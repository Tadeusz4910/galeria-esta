-- ============================================================================
-- MIGRACJA OBSZARU 3 — KOLEKCJA, ZASOBY, VIEWING ROOM
-- ============================================================================
--
-- Galeria ESTA — czerwiec 2026
-- Dokument koncepcyjny: docs/OBSZAR-3-KOLEKCJA-ZASOBY-VIEWING-ROOM-ODKRYWAJ.md
--
-- Cel migracji:
--   1. Korekta CHECK constraint na prace.widocznosc (dodanie 'zasoby', 'oferta_token', 'zasob')
--   2. Migracja istniejących prac z widocznosc='archiwum' → 'zasoby'
--   3. Dodanie 5 nowych pól w tabeli prace (potencjał VR, rola w Zasobach, kontekst, priorytety)
--   4. Dodanie 2 nowych pól w tabeli artysci (status programowy, potencjał VR)
--   5. Utworzenie tabeli artysci_relacje_recznie (M:N artysta ↔ artysta z notatkami)
--   6. Utworzenie tabeli viewing_room (kuratorskie wirtualne wystawy)
--   7. Utworzenie 4 tabel M:N dla VR (prace, pojęcia, artyści, powiązane VR)
--   8. Utworzenie tabeli viewing_room_assets (renderingi wnętrz, panoramy, video)
--
-- Migracja jest idempotentna:
--   - ADD COLUMN IF NOT EXISTS dla wszystkich kolumn
--   - CREATE TABLE IF NOT EXISTS dla wszystkich tabel
--   - CREATE INDEX IF NOT EXISTS dla wszystkich indeksów
--   - Sprawdzenia istnienia constraint przed dodaniem
--   - WHERE NOT EXISTS dla UPDATE migracyjnego
--
-- Wzorowane na: migrations/obszar4_oferty.sql (commit b00bdc6)
-- ============================================================================

BEGIN;

-- ============================================================================
-- 0. PRE-FLIGHT: RAPORT STANU BAZY PRZED MIGRACJĄ
-- ============================================================================

DO $$
DECLARE
  liczba_prac_total integer;
  liczba_prac_kolekcja integer;
  liczba_prac_archiwum integer;
  liczba_prac_zasoby integer;
  liczba_prac_ukryta integer;
  liczba_artystow integer;
  wystawy_istnieje boolean;
  viewing_room_istnieje boolean;
  artysci_relacje_istnieje boolean;
BEGIN
  -- Stan tabeli prace
  SELECT COUNT(*) INTO liczba_prac_total FROM prace;
  SELECT COUNT(*) INTO liczba_prac_kolekcja FROM prace WHERE widocznosc = 'kolekcja';
  SELECT COUNT(*) INTO liczba_prac_archiwum FROM prace WHERE widocznosc = 'archiwum';
  SELECT COUNT(*) INTO liczba_prac_zasoby FROM prace WHERE widocznosc = 'zasoby';
  SELECT COUNT(*) INTO liczba_prac_ukryta FROM prace WHERE widocznosc = 'ukryta';

  -- Stan tabeli artysci
  SELECT COUNT(*) INTO liczba_artystow FROM artysci;

  -- Sprawdź istnienie kluczowych tabel
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'wystawy'
  ) INTO wystawy_istnieje;

  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'viewing_room'
  ) INTO viewing_room_istnieje;

  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'artysci_relacje_recznie'
  ) INTO artysci_relacje_istnieje;

  RAISE NOTICE '';
  RAISE NOTICE '════════════════════════════════════════════════════════════════════';
  RAISE NOTICE '   MIGRACJA OBSZAR 3 — STAN BAZY PRZED ZMIANAMI';
  RAISE NOTICE '════════════════════════════════════════════════════════════════════';
  RAISE NOTICE '';
  RAISE NOTICE '  Tabela prace:';
  RAISE NOTICE '    - Total prac:      %', liczba_prac_total;
  RAISE NOTICE '    - widocznosc=kolekcja:  %', liczba_prac_kolekcja;
  RAISE NOTICE '    - widocznosc=archiwum: %', liczba_prac_archiwum;
  RAISE NOTICE '    - widocznosc=zasoby:    %', liczba_prac_zasoby;
  RAISE NOTICE '    - widocznosc=ukryta:    %', liczba_prac_ukryta;
  RAISE NOTICE '';
  RAISE NOTICE '  Tabela artysci:';
  RAISE NOTICE '    - Total artystow:   %', liczba_artystow;
  RAISE NOTICE '';
  RAISE NOTICE '  Istniejace tabele:';
  RAISE NOTICE '    - wystawy:                 %', wystawy_istnieje;
  RAISE NOTICE '    - viewing_room:            %', viewing_room_istnieje;
  RAISE NOTICE '    - artysci_relacje_recznie: %', artysci_relacje_istnieje;
  RAISE NOTICE '';
  RAISE NOTICE '════════════════════════════════════════════════════════════════════';
  RAISE NOTICE '';
