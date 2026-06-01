-- =============================================================================
-- OBSZAR 0 — STATUSY WIDOCZNOŚCI PRAC + INTERNATIONAL + RYNKI + WIELOJĘZYCZNOŚĆ
-- =============================================================================
-- Wersja:        1
-- Data:          2026-05-28
-- Dokument:      docs/ESTA-PLAN-PRZEBUDOWY.md (Obszar 0)
-- Architektura:  docs/ESTA-ARCHITEKTURA-SYSTEMU.md (sekcje 3.3, 3.4, 5A, 5B)
--
-- Zakres jednej transakcji:
--   1. Backup tabeli prace (prace_backup_obszar0)
--   2. Nowy model statusów: widocznosc (3 wartości: ukryta/kolekcja/archiwum)
--      + status_handlowy (4 wartości) + rola_pracy (zasob/znana)
--      + status_fizyczny (6 wartości)
--      + migracja danych wg ustalonego mapowania (sumarycznie 108 wierszy)
--      + usunięcie 4 redundantnych kolumn (status, publiczne, w_dorobku,
--        dostepna_do_sprzedazy)
--   3. Pola International na prace (int_publiczne, int_visual_wall, cena_eur)
--   4. Słownik rynki (7 wartości) + tabela łącząca prace_rynki
--   5. Puste kolumny EN + DE dla pól, które ich nie mają w prace
--
-- Bezpieczeństwo:
--   - Cała migracja w jednym BEGIN/COMMIT — rollback przy każdym błędzie.
--   - Idempotentne: IF NOT EXISTS na DDL, DROP CONSTRAINT IF EXISTS + ADD,
--     warunkowy UPDATE w bloku DO (uruchamia się tylko gdy stara kolumna
--     `status` jeszcze istnieje), ON CONFLICT DO NOTHING na seedzie słownika.
--   - Polityki RLS na nowych tabelach (rynki, prace_rynki) są POZA tą
--     migracją — osobny obszar bezpieczeństwa.
-- =============================================================================

BEGIN;

-- pgcrypto: gen_random_uuid() jest używane w DEFAULT na nowym słowniku.
-- Supabase zwykle ma to włączone, ale na wszelki wypadek:
CREATE EXTENSION IF NOT EXISTS pgcrypto;


-- -----------------------------------------------------------------------------
-- 0. HIGIENICZNE USUWANIE ZNANYCH OBIEKTÓW przed pre-flight i migracją.
-- -----------------------------------------------------------------------------
-- Wszystko co znamy i wiemy że trzeba usunąć — w jednym miejscu, przed
-- pre-flight. Dzięki temu pre-flight szuka tylko NIEZNANYCH zależności,
-- bez exclusion-list dla każdego znanego obiektu.

-- Widoki używające usuwanych kolumn (panel ich nie używa — zweryfikowane).
DROP VIEW IF EXISTS prace_do_oferty;
DROP VIEW IF EXISTS prace_pelne;
DROP VIEW IF EXISTS prace_public;

-- Indeks na usuwanej kolumnie 'status' (zastąpiony przez idx_prace_status_handlowy w 2g).
DROP INDEX IF EXISTS idx_prace_status;

-- Stary CHECK na widocznosc — dopuszczał ('glowny_nurt','kolekcja','ukryty','archiwum')
-- i odrzuciłby UPDATE na 'ukryta' w 2b. Nowy CHECK ustawiany w 2c.
ALTER TABLE prace DROP CONSTRAINT IF EXISTS prace_widocznosc_check;


-- -----------------------------------------------------------------------------
-- 0a'. PRE-FLIGHT CHECK — pełna inwentaryzacja zależności i wartości.
-- -----------------------------------------------------------------------------
-- Cel: znaleźć WSZYSTKIE pułapki na początku transakcji. Albo PASS, albo
-- EXCEPTION z czytelną listą — żadnych niespodzianek w połowie migracji.
DO $$
DECLARE
  doomed_cols text[] := ARRAY['status','publiczne','w_dorobku','dostepna_do_sprzedazy'];
  problems text;
  warning  text;
