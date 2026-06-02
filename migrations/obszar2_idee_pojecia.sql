-- =============================================================================
-- OBSZAR 2 — IDEE, POJĘCIA I WSPÓŁCZESNE KONTYNUACJE
-- =============================================================================
-- Wersja:        1
-- Data:          2026-06-02
-- Dokument:      docs/OBSZAR-2-IDEE-POJECIA.md
-- Plan:          docs/ESTA-PLAN-PRZEBUDOWY.md (Obszar 2)
-- Architektura:  docs/ESTA-ARCHITEKTURA-SYSTEMU.md
--
-- Zakres jednej transakcji:
--   1. Higieniczne usuwanie starego modelu idei:
--      - 6 starych tabel (idee, idee_artysci, idee_prace, idee_teksty,
--        kompendium_idee, idee_idee) z DROP CASCADE
--      - 6 kolumn _txt z głównych tabel (artysci × 2, prace, wystawy,
--        targi, oferty)
--      - prace_backup_obszar0.idee_txt NIE ruszamy (backup z Obszaru 0)
--   2. Pre-flight check szukający nieznanych zależności
--   3. Brak BACKUP — świadomie nie zachowujemy starych danych
--      (35 idei + 7 powiązań + 4 stringi _txt = 46 rekordów, wszystko
--      do ręcznego odtworzenia przez Tadeusza w panelu po migracji)
--   4. Nowe tabele:
--      - idee (7 rekordów: 6 głównych + 1 wspolczesne_kontynuacje)
--      - pojecia (45 rekordów: 36 sygnal + 9 tag_publiczny)
--      - artysci_idee (M:N artysta ↔ idea z rolą)
--      - pojecia_artysci (M:N)
--      - pojecia_prace (M:N)
--      - pojecia_wystawy (M:N)
--   5. Nowe pola FK na istniejących tabelach:
--      - artysci.idea_glowna_id (single, nullable)
--      - prace.idea_glowna_id (single, nullable)
--      - wystawy.idea_glowna_id (single, nullable)
--   6. Indeksy na nowych kolumnach
--   7. Weryfikacja końcowa przez RAISE NOTICE
--
-- Wzorzec migracji (z Obszaru 0):
--   - Cała migracja w jednym BEGIN/COMMIT — rollback przy każdym błędzie.
--   - Sekcja 0 higieniczna PRZED pre-flight.
--   - Pre-flight szuka NIEZNANYCH zależności (znane już skasowane).
--   - Idempotentne: IF NOT EXISTS / IF EXISTS / DROP CASCADE.
--   - Polityki RLS na nowych tabelach POZA tą migracją (osobny obszar
--     bezpieczeństwa wszystkich tabel).
-- =============================================================================

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- -----------------------------------------------------------------------------
-- 0. HIGIENICZNE USUWANIE ZNANYCH OBIEKTÓW przed pre-flight i migracją.
-- -----------------------------------------------------------------------------
-- Wszystko co znamy i wiemy że trzeba usunąć — w jednym miejscu, przed
-- pre-flight. Pre-flight szuka tylko NIEZNANYCH zależności.

-- Kolumny _txt z głównych tabel (stary model zapisu idei jako stringi)
ALTER TABLE artysci DROP COLUMN IF EXISTS idee_glowne_txt;
ALTER TABLE artysci DROP COLUMN IF EXISTS idee_dodatkowe_txt;
ALTER TABLE prace   DROP COLUMN IF EXISTS idee_txt;
ALTER TABLE wystawy DROP COLUMN IF EXISTS idee_txt;
ALTER TABLE targi   DROP COLUMN IF EXISTS idee_txt;
ALTER TABLE oferty  DROP COLUMN IF EXISTS idee_txt;
-- prace_backup_obszar0.idee_txt — NIE ruszamy (backup z Obszaru 0)

-- Stare tabele łączące M:N
DROP TABLE IF EXISTS idee_artysci CASCADE;
DROP TABLE IF EXISTS idee_prace CASCADE;
DROP TABLE IF EXISTS idee_teksty CASCADE;
DROP TABLE IF EXISTS kompendium_idee CASCADE;
DROP TABLE IF EXISTS idee_idee CASCADE;