END $$;

-- ============================================================================
-- 1. KOREKTA CHECK CONSTRAINT prace.widocznosc
-- ============================================================================
--
-- Stan obecny: CHECK ((widocznosc = ANY (ARRAY['ukryta', 'kolekcja', 'archiwum'])))
-- Stan docelowy: dozwolone wartości 'kolekcja', 'zasoby', 'oferta_token', 'zasob', 'ukryta'
--
-- Strategia:
--   1. Usuń stary CHECK constraint (jeśli istnieje)
--   2. Migruj rekordy: widocznosc='archiwum' → widocznosc='zasoby'
--   3. Dodaj nowy CHECK constraint z 5 dozwolonymi wartościami
-- ============================================================================

-- 1.1 Usuń stary CHECK constraint (jeśli istnieje)
DO $$
DECLARE
  constraint_name text;
BEGIN
  -- Znajdź nazwę constraint
  SELECT c.conname INTO constraint_name
  FROM pg_constraint c
  JOIN pg_class t ON c.conrelid = t.oid
  JOIN pg_namespace n ON t.relnamespace = n.oid
  WHERE n.nspname = 'public'
    AND t.relname = 'prace'
    AND c.conname LIKE '%widocznosc%'
  LIMIT 1;

  IF constraint_name IS NOT NULL THEN
    EXECUTE format('ALTER TABLE prace DROP CONSTRAINT %I', constraint_name);
    RAISE NOTICE '✓ Usunieto stary constraint: %', constraint_name;
  ELSE
    RAISE NOTICE '  (brak istniejacego constraint na widocznosc)';
  END IF;
END $$;

-- 1.2 Migracja archiwum → zasoby
DO $$
DECLARE
  liczba_zmigrowana integer;
BEGIN
  UPDATE prace
  SET widocznosc = 'zasoby'
  WHERE widocznosc = 'archiwum';

  GET DIAGNOSTICS liczba_zmigrowana = ROW_COUNT;

  IF liczba_zmigrowana > 0 THEN
    RAISE NOTICE '✓ Zmigrowano % prac z widocznosc=archiwum → widocznosc=zasoby', liczba_zmigrowana;
  ELSE
    RAISE NOTICE '  (brak prac z widocznosc=archiwum do migracji)';
  END IF;
END $$;

-- 1.3 Dodaj nowy CHECK constraint
ALTER TABLE prace
ADD CONSTRAINT prace_widocznosc_check
CHECK (widocznosc = ANY (ARRAY[
  'kolekcja'::text,
  'zasoby'::text,
  'oferta_token'::text,
  'zasob'::text,
  'ukryta'::text
]));

DO $$ BEGIN
  RAISE NOTICE '✓ Dodano nowy CHECK constraint na prace.widocznosc';
  RAISE NOTICE '  Dozwolone wartosci: kolekcja, zasoby, oferta_token, zasob, ukryta';
  RAISE NOTICE '';
END $$;


-- ============================================================================
-- 2. NOWE POLA W TABELI prace
-- ============================================================================

-- 2.1 potencjal_viewing_room — siła pracy jako kandydata do VR
ALTER TABLE prace
ADD COLUMN IF NOT EXISTS potencjal_viewing_room text;

-- Dodaj CHECK na potencjal_viewing_room (jeśli nie istnieje)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'prace_potencjal_vr_check'
  ) THEN
    ALTER TABLE prace
    ADD CONSTRAINT prace_potencjal_vr_check
    CHECK (potencjal_viewing_room IS NULL OR potencjal_viewing_room = ANY (ARRAY[
      'bardzo_wysoki'::text,
      'wysoki'::text,
      'sredni'::text,
      'niski'::text
    ]));
    RAISE NOTICE '✓ Dodano CHECK constraint prace_potencjal_vr_check';
  END IF;
END $$;

-- 2.2 rola_w_zasobach — typ obecności w Zasobach
ALTER TABLE prace
ADD COLUMN IF NOT EXISTS rola_w_zasobach text;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'prace_rola_w_zasobach_check'
  ) THEN
    ALTER TABLE prace
    ADD CONSTRAINT prace_rola_w_zasobach_check
    CHECK (rola_w_zasobach IS NULL OR rola_w_zasobach = ANY (ARRAY[
      'kluczowa'::text,
      'uzupelniajaca'::text,
      'archiwalium'::text,
      'dokumentacja'::text,
      'komis'::text,
      'kontekst'::text,
      'odkrycie'::text
    ]));
    RAISE NOTICE '✓ Dodano CHECK constraint prace_rola_w_zasobach_check';
  END IF;
