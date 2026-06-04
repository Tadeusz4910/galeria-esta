-- =============================================================================
-- OBSZAR 4 — SYSTEM OFERT: KOLEKCJA / ARCHIWUM / INDYWIDUALNA Z TOKENEM
-- =============================================================================
-- Wersja:        1
-- Data:          2026-06-04
-- Dokument:      docs/OBSZAR-4-OFERTY.md
-- Powiązane:     migrations/obszar0_statusy.sql (commit 1441367...)
--                migrations/obszar2_idee_pojecia.sql (commit 7b592d5)
--                migrations/obszar2_uzupelnienie.sql (commit 4c617af)
--
-- ZASADA NACZELNA: Obszar 4 dobudowuje fundament systemu ofert na
-- istniejącej już infrastrukturze. Wykorzystujemy:
--   - tabele klasyfikacji: segmenty, style, dziedziny (gotowe)
--   - M:N klasyfikacji prac: prace_segmenty/style/dziedziny (gotowe)
--   - tabelę klienci (30 pól) + M:N klienci_segmenty/style/dziedziny (gotowe)
--   - historię ofert: klienci_oferowane, kolekcja_klienta (gotowe)
--   - tabelę oferty z polami z Sesji A (idea, pojęcia, INT, PL/EN/DE)
--   - tabelę oferty_prace z polami: oferta_id, praca_id, kolejnosc,
--     opis_do_oferty, cena_w_ofercie (gotowe)
--
-- Zakres jednej transakcji:
--   SEKCJA 1: rynki_priorytetowe (nowy słownik) + seed 8 rekordów
--   SEKCJA 2: oferty_rynki, prace_rynki (M:N do nowego słownika)
--   SEKCJA 3: rozszerzenie tabeli oferty (~14 kolumn)
--   SEKCJA 4: rozszerzenie tabeli oferty_prace (~5 kolumn)
--   SEKCJA 5: 3 nowe tabele (oferty_dokumenty, prace_related, oferty_analityka)
--   SEKCJA 6: uzupełnienie pól int_* w prace (5 kolumn)
--   SEKCJA 7: indeksy performance
--   SEKCJA 8: weryfikacja końcowa
--
-- Razem: 24 nowe kolumny + 5 nowych tabel + 18 indeksów.
--
-- Wzorzec migracji (Obszary 0, 2, 2-uzupełnienie):
--   - Cała migracja w BEGIN/COMMIT - rollback przy każdym błędzie
--   - Pre-flight check 0a' sprawdza stan przed zmianami
--   - Idempotentne: IF NOT EXISTS, ADD COLUMN IF NOT EXISTS
--   - Wszystkie pola tekstowe nullable, boolean DEFAULT false
--   - Walidacje: token unique gdy nie NULL, typ_oferty enum-like
--   - Weryfikacja końcowa z RAISE NOTICE/EXCEPTION
-- =============================================================================

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- -----------------------------------------------------------------------------
-- 0a'. PRE-FLIGHT CHECK
-- -----------------------------------------------------------------------------
DO $$
DECLARE
  has_oferty boolean;
  has_oferty_prace boolean;
  has_prace boolean;
  has_klienci boolean;
  has_segmenty boolean;
  has_style boolean;
  has_dziedziny boolean;
  has_prace_segmenty boolean;
  has_klienci_segmenty boolean;
  oferty_has_idea boolean;
  oferty_prace_has_kolejnosc boolean;
  cnt_oferty integer;
  cnt_klienci integer;
  cnt_prace integer;
  cnt_segmenty integer;