-- Stara tabela idee (35 rekordów w starym modelu 8 rodzin)
DROP TABLE IF EXISTS idee CASCADE;

-- -----------------------------------------------------------------------------
-- 0a'. PRE-FLIGHT CHECK — szukamy NIEZNANYCH zależności po sprzątaniu.
-- -----------------------------------------------------------------------------
-- Cel: znaleźć WSZYSTKIE pułapki zanim zaczniemy tworzyć nowe obiekty.
-- Albo PASS, albo EXCEPTION z czytelną listą.
DO $$
DECLARE
  problems text;
BEGIN
  -- (1) Obiekty (views, matviews, sekwencje, indeksy, funkcje) zależne
  -- od skasowanych obiektów. Po CASCADE wszystko zależne już usunięte,
  -- ale jeśli coś wciąż istnieje — flagujemy.
  WITH deps AS (
    SELECT format('%s %I.%I',
             CASE c.relkind WHEN 'v' THEN 'view'
                            WHEN 'm' THEN 'matview'
                            WHEN 'r' THEN 'table'
                            WHEN 'S' THEN 'sequence'
                            WHEN 'i' THEN 'index'
                            ELSE c.relkind::text END,
             n.nspname, c.relname) AS obj_desc
      FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
     WHERE n.nspname = 'public'
       AND (c.relname IN ('idee','idee_artysci','idee_prace',
                          'idee_teksty','kompendium_idee','idee_idee'))
  )
  SELECT string_agg(obj_desc, E'\n  ') INTO problems FROM deps;

  IF problems IS NOT NULL THEN
    RAISE EXCEPTION E'Pre-flight FAIL: pozostały obiekty po sprzątaniu:\n  %', problems;
  END IF;

  -- (2) FK na nieistniejącą już tabelę idee (z innych tabel poza naszą listą)
  WITH fk_deps AS (
    SELECT format('FK %I.%I.%I → idee',
             n.nspname, c.relname, con.conname) AS obj_desc
      FROM pg_constraint con
      JOIN pg_class c ON c.oid = con.conrelid
      JOIN pg_namespace n ON n.oid = c.relnamespace
     WHERE con.contype = 'f'
       AND pg_get_constraintdef(con.oid) ILIKE '%REFERENCES%idee%'
  )
  SELECT string_agg(obj_desc, E'\n  ') INTO problems FROM fk_deps;

  IF problems IS NOT NULL THEN
    RAISE EXCEPTION E'Pre-flight FAIL: pozostałe FK do nieistniejącej tabeli idee:\n  %', problems;
  END IF;

  -- (3) Kolumny _txt na innych tabelach niż prace_backup_obszar0
  -- (jeśli coś gdzieś pominęliśmy)
  WITH leftover_cols AS (
    SELECT format('%I.%I', table_name, column_name) AS obj_desc
      FROM information_schema.columns
     WHERE table_schema = 'public'
       AND (column_name LIKE '%idee%' OR column_name LIKE '%idea%' OR column_name LIKE '%pojec%')
       AND table_name NOT IN ('prace_backup_obszar0')
  )
  SELECT string_agg(obj_desc, E'\n  ') INTO problems FROM leftover_cols;

  IF problems IS NOT NULL THEN
    RAISE NOTICE E'INFO: pozostały kolumny _txt (mogą być w prace_backup_obszar0 lub innych — sprawdź):\n  %', problems;
  END IF;

  RAISE NOTICE 'Pre-flight check: PASS. Można tworzyć nowe tabele.';
END $$;