END $$;

-- 2.3 kontekst zasobowy PL/EN (krótki opis dlaczego praca jest w Zasobach)
ALTER TABLE prace
ADD COLUMN IF NOT EXISTS kontekst_zasobowy_pl text;

ALTER TABLE prace
ADD COLUMN IF NOT EXISTS kontekst_zasobowy_en text;

-- 2.4 Priorytety sortowania
ALTER TABLE prace
ADD COLUMN IF NOT EXISTS priorytet_zasoby integer DEFAULT 0;

ALTER TABLE prace
ADD COLUMN IF NOT EXISTS priorytet_viewing_room integer DEFAULT 0;

DO $$ BEGIN
  RAISE NOTICE '✓ Dodano 6 nowych pol w tabeli prace';
  RAISE NOTICE '  - potencjal_viewing_room (text, CHECK)';
  RAISE NOTICE '  - rola_w_zasobach (text, CHECK)';
  RAISE NOTICE '  - kontekst_zasobowy_pl (text)';
  RAISE NOTICE '  - kontekst_zasobowy_en (text)';
  RAISE NOTICE '  - priorytet_zasoby (integer, default 0)';
  RAISE NOTICE '  - priorytet_viewing_room (integer, default 0)';
  RAISE NOTICE '';
END $$;


-- ============================================================================
-- 3. NOWE POLA W TABELI artysci
-- ============================================================================

-- 3.1 status_programowy — pozycja artysty w programie galerii
ALTER TABLE artysci
ADD COLUMN IF NOT EXISTS status_programowy text;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'artysci_status_programowy_check'
  ) THEN
    ALTER TABLE artysci
    ADD CONSTRAINT artysci_status_programowy_check
    CHECK (status_programowy IS NULL OR status_programowy = ANY (ARRAY[
      'rdzen_kolekcji'::text,
      'wspolczesne_kontynuacje'::text,
      'zasoby'::text,
      'gosc_programu'::text,
      'archiwum_galerii'::text
    ]));
    RAISE NOTICE '✓ Dodano CHECK constraint artysci_status_programowy_check';
  END IF;
END $$;

-- 3.2 potencjal_viewing_room dla artysty (analogicznie jak dla pracy)
ALTER TABLE artysci
ADD COLUMN IF NOT EXISTS potencjal_viewing_room text;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'artysci_potencjal_vr_check'
  ) THEN
    ALTER TABLE artysci
    ADD CONSTRAINT artysci_potencjal_vr_check
    CHECK (potencjal_viewing_room IS NULL OR potencjal_viewing_room = ANY (ARRAY[
      'bardzo_wysoki'::text,
      'wysoki'::text,
      'sredni'::text,
      'niski'::text
    ]));
    RAISE NOTICE '✓ Dodano CHECK constraint artysci_potencjal_vr_check';
  END IF;
END $$;

DO $$ BEGIN
  RAISE NOTICE '✓ Dodano 2 nowe pola w tabeli artysci';
  RAISE NOTICE '  - status_programowy (text, CHECK)';
  RAISE NOTICE '  - potencjal_viewing_room (text, CHECK)';
  RAISE NOTICE '';
END $$;


-- ============================================================================
-- 4. TABELA artysci_relacje_recznie (M:N artysta ↔ artysta z notatkami)
-- ============================================================================
--
-- Ręczne powiązania kuratorskie między artystami.
-- Używane w module "Odkrywaj dalej" jako Priorytet 1 (przed algorytmem).
-- Przykład: Berdyszak ↔ Chwałczyk, Bauer ↔ Dróżdż, Molnar ↔ Gołkowska
-- ============================================================================

CREATE TABLE IF NOT EXISTS artysci_relacje_recznie (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  artysta_id uuid NOT NULL REFERENCES artysci(id) ON DELETE CASCADE,
  powiazany_artysta_id uuid NOT NULL REFERENCES artysci(id) ON DELETE CASCADE,
  rodzaj_relacji text,
  notatka text,
  kolejnosc integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT artysci_relacje_unique UNIQUE (artysta_id, powiazany_artysta_id),
  CONSTRAINT artysci_relacje_different CHECK (artysta_id <> powiazany_artysta_id)
);

CREATE INDEX IF NOT EXISTS idx_artysci_relacje_artysta
  ON artysci_relacje_recznie(artysta_id);

CREATE INDEX IF NOT EXISTS idx_artysci_relacje_powiazany
  ON artysci_relacje_recznie(powiazany_artysta_id);