BEGIN
  -- (1) Wszystkie tabele bazowe istnieją
  SELECT EXISTS (SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'oferty') INTO has_oferty;
  SELECT EXISTS (SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'oferty_prace') INTO has_oferty_prace;
  SELECT EXISTS (SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'prace') INTO has_prace;
  SELECT EXISTS (SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'klienci') INTO has_klienci;
  SELECT EXISTS (SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'segmenty') INTO has_segmenty;
  SELECT EXISTS (SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'style') INTO has_style;
  SELECT EXISTS (SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'dziedziny') INTO has_dziedziny;
  SELECT EXISTS (SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'prace_segmenty') INTO has_prace_segmenty;
  SELECT EXISTS (SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'klienci_segmenty') INTO has_klienci_segmenty;

  IF NOT (has_oferty AND has_oferty_prace AND has_prace AND has_klienci
          AND has_segmenty AND has_style AND has_dziedziny
          AND has_prace_segmenty AND has_klienci_segmenty) THEN
    RAISE EXCEPTION 'Pre-flight FAIL: brakuje tabel bazowych. oferty=%, oferty_prace=%, prace=%, klienci=%, segmenty=%, style=%, dziedziny=%, prace_segmenty=%, klienci_segmenty=%',
      has_oferty, has_oferty_prace, has_prace, has_klienci, has_segmenty, has_style, has_dziedziny, has_prace_segmenty, has_klienci_segmenty;
  END IF;

  -- (2) Sesja A była uruchomiona (sanity check)
  SELECT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'oferty' AND column_name = 'idea_glowna_id') INTO oferty_has_idea;
  IF NOT oferty_has_idea THEN
    RAISE EXCEPTION 'Pre-flight FAIL: oferty nie ma idea_glowna_id - czy Sesja A Obszaru 2 została uruchomiona?';
  END IF;

  -- (3) oferty_prace ma już kolejnosc (z wcześniejszych sesji)
  SELECT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'oferty_prace' AND column_name = 'kolejnosc') INTO oferty_prace_has_kolejnosc;
  IF NOT oferty_prace_has_kolejnosc THEN
    RAISE EXCEPTION 'Pre-flight FAIL: oferty_prace nie ma kolejnosc - nieoczekiwany stan bazy';
  END IF;

  -- (4) Liczba rekordów - kontekst informacyjny
  SELECT COUNT(*) INTO cnt_oferty FROM oferty;
  SELECT COUNT(*) INTO cnt_klienci FROM klienci;
  SELECT COUNT(*) INTO cnt_prace FROM prace;
  SELECT COUNT(*) INTO cnt_segmenty FROM segmenty;

  RAISE NOTICE 'Pre-flight check: PASS.';
  RAISE NOTICE '  Tabele bazowe: oferty, oferty_prace, prace, klienci, segmenty, style, dziedziny - wszystkie istnieją';
  RAISE NOTICE '  M:N gotowe: prace_segmenty, klienci_segmenty (i pozostałe)';
  RAISE NOTICE '  Sesja A na oferty: PASS (idea_glowna_id istnieje)';
  RAISE NOTICE '  Rekordy: oferty=%, klienci=%, prace=%, segmenty=%', cnt_oferty, cnt_klienci, cnt_prace, cnt_segmenty;
END $$;


-- -----------------------------------------------------------------------------
-- SEKCJA 1: Słownik rynki_priorytetowe + seed 8 rekordów
-- -----------------------------------------------------------------------------
-- Z konceptu International (punkt 9.4 i 11.4): 8 wartości rynków
-- które decydują o priorytecie komunikacyjnym i sprzedażowym.