BEGIN
  -- (1) Obiekty zależne od kolumn usuwanych w 2d: views, matviews, sekwencje,
  -- indeksy (pg_depend) + FK celujące w te kolumny (pg_constraint). Znane
  -- obiekty zostały już sprzątnięte w sekcji 0 — pre-flight szuka tylko nieznanych.
  WITH deps AS (
    SELECT format('%s %I.%I (kolumna: %I)',
             CASE c.relkind WHEN 'v' THEN 'view'
                            WHEN 'm' THEN 'matview'
                            WHEN 'r' THEN 'table'
                            WHEN 'S' THEN 'sequence'
                            WHEN 'i' THEN 'index'
                            ELSE c.relkind::text END,
             n.nspname, c.relname, a.attname) AS obj_desc
      FROM pg_depend d
      JOIN pg_class src       ON src.oid = d.refobjid
      JOIN pg_attribute a     ON a.attrelid = src.oid AND a.attnum = d.refobjsubid
      JOIN pg_class c         ON c.oid = d.objid
      JOIN pg_namespace n     ON n.oid = c.relnamespace
     WHERE src.relname = 'prace'
       AND a.attname   = ANY(doomed_cols)
    UNION ALL
    SELECT format('FK %I.%I (constraint %I → prace.%I)',
             n.nspname, c2.relname, con.conname, a.attname) AS obj_desc
      FROM pg_constraint con
      JOIN pg_class c2        ON c2.oid = con.conrelid
      JOIN pg_namespace n     ON n.oid = c2.relnamespace
      JOIN pg_attribute a     ON a.attrelid = con.confrelid AND a.attnum = ANY(con.confkey)
     WHERE con.contype  = 'f'
       AND con.confrelid = 'prace'::regclass
       AND a.attname    = ANY(doomed_cols)
  )
  SELECT string_agg(obj_desc, E'\n  ') INTO problems FROM deps;

  IF problems IS NOT NULL THEN
    RAISE EXCEPTION E'Pre-flight FAIL: zależne obiekty, obsłuż je przed migracją:\n  %', problems;
  END IF;

  -- (2) Widoki używające widocznosc='ukryty' (stara wartość). Tylko OSTRZEŻENIE —
  -- po migracji wartość = 'ukryta', te widoki przestaną zwracać dane.
  SELECT string_agg(schemaname || '.' || viewname, ', ') INTO warning
    FROM pg_views
   WHERE schemaname NOT IN ('pg_catalog','information_schema')
     AND definition ~ 'widocznosc\s*=\s*''ukryty''';

  IF warning IS NOT NULL THEN
    RAISE NOTICE 'OSTRZEŻENIE: widoki używają widocznosc=''ukryty'' (po migracji ''ukryta''): %', warning;
  END IF;

  -- (3) Sanity wartości w kolumnach migrowanych (status, widocznosc). NULL też zakazany.
  SELECT string_agg(DISTINCT COALESCE(quote_literal(status), 'NULL'), ', ') INTO problems
    FROM prace
   WHERE status IS NULL
      OR status NOT IN ('dostepna','sprzedana','niedostepna','depozyt','rezerwacja','glowny_nurt');

  IF problems IS NOT NULL THEN
    RAISE EXCEPTION 'Pre-flight FAIL: nieoczekiwana wartość prace.status: %', problems;
  END IF;

  SELECT string_agg(DISTINCT COALESCE(quote_literal(widocznosc), 'NULL'), ', ') INTO problems
    FROM prace
   WHERE widocznosc IS NULL
      OR widocznosc NOT IN ('ukryty','kolekcja','archiwum','glowny_nurt');

  IF problems IS NOT NULL THEN
    RAISE EXCEPTION 'Pre-flight FAIL: nieoczekiwana wartość prace.widocznosc: %', problems;
  END IF;

  RAISE NOTICE 'Pre-flight check: PASS. Wszystkie zależności i wartości znane, można kontynuować.';
END $$;


-- -----------------------------------------------------------------------------
-- 1. BACKUP — bezpiecznik przed jakąkolwiek zmianą
-- -----------------------------------------------------------------------------
-- Snapshot tabeli prace w obecnym kształcie (wszystkie kolumny, wszystkie wiersze).
-- IF NOT EXISTS: przy powtórnym uruchomieniu nie nadpisuje snapshotu sprzed
-- migracji (chronimy oryginał, nie kopiujemy stanu po migracji).

CREATE TABLE IF NOT EXISTS prace_backup_obszar0 AS
SELECT * FROM prace;


-- -----------------------------------------------------------------------------
-- 2. STATUSY — nowy model widocznosc + status_handlowy
-- -----------------------------------------------------------------------------

-- 2a. Nowa kolumna status_handlowy (nullable na czas migracji, NOT NULL na końcu).
ALTER TABLE prace
  ADD COLUMN IF NOT EXISTS status_handlowy text;

-- 2b. Migracja danych — warunkowo, tylko gdy stara kolumna `status` jeszcze
-- istnieje (tzn. pierwszy run migracji). Po jej DROP-ie w sekcji 2d
-- powtórny run pomija ten blok.
DO $$
DECLARE
  n1 int := 0;
  n2 int := 0;
  n3 int := 0;
  n4 int := 0;