-- -----------------------------------------------------------------------------
-- 1. TWORZENIE NOWEJ TABELI idee (7 rekordów)
-- -----------------------------------------------------------------------------
CREATE TABLE idee (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nazwa               text NOT NULL,
  nazwa_en            text,
  nazwa_de            text,
  slug                text NOT NULL UNIQUE,
  numer               integer NOT NULL UNIQUE,
  typ                 text NOT NULL DEFAULT 'glowna',
  opis_krotki_pl      text,
  opis_krotki_en      text,
  opis_krotki_de      text,
  opis_dlugi_pl       text,
  opis_dlugi_en       text,
  opis_dlugi_de       text,
  artysci_home        text,
  detal_obraz_url     text,
  alt_detalu          text,
  charakter_wizualny  text,
  kolejnosc           integer NOT NULL UNIQUE,
  status_publikacji   text NOT NULL DEFAULT 'gotowe',
  seo_title           text,
  seo_description     text,
  meta_index          text NOT NULL DEFAULT 'index',
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT idee_typ_check
    CHECK (typ IN ('glowna','wspolczesne_kontynuacje')),
  CONSTRAINT idee_numer_check
    CHECK (numer BETWEEN 1 AND 99),
  CONSTRAINT idee_status_publikacji_check
    CHECK (status_publikacji IN ('szkic','gotowe','opublikowane','ukryte')),
  CONSTRAINT idee_meta_index_check
    CHECK (meta_index IN ('index','noindex'))
);

CREATE INDEX idx_idee_typ ON idee(typ);
CREATE INDEX idx_idee_kolejnosc ON idee(kolejnosc);
CREATE INDEX idx_idee_status_publikacji ON idee(status_publikacji);


-- -----------------------------------------------------------------------------
-- 2. TWORZENIE NOWEJ TABELI pojecia (45 rekordów)
-- -----------------------------------------------------------------------------
CREATE TABLE pojecia (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nazwa                   text NOT NULL,
  nazwa_en                text,
  nazwa_de                text,
  slug                    text NOT NULL UNIQUE,
  idea_glowna_id          uuid NOT NULL REFERENCES idee(id) ON DELETE RESTRICT,
  status_publiczny        text NOT NULL DEFAULT 'sygnal',
  etap_wdrozenia          text NOT NULL DEFAULT 'etap_1_sygnal',
  opis_krotki             text,
  opis_dlugi              text,
  priorytet               integer NOT NULL DEFAULT 0,
  pokaz_na_stronie_idei   boolean NOT NULL DEFAULT true,
  pokaz_przy_artyscie     boolean NOT NULL DEFAULT true,
  pokaz_przy_pracy        boolean NOT NULL DEFAULT true,
  seo_title               text,
  seo_description         text,
  meta_index              text NOT NULL DEFAULT 'noindex',
  created_at              timestamptz NOT NULL DEFAULT now(),
  updated_at              timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT pojecia_status_publiczny_check
    CHECK (status_publiczny IN
           ('ukryte','sygnal','tag_publiczny','klikalny_filtr','strona_pojecia')),
  CONSTRAINT pojecia_etap_wdrozenia_check
    CHECK (etap_wdrozenia IN
           ('etap_1_sygnal','etap_2_filtr','etap_3_opis','etap_4_strona_pojecia')),
  CONSTRAINT pojecia_meta_index_check
    CHECK (meta_index IN ('index','noindex'))
);

CREATE INDEX idx_pojecia_idea_glowna ON pojecia(idea_glowna_id);
CREATE INDEX idx_pojecia_status_publiczny ON pojecia(status_publiczny);
CREATE INDEX idx_pojecia_etap_wdrozenia ON pojecia(etap_wdrozenia);
CREATE INDEX idx_pojecia_priorytet ON pojecia(priorytet);


-- -----------------------------------------------------------------------------
-- 3. TWORZENIE TABEL ŁĄCZĄCYCH M:N (4 tabele, puste po migracji)
-- -----------------------------------------------------------------------------