CREATE TABLE IF NOT EXISTS rynki_priorytetowe (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kod           text NOT NULL UNIQUE,         -- 'DACH', 'Italy', etc.
  nazwa_pl      text NOT NULL,
  nazwa_en      text NOT NULL,
  nazwa_de      text NOT NULL,
  opis_pl       text,
  kolejnosc     integer NOT NULL DEFAULT 0,
  aktywny       boolean NOT NULL DEFAULT true,
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- Seed 8 rynków z konceptu International
-- Używamy ON CONFLICT (kod) DO NOTHING dla idempotency
INSERT INTO rynki_priorytetowe (kod, nazwa_pl, nazwa_en, nazwa_de, opis_pl, kolejnosc) VALUES
  ('DACH', 'DACH (Niemcy, Austria, Szwajcaria)', 'DACH (Germany, Austria, Switzerland)', 'DACH (Deutschland, Österreich, Schweiz)', 'Główny rynek międzynarodowy - sztuka konkretna, konceptualna, geometryczna', 1),
  ('ITALY', 'Włochy', 'Italy', 'Italien', 'Rynek dla poezji konkretnej (Dróżdż) i konceptualizmu - Artissima jako wejście', 2),
  ('CENTRAL_EUROPE', 'Europa Środkowa', 'Central Europe', 'Mitteleuropa', 'Czechy, Słowacja, Węgry - dialog środkowoeuropejski', 3),
  ('WIDER_INTERNATIONAL', 'Szerszy międzynarodowy', 'Wider International', 'Weiteres International', 'USA, Skandynawia, Francja, Holandia, Belgia', 4),
  ('INSTITUTIONS', 'Instytucje', 'Institutions', 'Institutionen', 'Muzea, kolekcje publiczne, kuratorzy', 5),
  ('COLLECTORS', 'Kolekcjonerzy', 'Collectors', 'Sammler', 'Kolekcjonerzy prywatni - rdzeń bazy klientów ESTA', 6),
  ('ARCHITECTS', 'Architekci', 'Architects', 'Architekten', 'Architekci wnętrz, projektanci - architektoniczny porządek formy', 7),
  ('ART_FAIRS', 'Targi sztuki', 'Art Fairs', 'Kunstmessen', 'Art Basel, Art Karlsruhe, Positions Berlin, Artissima', 8)
ON CONFLICT (kod) DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_rynki_aktywny ON rynki_priorytetowe(aktywny) WHERE aktywny = true;


-- -----------------------------------------------------------------------------
-- SEKCJA 2: M:N do rynków - oferty_rynki, prace_rynki
-- -----------------------------------------------------------------------------

-- 2a. oferty_rynki
CREATE TABLE IF NOT EXISTS oferty_rynki (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  oferta_id     uuid NOT NULL REFERENCES oferty(id) ON DELETE CASCADE,
  rynek_id      uuid NOT NULL REFERENCES rynki_priorytetowe(id) ON DELETE CASCADE,
  priorytet     integer NOT NULL DEFAULT 0,  -- 1=główny, 2=drugorzędny, etc.
  created_at    timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT oferty_rynki_unique UNIQUE (oferta_id, rynek_id)
);
CREATE INDEX IF NOT EXISTS idx_oferty_rynki_oferta ON oferty_rynki(oferta_id);
CREATE INDEX IF NOT EXISTS idx_oferty_rynki_rynek ON oferty_rynki(rynek_id);

-- 2b. prace_rynki
CREATE TABLE IF NOT EXISTS prace_rynki (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  praca_id      uuid NOT NULL REFERENCES prace(id) ON DELETE CASCADE,
  rynek_id      uuid NOT NULL REFERENCES rynki_priorytetowe(id) ON DELETE CASCADE,
  priorytet     integer NOT NULL DEFAULT 0,
  created_at    timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT prace_rynki_unique UNIQUE (praca_id, rynek_id)
);
CREATE INDEX IF NOT EXISTS idx_prace_rynki_praca ON prace_rynki(praca_id);
CREATE INDEX IF NOT EXISTS idx_prace_rynki_rynek ON prace_rynki(rynek_id);


-- -----------------------------------------------------------------------------
-- SEKCJA 3: Rozszerzenie tabeli oferty - 14 nowych kolumn
-- -----------------------------------------------------------------------------

-- 3a. Typ oferty (kolekcja / archiwum / indywidualna)
ALTER TABLE oferty
  ADD COLUMN IF NOT EXISTS typ_oferty text;

-- Walidacja: tylko 3 dozwolone wartości
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage
    WHERE table_schema = 'public' AND table_name = 'oferty'
      AND constraint_name = 'oferty_typ_oferty_check'
  ) THEN
    ALTER TABLE oferty
      ADD CONSTRAINT oferty_typ_oferty_check
      CHECK (typ_oferty IS NULL OR typ_oferty IN ('kolekcja', 'archiwum', 'indywidualna'));
  END IF;
END $$;

-- 3b. Token (D1: wymagany tylko dla indywidualnych)
ALTER TABLE oferty
  ADD COLUMN IF NOT EXISTS token text;

-- Unique gdy nie NULL
CREATE UNIQUE INDEX IF NOT EXISTS idx_oferty_token_unique ON oferty(token) WHERE token IS NOT NULL;

-- 3c. Status oferty
ALTER TABLE oferty
  ADD COLUMN IF NOT EXISTS status_oferty text;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage
    WHERE table_schema = 'public' AND table_name = 'oferty'
      AND constraint_name = 'oferty_status_oferty_check'
  ) THEN
    ALTER TABLE oferty
      ADD CONSTRAINT oferty_status_oferty_check
      CHECK (status_oferty IS NULL OR status_oferty IN (
        'robocze', 'do_uzupelnienia', 'gotowe', 'wyslane',
        'follow_up', 'zamkniete', 'sprzedaz'
      ));
  END IF;
END $$;

