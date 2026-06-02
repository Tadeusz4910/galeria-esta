-- =============================================================================
-- OBSZAR 2 + 9 — KOMPLETNE UZUPEŁNIENIE: idee, pojęcia, International, EN/DE
-- =============================================================================
-- Wersja:        1
-- Data:          2026-06-02
-- Dokument:      docs/OBSZAR-2-UZUPELNIENIE.md
-- Powiązane:     migrations/obszar0_statusy.sql (commit 1441367...)
--                migrations/obszar2_idee_pojecia.sql (commit 7b592d5)
--
-- ZASADA NACZELNA: jeden raz, kompletnie, bez powrotów.
-- Po tej migracji żaden kolejny obszar planu przebudowy nie powinien
-- dodawać pól strukturalnych do 7 encji programu galerii
-- (prace, artysci, wystawy, targi, oferty, artykuly, kompendium).
--
-- Zakres jednej transakcji:
--   SEKCJA 1: idea_glowna_id na 4 nowych encjach (targi/oferty/artykuly/kompendium)
--   SEKCJA 2: int_publiczne na 6 encjach (wszystkie poza prace)
--   SEKCJA 3: int_visual_wall na 4 encjach (bez targi i oferty - decyzja kuratorska)
--   SEKCJA 4: dopełnienie DE na artysci i wystawy (już mają EN)
--   SEKCJA 5: EN+DE od zera na kompendium/artykuly/targi/oferty
--   SEKCJA 6: 4 tabele M:N pojęć (pojecia_targi/oferty/artykuly/kompendium)
--   SEKCJA 7: weryfikacja końcowa
--
-- Razem: 64 nowe kolumny + 4 tabele M:N + 22 indeksy.
--
-- Wzorzec migracji (Obszar 0 i 2):
--   - Cała migracja w BEGIN/COMMIT - rollback przy każdym błędzie
--   - Pre-flight check 0a' sprawdza stan przed zmianami
--   - Idempotentne: IF NOT EXISTS, ADD COLUMN IF NOT EXISTS
--   - Wszystkie pola tekstowe nullable, boolean DEFAULT false
--   - Weryfikacja końcowa z RAISE NOTICE/EXCEPTION
-- =============================================================================

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- -----------------------------------------------------------------------------
-- 0a'. PRE-FLIGHT CHECK
-- -----------------------------------------------------------------------------
DO $$
DECLARE
  cnt_idee integer;
  cnt_pojecia integer;
  cnt_artysci integer;
  cnt_wystawy integer;
  cnt_targi integer;
  cnt_oferty integer;
  cnt_artykuly integer;
  cnt_kompendium integer;
  has_targi boolean;
  has_oferty boolean;
  has_artykuly boolean;
  has_kompendium boolean;
  prace_has_int boolean;