-- 3a. artysci_idee — artysta ↔ idea z rolą
CREATE TABLE artysci_idee (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  artysta_id  uuid NOT NULL REFERENCES artysci(id) ON DELETE CASCADE,
  idea_id     uuid NOT NULL REFERENCES idee(id) ON DELETE CASCADE,
  rola        text NOT NULL DEFAULT 'glowna',
  opis        text,
  kolejnosc   integer NOT NULL DEFAULT 1,
  created_at  timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT artysci_idee_rola_check
    CHECK (rola IN ('glowna','uzupelniajaca')),
  CONSTRAINT artysci_idee_unique
    UNIQUE (artysta_id, idea_id)
);

CREATE INDEX idx_artysci_idee_artysta ON artysci_idee(artysta_id);
CREATE INDEX idx_artysci_idee_idea ON artysci_idee(idea_id);

-- 3b. pojecia_artysci — pojęcie ↔ artysta
CREATE TABLE pojecia_artysci (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pojecie_id  uuid NOT NULL REFERENCES pojecia(id) ON DELETE CASCADE,
  artysta_id  uuid NOT NULL REFERENCES artysci(id) ON DELETE CASCADE,
  priorytet   integer NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT pojecia_artysci_unique
    UNIQUE (pojecie_id, artysta_id)
);

CREATE INDEX idx_pojecia_artysci_pojecie ON pojecia_artysci(pojecie_id);
CREATE INDEX idx_pojecia_artysci_artysta ON pojecia_artysci(artysta_id);

-- 3c. pojecia_prace — pojęcie ↔ praca
CREATE TABLE pojecia_prace (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pojecie_id  uuid NOT NULL REFERENCES pojecia(id) ON DELETE CASCADE,
  praca_id    uuid NOT NULL REFERENCES prace(id) ON DELETE CASCADE,
  priorytet   integer NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT pojecia_prace_unique
    UNIQUE (pojecie_id, praca_id)
);

CREATE INDEX idx_pojecia_prace_pojecie ON pojecia_prace(pojecie_id);
CREATE INDEX idx_pojecia_prace_praca ON pojecia_prace(praca_id);

-- 3d. pojecia_wystawy — pojęcie ↔ wystawa
CREATE TABLE pojecia_wystawy (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pojecie_id  uuid NOT NULL REFERENCES pojecia(id) ON DELETE CASCADE,
  wystawa_id  uuid NOT NULL REFERENCES wystawy(id) ON DELETE CASCADE,
  priorytet   integer NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT pojecia_wystawy_unique
    UNIQUE (pojecie_id, wystawa_id)
);

CREATE INDEX idx_pojecia_wystawy_pojecie ON pojecia_wystawy(pojecie_id);
CREATE INDEX idx_pojecia_wystawy_wystawa ON pojecia_wystawy(wystawa_id);


-- -----------------------------------------------------------------------------
-- 4. NOWE POLA FK NA ISTNIEJĄCYCH TABELACH (single idea główna)
-- -----------------------------------------------------------------------------
-- Każdy artysta/praca/wystawa ma jedną ideę główną (nullable, do ręcznego
-- uzupełnienia w panelu). Dodatkowe idee przez artysci_idee z rolą='uzupelniajaca'.
ALTER TABLE artysci ADD COLUMN IF NOT EXISTS idea_glowna_id
  uuid REFERENCES idee(id) ON DELETE SET NULL;
ALTER TABLE prace ADD COLUMN IF NOT EXISTS idea_glowna_id
  uuid REFERENCES idee(id) ON DELETE SET NULL;
ALTER TABLE wystawy ADD COLUMN IF NOT EXISTS idea_glowna_id
  uuid REFERENCES idee(id) ON DELETE SET NULL;

CREATE INDEX idx_artysci_idea_glowna ON artysci(idea_glowna_id);
CREATE INDEX idx_prace_idea_glowna ON prace(idea_glowna_id);
CREATE INDEX idx_wystawy_idea_glowna ON wystawy(idea_glowna_id);


-- -----------------------------------------------------------------------------
-- 5. SEED IDEE — 7 rekordów (6 głównych + 1 wspolczesne_kontynuacje)
-- -----------------------------------------------------------------------------
INSERT INTO idee (numer, slug, typ, nazwa, nazwa_en, kolejnosc,
                  opis_krotki_pl, opis_krotki_en,
                  artysci_home, meta_index) VALUES

