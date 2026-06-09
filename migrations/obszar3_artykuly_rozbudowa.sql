-- =============================================================================
-- migrations/obszar3_artykuly_rozbudowa.sql
-- Obszar 3 — rozbudowa tabeli `artykuly`:
--   * 8 nowych kolumn (status, priorytety, hook do viewing_room, typ_artykulu,
--     czas_czytania, pokaz_na_home, updated_at)
--   * 6 tabel M:N (pojecia, artysci, prace, wystawy, viewing_room, powiazane)
--   * 15 indeksow CREATE INDEX + 6 PK auto-utworzonych na M:N = 21 lacznie
--   * Trigger updated_at na artykuly
--   * Migracja danych: publiczny=true → status_publiczny='opublikowany'
-- =============================================================================
--
-- IDEMPOTENCJA:
--   - ALTER TABLE ADD COLUMN IF NOT EXISTS
--   - CREATE TABLE IF NOT EXISTS
--   - CREATE INDEX IF NOT EXISTS
--   - Constraints w DO blokach z IF NOT EXISTS przez pg_constraint
--   - DROP TRIGGER IF EXISTS + CREATE TRIGGER
--   - UPDATE warunkowy (tylko gdzie status='szkic' AND publiczny=true)
--
-- STRATEGIA WSTECZNEJ KOMPATYBILNOSCI:
--   - Stare pole `publiczny` (bool) ZOSTAJE — nie usuwamy
--   - Stare FK artysta_id/praca_id/wystawa_id w artykuly ZOSTAJA jako "glowne
--     powiazanie" dla wstecznej kompatybilnosci. Nowe M:N rozszerzaja model
--     o powiazania wielokrotne (jeden artykul → wielu artystow itd.)
-- =============================================================================

BEGIN;

-- =============================================================================
-- 0. PRE-FLIGHT — stan obecny
-- =============================================================================
DO $$
DECLARE
  v_total int;
  v_publiczne int;
BEGIN
  SELECT COUNT(*) INTO v_total FROM artykuly;
  SELECT COUNT(*) INTO v_publiczne FROM artykuly WHERE publiczny = true;
  RAISE NOTICE '====================================================================';
  RAISE NOTICE 'PRE-FLIGHT artykuly:';
  RAISE NOTICE '  Lacznie rekordow: %', v_total;
  RAISE NOTICE '  Z publiczny=true: % (do migracji na status_publiczny=opublikowany)', v_publiczne;
  RAISE NOTICE '====================================================================';
END $$;

-- =============================================================================
-- 1. 8 NOWYCH KOLUMN — ALTER TABLE ADD COLUMN IF NOT EXISTS
-- =============================================================================

ALTER TABLE artykuly ADD COLUMN IF NOT EXISTS status_publiczny text DEFAULT 'szkic';
ALTER TABLE artykuly ADD COLUMN IF NOT EXISTS priorytet integer DEFAULT 0;
ALTER TABLE artykuly ADD COLUMN IF NOT EXISTS priorytet_international integer DEFAULT 0;
ALTER TABLE artykuly ADD COLUMN IF NOT EXISTS pokaz_na_home boolean DEFAULT false;
ALTER TABLE artykuly ADD COLUMN IF NOT EXISTS typ_artykulu text;
ALTER TABLE artykuly ADD COLUMN IF NOT EXISTS czas_czytania_min integer;
ALTER TABLE artykuly ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE artykuly ADD COLUMN IF NOT EXISTS viewing_room_id uuid;

-- =============================================================================
-- 2. CHECK CONSTRAINTS na artykuly (idempotent)
-- =============================================================================

-- 2a. status_publiczny CHECK
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'artykuly_status_publiczny_check'
  ) THEN
    ALTER TABLE artykuly ADD CONSTRAINT artykuly_status_publiczny_check
      CHECK (status_publiczny IN ('szkic', 'opublikowany', 'archiwalny'));
    RAISE NOTICE 'CHECK artykuly_status_publiczny_check — dodany';
  ELSE
    RAISE NOTICE 'CHECK artykuly_status_publiczny_check — juz istnieje (skip)';
  END IF;
END $$;