-- 3d. Klient (D3: FK od razu, tabela klienci ma 30 pól)
ALTER TABLE oferty
  ADD COLUMN IF NOT EXISTS klient_id uuid REFERENCES klienci(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_oferty_klient ON oferty(klient_id) WHERE klient_id IS NOT NULL;

-- 3e. Daty operacyjne
ALTER TABLE oferty ADD COLUMN IF NOT EXISTS data_wyslania     date;
ALTER TABLE oferty ADD COLUMN IF NOT EXISTS data_follow_up    date;
ALTER TABLE oferty ADD COLUMN IF NOT EXISTS data_waznosci     date;  -- D8: NULL w MVP

-- 3f. Hasło (D8: NULL w MVP, na później)
ALTER TABLE oferty ADD COLUMN IF NOT EXISTS haslo_hash text;

-- 3g. Język oferty (z konceptu International 11.3)
ALTER TABLE oferty ADD COLUMN IF NOT EXISTS jezyk_oferty text;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage
    WHERE table_schema = 'public' AND table_name = 'oferty'
      AND constraint_name = 'oferty_jezyk_oferty_check'
  ) THEN
    ALTER TABLE oferty
      ADD CONSTRAINT oferty_jezyk_oferty_check
      CHECK (jezyk_oferty IS NULL OR jezyk_oferty IN (
        'pl', 'en', 'de', 'en_de', 'pl_en', 'pl_en_de'
      ));
  END IF;
END $$;

-- 3h. Typ oferty szczegółowy (z konceptu International 11.2)
ALTER TABLE oferty ADD COLUMN IF NOT EXISTS typ_oferty_szczegolowy text;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage
    WHERE table_schema = 'public' AND table_name = 'oferty'
      AND constraint_name = 'oferty_typ_szczeg_check'
  ) THEN
    ALTER TABLE oferty
      ADD CONSTRAINT oferty_typ_szczeg_check
      CHECK (typ_oferty_szczegolowy IS NULL OR typ_oferty_szczegolowy IN (
        'private_preview', 'related_works', 'artist_focus', 'fair_follow_up',
        'collector_selection', 'institutional_proposal', 'architect_selection',
        'italy_artissima_follow_up', 'dach_follow_up'
      ));
  END IF;
END $$;

-- 3i. Hero i branding
ALTER TABLE oferty ADD COLUMN IF NOT EXISTS hero_url            text;
ALTER TABLE oferty ADD COLUMN IF NOT EXISTS hero_focalpoint_x   numeric;
ALTER TABLE oferty ADD COLUMN IF NOT EXISTS hero_focalpoint_y   numeric;
ALTER TABLE oferty ADD COLUMN IF NOT EXISTS accent_color        text;

-- 3j. Indeksy operacyjne na oferty
CREATE INDEX IF NOT EXISTS idx_oferty_typ           ON oferty(typ_oferty);
CREATE INDEX IF NOT EXISTS idx_oferty_status        ON oferty(status_oferty);
CREATE INDEX IF NOT EXISTS idx_oferty_data_wyslania ON oferty(data_wyslania) WHERE data_wyslania IS NOT NULL;


-- -----------------------------------------------------------------------------
-- SEKCJA 4: Rozszerzenie tabeli oferty_prace - 5 nowych kolumn
-- -----------------------------------------------------------------------------
-- Istniejące kolumny: oferta_id, praca_id, kolejnosc, opis_do_oferty, cena_w_ofercie

-- 4a. cena_w_ofercie_eur - osobno EUR (cena_w_ofercie jest PLN)
ALTER TABLE oferty_prace ADD COLUMN IF NOT EXISTS cena_w_ofercie_eur numeric;

-- 4b. cena_widoczna (D2: domyślnie ukryta)
ALTER TABLE oferty_prace ADD COLUMN IF NOT EXISTS cena_widoczna boolean NOT NULL DEFAULT false;

-- 4c. Wielojęzyczność opisu - opis_do_oferty istnieje (PL), dodajemy EN i DE
ALTER TABLE oferty_prace ADD COLUMN IF NOT EXISTS opis_do_oferty_en text;
ALTER TABLE oferty_prace ADD COLUMN IF NOT EXISTS opis_do_oferty_de text;