(1, 'idea-jezyk', 'glowna',
 'Idea / Język', 'Idea / Language', 1,
 'Dzieło jako sytuacja pojęciowa, językowa i intelektualna.',
 'The artwork as a conceptual, linguistic and intellectual situation.',
 'Kozłowski / Dłużniewski', 'index'),

(2, 'slowo-znak', 'glowna',
 'Słowo / Znak', 'Word / Sign', 2,
 'Słowo jako obraz, przestrzeń, typografia i komunikat.',
 'The word as image, space, typography and communication.',
 'Dróżdż / Twożywo / Kozłowski', 'index'),

(3, 'geometria-struktura', 'glowna',
 'Geometria / Struktura', 'Geometry / Structure', 3,
 'Układ, rytm, powtórzenie i relacja elementów.',
 'Arrangement, rhythm, repetition and relations between elements.',
 'Gołkowska / Gostomski / Wiśniewski / Brandt', 'index'),

(4, 'swiatlo-przestrzen', 'glowna',
 'Światło / Przestrzeń', 'Light / Space', 4,
 'Cień, obiekt, projekcja, miejsce i działanie.',
 'Shadow, object, projection, place and action.',
 'Chwałczyk / B. Kozłowska / Paruzel / Wiśniewski', 'index'),

(5, 'pamiec-archiwum', 'glowna',
 'Pamięć / Archiwum', 'Memory / Archive', 5,
 'Fotografia, ślad, dokumentacja i historia galerii.',
 'Photography, trace, documentation and the history of the gallery.',
 'Lewczyński / Archiwum ESTA / B. Kozłowska / Paruzel', 'index'),

(6, 'obraz-komunikat', 'glowna',
 'Obraz / Komunikat', 'Image / Communication', 6,
 'Malarstwo, tekst, ironia i znak w przestrzeni publicznej.',
 'Painting, text, irony and the sign in public space.',
 'Sobczyk / Twożywo', 'index'),

(7, 'wspolczesne-kontynuacje', 'wspolczesne_kontynuacje',
 'Współczesne kontynuacje', 'Contemporary Continuations', 7,
 'Ciało, obraz, pamięć, tożsamość.',
 'Body, image, memory, identity.',
 'Żychlińska / Dziedzic / Swoboda', 'index');


-- -----------------------------------------------------------------------------
-- 6. SEED POJECIA — 45 rekordów (36 sygnal + 9 tag_publiczny)
-- -----------------------------------------------------------------------------
-- Wszystkie z etap_wdrozenia='etap_1_sygnal' i meta_index='noindex'.
-- idea_glowna_id wyciągane przez sub-SELECT po slug idei.

-- Idea 1: Idea / Język (6 pojęć)
INSERT INTO pojecia (slug, nazwa, nazwa_en, idea_glowna_id, status_publiczny, priorytet) VALUES
('pojecie',        'pojęcie',        'concept',
   (SELECT id FROM idee WHERE slug='idea-jezyk'), 'sygnal', 1),
('paradoks',       'paradoks',       'paradox',
   (SELECT id FROM idee WHERE slug='idea-jezyk'), 'sygnal', 2),
('definicja',      'definicja',      'definition',
   (SELECT id FROM idee WHERE slug='idea-jezyk'), 'sygnal', 3),
('instrukcja',     'instrukcja',     'instruction',
   (SELECT id FROM idee WHERE slug='idea-jezyk'), 'sygnal', 4),
('system-znaczen', 'system znaczeń', 'system of meanings',
   (SELECT id FROM idee WHERE slug='idea-jezyk'), 'sygnal', 5),
('dokumentacja',   'dokumentacja',   'documentation',
   (SELECT id FROM idee WHERE slug='idea-jezyk'), 'tag_publiczny', 6);