BEGIN
  IF EXISTS (
    SELECT 1
      FROM information_schema.columns
     WHERE table_schema = 'public'
       AND table_name   = 'prace'
       AND column_name  = 'status'
  ) THEN

    -- 14 prac: dostepna + kolekcja → kolekcja / dostepna
    UPDATE prace
       SET widocznosc     = 'kolekcja',
           status_handlowy = 'dostepna'
     WHERE status     = 'dostepna'
       AND widocznosc = 'kolekcja';
    GET DIAGNOSTICS n1 = ROW_COUNT;

    -- 84 prac: dostepna + ukryty → ukryta / dostepna
    UPDATE prace
       SET widocznosc     = 'ukryta',
           status_handlowy = 'dostepna'
     WHERE status     = 'dostepna'
       AND widocznosc = 'ukryty';
    GET DIAGNOSTICS n2 = ROW_COUNT;

    -- 9 prac: sprzedana → ukryta / sprzedana
    UPDATE prace
       SET widocznosc     = 'ukryta',
           status_handlowy = 'sprzedana'
     WHERE status = 'sprzedana';
    GET DIAGNOSTICS n3 = ROW_COUNT;

    -- 1 praca: niedostepna → ukryta / niedostepna
    UPDATE prace
       SET widocznosc     = 'ukryta',
           status_handlowy = 'niedostepna'
     WHERE status = 'niedostepna';
    GET DIAGNOSTICS n4 = ROW_COUNT;

    RAISE NOTICE 'Migracja statusów: kolekcja/dostepna=%, ukryta/dostepna=%, ukryta/sprzedana=%, ukryta/niedostepna=%',
                 n1, n2, n3, n4;
    RAISE NOTICE 'Suma: % wierszy (oczekiwane wg sondy: 108)', n1 + n2 + n3 + n4;
  ELSE
    RAISE NOTICE 'Kolumna `status` już nie istnieje — pomijam migrację danych (powtórny run).';
  END IF;
END $$;

-- 2c. CHECK constraints — dozwolone wartości dla obu kolumn statusu.
ALTER TABLE prace
  ADD  CONSTRAINT prace_widocznosc_check
       CHECK (widocznosc IN ('ukryta', 'kolekcja', 'archiwum'));

ALTER TABLE prace
  DROP CONSTRAINT IF EXISTS prace_status_handlowy_check;
ALTER TABLE prace
  ADD  CONSTRAINT prace_status_handlowy_check
       CHECK (status_handlowy IN ('dostepna', 'zarezerwowana', 'sprzedana', 'niedostepna'));

-- NOT NULL po wypełnieniu danych. Idempotentne — jeśli już NOT NULL, no-op.
ALTER TABLE prace ALTER COLUMN widocznosc      SET NOT NULL;
ALTER TABLE prace ALTER COLUMN status_handlowy SET NOT NULL;

-- Secure by default: nowe wiersze bez podanego widocznosc dostają 'ukryta'.
ALTER TABLE prace ALTER COLUMN widocznosc SET DEFAULT 'ukryta';

-- 2d. Usunięcie 4 redundantnych kolumn (informacja zawarta teraz w widocznosc
-- + status_handlowy). status_wlasnosci ZOSTAJE bez zmian (NULL dozwolone).
ALTER TABLE prace DROP COLUMN IF EXISTS status;
ALTER TABLE prace DROP COLUMN IF EXISTS publiczne;
ALTER TABLE prace DROP COLUMN IF EXISTS w_dorobku;
ALTER TABLE prace DROP COLUMN IF EXISTS dostepna_do_sprzedazy;


-- 2e. rola_pracy — czy praca należy do zasobu galerii czy jest „znana"
-- (np. proweniencyjnie odnotowana ale poza zasobem).
ALTER TABLE prace
  ADD COLUMN IF NOT EXISTS rola_pracy text NOT NULL DEFAULT 'zasob';

ALTER TABLE prace
  DROP CONSTRAINT IF EXISTS prace_rola_pracy_check;
ALTER TABLE prace
  ADD  CONSTRAINT prace_rola_pracy_check
       CHECK (rola_pracy IN ('zasob', 'znana'));

-- 2f. status_fizyczny — gdzie praca fizycznie się znajduje.
ALTER TABLE prace
  ADD COLUMN IF NOT EXISTS status_fizyczny text NOT NULL DEFAULT 'w_galerii';

ALTER TABLE prace
  DROP CONSTRAINT IF EXISTS prace_status_fizyczny_check;
ALTER TABLE prace
  ADD  CONSTRAINT prace_status_fizyczny_check
       CHECK (status_fizyczny IN ('w_galerii', 'u_klienta', 'u_artysty', 'na_wystawie', 'na_aukcji', 'nieznane'));