-- 4d. Status pracy w kontekście tej oferty (opcjonalne nadpisanie)
ALTER TABLE oferty_prace ADD COLUMN IF NOT EXISTS status_w_ofercie text;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage
    WHERE table_schema = 'public' AND table_name = 'oferty_prace'
      AND constraint_name = 'oferty_prace_status_check'
  ) THEN
    ALTER TABLE oferty_prace
      ADD CONSTRAINT oferty_prace_status_check
      CHECK (status_w_ofercie IS NULL OR status_w_ofercie IN (
        'dostepna', 'zarezerwowana_dla_klienta', 'sprzedana_w_miedzyczasie'
      ));
  END IF;
END $$;


-- -----------------------------------------------------------------------------
-- SEKCJA 5: 3 nowe tabele - dokumenty, related works, analityka
-- -----------------------------------------------------------------------------

-- 5a. oferty_dokumenty (D6: PDF i inne załączniki)
CREATE TABLE IF NOT EXISTS oferty_dokumenty (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  oferta_id     uuid NOT NULL REFERENCES oferty(id) ON DELETE CASCADE,
  typ           text NOT NULL,  -- 'pdf_oferty' / 'fact_sheet' / 'condition_report' / 'biography' / 'certificate' / 'inne'
  nazwa         text NOT NULL,
  url           text NOT NULL,
  kolejnosc     integer NOT NULL DEFAULT 0,
  created_at    timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_oferty_dokumenty_oferta ON oferty_dokumenty(oferta_id);

-- Walidacja typu dokumentu
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage
    WHERE table_schema = 'public' AND table_name = 'oferty_dokumenty'
      AND constraint_name = 'oferty_dokumenty_typ_check'
  ) THEN
    ALTER TABLE oferty_dokumenty
      ADD CONSTRAINT oferty_dokumenty_typ_check
      CHECK (typ IN (
        'pdf_oferty', 'fact_sheet', 'condition_report',
        'biography', 'certificate', 'cv_artysty',
        'tekst_kuratorski', 'press_release', 'inne'
      ));
  END IF;
END $$;

-- 5b. prace_related (Sold/Related Works - manualne wskazywanie)
CREATE TABLE IF NOT EXISTS prace_related (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  praca_id      uuid NOT NULL REFERENCES prace(id) ON DELETE CASCADE,    -- praca sprzedana
  related_id    uuid NOT NULL REFERENCES prace(id) ON DELETE CASCADE,    -- praca podobna dostępna
  kolejnosc     integer NOT NULL DEFAULT 0,
  notatka       text,                                                     -- dlaczego ta jest related
  created_at    timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT prace_related_unique UNIQUE (praca_id, related_id),
  CONSTRAINT prace_related_different CHECK (praca_id <> related_id)
);
CREATE INDEX IF NOT EXISTS idx_prace_related_praca   ON prace_related(praca_id);
CREATE INDEX IF NOT EXISTS idx_prace_related_related ON prace_related(related_id);

-- 5c. oferty_analityka (tracking otworzeń)
CREATE TABLE IF NOT EXISTS oferty_analityka (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  oferta_id       uuid NOT NULL REFERENCES oferty(id) ON DELETE CASCADE,
  data_otworzenia timestamptz NOT NULL DEFAULT now(),
  ip_hash         text,                                                   -- hash IP dla anonimowego trackingu
  user_agent      text,
  sekcja          text,                                                   -- 'lista_prac' / 'szczegol_pracy' / 'documents' / 'contact'
  praca_id        uuid REFERENCES prace(id) ON DELETE SET NULL,           -- jeśli sekcja = szczegol_pracy
  czas_na_sekcji  integer,                                                -- sekundy spędzone w sekcji (opcjonalne)
  created_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_oferty_analityka_oferta ON oferty_analityka(oferta_id);
CREATE INDEX IF NOT EXISTS idx_oferty_analityka_data   ON oferty_analityka(data_otworzenia DESC);
CREATE INDEX IF NOT EXISTS idx_oferty_analityka_praca  ON oferty_analityka(praca_id) WHERE praca_id IS NOT NULL;


-- -----------------------------------------------------------------------------
-- SEKCJA 6: Uzupełnienie pól int_* w prace - 5 nowych kolumn
-- -----------------------------------------------------------------------------
-- Z konceptu International (punkt 9), nie zrobione w Sesji A.

-- 6a. int_priorytet
ALTER TABLE prace ADD COLUMN IF NOT EXISTS int_priorytet text;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage
    WHERE table_schema = 'public' AND table_name = 'prace'
      AND constraint_name = 'prace_int_priorytet_check'
  ) THEN
    ALTER TABLE prace
      ADD CONSTRAINT prace_int_priorytet_check
      CHECK (int_priorytet IS NULL OR int_priorytet IN ('1_kluczowa', '2_mocna', '3_uzupelniajaca'));
  END IF;