BEGIN
  -- (1) Stan Obszaru 2 nienaruszony
  SELECT COUNT(*) INTO cnt_idee FROM idee;
  SELECT COUNT(*) INTO cnt_pojecia FROM pojecia;

  IF cnt_idee != 7 THEN
    RAISE EXCEPTION 'Pre-flight FAIL: tabela idee ma % rekordów, oczekiwane 7', cnt_idee;
  END IF;

  IF cnt_pojecia != 45 THEN
    RAISE EXCEPTION 'Pre-flight FAIL: tabela pojecia ma % rekordów, oczekiwane 45', cnt_pojecia;
  END IF;

  -- (2) Wszystkie 4 nowe tabele docelowe istnieją
  SELECT EXISTS (SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'targi') INTO has_targi;
  SELECT EXISTS (SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'oferty') INTO has_oferty;
  SELECT EXISTS (SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'artykuly') INTO has_artykuly;
  SELECT EXISTS (SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'kompendium') INTO has_kompendium;

  IF NOT (has_targi AND has_oferty AND has_artykuly AND has_kompendium) THEN
    RAISE EXCEPTION 'Pre-flight FAIL: brakuje tabel docelowych. targi=%, oferty=%, artykuly=%, kompendium=%',
      has_targi, has_oferty, has_artykuly, has_kompendium;
  END IF;

  -- (3) prace ma już int_publiczne z Obszaru 0 (sanity check)
  SELECT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'prace' AND column_name = 'int_publiczne') INTO prace_has_int;

  IF NOT prace_has_int THEN
    RAISE EXCEPTION 'Pre-flight FAIL: prace nie ma int_publiczne - czy Obszar 0 został uruchomiony?';
  END IF;

  -- (4) Liczba rekordów - kontekst informacyjny
  SELECT COUNT(*) INTO cnt_artysci FROM artysci;
  SELECT COUNT(*) INTO cnt_wystawy FROM wystawy;
  SELECT COUNT(*) INTO cnt_targi FROM targi;
  SELECT COUNT(*) INTO cnt_oferty FROM oferty;
  SELECT COUNT(*) INTO cnt_artykuly FROM artykuly;
  SELECT COUNT(*) INTO cnt_kompendium FROM kompendium;

  RAISE NOTICE 'Pre-flight check: PASS.';
  RAISE NOTICE '  Obszar 2: idee=%, pojecia=%', cnt_idee, cnt_pojecia;
  RAISE NOTICE '  Rekordy w encjach: artysci=%, wystawy=%, targi=%, oferty=%, artykuly=%, kompendium=%',
    cnt_artysci, cnt_wystawy, cnt_targi, cnt_oferty, cnt_artykuly, cnt_kompendium;
  RAISE NOTICE '  Wszystkie nowe pola będą NULL/false - Tadeusz wypełni w panelu.';
END $$;


-- -----------------------------------------------------------------------------
-- SEKCJA 1: idea_glowna_id na 4 nowych encjach
-- -----------------------------------------------------------------------------
-- Single FK, nullable, ON DELETE SET NULL.
-- Skasowanie idei nie kasuje powiązanego rekordu, tylko zeruje powiązanie.

ALTER TABLE targi
  ADD COLUMN IF NOT EXISTS idea_glowna_id uuid
  REFERENCES idee(id) ON DELETE SET NULL;

ALTER TABLE oferty
  ADD COLUMN IF NOT EXISTS idea_glowna_id uuid
  REFERENCES idee(id) ON DELETE SET NULL;

ALTER TABLE artykuly
  ADD COLUMN IF NOT EXISTS idea_glowna_id uuid
  REFERENCES idee(id) ON DELETE SET NULL;