DO $$ BEGIN
  RAISE NOTICE '✓ Utworzono tabele artysci_relacje_recznie (jesli nie istniala)';
  RAISE NOTICE '';
END $$;


-- ============================================================================
-- 5. TABELA viewing_room (kuratorskie wirtualne wystawy)
-- ============================================================================
--
-- Główna tabela Viewing Roomów. Każdy VR to wirtualna wystawa kuratorska.
-- Nie posiada własnych prac — korzysta z prac z tabeli prace przez M:N viewing_room_prace.
-- ============================================================================

CREATE TABLE IF NOT EXISTS viewing_room (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Tożsamość (PL/EN/DE)
  tytul_pl text NOT NULL,
  tytul_en text,
  tytul_de text,
  podtytul_pl text,
  podtytul_en text,
  podtytul_de text,
  slug text NOT NULL UNIQUE,

  -- Klasyfikacja kuratorska
  typ_vr text NOT NULL DEFAULT 'relacja',

  -- Status publikacji
  status_publiczny text NOT NULL DEFAULT 'szkic',
  data_publikacji date,
  data_archiwizacji date,

  -- Powiązania
  praca_hero_id uuid REFERENCES prace(id) ON DELETE SET NULL,
  idea_glowna_id uuid REFERENCES idee(id) ON DELETE SET NULL,

  -- Treści PL/EN/DE
  tekst_otwierajacy_pl text,
  tekst_otwierajacy_en text,
  tekst_otwierajacy_de text,

  -- Sekwencja narracji (główna sekcja VR — elastyczna)
  sekcje_jsonb jsonb,

  -- Hero rozszerzony (opcjonalnie zamiast praca_hero_id)
  hero_url text,
  hero_focalpoint_x numeric,
  hero_focalpoint_y numeric,
  accent_color text,

  -- Ekspozycja
  pokaz_na_home boolean NOT NULL DEFAULT false,
  pokaz_w_international boolean NOT NULL DEFAULT false,
  priorytet_vr integer DEFAULT 0,
  priorytet_international integer DEFAULT 0,
  kolejnosc integer DEFAULT 0,

  -- SEO (PL/EN/DE)
  seo_title_pl text,
  seo_title_en text,
  seo_title_de text,
  seo_description_pl text,
  seo_description_en text,
  seo_description_de text,

  -- Metadane
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- CHECK constraints
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'viewing_room_typ_vr_check') THEN
    ALTER TABLE viewing_room
    ADD CONSTRAINT viewing_room_typ_vr_check
    CHECK (typ_vr = ANY (ARRAY[
      'relacja'::text,
      'idea'::text,
      'pojecie'::text,
      'monografia'::text,
      'archiwum'::text,
      'wspolczesne_kontynuacje'::text
    ]));
    RAISE NOTICE '✓ Dodano CHECK constraint viewing_room_typ_vr_check';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'viewing_room_status_check') THEN
    ALTER TABLE viewing_room
    ADD CONSTRAINT viewing_room_status_check
    CHECK (status_publiczny = ANY (ARRAY[
      'szkic'::text,
      'aktywny'::text,
      'archiwalny'::text
    ]));
    RAISE NOTICE '✓ Dodano CHECK constraint viewing_room_status_check';
  END IF;
END $$;