END $$;

-- 6b. int_status
ALTER TABLE prace ADD COLUMN IF NOT EXISTS int_status text;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage
    WHERE table_schema = 'public' AND table_name = 'prace'
      AND constraint_name = 'prace_int_status_check'
  ) THEN
    ALTER TABLE prace
      ADD CONSTRAINT prace_int_status_check
      CHECK (int_status IS NULL OR int_status IN (
        'robocze', 'do_opisu_pl', 'do_opisu_en', 'do_opisu_de',
        'gotowe', 'opublikowane', 'wyslane', 'sprzedane', 'archiwalne'
      ));
  END IF;
END $$;

-- 6c. Visual Wall teksty PL/EN/DE (D5: zostają, niewypełniane teraz)
ALTER TABLE prace ADD COLUMN IF NOT EXISTS int_visual_wall_tekst_pl text;
ALTER TABLE prace ADD COLUMN IF NOT EXISTS int_visual_wall_tekst_en text;
ALTER TABLE prace ADD COLUMN IF NOT EXISTS int_visual_wall_tekst_de text;

-- 6d. Notatki wewnętrzne
ALTER TABLE prace ADD COLUMN IF NOT EXISTS int_notatki text;

CREATE INDEX IF NOT EXISTS idx_prace_int_priorytet ON prace(int_priorytet) WHERE int_priorytet IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_prace_int_status    ON prace(int_status)    WHERE int_status IS NOT NULL;


-- -----------------------------------------------------------------------------
-- SEKCJA 7: Weryfikacja końcowa
-- -----------------------------------------------------------------------------
DO $$
DECLARE
  cnt_rynki integer;
  cnt_new_tables integer;
  cnt_oferty_new_cols integer;
  cnt_oferty_prace_new_cols integer;
  cnt_prace_int_new_cols integer;
  cnt_indexes_new integer;
  has_token_unique boolean;