ALTER TABLE kompendium
  ADD COLUMN IF NOT EXISTS idea_glowna_id uuid
  REFERENCES idee(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_targi_idea_glowna       ON targi(idea_glowna_id);
CREATE INDEX IF NOT EXISTS idx_oferty_idea_glowna      ON oferty(idea_glowna_id);
CREATE INDEX IF NOT EXISTS idx_artykuly_idea_glowna    ON artykuly(idea_glowna_id);
CREATE INDEX IF NOT EXISTS idx_kompendium_idea_glowna  ON kompendium(idea_glowna_id);


-- -----------------------------------------------------------------------------
-- SEKCJA 2: int_publiczne na 6 encjach (wszystkie poza prace)
-- -----------------------------------------------------------------------------
-- Boolean DEFAULT false.
-- Decyduje czy encja pokazana w wersji EN/DE na stronie International Program.

ALTER TABLE artysci    ADD COLUMN IF NOT EXISTS int_publiczne boolean NOT NULL DEFAULT false;
ALTER TABLE wystawy    ADD COLUMN IF NOT EXISTS int_publiczne boolean NOT NULL DEFAULT false;
ALTER TABLE targi      ADD COLUMN IF NOT EXISTS int_publiczne boolean NOT NULL DEFAULT false;
ALTER TABLE oferty     ADD COLUMN IF NOT EXISTS int_publiczne boolean NOT NULL DEFAULT false;
ALTER TABLE artykuly   ADD COLUMN IF NOT EXISTS int_publiczne boolean NOT NULL DEFAULT false;
ALTER TABLE kompendium ADD COLUMN IF NOT EXISTS int_publiczne boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_artysci_int_publiczne    ON artysci(int_publiczne)    WHERE int_publiczne = true;
CREATE INDEX IF NOT EXISTS idx_wystawy_int_publiczne    ON wystawy(int_publiczne)    WHERE int_publiczne = true;
CREATE INDEX IF NOT EXISTS idx_targi_int_publiczne      ON targi(int_publiczne)      WHERE int_publiczne = true;
CREATE INDEX IF NOT EXISTS idx_oferty_int_publiczne     ON oferty(int_publiczne)     WHERE int_publiczne = true;
CREATE INDEX IF NOT EXISTS idx_artykuly_int_publiczne   ON artykuly(int_publiczne)   WHERE int_publiczne = true;
CREATE INDEX IF NOT EXISTS idx_kompendium_int_publiczne ON kompendium(int_publiczne) WHERE int_publiczne = true;


-- -----------------------------------------------------------------------------
-- SEKCJA 3: int_visual_wall na 4 encjach (bez targi i oferty - decyzja kuratorska)
-- -----------------------------------------------------------------------------
-- Boolean DEFAULT false.
-- Decyduje czy encja promowana w Visual Wall na stronie głównej International.
-- BEZ targi (targi to logistyka, nie wizualny kontent).
-- BEZ oferty (oferty są prywatne lub półprywatne).

ALTER TABLE artysci    ADD COLUMN IF NOT EXISTS int_visual_wall boolean NOT NULL DEFAULT false;
ALTER TABLE wystawy    ADD COLUMN IF NOT EXISTS int_visual_wall boolean NOT NULL DEFAULT false;
ALTER TABLE artykuly   ADD COLUMN IF NOT EXISTS int_visual_wall boolean NOT NULL DEFAULT false;
ALTER TABLE kompendium ADD COLUMN IF NOT EXISTS int_visual_wall boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_artysci_int_visual_wall    ON artysci(int_visual_wall)    WHERE int_visual_wall = true;
CREATE INDEX IF NOT EXISTS idx_wystawy_int_visual_wall    ON wystawy(int_visual_wall)    WHERE int_visual_wall = true;
CREATE INDEX IF NOT EXISTS idx_artykuly_int_visual_wall   ON artykuly(int_visual_wall)   WHERE int_visual_wall = true;
CREATE INDEX IF NOT EXISTS idx_kompendium_int_visual_wall ON kompendium(int_visual_wall) WHERE int_visual_wall = true;


-- -----------------------------------------------------------------------------
-- SEKCJA 4: Dopełnienie wielojęzyczności DE na artysci i wystawy
-- -----------------------------------------------------------------------------
-- Te encje mają już komplet EN z poprzedniej pracy panelowej, brakuje DE.

-- 4a. ARTYSCI - 5 pól DE (analogicznie do istniejących _en)
ALTER TABLE artysci ADD COLUMN IF NOT EXISTS biografia_de            text;
ALTER TABLE artysci ADD COLUMN IF NOT EXISTS dlaczego_wazny_de       text;
ALTER TABLE artysci ADD COLUMN IF NOT EXISTS haslo_de                text;
ALTER TABLE artysci ADD COLUMN IF NOT EXISTS nota_biograficzna_de    text;
ALTER TABLE artysci ADD COLUMN IF NOT EXISTS nota_kuratorska_de      text;

-- 4b. WYSTAWY - 5 pól DE (analogicznie do istniejących _en)
ALTER TABLE wystawy ADD COLUMN IF NOT EXISTS tytul_de                text;
ALTER TABLE wystawy ADD COLUMN IF NOT EXISTS opis_krotki_de          text;
ALTER TABLE wystawy ADD COLUMN IF NOT EXISTS opis_pelny_de           text;
ALTER TABLE wystawy ADD COLUMN IF NOT EXISTS opis_kuratorski_de      text;
ALTER TABLE wystawy ADD COLUMN IF NOT EXISTS opis_artysty_de         text;


-- -----------------------------------------------------------------------------
-- SEKCJA 5: Wielojęzyczność EN+DE od zera dla pozostałych 4 encji
-- -----------------------------------------------------------------------------

-- 5a. KOMPENDIUM - 10 pól (tytuł, lead, treść, seo_title, seo_description × EN+DE)
ALTER TABLE kompendium ADD COLUMN IF NOT EXISTS tytul_en             text;
ALTER TABLE kompendium ADD COLUMN IF NOT EXISTS tytul_de             text;
ALTER TABLE kompendium ADD COLUMN IF NOT EXISTS lead_en              text;
ALTER TABLE kompendium ADD COLUMN IF NOT EXISTS lead_de              text;
ALTER TABLE kompendium ADD COLUMN IF NOT EXISTS tresc_en             text;
ALTER TABLE kompendium ADD COLUMN IF NOT EXISTS tresc_de             text;
ALTER TABLE kompendium ADD COLUMN IF NOT EXISTS seo_title_en         text;
ALTER TABLE kompendium ADD COLUMN IF NOT EXISTS seo_title_de         text;
ALTER TABLE kompendium ADD COLUMN IF NOT EXISTS seo_description_en   text;
ALTER TABLE kompendium ADD COLUMN IF NOT EXISTS seo_description_de   text;

-- 5b. ARTYKULY - 10 pól (tytuł, lead, treść, seo_title, seo_description × EN+DE)
ALTER TABLE artykuly ADD COLUMN IF NOT EXISTS tytul_en               text;
ALTER TABLE artykuly ADD COLUMN IF NOT EXISTS tytul_de               text;
ALTER TABLE artykuly ADD COLUMN IF NOT EXISTS lead_en                text;
ALTER TABLE artykuly ADD COLUMN IF NOT EXISTS lead_de                text;
ALTER TABLE artykuly ADD COLUMN IF NOT EXISTS tresc_en               text;
ALTER TABLE artykuly ADD COLUMN IF NOT EXISTS tresc_de               text;
ALTER TABLE artykuly ADD COLUMN IF NOT EXISTS seo_title_en           text;
ALTER TABLE artykuly ADD COLUMN IF NOT EXISTS seo_title_de           text;
ALTER TABLE artykuly ADD COLUMN IF NOT EXISTS seo_description_en     text;
ALTER TABLE artykuly ADD COLUMN IF NOT EXISTS seo_description_de     text;

-- 5c. TARGI - 10 pól (nazwa_targow, opis, info_dla_artystow, seo_title, seo_description × EN+DE)
ALTER TABLE targi ADD COLUMN IF NOT EXISTS nazwa_targow_en           text;
ALTER TABLE targi ADD COLUMN IF NOT EXISTS nazwa_targow_de           text;
ALTER TABLE targi ADD COLUMN IF NOT EXISTS opis_en                   text;
ALTER TABLE targi ADD COLUMN IF NOT EXISTS opis_de                   text;
ALTER TABLE targi ADD COLUMN IF NOT EXISTS info_dla_artystow_en      text;
ALTER TABLE targi ADD COLUMN IF NOT EXISTS info_dla_artystow_de      text;
ALTER TABLE targi ADD COLUMN IF NOT EXISTS seo_title_en              text;
ALTER TABLE targi ADD COLUMN IF NOT EXISTS seo_title_de              text;
ALTER TABLE targi ADD COLUMN IF NOT EXISTS seo_description_en        text;
ALTER TABLE targi ADD COLUMN IF NOT EXISTS seo_description_de        text;

-- 5d. OFERTY - 10 pól (tytuł, wstęp, tekst_kuratorski, tekst_dla_klienta, seo_title, seo_description × EN+DE)
-- Uwaga: oferty mają 6 par językowych (tytuł, wstęp, tekst_kuratorski, tekst_dla_klienta, seo_title, seo_description)
-- = 12 pól. Plan dokumentu mówił 10 pól (5 par) - poprawiam na 12 dla pełnego pokrycia.
ALTER TABLE oferty ADD COLUMN IF NOT EXISTS tytul_en                 text;
ALTER TABLE oferty ADD COLUMN IF NOT EXISTS tytul_de                 text;
ALTER TABLE oferty ADD COLUMN IF NOT EXISTS wstep_en                 text;
ALTER TABLE oferty ADD COLUMN IF NOT EXISTS wstep_de                 text;
ALTER TABLE oferty ADD COLUMN IF NOT EXISTS tekst_kuratorski_en      text;
ALTER TABLE oferty ADD COLUMN IF NOT EXISTS tekst_kuratorski_de      text;
ALTER TABLE oferty ADD COLUMN IF NOT EXISTS tekst_dla_klienta_en     text;
ALTER TABLE oferty ADD COLUMN IF NOT EXISTS tekst_dla_klienta_de     text;
ALTER TABLE oferty ADD COLUMN IF NOT EXISTS seo_title_en             text;
ALTER TABLE oferty ADD COLUMN IF NOT EXISTS seo_title_de             text;
ALTER TABLE oferty ADD COLUMN IF NOT EXISTS seo_description_en       text;
ALTER TABLE oferty ADD COLUMN IF NOT EXISTS seo_description_de       text;


-- -----------------------------------------------------------------------------
-- SEKCJA 6: 4 tabele M:N pojęć
-- -----------------------------------------------------------------------------
-- Struktura identyczna jak pojecia_artysci/prace/wystawy z Obszaru 2.

-- 6a. pojecia_targi
CREATE TABLE IF NOT EXISTS pojecia_targi (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pojecie_id  uuid NOT NULL REFERENCES pojecia(id) ON DELETE CASCADE,
  targi_id    uuid NOT NULL REFERENCES targi(id) ON DELETE CASCADE,
  priorytet   integer NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT pojecia_targi_unique UNIQUE (pojecie_id, targi_id)
);
CREATE INDEX IF NOT EXISTS idx_pojecia_targi_pojecie ON pojecia_targi(pojecie_id);
CREATE INDEX IF NOT EXISTS idx_pojecia_targi_targi   ON pojecia_targi(targi_id);

-- 6b. pojecia_oferty
CREATE TABLE IF NOT EXISTS pojecia_oferty (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pojecie_id  uuid NOT NULL REFERENCES pojecia(id) ON DELETE CASCADE,
  oferty_id   uuid NOT NULL REFERENCES oferty(id) ON DELETE CASCADE,
  priorytet   integer NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT pojecia_oferty_unique UNIQUE (pojecie_id, oferty_id)
);
CREATE INDEX IF NOT EXISTS idx_pojecia_oferty_pojecie ON pojecia_oferty(pojecie_id);
CREATE INDEX IF NOT EXISTS idx_pojecia_oferty_oferty  ON pojecia_oferty(oferty_id);

-- 6c. pojecia_artykuly
CREATE TABLE IF NOT EXISTS pojecia_artykuly (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pojecie_id  uuid NOT NULL REFERENCES pojecia(id) ON DELETE CASCADE,
  artykuly_id uuid NOT NULL REFERENCES artykuly(id) ON DELETE CASCADE,
  priorytet   integer NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT pojecia_artykuly_unique UNIQUE (pojecie_id, artykuly_id)
);
CREATE INDEX IF NOT EXISTS idx_pojecia_artykuly_pojecie  ON pojecia_artykuly(pojecie_id);
CREATE INDEX IF NOT EXISTS idx_pojecia_artykuly_artykuly ON pojecia_artykuly(artykuly_id);

-- 6d. pojecia_kompendium
CREATE TABLE IF NOT EXISTS pojecia_kompendium (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pojecie_id    uuid NOT NULL REFERENCES pojecia(id) ON DELETE CASCADE,
  kompendium_id uuid NOT NULL REFERENCES kompendium(id) ON DELETE CASCADE,
  priorytet     integer NOT NULL DEFAULT 0,
  created_at    timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT pojecia_kompendium_unique UNIQUE (pojecie_id, kompendium_id)
);
CREATE INDEX IF NOT EXISTS idx_pojecia_kompendium_pojecie    ON pojecia_kompendium(pojecie_id);
CREATE INDEX IF NOT EXISTS idx_pojecia_kompendium_kompendium ON pojecia_kompendium(kompendium_id);


-- -----------------------------------------------------------------------------
-- SEKCJA 7: Weryfikacja końcowa
-- -----------------------------------------------------------------------------
DO $$
DECLARE
  cnt_idea_glowna integer;
  cnt_int_publiczne_new integer;
  cnt_int_visual_wall_new integer;
  cnt_de_artysci integer;
  cnt_de_wystawy integer;
  cnt_endemi_kompendium integer;
  cnt_endemi_artykuly integer;
  cnt_endemi_targi integer;
  cnt_endemi_oferty integer;
  cnt_new_tables integer;
  cnt_records_in_new integer;
BEGIN
  -- Sprawdzenie nowych kolumn idea_glowna_id (4 nowe + 3 z Obszaru 2 = 7)
  SELECT COUNT(*) INTO cnt_idea_glowna
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND column_name = 'idea_glowna_id'
    AND table_name IN ('targi','oferty','artykuly','kompendium');

  -- Sprawdzenie nowych kolumn int_publiczne (6 nowych - bez prace, które już ma)
  SELECT COUNT(*) INTO cnt_int_publiczne_new
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND column_name = 'int_publiczne'
    AND table_name IN ('artysci','wystawy','targi','oferty','artykuly','kompendium');

  -- Sprawdzenie nowych kolumn int_visual_wall (4 nowe - bez targi/oferty)
  SELECT COUNT(*) INTO cnt_int_visual_wall_new
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND column_name = 'int_visual_wall'
    AND table_name IN ('artysci','wystawy','artykuly','kompendium');

  -- DE na artysci (5 nowych pól)
  SELECT COUNT(*) INTO cnt_de_artysci
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = 'artysci'
    AND column_name IN ('biografia_de','dlaczego_wazny_de','haslo_de','nota_biograficzna_de','nota_kuratorska_de');

  -- DE na wystawy (5 nowych pól)
  SELECT COUNT(*) INTO cnt_de_wystawy
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = 'wystawy'
    AND column_name IN ('tytul_de','opis_krotki_de','opis_pelny_de','opis_kuratorski_de','opis_artysty_de');

  -- EN+DE na kompendium (10 pól)
  SELECT COUNT(*) INTO cnt_endemi_kompendium
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = 'kompendium'
    AND column_name IN ('tytul_en','tytul_de','lead_en','lead_de','tresc_en','tresc_de',
                        'seo_title_en','seo_title_de','seo_description_en','seo_description_de');

  -- EN+DE na artykuly (10 pól)
  SELECT COUNT(*) INTO cnt_endemi_artykuly
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = 'artykuly'
    AND column_name IN ('tytul_en','tytul_de','lead_en','lead_de','tresc_en','tresc_de',
                        'seo_title_en','seo_title_de','seo_description_en','seo_description_de');

  -- EN+DE na targi (10 pól)
  SELECT COUNT(*) INTO cnt_endemi_targi
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = 'targi'
    AND column_name IN ('nazwa_targow_en','nazwa_targow_de','opis_en','opis_de',
                        'info_dla_artystow_en','info_dla_artystow_de',
                        'seo_title_en','seo_title_de','seo_description_en','seo_description_de');

  -- EN+DE na oferty (12 pól - 6 par)
  SELECT COUNT(*) INTO cnt_endemi_oferty
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = 'oferty'
    AND column_name IN ('tytul_en','tytul_de','wstep_en','wstep_de',
                        'tekst_kuratorski_en','tekst_kuratorski_de',
                        'tekst_dla_klienta_en','tekst_dla_klienta_de',
                        'seo_title_en','seo_title_de','seo_description_en','seo_description_de');

  -- Liczba nowych tabel M:N (4)
  SELECT COUNT(*) INTO cnt_new_tables
  FROM information_schema.tables
  WHERE table_schema = 'public'
    AND table_name IN ('pojecia_targi','pojecia_oferty','pojecia_artykuly','pojecia_kompendium');

  -- Liczba rekordów w nowych tabelach M:N (powinno być 0)
  SELECT
    (SELECT COUNT(*) FROM pojecia_targi)
  + (SELECT COUNT(*) FROM pojecia_oferty)
  + (SELECT COUNT(*) FROM pojecia_artykuly)
  + (SELECT COUNT(*) FROM pojecia_kompendium)
  INTO cnt_records_in_new;

  RAISE NOTICE '====================================================';
  RAISE NOTICE 'OBSZAR 2+9 UZUPELNIENIE: weryfikacja';
  RAISE NOTICE '====================================================';
  RAISE NOTICE 'Sekcja 1 - idea_glowna_id na 4 encjach: %', cnt_idea_glowna;
  RAISE NOTICE 'Sekcja 2 - int_publiczne na 6 encjach: %', cnt_int_publiczne_new;
  RAISE NOTICE 'Sekcja 3 - int_visual_wall na 4 encjach: %', cnt_int_visual_wall_new;
  RAISE NOTICE 'Sekcja 4 - DE na artysci: %, DE na wystawy: %', cnt_de_artysci, cnt_de_wystawy;
  RAISE NOTICE 'Sekcja 5 - EN+DE: kompendium=%, artykuly=%, targi=%, oferty=%',
    cnt_endemi_kompendium, cnt_endemi_artykuly, cnt_endemi_targi, cnt_endemi_oferty;
  RAISE NOTICE 'Sekcja 6 - nowe tabele M:N: % (oczekiwane 4)', cnt_new_tables;
  RAISE NOTICE 'Sekcja 6 - rekordy w nowych M:N: % (oczekiwane 0)', cnt_records_in_new;
  RAISE NOTICE '====================================================';

  -- Twarde weryfikacje
  IF cnt_idea_glowna != 4 THEN
    RAISE EXCEPTION 'FAIL Sekcja 1: oczekiwane 4 kolumny idea_glowna_id, jest %', cnt_idea_glowna;
  END IF;

  IF cnt_int_publiczne_new != 6 THEN
    RAISE EXCEPTION 'FAIL Sekcja 2: oczekiwane 6 kolumn int_publiczne, jest %', cnt_int_publiczne_new;
  END IF;

  IF cnt_int_visual_wall_new != 4 THEN
    RAISE EXCEPTION 'FAIL Sekcja 3: oczekiwane 4 kolumny int_visual_wall, jest %', cnt_int_visual_wall_new;
  END IF;

  IF cnt_de_artysci != 5 THEN
    RAISE EXCEPTION 'FAIL Sekcja 4: oczekiwane 5 pól DE na artysci, jest %', cnt_de_artysci;
  END IF;

  IF cnt_de_wystawy != 5 THEN
    RAISE EXCEPTION 'FAIL Sekcja 4: oczekiwane 5 pól DE na wystawy, jest %', cnt_de_wystawy;
  END IF;

  IF cnt_endemi_kompendium != 10 THEN
    RAISE EXCEPTION 'FAIL Sekcja 5a: oczekiwane 10 pól EN+DE na kompendium, jest %', cnt_endemi_kompendium;
  END IF;

  IF cnt_endemi_artykuly != 10 THEN
    RAISE EXCEPTION 'FAIL Sekcja 5b: oczekiwane 10 pól EN+DE na artykuly, jest %', cnt_endemi_artykuly;
  END IF;

  IF cnt_endemi_targi != 10 THEN
    RAISE EXCEPTION 'FAIL Sekcja 5c: oczekiwane 10 pól EN+DE na targi, jest %', cnt_endemi_targi;
  END IF;

  IF cnt_endemi_oferty != 12 THEN
    RAISE EXCEPTION 'FAIL Sekcja 5d: oczekiwane 12 pól EN+DE na oferty, jest %', cnt_endemi_oferty;
  END IF;

  IF cnt_new_tables != 4 THEN
    RAISE EXCEPTION 'FAIL Sekcja 6: oczekiwane 4 nowe tabele M:N, jest %', cnt_new_tables;
  END IF;

  IF cnt_records_in_new != 0 THEN
    RAISE EXCEPTION 'FAIL Sekcja 6: nowe tabele M:N powinny być puste, jest % rekordów łącznie', cnt_records_in_new;
  END IF;

  -- Suma wszystkich nowych kolumn (powinno być 66 - bo oferty ma 12 zamiast 10)
  -- 4 + 6 + 4 + 5 + 5 + 10 + 10 + 10 + 12 = 66
  RAISE NOTICE 'SUMA wszystkich nowych kolumn: % (oczekiwane 66)',
    cnt_idea_glowna + cnt_int_publiczne_new + cnt_int_visual_wall_new
    + cnt_de_artysci + cnt_de_wystawy
    + cnt_endemi_kompendium + cnt_endemi_artykuly + cnt_endemi_targi + cnt_endemi_oferty;

  RAISE NOTICE '====================================================';
  RAISE NOTICE 'MIGRACJA OBSZAR 2+9 UZUPELNIENIE: PASS. Gotowe do COMMIT.';
  RAISE NOTICE '====================================================';
END $$;

COMMIT;

-- =============================================================================
-- WERYFIKACJA RĘCZNA (po commicie - NIE jest częścią transakcji)
-- =============================================================================
--
-- 1. Wszystkie kolumny idea_glowna_id (oczekiwane 7: prace/artysci/wystawy z Obszaru 2
--    + targi/oferty/artykuly/kompendium z tej migracji):
-- SELECT table_name FROM information_schema.columns
--  WHERE table_schema = 'public' AND column_name = 'idea_glowna_id'
--  ORDER BY table_name;
--
-- 2. Wszystkie kolumny int_publiczne (oczekiwane 7: prace z Obszaru 0
--    + 6 encji z tej migracji):
-- SELECT table_name FROM information_schema.columns
--  WHERE table_schema = 'public' AND column_name = 'int_publiczne'
--  ORDER BY table_name;
--
-- 3. Wszystkie tabele M:N pojęć (oczekiwane 7: pojecia_artysci/prace/wystawy z Obszaru 2
--    + pojecia_targi/oferty/artykuly/kompendium z tej migracji):
-- SELECT table_name FROM information_schema.tables
--  WHERE table_schema = 'public' AND table_name LIKE 'pojecia_%'
--  ORDER BY table_name;
--
-- 4. Sprawdzenie wielojęzyczności na wszystkich 7 encjach:
-- SELECT table_name, COUNT(*) FILTER (WHERE column_name LIKE '%_en') AS en_cols,
--                     COUNT(*) FILTER (WHERE column_name LIKE '%_de') AS de_cols
-- FROM information_schema.columns
-- WHERE table_schema = 'public'
--   AND table_name IN ('prace','artysci','wystawy','targi','oferty','artykuly','kompendium')
-- GROUP BY table_name
-- ORDER BY table_name;
-- =============================================================================