-- Idea 2: Słowo / Znak (6 pojęć)
INSERT INTO pojecia (slug, nazwa, nazwa_en, idea_glowna_id, status_publiczny, priorytet) VALUES
('poezja-konkretna', 'poezja konkretna', 'concrete poetry',
   (SELECT id FROM idee WHERE slug='slowo-znak'), 'tag_publiczny', 1),
('typografia',       'typografia',       'typography',
   (SELECT id FROM idee WHERE slug='slowo-znak'), 'sygnal', 2),
('litera',           'litera',           'letter',
   (SELECT id FROM idee WHERE slug='slowo-znak'), 'sygnal', 3),
('tekst',            'tekst',            'text',
   (SELECT id FROM idee WHERE slug='slowo-znak'), 'sygnal', 4),
('komunikat',        'komunikat',        'message',
   (SELECT id FROM idee WHERE slug='slowo-znak'), 'sygnal', 5),
('uklad-slowo',      'układ (Słowo/Znak)', 'arrangement (Word/Sign)',
   (SELECT id FROM idee WHERE slug='slowo-znak'), 'sygnal', 6);

-- Idea 3: Geometria / Struktura (6 pojęć)
INSERT INTO pojecia (slug, nazwa, nazwa_en, idea_glowna_id, status_publiczny, priorytet) VALUES
('uklad',         'układ',         'arrangement',
   (SELECT id FROM idee WHERE slug='geometria-struktura'), 'sygnal', 1),
('rytm',          'rytm',          'rhythm',
   (SELECT id FROM idee WHERE slug='geometria-struktura'), 'sygnal', 2),
('system',        'system',        'system',
   (SELECT id FROM idee WHERE slug='geometria-struktura'), 'sygnal', 3),
('powtorzenie',   'powtórzenie',   'repetition',
   (SELECT id FROM idee WHERE slug='geometria-struktura'), 'sygnal', 4),
('relief',        'relief',        'relief',
   (SELECT id FROM idee WHERE slug='geometria-struktura'), 'sygnal', 5),
('uklad-otwarty', 'układ otwarty', 'open arrangement',
   (SELECT id FROM idee WHERE slug='geometria-struktura'), 'tag_publiczny', 6);

-- Idea 4: Światło / Przestrzeń (6 pojęć)
INSERT INTO pojecia (slug, nazwa, nazwa_en, idea_glowna_id, status_publiczny, priorytet) VALUES
('swiatlo',   'światło',   'light',
   (SELECT id FROM idee WHERE slug='swiatlo-przestrzen'), 'sygnal', 1),
('cien',      'cień',      'shadow',
   (SELECT id FROM idee WHERE slug='swiatlo-przestrzen'), 'tag_publiczny', 2),
('projekcja', 'projekcja', 'projection',
   (SELECT id FROM idee WHERE slug='swiatlo-przestrzen'), 'sygnal', 3),
('obiekt',    'obiekt',    'object',
   (SELECT id FROM idee WHERE slug='swiatlo-przestrzen'), 'sygnal', 4),
('miejsce',   'miejsce',   'place',
   (SELECT id FROM idee WHERE slug='swiatlo-przestrzen'), 'sygnal', 5),
('dzialanie', 'działanie', 'action',
   (SELECT id FROM idee WHERE slug='swiatlo-przestrzen'), 'sygnal', 6);

-- Idea 5: Pamięć / Archiwum (6 pojęć)
INSERT INTO pojecia (slug, nazwa, nazwa_en, idea_glowna_id, status_publiczny, priorytet) VALUES
('fotografia',      'fotografia',       'photography',
   (SELECT id FROM idee WHERE slug='pamiec-archiwum'), 'tag_publiczny', 1),
('slad',            'ślad',             'trace',
   (SELECT id FROM idee WHERE slug='pamiec-archiwum'), 'sygnal', 2),
('dokument',        'dokument',         'document',
   (SELECT id FROM idee WHERE slug='pamiec-archiwum'), 'sygnal', 3),
('archiwum',        'archiwum',         'archive',
   (SELECT id FROM idee WHERE slug='pamiec-archiwum'), 'tag_publiczny', 4),