BEGIN
  -- Sprawdzenie słownika rynków
  SELECT COUNT(*) INTO cnt_rynki FROM rynki_priorytetowe;
  IF cnt_rynki != 8 THEN
    RAISE EXCEPTION 'FAIL Sekcja 1: oczekiwane 8 rekordów w rynki_priorytetowe, jest %', cnt_rynki;
  END IF;

  -- Sprawdzenie nowych tabel (5: rynki_priorytetowe, oferty_rynki, prace_rynki, oferty_dokumenty, prace_related, oferty_analityka = 6 łącznie)
  SELECT COUNT(*) INTO cnt_new_tables
  FROM information_schema.tables
  WHERE table_schema = 'public'
    AND table_name IN (
      'rynki_priorytetowe', 'oferty_rynki', 'prace_rynki',
      'oferty_dokumenty', 'prace_related', 'oferty_analityka'
    );

  -- Sprawdzenie nowych kolumn w oferty (14)
  SELECT COUNT(*) INTO cnt_oferty_new_cols
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = 'oferty'
    AND column_name IN (
      'typ_oferty', 'token', 'status_oferty', 'klient_id',
      'data_wyslania', 'data_follow_up', 'data_waznosci', 'haslo_hash',
      'jezyk_oferty', 'typ_oferty_szczegolowy',
      'hero_url', 'hero_focalpoint_x', 'hero_focalpoint_y', 'accent_color'
    );

  -- Sprawdzenie nowych kolumn w oferty_prace (5)
  SELECT COUNT(*) INTO cnt_oferty_prace_new_cols
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = 'oferty_prace'
    AND column_name IN (
      'cena_w_ofercie_eur', 'cena_widoczna',
      'opis_do_oferty_en', 'opis_do_oferty_de',
      'status_w_ofercie'
    );

  -- Sprawdzenie nowych kolumn w prace (5)
  SELECT COUNT(*) INTO cnt_prace_int_new_cols
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = 'prace'
    AND column_name IN (
      'int_priorytet', 'int_status',
      'int_visual_wall_tekst_pl', 'int_visual_wall_tekst_en', 'int_visual_wall_tekst_de',
      'int_notatki'
    );

  -- Token unique index
  SELECT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE schemaname = 'public' AND indexname = 'idx_oferty_token_unique'
  ) INTO has_token_unique;

  RAISE NOTICE '====================================================';
  RAISE NOTICE 'OBSZAR 4 - SYSTEM OFERT: weryfikacja';
  RAISE NOTICE '====================================================';
  RAISE NOTICE 'Sekcja 1 - słownik rynków: % rekordów (oczekiwane 8)', cnt_rynki;
  RAISE NOTICE 'Sekcja 2+5 - nowych tabel: % (oczekiwane 6)', cnt_new_tables;
  RAISE NOTICE 'Sekcja 3 - nowych kolumn w oferty: % (oczekiwane 14)', cnt_oferty_new_cols;
  RAISE NOTICE 'Sekcja 4 - nowych kolumn w oferty_prace: % (oczekiwane 5)', cnt_oferty_prace_new_cols;
  RAISE NOTICE 'Sekcja 6 - nowych kolumn int_* w prace: % (oczekiwane 6)', cnt_prace_int_new_cols;
  RAISE NOTICE 'Token unique index: %', has_token_unique;
  RAISE NOTICE '====================================================';

  -- Twarde weryfikacje
  IF cnt_new_tables != 6 THEN
    RAISE EXCEPTION 'FAIL: oczekiwane 6 nowych tabel (rynki + oferty_rynki + prace_rynki + oferty_dokumenty + prace_related + oferty_analityka), jest %', cnt_new_tables;
  END IF;

  IF cnt_oferty_new_cols != 14 THEN
    RAISE EXCEPTION 'FAIL Sekcja 3: oczekiwane 14 kolumn nowych w oferty, jest %', cnt_oferty_new_cols;
  END IF;

  IF cnt_oferty_prace_new_cols != 5 THEN
    RAISE EXCEPTION 'FAIL Sekcja 4: oczekiwane 5 kolumn nowych w oferty_prace, jest %', cnt_oferty_prace_new_cols;
  END IF;

  IF cnt_prace_int_new_cols != 6 THEN
    RAISE EXCEPTION 'FAIL Sekcja 6: oczekiwane 6 kolumn nowych int_* w prace, jest %', cnt_prace_int_new_cols;
  END IF;

  IF NOT has_token_unique THEN
    RAISE EXCEPTION 'FAIL: brak unique index dla oferty.token (gdy NOT NULL)';
  END IF;

  -- Suma wszystkich nowych kolumn (powinno być 25 = 14 + 5 + 6)
  RAISE NOTICE 'SUMA wszystkich nowych kolumn: % (oczekiwane 25)',
    cnt_oferty_new_cols + cnt_oferty_prace_new_cols + cnt_prace_int_new_cols;

  RAISE NOTICE '====================================================';
  RAISE NOTICE 'MIGRACJA OBSZAR 4 - SYSTEM OFERT: PASS. Gotowe do COMMIT.';
  RAISE NOTICE '====================================================';
END $$;

COMMIT;

-- =============================================================================
-- WERYFIKACJA RĘCZNA (po commicie - NIE jest częścią transakcji)
-- =============================================================================
--
-- 1. Słownik rynków - 8 wartości:
-- SELECT kod, nazwa_pl, nazwa_en, nazwa_de, kolejnosc FROM rynki_priorytetowe ORDER BY kolejnosc;
--
-- 2. Sprawdzenie wszystkich kolumn w tabeli oferty:
-- SELECT column_name, data_type FROM information_schema.columns
--  WHERE table_schema = 'public' AND table_name = 'oferty'
--  ORDER BY ordinal_position;
--
-- 3. Sprawdzenie nowych tabel:
-- SELECT table_name FROM information_schema.tables
--  WHERE table_schema = 'public'
--    AND table_name IN ('rynki_priorytetowe', 'oferty_rynki', 'prace_rynki',
--                       'oferty_dokumenty', 'prace_related', 'oferty_analityka')
--  ORDER BY table_name;
--
-- 4. Sprawdzenie wszystkich CHECK constraints (walidacje typu_oferty, statusu, etc.):
-- SELECT conname, pg_get_constraintdef(c.oid)
--  FROM pg_constraint c
--  JOIN pg_class t ON c.conrelid = t.oid
--  JOIN pg_namespace n ON t.relnamespace = n.oid
--  WHERE n.nspname = 'public'
--    AND t.relname IN ('oferty', 'oferty_prace', 'prace')
--    AND c.contype = 'c'
--  ORDER BY t.relname, conname;
-- =============================================================================