-- Indeksy
CREATE INDEX IF NOT EXISTS idx_vr_status ON viewing_room(status_publiczny);
CREATE INDEX IF NOT EXISTS idx_vr_typ ON viewing_room(typ_vr);
CREATE INDEX IF NOT EXISTS idx_vr_priorytet ON viewing_room(priorytet_vr DESC);
CREATE INDEX IF NOT EXISTS idx_vr_data_publikacji
  ON viewing_room(data_publikacji DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_vr_pokaz_na_home
  ON viewing_room(pokaz_na_home) WHERE pokaz_na_home = true;
CREATE INDEX IF NOT EXISTS idx_vr_pokaz_w_international
  ON viewing_room(pokaz_w_international) WHERE pokaz_w_international = true;
CREATE INDEX IF NOT EXISTS idx_vr_praca_hero
  ON viewing_room(praca_hero_id) WHERE praca_hero_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_vr_idea_glowna
  ON viewing_room(idea_glowna_id) WHERE idea_glowna_id IS NOT NULL;

DO $$ BEGIN
  RAISE NOTICE '✓ Utworzono tabele viewing_room z 9 indeksami';
  RAISE NOTICE '';
END $$;


-- ============================================================================
-- 6. M:N viewing_room_prace
-- ============================================================================
--
-- Łączy Viewing Room z konkretnymi pracami z bazy (z Kolekcji i Zasobów).
-- Pole kontekst_w_vr_* — krótki komentarz kuratorski per praca w danym VR
-- (różny od ogólnego opisu pracy, generowany przez AI lub pisany ręcznie).
-- ============================================================================

CREATE TABLE IF NOT EXISTS viewing_room_prace (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vr_id uuid NOT NULL REFERENCES viewing_room(id) ON DELETE CASCADE,
  praca_id uuid NOT NULL REFERENCES prace(id) ON DELETE CASCADE,
  kolejnosc integer NOT NULL DEFAULT 0,

  -- Krótki komentarz kuratorski per praca w tym VR (PL/EN/DE)
  kontekst_w_vr_pl text,
  kontekst_w_vr_en text,
  kontekst_w_vr_de text,

  -- Czy pokazać cenę przy tej pracy w tym VR
  pokaz_cene boolean NOT NULL DEFAULT false,

  -- Opcjonalne nadpisanie ceny per VR (rzadko używane)
  cena_w_vr numeric,

  created_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT vr_prace_unique UNIQUE (vr_id, praca_id)
);

CREATE INDEX IF NOT EXISTS idx_vr_prace_vr ON viewing_room_prace(vr_id);
CREATE INDEX IF NOT EXISTS idx_vr_prace_praca ON viewing_room_prace(praca_id);
CREATE INDEX IF NOT EXISTS idx_vr_prace_kolejnosc ON viewing_room_prace(vr_id, kolejnosc);

DO $$ BEGIN
  RAISE NOTICE '✓ Utworzono tabele viewing_room_prace (M:N)';
END $$;


-- ============================================================================
-- 7. M:N viewing_room_pojecia
-- ============================================================================

CREATE TABLE IF NOT EXISTS viewing_room_pojecia (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vr_id uuid NOT NULL REFERENCES viewing_room(id) ON DELETE CASCADE,
  pojecie_id uuid NOT NULL REFERENCES pojecia(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT vr_pojecia_unique UNIQUE (vr_id, pojecie_id)
);

CREATE INDEX IF NOT EXISTS idx_vr_pojecia_vr ON viewing_room_pojecia(vr_id);
CREATE INDEX IF NOT EXISTS idx_vr_pojecia_pojecie ON viewing_room_pojecia(pojecie_id);

DO $$ BEGIN
  RAISE NOTICE '✓ Utworzono tabele viewing_room_pojecia (M:N)';
END $$;


-- ============================================================================
-- 8. M:N viewing_room_artysci
-- ============================================================================
--
-- Lookup z prac (artyści występujących w VR przez praca.artysta_id),
-- ale opcjonalnie też ręcznie dodawani jako 'gosc programu', 'kontekst' itp.
-- Pole rola_w_vr — np. głowny / kontekst / zasoby / kontynuacja
-- ============================================================================

CREATE TABLE IF NOT EXISTS viewing_room_artysci (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vr_id uuid NOT NULL REFERENCES viewing_room(id) ON DELETE CASCADE,
  artysta_id uuid NOT NULL REFERENCES artysci(id) ON DELETE CASCADE,
  rola_w_vr text,
  created_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT vr_artysci_unique UNIQUE (vr_id, artysta_id)
);

CREATE INDEX IF NOT EXISTS idx_vr_artysci_vr ON viewing_room_artysci(vr_id);
CREATE INDEX IF NOT EXISTS idx_vr_artysci_artysta ON viewing_room_artysci(artysta_id);

DO $$ BEGIN
  RAISE NOTICE '✓ Utworzono tabele viewing_room_artysci (M:N)';
END $$;


-- ============================================================================
-- 9. M:N viewing_room_powiazane (VR ↔ VR dla modułu "Odkrywaj dalej")
-- ============================================================================

CREATE TABLE IF NOT EXISTS viewing_room_powiazane (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vr_id uuid NOT NULL REFERENCES viewing_room(id) ON DELETE CASCADE,
  powiazany_vr_id uuid NOT NULL REFERENCES viewing_room(id) ON DELETE CASCADE,
  notatka text,
  kolejnosc integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT vr_powiazane_unique UNIQUE (vr_id, powiazany_vr_id),
  CONSTRAINT vr_powiazane_different CHECK (vr_id <> powiazany_vr_id)
);

CREATE INDEX IF NOT EXISTS idx_vr_powiazane_vr ON viewing_room_powiazane(vr_id);
CREATE INDEX IF NOT EXISTS idx_vr_powiazane_powiazany
  ON viewing_room_powiazane(powiazany_vr_id);

DO $$ BEGIN
  RAISE NOTICE '✓ Utworzono tabele viewing_room_powiazane (M:N)';
  RAISE NOTICE '';
END $$;


-- ============================================================================
-- 10. TABELA viewing_room_assets (bogate media — renderingi wnętrz, panoramy, video)
-- ============================================================================
--
-- Pliki towarzyszące Viewing Roomowi, używane w bloku praca_in_situ, archiwum,
-- panorama, video, detail, cytat z obrazem.
--
-- Pole prompt_ai — "hak" na przyszłą automatyzację (Poziom 2):
-- zapisuje prompt użyty w Midjourney/Flux dla powtórzenia generowania.
-- ============================================================================

CREATE TABLE IF NOT EXISTS viewing_room_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vr_id uuid NOT NULL REFERENCES viewing_room(id) ON DELETE CASCADE,

  typ_asset text NOT NULL,

  url text NOT NULL,
  url_low_res text,
  url_thumbnail text,

  -- Opcjonalne powiązanie z konkretną pracą
  praca_id uuid REFERENCES prace(id) ON DELETE SET NULL,

  -- Metadane (PL/EN/DE)
  podpis_pl text,
  podpis_en text,
  podpis_de text,

  -- Pomocnicze
  prompt_ai text,       -- prompt użyty w generatorze AI (Midjourney/Flux)
  zrodlo text,          -- 'midjourney', 'flux', 'photoshop', 'archiwum_galerii', etc.
  kolejnosc integer DEFAULT 0,

  -- Dodatkowe dane jsonb (np. dla video: duration, dla 360_view: angles)
  dane_jsonb jsonb,

  created_at timestamptz NOT NULL DEFAULT now()
);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'vr_assets_typ_check') THEN
    ALTER TABLE viewing_room_assets
    ADD CONSTRAINT vr_assets_typ_check
    CHECK (typ_asset = ANY (ARRAY[
      'rendering_wnetrze'::text,
      'panorama'::text,
      'video'::text,
      'detail'::text,
      'archiwum'::text,
      'cytat_obraz'::text,
      'inne'::text
    ]));
    RAISE NOTICE '✓ Dodano CHECK constraint vr_assets_typ_check';
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_vr_assets_vr ON viewing_room_assets(vr_id);
CREATE INDEX IF NOT EXISTS idx_vr_assets_praca
  ON viewing_room_assets(praca_id) WHERE praca_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_vr_assets_typ ON viewing_room_assets(typ_asset);