-- 2b. typ_artykulu CHECK (10 dozwolonych wartosci LUB NULL)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'artykuly_typ_artykulu_check'
  ) THEN
    ALTER TABLE artykuly ADD CONSTRAINT artykuly_typ_artykulu_check
      CHECK (typ_artykulu IS NULL OR typ_artykulu IN (
        'notatka',
        'nowa-praca',
        'wystawa',
        'targi',
        'komentarz-artysta',
        'pojecie',
        'behind-the-scenes',
        'recenzja',
        'wywiad',
        'krótka-notatka'
      ));
    RAISE NOTICE 'CHECK artykuly_typ_artykulu_check — dodany';
  ELSE
    RAISE NOTICE 'CHECK artykuly_typ_artykulu_check — juz istnieje (skip)';
  END IF;
END $$;

-- =============================================================================
-- 3. FK CONSTRAINT viewing_room_id → viewing_room(id) (idempotent)
-- =============================================================================
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'artykuly_viewing_room_id_fkey'
  ) THEN
    ALTER TABLE artykuly ADD CONSTRAINT artykuly_viewing_room_id_fkey
      FOREIGN KEY (viewing_room_id) REFERENCES viewing_room(id) ON DELETE SET NULL;
    RAISE NOTICE 'FK artykuly_viewing_room_id_fkey — dodany';
  ELSE
    RAISE NOTICE 'FK artykuly_viewing_room_id_fkey — juz istnieje (skip)';
  END IF;
END $$;

-- =============================================================================
-- 4. MIGRACJA DANYCH: publiczny=true → status_publiczny='opublikowany'
-- =============================================================================
DO $$
DECLARE v_updated int;
BEGIN
  UPDATE artykuly
  SET status_publiczny = 'opublikowany'
  WHERE publiczny = true AND status_publiczny = 'szkic';
  GET DIAGNOSTICS v_updated = ROW_COUNT;
  RAISE NOTICE 'Migracja danych: % rekordow → status_publiczny=opublikowany', v_updated;
END $$;

-- =============================================================================
-- 5. 6 NOWYCH TABEL M:N (CREATE TABLE IF NOT EXISTS)
-- =============================================================================

-- 5a. artykuly_pojecia
CREATE TABLE IF NOT EXISTS artykuly_pojecia (
  artykul_id uuid NOT NULL REFERENCES artykuly(id) ON DELETE CASCADE,
  pojecie_id uuid NOT NULL REFERENCES pojecia(id) ON DELETE CASCADE,
  PRIMARY KEY (artykul_id, pojecie_id)
);

-- 5b. artykuly_artysci (z rola + kolejnosc)
CREATE TABLE IF NOT EXISTS artykuly_artysci (
  artykul_id uuid NOT NULL REFERENCES artykuly(id) ON DELETE CASCADE,
  artysta_id uuid NOT NULL REFERENCES artysci(id) ON DELETE CASCADE,
  rola text,
  kolejnosc integer DEFAULT 0,
  PRIMARY KEY (artykul_id, artysta_id)
);

-- 5c. artykuly_prace (z kontekst + kolejnosc)
CREATE TABLE IF NOT EXISTS artykuly_prace (
  artykul_id uuid NOT NULL REFERENCES artykuly(id) ON DELETE CASCADE,
  praca_id uuid NOT NULL REFERENCES prace(id) ON DELETE CASCADE,
  kontekst text,
  kolejnosc integer DEFAULT 0,
  PRIMARY KEY (artykul_id, praca_id)
);

-- 5d. artykuly_wystawy
CREATE TABLE IF NOT EXISTS artykuly_wystawy (
  artykul_id uuid NOT NULL REFERENCES artykuly(id) ON DELETE CASCADE,
  wystawa_id uuid NOT NULL REFERENCES wystawy(id) ON DELETE CASCADE,
  kolejnosc integer DEFAULT 0,
  PRIMARY KEY (artykul_id, wystawa_id)
);

-- 5e. artykuly_viewing_room
CREATE TABLE IF NOT EXISTS artykuly_viewing_room (
  artykul_id uuid NOT NULL REFERENCES artykuly(id) ON DELETE CASCADE,
  vr_id uuid NOT NULL REFERENCES viewing_room(id) ON DELETE CASCADE,
  kolejnosc integer DEFAULT 0,
  PRIMARY KEY (artykul_id, vr_id)
);

-- 5f. artykuly_powiazane (self-FK + CHECK different)
CREATE TABLE IF NOT EXISTS artykuly_powiazane (
  artykul_id uuid NOT NULL REFERENCES artykuly(id) ON DELETE CASCADE,
  powiazany_artykul_id uuid NOT NULL REFERENCES artykuly(id) ON DELETE CASCADE,
  notatka text,
  kolejnosc integer DEFAULT 0,
  PRIMARY KEY (artykul_id, powiazany_artykul_id),
  CONSTRAINT artykuly_powiazane_different CHECK (artykul_id <> powiazany_artykul_id)
);