-- 2g. Indeksy na nowych kolumnach migrowanych w 2c/2e/2f. Zastępują funkcjonalnie
-- usunięty idx_prace_status (filtry list w panelu lecą teraz po status_handlowy).
CREATE INDEX IF NOT EXISTS idx_prace_status_handlowy ON prace (status_handlowy);
CREATE INDEX IF NOT EXISTS idx_prace_widocznosc      ON prace (widocznosc);
CREATE INDEX IF NOT EXISTS idx_prace_rola_pracy      ON prace (rola_pracy);


-- -----------------------------------------------------------------------------
-- 3. INTERNATIONAL — flagi i cena EUR (sekcja 5B architektury)
-- -----------------------------------------------------------------------------
-- int_publiczne / int_visual_wall: NOT NULL z DEFAULT false, żeby istniejące
-- 108 wierszy dostały false automatycznie, a panel nie musiał ich uzupełniać.
-- cena_eur: nullable — wypełniana tylko dla prac International.

ALTER TABLE prace
  ADD COLUMN IF NOT EXISTS int_publiczne   boolean        NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS int_visual_wall boolean        NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS cena_eur        numeric(12, 2);


-- -----------------------------------------------------------------------------
-- 4. RYNKI — słownik + tabela łącząca prace ↔ rynki (M:N)
-- -----------------------------------------------------------------------------

-- 4a. Słownik rynków docelowych International.
CREATE TABLE IF NOT EXISTS rynki (
  id    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nazwa text NOT NULL UNIQUE
);

-- 4b. Seed: 7 rynków zgodnie z planem. ON CONFLICT DO NOTHING dla idempotencji.
INSERT INTO rynki (nazwa) VALUES
  ('DACH'),
  ('Italy'),
  ('Central Europe'),
  ('France'),
  ('Benelux'),
  ('UK'),
  ('USA')
ON CONFLICT (nazwa) DO NOTHING;

-- 4c. Tabela łącząca prace ↔ rynki. Composite PK (praca_id, rynek_id) —
-- jedna para tylko raz. Oba FK z CASCADE: usunięcie pracy lub rynku
-- czyści powiązania bez sierot.
CREATE TABLE IF NOT EXISTS prace_rynki (
  praca_id uuid NOT NULL REFERENCES prace(id) ON DELETE CASCADE,
  rynek_id uuid NOT NULL REFERENCES rynki(id) ON DELETE CASCADE,
  PRIMARY KEY (praca_id, rynek_id)
);


-- -----------------------------------------------------------------------------
-- 5. WIELOJĘZYCZNOŚĆ — puste kolumny EN + DE w prace
-- -----------------------------------------------------------------------------
-- Wszystkie nullable text. Wypełniane przez AI w panelu (PL → EN → DE)
-- z możliwością ręcznej korekty. Pól, które już mają _en (tekst_kuratorski_en,
-- jak_czytac_en), tu nie dotykamy — dodajemy tylko brakujący _de plus
-- pełną parę _en/_de tam, gdzie żadna wersja jeszcze nie istniała.

ALTER TABLE prace
  ADD COLUMN IF NOT EXISTS tekst_kuratorski_de  text,
  ADD COLUMN IF NOT EXISTS jak_czytac_de        text,
  ADD COLUMN IF NOT EXISTS opis_pracy_en        text,
  ADD COLUMN IF NOT EXISTS opis_pracy_de        text,
  ADD COLUMN IF NOT EXISTS opis_krotki_en       text,
  ADD COLUMN IF NOT EXISTS opis_krotki_de       text,
  ADD COLUMN IF NOT EXISTS opis_do_oferty_en    text,
  ADD COLUMN IF NOT EXISTS opis_do_oferty_de    text,
  ADD COLUMN IF NOT EXISTS seo_title_en         text,
  ADD COLUMN IF NOT EXISTS seo_title_de         text,
  ADD COLUMN IF NOT EXISTS seo_description_en   text,
  ADD COLUMN IF NOT EXISTS seo_description_de   text,
  ADD COLUMN IF NOT EXISTS alt_zdjecia_en       text,
  ADD COLUMN IF NOT EXISTS alt_zdjecia_de       text;


COMMIT;

-- =============================================================================
-- WERYFIKACJA (ręcznie, po commicie — NIE jest częścią transakcji)
-- =============================================================================
-- SELECT widocznosc, status_handlowy, COUNT(*)
--   FROM prace
--  GROUP BY 1, 2
--  ORDER BY 3 DESC;
-- -- Oczekiwane: 14 kolekcja/dostepna, 84 ukryta/dostepna, 9 ukryta/sprzedana, 1 ukryta/niedostepna.
-- -- Razem: 14 'kolekcja' + 94 'ukryta' + 0 'archiwum' = 108.
--
-- SELECT COUNT(*) FROM prace_backup_obszar0;   -- 108
-- SELECT COUNT(*) FROM rynki;                  -- 7
-- SELECT COUNT(*) FROM prace_rynki;            -- 0 (nic jeszcze nie powiązane)