CREATE INDEX IF NOT EXISTS idx_vr_assets_kolejnosc
  ON viewing_room_assets(vr_id, kolejnosc);

DO $$ BEGIN
  RAISE NOTICE '✓ Utworzono tabele viewing_room_assets z 4 indeksami';
  RAISE NOTICE '';
END $$;


-- ============================================================================
-- 11. TRIGGER updated_at dla viewing_room (analogicznie do innych tabel)
-- ============================================================================

CREATE OR REPLACE FUNCTION update_viewing_room_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_viewing_room_updated_at ON viewing_room;

CREATE TRIGGER trigger_viewing_room_updated_at
  BEFORE UPDATE ON viewing_room
  FOR EACH ROW
  EXECUTE FUNCTION update_viewing_room_updated_at();

DO $$ BEGIN
  RAISE NOTICE '✓ Utworzono trigger update_viewing_room_updated_at';
  RAISE NOTICE '';
END $$;


-- ============================================================================
-- 12. WERYFIKACJA KOŃCOWA — RAPORT PASS/FAIL
-- ============================================================================

DO $$
DECLARE
  -- Liczniki dla weryfikacji
  liczba_kolumn_prace integer;
  liczba_kolumn_artysci integer;
  liczba_indeksow_vr integer;
  liczba_constraints_check integer;
  liczba_prac_kolekcja integer;
  liczba_prac_zasoby integer;
  liczba_prac_archiwum_pozostalo integer;
  pass_count integer := 0;
  fail_count integer := 0;
  total_count integer := 0;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '════════════════════════════════════════════════════════════════════';
  RAISE NOTICE '   MIGRACJA OBSZAR 3 — WERYFIKACJA KONCOWA';
  RAISE NOTICE '════════════════════════════════════════════════════════════════════';
  RAISE NOTICE '';

  -- TEST 1: Nowe kolumny w prace (6 pól)
  total_count := total_count + 1;
  SELECT COUNT(*) INTO liczba_kolumn_prace
  FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = 'prace'
    AND column_name IN (
      'potencjal_viewing_room', 'rola_w_zasobach',
      'kontekst_zasobowy_pl', 'kontekst_zasobowy_en',
      'priorytet_zasoby', 'priorytet_viewing_room'
    );
  IF liczba_kolumn_prace = 6 THEN
    RAISE NOTICE '✓ TEST 1 PASS: 6 nowych kolumn w prace (potencjal_vr, rola, kontekst_pl/en, 2x priorytet)';
    pass_count := pass_count + 1;
  ELSE
    RAISE WARNING '✗ TEST 1 FAIL: Oczekiwano 6 nowych kolumn w prace, znaleziono %', liczba_kolumn_prace;
    fail_count := fail_count + 1;
  END IF;

  -- TEST 2: Nowe kolumny w artysci (2 pola)
  total_count := total_count + 1;
  SELECT COUNT(*) INTO liczba_kolumn_artysci
  FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = 'artysci'
    AND column_name IN ('status_programowy', 'potencjal_viewing_room');
  IF liczba_kolumn_artysci = 2 THEN
    RAISE NOTICE '✓ TEST 2 PASS: 2 nowe kolumny w artysci (status_programowy, potencjal_vr)';
    pass_count := pass_count + 1;
  ELSE
    RAISE WARNING '✗ TEST 2 FAIL: Oczekiwano 2 nowe kolumny w artysci, znaleziono %', liczba_kolumn_artysci;
    fail_count := fail_count + 1;
  END IF;

  -- TEST 3: Tabela artysci_relacje_recznie
  total_count := total_count + 1;
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'artysci_relacje_recznie'
  ) THEN
    RAISE NOTICE '✓ TEST 3 PASS: Tabela artysci_relacje_recznie istnieje';
    pass_count := pass_count + 1;
  ELSE
    RAISE WARNING '✗ TEST 3 FAIL: Tabela artysci_relacje_recznie nie istnieje';
    fail_count := fail_count + 1;
  END IF;

  -- TEST 4: Tabela viewing_room
  total_count := total_count + 1;
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'viewing_room'
  ) THEN
    RAISE NOTICE '✓ TEST 4 PASS: Tabela viewing_room istnieje';
    pass_count := pass_count + 1;
  ELSE
    RAISE WARNING '✗ TEST 4 FAIL: Tabela viewing_room nie istnieje';
    fail_count := fail_count + 1;
  END IF;

  -- TEST 5: 4 tabele M:N dla VR (prace, pojecia, artysci, powiazane)
  total_count := total_count + 1;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'viewing_room_prace')
     AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'viewing_room_pojecia')
     AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'viewing_room_artysci')
     AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'viewing_room_powiazane')
  THEN
    RAISE NOTICE '✓ TEST 5 PASS: 4 tabele M:N dla VR istnieja (prace, pojecia, artysci, powiazane)';
    pass_count := pass_count + 1;
  ELSE
    RAISE WARNING '✗ TEST 5 FAIL: Brakuje jednej z 4 tabel M:N dla VR';
    fail_count := fail_count + 1;
  END IF;

  -- TEST 6: Tabela viewing_room_assets
  total_count := total_count + 1;
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'viewing_room_assets'
  ) THEN
    RAISE NOTICE '✓ TEST 6 PASS: Tabela viewing_room_assets istnieje';
    pass_count := pass_count + 1;
  ELSE
    RAISE WARNING '✗ TEST 6 FAIL: Tabela viewing_room_assets nie istnieje';
    fail_count := fail_count + 1;
  END IF;

  -- TEST 7: Indeksy dla viewing_room (oczekuje >= 9)
  total_count := total_count + 1;
  SELECT COUNT(*) INTO liczba_indeksow_vr
  FROM pg_indexes
  WHERE schemaname = 'public' AND tablename = 'viewing_room';
  IF liczba_indeksow_vr >= 9 THEN
    RAISE NOTICE '✓ TEST 7 PASS: viewing_room ma % indeksow (oczekiwano >=9)', liczba_indeksow_vr;
    pass_count := pass_count + 1;
  ELSE
    RAISE WARNING '✗ TEST 7 FAIL: viewing_room ma % indeksow (oczekiwano >=9)', liczba_indeksow_vr;
    fail_count := fail_count + 1;
  END IF;

  -- TEST 8: CHECK constraints (oczekuje 6: widocznosc, prace.potencjal_vr, prace.rola, artysci.status, artysci.potencjal_vr, viewing_room.typ_vr, viewing_room.status, vr_assets.typ)
  total_count := total_count + 1;
  SELECT COUNT(*) INTO liczba_constraints_check
  FROM pg_constraint
  WHERE conname IN (
    'prace_widocznosc_check',
    'prace_potencjal_vr_check',
    'prace_rola_w_zasobach_check',
    'artysci_status_programowy_check',
    'artysci_potencjal_vr_check',
    'viewing_room_typ_vr_check',
    'viewing_room_status_check',
    'vr_assets_typ_check'
  );
  IF liczba_constraints_check = 8 THEN
    RAISE NOTICE '✓ TEST 8 PASS: 8 CHECK constraints istnieje (widocznosc, 2x potencjal_vr, rola, status, typ_vr, status, vr_assets)';
    pass_count := pass_count + 1;
  ELSE
    RAISE WARNING '✗ TEST 8 FAIL: Oczekiwano 8 CHECK constraints, znaleziono %', liczba_constraints_check;
    fail_count := fail_count + 1;
  END IF;

  -- TEST 9: Migracja archiwum → zasoby (sprawdź czy nie zostały rekordy z archiwum)
  total_count := total_count + 1;
  SELECT COUNT(*) INTO liczba_prac_archiwum_pozostalo
  FROM prace WHERE widocznosc = 'archiwum';
  IF liczba_prac_archiwum_pozostalo = 0 THEN
    RAISE NOTICE '✓ TEST 9 PASS: Brak prac z widocznosc=archiwum (migracja OK)';
    pass_count := pass_count + 1;
  ELSE
    RAISE WARNING '✗ TEST 9 FAIL: Pozostalo % prac z widocznosc=archiwum (migracja nieudana)', liczba_prac_archiwum_pozostalo;
    fail_count := fail_count + 1;
  END IF;

  -- TEST 10: Trigger updated_at dla viewing_room
  total_count := total_count + 1;
  IF EXISTS (
    SELECT 1 FROM information_schema.triggers
    WHERE trigger_schema = 'public'
      AND event_object_table = 'viewing_room'
      AND trigger_name = 'trigger_viewing_room_updated_at'
  ) THEN
    RAISE NOTICE '✓ TEST 10 PASS: Trigger trigger_viewing_room_updated_at istnieje';
    pass_count := pass_count + 1;
  ELSE
    RAISE WARNING '✗ TEST 10 FAIL: Brak triggera trigger_viewing_room_updated_at';
    fail_count := fail_count + 1;
  END IF;

  -- PODSUMOWANIE FINALNE
  SELECT COUNT(*) INTO liczba_prac_kolekcja FROM prace WHERE widocznosc = 'kolekcja';
  SELECT COUNT(*) INTO liczba_prac_zasoby FROM prace WHERE widocznosc = 'zasoby';

  RAISE NOTICE '';
  RAISE NOTICE '════════════════════════════════════════════════════════════════════';
  RAISE NOTICE '   PODSUMOWANIE WERYFIKACJI';
  RAISE NOTICE '════════════════════════════════════════════════════════════════════';
  RAISE NOTICE '';
  RAISE NOTICE '  Wyniki testow: % PASS / % FAIL (z % testow lacznie)', pass_count, fail_count, total_count;
  RAISE NOTICE '';
  RAISE NOTICE '  Stan tabeli prace po migracji:';
  RAISE NOTICE '    - widocznosc=kolekcja: % prac', liczba_prac_kolekcja;
  RAISE NOTICE '    - widocznosc=zasoby:   % prac', liczba_prac_zasoby;
  RAISE NOTICE '';

  IF fail_count = 0 THEN
    RAISE NOTICE '✓✓✓ MIGRACJA OBSZAR 3 ZAKONCZONA SUKCESEM ✓✓✓';
    RAISE NOTICE '';
    RAISE NOTICE '  Nowe pola w prace:    6';
    RAISE NOTICE '  Nowe pola w artysci:  2';
    RAISE NOTICE '  Nowe tabele:          7 (artysci_relacje_recznie, viewing_room + 4 M:N + assets)';
    RAISE NOTICE '  CHECK constraints:    8';
    RAISE NOTICE '  Indeksy viewing_room: %', liczba_indeksow_vr;
    RAISE NOTICE '  Trigger:              trigger_viewing_room_updated_at';
    RAISE NOTICE '';
    RAISE NOTICE '  Nastepne kroki:';
    RAISE NOTICE '    1. Aktualizacja panelu CRM (esta-panel.html) - nowe pola w modalach pracy i artysty';
    RAISE NOTICE '    2. Etap 2 - korekty Kolekcji (usuniecie IDEE z menu, dodanie ZASOBY)';
    RAISE NOTICE '    3. Etap 3 - nowa strona /zasoby (fetch prac z widocznosc=zasoby)';
    RAISE NOTICE '';
  ELSE
    RAISE EXCEPTION 'MIGRACJA NIEUDANA: % testow zakonczonych bledem. Sprawdz logi powyzej.', fail_count;
  END IF;

  RAISE NOTICE '════════════════════════════════════════════════════════════════════';
END $$;

COMMIT;

-- ============================================================================
-- KONIEC MIGRACJI OBSZARU 3
-- ============================================================================