-- =============================================================================
-- 6. INDEKSY (15 CREATE INDEX + 6 PK auto-utworzonych = 21 lacznie)
-- =============================================================================

-- 6a. Indeksy na artykuly (9 sztuk)
CREATE INDEX IF NOT EXISTS idx_artykuly_status_publiczny ON artykuly(status_publiczny);
CREATE INDEX IF NOT EXISTS idx_artykuly_priorytet ON artykuly(priorytet DESC);
CREATE INDEX IF NOT EXISTS idx_artykuly_priorytet_international ON artykuly(priorytet_international DESC);
CREATE INDEX IF NOT EXISTS idx_artykuly_pokaz_na_home ON artykuly(pokaz_na_home) WHERE pokaz_na_home = true;
CREATE INDEX IF NOT EXISTS idx_artykuly_typ_artykulu ON artykuly(typ_artykulu);
CREATE INDEX IF NOT EXISTS idx_artykuly_viewing_room_id ON artykuly(viewing_room_id);
CREATE INDEX IF NOT EXISTS idx_artykuly_updated_at ON artykuly(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_artykuly_status_priorytet ON artykuly(status_publiczny, priorytet DESC);
CREATE INDEX IF NOT EXISTS idx_artykuly_status_priorytet_intl ON artykuly(status_publiczny, priorytet_international DESC);

-- 6b. Reverse-lookup indeksy na M:N (6 sztuk) — PK juz indeksuje (artykul_id, X)
CREATE INDEX IF NOT EXISTS idx_artykuly_pojecia_pojecie ON artykuly_pojecia(pojecie_id);
CREATE INDEX IF NOT EXISTS idx_artykuly_artysci_artysta ON artykuly_artysci(artysta_id);
CREATE INDEX IF NOT EXISTS idx_artykuly_prace_praca ON artykuly_prace(praca_id);
CREATE INDEX IF NOT EXISTS idx_artykuly_wystawy_wystawa ON artykuly_wystawy(wystawa_id);
CREATE INDEX IF NOT EXISTS idx_artykuly_vr_vr ON artykuly_viewing_room(vr_id);
CREATE INDEX IF NOT EXISTS idx_artykuly_powiazane_target ON artykuly_powiazane(powiazany_artykul_id);

-- =============================================================================
-- 7. TRIGGER updated_at — przy kazdym UPDATE artykuly
-- =============================================================================

CREATE OR REPLACE FUNCTION trigger_artykuly_updated_at()
RETURNS TRIGGER AS $func$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$func$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS artykuly_updated_at ON artykuly;
CREATE TRIGGER artykuly_updated_at
  BEFORE UPDATE ON artykuly
  FOR EACH ROW
  EXECUTE FUNCTION trigger_artykuly_updated_at();

-- =============================================================================
-- 8. WERYFIKACJA KONCOWA — 6 testow PASS/FAIL
-- =============================================================================
DO $$
DECLARE
  v_columns int;
  v_tables int;
  v_indexes int;
  v_checks_artykuly int;
  v_checks_powiazane int;
  v_pks_mn int;
  v_trigger int;
  v_szkic_publiczny int;
  v_pass bool := true;
BEGIN
  -- TEST 1: 8 nowych kolumn istnieje
  SELECT COUNT(*) INTO v_columns FROM information_schema.columns
  WHERE table_schema='public' AND table_name='artykuly'
    AND column_name IN (
      'status_publiczny', 'priorytet', 'priorytet_international',
      'pokaz_na_home', 'typ_artykulu', 'czas_czytania_min',
      'updated_at', 'viewing_room_id'
    );

  -- TEST 2: 6 nowych tabel M:N istnieje
  SELECT COUNT(*) INTO v_tables FROM information_schema.tables
  WHERE table_schema='public' AND table_name IN (
    'artykuly_pojecia', 'artykuly_artysci', 'artykuly_prace',
    'artykuly_wystawy', 'artykuly_viewing_room', 'artykuly_powiazane'
  );

  -- TEST 3: indeksy >= 20 (na artykuly + 6 M:N tabelach)
  SELECT COUNT(*) INTO v_indexes FROM pg_indexes
  WHERE schemaname='public' AND tablename IN (
    'artykuly', 'artykuly_pojecia', 'artykuly_artysci', 'artykuly_prace',
    'artykuly_wystawy', 'artykuly_viewing_room', 'artykuly_powiazane'
  );

  -- TEST 4a: CHECK constraints na artykuly (2 oczekiwane)
  SELECT COUNT(*) INTO v_checks_artykuly FROM pg_constraint c
  JOIN pg_class t ON c.conrelid = t.oid
  WHERE c.contype = 'c' AND t.relname = 'artykuly'
    AND c.conname IN ('artykuly_status_publiczny_check', 'artykuly_typ_artykulu_check');

  -- TEST 4b: CHECK artykuly_powiazane_different (1 oczekiwany)
  SELECT COUNT(*) INTO v_checks_powiazane FROM pg_constraint c
  JOIN pg_class t ON c.conrelid = t.oid
  WHERE c.contype = 'c' AND t.relname = 'artykuly_powiazane'
    AND c.conname = 'artykuly_powiazane_different';

  -- TEST 4c: PRIMARY KEY na wszystkich 6 M:N tabelach
  SELECT COUNT(*) INTO v_pks_mn FROM pg_constraint c
  JOIN pg_class t ON c.conrelid = t.oid
  WHERE c.contype = 'p' AND t.relname IN (
    'artykuly_pojecia', 'artykuly_artysci', 'artykuly_prace',
    'artykuly_wystawy', 'artykuly_viewing_room', 'artykuly_powiazane'
  );

  -- TEST 5: trigger updated_at istnieje
  SELECT COUNT(*) INTO v_trigger FROM pg_trigger
  WHERE tgname = 'artykuly_updated_at' AND NOT tgisinternal;

  -- TEST 6: migracja danych OK — 0 rekordow szkic+publiczny=true
  SELECT COUNT(*) INTO v_szkic_publiczny FROM artykuly
  WHERE publiczny = true AND status_publiczny = 'szkic';

  RAISE NOTICE '====================================================================';
  RAISE NOTICE 'WERYFIKACJA rozbudowy artykuly:';
  RAISE NOTICE '  TEST 1 — 8 nowych kolumn artykuly:      % / 8', v_columns;
  RAISE NOTICE '  TEST 2 — 6 nowych tabel M:N:            % / 6', v_tables;
  RAISE NOTICE '  TEST 3 — indeksy lacznie:               % (oczekiwane >= 20)', v_indexes;
  RAISE NOTICE '  TEST 4a — CHECK constraints artykuly:   % / 2', v_checks_artykuly;
  RAISE NOTICE '  TEST 4b — CHECK artykuly_powiazane:     % / 1', v_checks_powiazane;
  RAISE NOTICE '  TEST 4c — PK na 6 M:N tabelach:         % / 6', v_pks_mn;
  RAISE NOTICE '  TEST 5 — trigger updated_at:            % / 1', v_trigger;
  RAISE NOTICE '  TEST 6 — szkic+publiczny (oczekiwane 0): %', v_szkic_publiczny;
  RAISE NOTICE '====================================================================';

  IF v_columns < 8 THEN v_pass := false; RAISE WARNING 'FAIL TEST 1 (kolumny)'; END IF;
  IF v_tables < 6 THEN v_pass := false; RAISE WARNING 'FAIL TEST 2 (M:N tabele)'; END IF;
  IF v_indexes < 20 THEN v_pass := false; RAISE WARNING 'FAIL TEST 3 (indeksy: %)', v_indexes; END IF;
  IF v_checks_artykuly < 2 THEN v_pass := false; RAISE WARNING 'FAIL TEST 4a (CHECK artykuly)'; END IF;
  IF v_checks_powiazane < 1 THEN v_pass := false; RAISE WARNING 'FAIL TEST 4b (CHECK powiazane)'; END IF;
  IF v_pks_mn < 6 THEN v_pass := false; RAISE WARNING 'FAIL TEST 4c (PK M:N)'; END IF;
  IF v_trigger < 1 THEN v_pass := false; RAISE WARNING 'FAIL TEST 5 (trigger)'; END IF;
  IF v_szkic_publiczny > 0 THEN v_pass := false; RAISE WARNING 'FAIL TEST 6 (migracja danych)'; END IF;

  IF v_pass THEN
    RAISE NOTICE 'PASS — rozbudowa artykuly zakonczona pomyslnie';
  ELSE
    RAISE EXCEPTION 'FAIL — patrz WARNINGI powyzej';
  END IF;
END $$;

COMMIT;