('czas',            'czas',             'time',
   (SELECT id FROM idee WHERE slug='pamiec-archiwum'), 'sygnal', 5),
('historia-galerii','historia galerii', 'gallery history',
   (SELECT id FROM idee WHERE slug='pamiec-archiwum'), 'tag_publiczny', 6);

-- Idea 6: Obraz / Komunikat (6 pojęć)
INSERT INTO pojecia (slug, nazwa, nazwa_en, idea_glowna_id, status_publiczny, priorytet) VALUES
('malarstwo',       'malarstwo',       'painting',
   (SELECT id FROM idee WHERE slug='obraz-komunikat'), 'sygnal', 1),
('tekst-w-obrazie', 'tekst w obrazie', 'text in image',
   (SELECT id FROM idee WHERE slug='obraz-komunikat'), 'sygnal', 2),
('ironia',          'ironia',          'irony',
   (SELECT id FROM idee WHERE slug='obraz-komunikat'), 'sygnal', 3),
('miasto',          'miasto',          'city',
   (SELECT id FROM idee WHERE slug='obraz-komunikat'), 'sygnal', 4),
('znak-publiczny',  'znak publiczny',  'public sign',
   (SELECT id FROM idee WHERE slug='obraz-komunikat'), 'sygnal', 5),
('krytyka',         'krytyka',         'critique',
   (SELECT id FROM idee WHERE slug='obraz-komunikat'), 'sygnal', 6);

-- Idea 7: Współczesne kontynuacje (9 pojęć)
INSERT INTO pojecia (slug, nazwa, nazwa_en, idea_glowna_id, status_publiczny, priorytet) VALUES
('cialo',       'ciało',       'body',
   (SELECT id FROM idee WHERE slug='wspolczesne-kontynuacje'), 'tag_publiczny', 1),
('tozsamosc',   'tożsamość',   'identity',
   (SELECT id FROM idee WHERE slug='wspolczesne-kontynuacje'), 'sygnal', 2),
('relacja',     'relacja',     'relation',
   (SELECT id FROM idee WHERE slug='wspolczesne-kontynuacje'), 'sygnal', 3),
('natura',      'natura',      'nature',
   (SELECT id FROM idee WHERE slug='wspolczesne-kontynuacje'), 'sygnal', 4),
('nieludzkie',  'nieludzkie',  'non-human',
   (SELECT id FROM idee WHERE slug='wspolczesne-kontynuacje'), 'tag_publiczny', 5),
('duchowosc',   'duchowość',   'spirituality',
   (SELECT id FROM idee WHERE slug='wspolczesne-kontynuacje'), 'sygnal', 6),
('terytorium',  'terytorium',  'territory',
   (SELECT id FROM idee WHERE slug='wspolczesne-kontynuacje'), 'sygnal', 7),
('emocja',      'emocja',      'emotion',
   (SELECT id FROM idee WHERE slug='wspolczesne-kontynuacje'), 'sygnal', 8),
('granica',     'granica',     'boundary',
   (SELECT id FROM idee WHERE slug='wspolczesne-kontynuacje'), 'sygnal', 9);


-- -----------------------------------------------------------------------------
-- 7. WERYFIKACJA KOŃCOWA — RAISE NOTICE z licznikami
-- -----------------------------------------------------------------------------
DO $$
DECLARE
  cnt_idee integer;
  cnt_idee_glowna integer;
  cnt_idee_wsp integer;
  cnt_pojecia integer;
  cnt_pojecia_sygnal integer;
  cnt_pojecia_tag integer;
  cnt_artysci_idee integer;
  cnt_pojecia_artysci integer;
  cnt_pojecia_prace integer;
  cnt_pojecia_wystawy integer;
