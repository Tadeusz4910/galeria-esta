-- =============================================================================
-- migrations/obszar_status_pracy.sql
-- Obszar STATUS PRACY (wariant 3 - puste szkice):
--   * 1 nowa kolumna: prace.status_pracy text DEFAULT 'aktywna'
--   * CHECK constraint: 'szkic' / 'aktywna' / 'archiwalna'
--   * UPDATE istniejacych prac → 'aktywna' (idempotentne)
--   * 1 indeks btree na status_pracy
--   * 4 testy PASS/FAIL na koncu
--
-- KONTEKST:
--   Panel esta-crm wprowadza tryb "pusty widok 5-tab + auto-szkic":
--   przycisk "+ Dodaj prace" → INSERT pustego szkicu → otwiera widok pracy
--   z status_pracy='szkic' + widocznosc='ukryta' (default). Uzytkownik
--   uzupelnia dane w zakladkach, potem zmienia status_pracy → 'aktywna'.
--   Filtr w liscie prac (f-stp) operuje na tej kolumnie.
--
-- IDEMPOTENCJA:
--   - ALTER TABLE ADD COLUMN IF NOT EXISTS (PG default behaviour)
--   - DO block z IF NOT EXISTS (pg_constraint) dla CHECK
--   - UPDATE warunkowe (... WHERE status_pracy IS NULL)
--   - CREATE INDEX IF NOT EXISTS
--   - Wszystkie testy verify-only (nie pisza)
--
-- WSTECZNA KOMPATYBILNOSC:
--   - Pole NOWE - zero ryzyka dla istniejacych zapytan
--   - Default 'aktywna' = wszystkie 108 istniejacych prac dziedziczy ten status
--   - widocznosc/status_handlowy/rola_pracy/status_fizyczny BEZ ZMIAN
-- =============================================================================

BEGIN;

-- =============================================================================
-- 0. PRE-FLIGHT - stan obecny
-- =============================================================================
DO $$
DECLARE
  v_total int;
  v_col_exists bool;
BEGIN
  SELECT COUNT(*) INTO v_total FROM prace;
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='prace' AND column_name='status_pracy'
  ) INTO v_col_exists;

  RAISE NOTICE '====================================================================';
  RAISE NOTICE 'PRE-FLIGHT status_pracy:';
  RAISE NOTICE '  Lacznie prac:                      %', v_total;
  RAISE NOTICE '  Kolumna status_pracy juz istnieje: %', v_col_exists;
  RAISE NOTICE '====================================================================';
END $$;

-- =============================================================================
-- 1. NOWA KOLUMNA - status_pracy z DEFAULT 'aktywna'
-- =============================================================================
ALTER TABLE prace ADD COLUMN IF NOT EXISTS status_pracy text DEFAULT 'aktywna';

-- =============================================================================
-- 2. BACKFILL - wszystkie istniejace prace dostaja 'aktywna'
--    (zabezpieczenie - gdyby kolumna istniala wczesniej bez DEFAULT)
-- =============================================================================
UPDATE prace
   SET status_pracy = 'aktywna'
 WHERE status_pracy IS NULL;

-- =============================================================================
-- 3. CHECK CONSTRAINT - 3 wartosci (idempotent przez pg_constraint)
-- =============================================================================
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'prace_status_pracy_check'
  ) THEN
    ALTER TABLE prace ADD CONSTRAINT prace_status_pracy_check
      CHECK (status_pracy IN ('szkic', 'aktywna', 'archiwalna'));
    RAISE NOTICE 'CHECK prace_status_pracy_check - dodany';
  ELSE
    RAISE NOTICE 'CHECK prace_status_pracy_check - juz istnieje (skip)';
  END IF;
END $$;

-- =============================================================================
-- 4. INDEKS - btree na status_pracy (filtr listy prac uzywa eq.)
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_prace_status_pracy ON prace(status_pracy);

-- =============================================================================
-- 5. WERYFIKACJA - 4 testy PASS/FAIL
-- =============================================================================
DO $$
DECLARE
  v_col int;
  v_check int;
  v_check_def text;
  v_null int;
  v_total int;
  v_index int;
  v_pass bool := true;
BEGIN
  -- TEST 1: kolumna status_pracy istnieje
  SELECT COUNT(*) INTO v_col FROM information_schema.columns
   WHERE table_schema='public' AND table_name='prace' AND column_name='status_pracy';

  -- TEST 2: CHECK constraint istnieje + ma odpowiednia definicje
  SELECT COUNT(*), MAX(pg_get_constraintdef(oid))
    INTO v_check, v_check_def
    FROM pg_constraint
   WHERE conrelid = 'prace'::regclass
     AND conname = 'prace_status_pracy_check';

  -- TEST 3: wszystkie prace maja status_pracy != NULL
  SELECT COUNT(*) INTO v_null FROM prace WHERE status_pracy IS NULL;
  SELECT COUNT(*) INTO v_total FROM prace;

  -- TEST 4: indeks idx_prace_status_pracy istnieje
  SELECT COUNT(*) INTO v_index FROM pg_indexes
   WHERE schemaname='public' AND tablename='prace' AND indexname='idx_prace_status_pracy';

  RAISE NOTICE '====================================================================';
  RAISE NOTICE 'WERYFIKACJA status_pracy:';
  RAISE NOTICE '  TEST 1 - kolumna status_pracy:     % / 1', v_col;
  RAISE NOTICE '  TEST 2 - CHECK constraint:         % / 1   def: %', v_check, v_check_def;
  RAISE NOTICE '  TEST 3 - prace z NULL status:      % / 0   (lacznie %)', v_null, v_total;
  RAISE NOTICE '  TEST 4 - indeks idx_prace_status:  % / 1', v_index;
  RAISE NOTICE '====================================================================';

  IF v_col < 1 THEN
    v_pass := false; RAISE WARNING 'FAIL TEST 1 (kolumna nie istnieje)';
  END IF;
  IF v_check < 1 THEN
    v_pass := false; RAISE WARNING 'FAIL TEST 2 (CHECK constraint brak)';
  END IF;
  IF v_check_def IS NULL OR (
       v_check_def NOT LIKE '%szkic%'
    OR v_check_def NOT LIKE '%aktywna%'
    OR v_check_def NOT LIKE '%archiwalna%'
  ) THEN
    v_pass := false; RAISE WARNING 'FAIL TEST 2 (CHECK definicja nie zawiera 3 wartosci: %)', v_check_def;
  END IF;
  IF v_null > 0 THEN
    v_pass := false; RAISE WARNING 'FAIL TEST 3 (% prac z NULL status_pracy)', v_null;
  END IF;
  IF v_index < 1 THEN
    v_pass := false; RAISE WARNING 'FAIL TEST 4 (indeks brak)';
  END IF;

  IF v_pass THEN
    RAISE NOTICE 'PASS - migracja status_pracy zakonczona pomyslnie';
  ELSE
    RAISE EXCEPTION 'FAIL - patrz WARNINGI powyzej';
  END IF;
END $$;

COMMIT;