BEGIN
  SELECT COUNT(*) INTO cnt_idee FROM idee;
  SELECT COUNT(*) INTO cnt_idee_glowna FROM idee WHERE typ='glowna';
  SELECT COUNT(*) INTO cnt_idee_wsp FROM idee WHERE typ='wspolczesne_kontynuacje';
  SELECT COUNT(*) INTO cnt_pojecia FROM pojecia;
  SELECT COUNT(*) INTO cnt_pojecia_sygnal FROM pojecia WHERE status_publiczny='sygnal';
  SELECT COUNT(*) INTO cnt_pojecia_tag FROM pojecia WHERE status_publiczny='tag_publiczny';
  SELECT COUNT(*) INTO cnt_artysci_idee FROM artysci_idee;
  SELECT COUNT(*) INTO cnt_pojecia_artysci FROM pojecia_artysci;
  SELECT COUNT(*) INTO cnt_pojecia_prace FROM pojecia_prace;
  SELECT COUNT(*) INTO cnt_pojecia_wystawy FROM pojecia_wystawy;

  RAISE NOTICE '====================================================';
  RAISE NOTICE 'Migracja Obszaru 2 — weryfikacja:';
  RAISE NOTICE '  idee: % (oczekiwane: 7)', cnt_idee;
  RAISE NOTICE '    typ=glowna: % (oczekiwane: 6)', cnt_idee_glowna;
  RAISE NOTICE '    typ=wspolczesne_kontynuacje: % (oczekiwane: 1)', cnt_idee_wsp;
  RAISE NOTICE '  pojecia: % (oczekiwane: 45)', cnt_pojecia;
  RAISE NOTICE '    sygnal: % (oczekiwane: 36)', cnt_pojecia_sygnal;
  RAISE NOTICE '    tag_publiczny: % (oczekiwane: 9)', cnt_pojecia_tag;
  RAISE NOTICE '  artysci_idee: % (oczekiwane: 0 — Tadeusz wprowadzi w panelu)', cnt_artysci_idee;
  RAISE NOTICE '  pojecia_artysci: % (oczekiwane: 0)', cnt_pojecia_artysci;
  RAISE NOTICE '  pojecia_prace: % (oczekiwane: 0)', cnt_pojecia_prace;
  RAISE NOTICE '  pojecia_wystawy: % (oczekiwane: 0)', cnt_pojecia_wystawy;
  RAISE NOTICE '====================================================';

  IF cnt_idee != 7 THEN
    RAISE EXCEPTION 'Weryfikacja FAIL: oczekiwane 7 idei, jest %', cnt_idee;
  END IF;
  IF cnt_pojecia != 45 THEN
    RAISE EXCEPTION 'Weryfikacja FAIL: oczekiwane 45 pojęć, jest %', cnt_pojecia;
  END IF;
  IF cnt_pojecia_sygnal != 36 THEN
    RAISE EXCEPTION 'Weryfikacja FAIL: oczekiwane 36 pojęć sygnal, jest %', cnt_pojecia_sygnal;
  END IF;
  IF cnt_pojecia_tag != 9 THEN
    RAISE EXCEPTION 'Weryfikacja FAIL: oczekiwane 9 pojęć tag_publiczny, jest %', cnt_pojecia_tag;
  END IF;

  RAISE NOTICE 'Migracja Obszaru 2: PASS. Gotowe do COMMIT.';
END $$;

COMMIT;

-- =============================================================================
-- WERYFIKACJA (ręcznie po commicie — NIE jest częścią transakcji)
-- =============================================================================
-- SELECT numer, nazwa, typ FROM idee ORDER BY numer;
-- -- Oczekiwane: 7 wierszy, 6 typu glowna + 1 wspolczesne_kontynuacje
--
-- SELECT i.nazwa AS idea, COUNT(p.id) AS liczba_pojec
--   FROM idee i
--   LEFT JOIN pojecia p ON p.idea_glowna_id = i.id
--  GROUP BY i.nazwa, i.kolejnosc
--  ORDER BY i.kolejnosc;
-- -- Oczekiwane: 6+6+6+6+6+6+9 = 45 pojęć
--
-- SELECT status_publiczny, COUNT(*) FROM pojecia GROUP BY status_publiczny;
-- -- Oczekiwane: sygnal=36, tag_publiczny=9
-- =============================================================================
