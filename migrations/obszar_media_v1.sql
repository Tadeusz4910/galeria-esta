-- =============================================================================
-- migrations/obszar_media_v1.sql
-- Obszar MEDIA — rozbudowa tabeli `media`:
--   * 32 nowe kolumny (typy, wielojezycznosc, metadane, prawa, hash,
--     thumbnaile, wideo/audio, focal point, upload tracking)
--   * 4 tabele M:N (artysci, prace, wystawy, pojecia)
--   * ~22 indeksow (CREATE INDEX + PK auto na M:N)
--   * Trigger zmodyfikowane BEFORE UPDATE
--   * View media_publiczne (security_invoker)
--   * Migracja danych: 21 rekordow (16 wernisaze + 5 prac) →
--     typ_glowny derive z FK, typ_szczegolowy = typ, alt_pl ← alt,
--     podpis_pl ← podpis, prawa_autorskie ← prawa,
--     szerokosc_px ← szerokosc, wysokosc_px ← wysokosc,
--     rozmiar_bajty ← rozmiar_kb × 1024, format_pliku z URL extension,
--     typ_zawartosci z URL extension (jpg/png/... = obraz, mp4 = wideo, itd.)
-- =============================================================================
--
-- IDEMPOTENCJA:
--   - ALTER TABLE ADD COLUMN IF NOT EXISTS
--   - CREATE TABLE IF NOT EXISTS
--   - CREATE INDEX IF NOT EXISTS
--   - Constraints w DO blokach z IF NOT EXISTS (pg_constraint)
--   - DROP TRIGGER IF EXISTS + CREATE TRIGGER
--   - UPDATE warunkowe (... AND col IS NULL)
--   - CREATE OR REPLACE VIEW
--
-- WSTECZNA KOMPATYBILNOSC:
--   - Stare kolumny ZOSTAJA: alt, podpis, prawa, typ,
--     szerokosc, wysokosc, rozmiar_kb (wzor z artykuly.publiczny)
--   - Wartosci KOPIOWANE do nowych kolumn (alt → alt_pl, ...)
--   - Stare FK artysta_id/praca_id/wystawa_id/targ_id ZOSTAJA jako
--     bezposrednie "glowne powiazanie". Nowe M:N rozszerzaja model
--     o powiazania wielokrotne.
--
-- DECYZJE (D1-D8) z konsultacji:
--   D1: stare kolumny zostaja jako legacy, wartosci kopiowane
--   D2: 5 rek. typ='praca' bez praca_id → typ_glowny='artysta', typ_szczegolowy='praca'
--   D3: 16 rek. artysta+wystawa typ='wernisaz' → typ_glowny='wystawa', typ_szczegolowy='wernisaz'
--   D4: rozmiar_kb wszystkie NULL → tylko CREATE COLUMN, brak konwersji
--   D5: focal_point_x/y typu real (0.0-1.0)
--   D6: view media_publiczne z WITH (security_invoker = true) — PG 17.6
--   D7: typ_glowny CHECK 7 wartosci: praca/artysta/wystawa/targ/blog/dokument/inne
--   D8: typ_zawartosci CHECK 6 wartosci: obraz/wideo/audio/dokument/wektor/inne
--       + 2 dodatkowe kolumny (poster_url, czas_trwania_sek) dla wideo/audio
-- =============================================================================

BEGIN;

-- =============================================================================
-- 0. PRE-FLIGHT — stan obecny
-- =============================================================================
DO $$
DECLARE
  v_total int;
  v_wystawa int;
  v_praca int;
BEGIN
  SELECT COUNT(*) INTO v_total FROM media;
  SELECT COUNT(*) INTO v_wystawa FROM media WHERE wystawa_id IS NOT NULL;
  SELECT COUNT(*) INTO v_praca FROM media WHERE typ = 'praca' AND praca_id IS NULL AND artysta_id IS NOT NULL;
  RAISE NOTICE '====================================================================';
  RAISE NOTICE 'PRE-FLIGHT media:';
  RAISE NOTICE '  Lacznie rekordow: %', v_total;
  RAISE NOTICE '  Kontekst wystawa (do typ_glowny=wystawa): %', v_wystawa;
  RAISE NOTICE '  Kontekst artysta bez praca_id (do typ_glowny=artysta): %', v_praca;
  RAISE NOTICE '====================================================================';
END $$;

-- =============================================================================
-- 1. 32 NOWE KOLUMNY — ALTER TABLE ADD COLUMN IF NOT EXISTS
-- =============================================================================

-- 1a. Typy i flagi
ALTER TABLE media ADD COLUMN IF NOT EXISTS format_pliku text;
ALTER TABLE media ADD COLUMN IF NOT EXISTS typ_zawartosci text;
ALTER TABLE media ADD COLUMN IF NOT EXISTS typ_glowny text;
ALTER TABLE media ADD COLUMN IF NOT EXISTS typ_szczegolowy text;
ALTER TABLE media ADD COLUMN IF NOT EXISTS glowne boolean DEFAULT false;
ALTER TABLE media ADD COLUMN IF NOT EXISTS kolejnosc integer DEFAULT 0;

-- 1b. Wielojezycznosc — alt + podpis w PL/EN/DE
ALTER TABLE media ADD COLUMN IF NOT EXISTS alt_pl text;
ALTER TABLE media ADD COLUMN IF NOT EXISTS alt_en text;
ALTER TABLE media ADD COLUMN IF NOT EXISTS alt_de text;
ALTER TABLE media ADD COLUMN IF NOT EXISTS podpis_pl text;
ALTER TABLE media ADD COLUMN IF NOT EXISTS podpis_en text;
ALTER TABLE media ADD COLUMN IF NOT EXISTS podpis_de text;
ALTER TABLE media ADD COLUMN IF NOT EXISTS alt_recznie_edytowane boolean DEFAULT false;

-- 1c. Prawa autorskie / licencja / zrodlo
ALTER TABLE media ADD COLUMN IF NOT EXISTS prawa_autorskie text;
ALTER TABLE media ADD COLUMN IF NOT EXISTS licencja text;
ALTER TABLE media ADD COLUMN IF NOT EXISTS zrodlo text;

-- 1d. Metadane techniczne
ALTER TABLE media ADD COLUMN IF NOT EXISTS szerokosc_px integer;
ALTER TABLE media ADD COLUMN IF NOT EXISTS wysokosc_px integer;
ALTER TABLE media ADD COLUMN IF NOT EXISTS rozmiar_bajty bigint;
ALTER TABLE media ADD COLUMN IF NOT EXISTS hash text;

-- 1e. Upload tracking + zmodyfikowane
ALTER TABLE media ADD COLUMN IF NOT EXISTS upload_data timestamptz;
ALTER TABLE media ADD COLUMN IF NOT EXISTS upload_kto text;
ALTER TABLE media ADD COLUMN IF NOT EXISTS zmodyfikowane timestamptz NOT NULL DEFAULT now();

-- 1f. Wyszukiwanie i tagi
ALTER TABLE media ADD COLUMN IF NOT EXISTS tagi text;
ALTER TABLE media ADD COLUMN IF NOT EXISTS notatka_wewnetrzna text;

-- 1g. Focal point (0.0-1.0) — punkt skupienia obrazu (crop center)
ALTER TABLE media ADD COLUMN IF NOT EXISTS focal_point_x real;
ALTER TABLE media ADD COLUMN IF NOT EXISTS focal_point_y real;

-- 1h. Thumbnaile (flagi czy istnieja generated rozmiary)
ALTER TABLE media ADD COLUMN IF NOT EXISTS ma_thumbnail boolean DEFAULT false;
ALTER TABLE media ADD COLUMN IF NOT EXISTS ma_medium boolean DEFAULT false;
ALTER TABLE media ADD COLUMN IF NOT EXISTS ma_large boolean DEFAULT false;

-- 1i. Wideo/audio (D8 — dodatkowe pola dla nie-obrazow)
ALTER TABLE media ADD COLUMN IF NOT EXISTS poster_url text;
ALTER TABLE media ADD COLUMN IF NOT EXISTS czas_trwania_sek integer;

-- =============================================================================
-- 2. CHECK CONSTRAINTS — D7 + D8 (idempotent przez pg_constraint)
-- =============================================================================

-- 2a. typ_glowny — 7 wartosci (D7)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'media_typ_glowny_check'
  ) THEN
    ALTER TABLE media ADD CONSTRAINT media_typ_glowny_check
      CHECK (typ_glowny IS NULL OR typ_glowny IN (
        'praca', 'artysta', 'wystawa', 'targ', 'blog', 'dokument', 'inne'
      ));
    RAISE NOTICE 'CHECK media_typ_glowny_check — dodany';
  ELSE
    RAISE NOTICE 'CHECK media_typ_glowny_check — juz istnieje (skip)';
  END IF;
END $$;

-- 2b. typ_zawartosci — 6 wartosci (D8 z wideo + audio)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'media_typ_zawartosci_check'
  ) THEN
    ALTER TABLE media ADD CONSTRAINT media_typ_zawartosci_check
      CHECK (typ_zawartosci IS NULL OR typ_zawartosci IN (
        'obraz', 'wideo', 'audio', 'dokument', 'wektor', 'inne'
      ));
    RAISE NOTICE 'CHECK media_typ_zawartosci_check — dodany';
  ELSE
    RAISE NOTICE 'CHECK media_typ_zawartosci_check — juz istnieje (skip)';
  END IF;
END $$;

-- =============================================================================
-- 3. 4 TABELE M:N (CREATE TABLE IF NOT EXISTS)
-- =============================================================================

-- 3a. media_artysci (z rola)
CREATE TABLE IF NOT EXISTS media_artysci (
  media_id uuid NOT NULL REFERENCES media(id) ON DELETE CASCADE,
  artysta_id uuid NOT NULL REFERENCES artysci(id) ON DELETE CASCADE,
  rola text,
  PRIMARY KEY (media_id, artysta_id)
);

-- 3b. media_prace (z rola)
CREATE TABLE IF NOT EXISTS media_prace (
  media_id uuid NOT NULL REFERENCES media(id) ON DELETE CASCADE,
  praca_id uuid NOT NULL REFERENCES prace(id) ON DELETE CASCADE,
  rola text,
  PRIMARY KEY (media_id, praca_id)
);

-- 3c. media_wystawy
CREATE TABLE IF NOT EXISTS media_wystawy (
  media_id uuid NOT NULL REFERENCES media(id) ON DELETE CASCADE,
  wystawa_id uuid NOT NULL REFERENCES wystawy(id) ON DELETE CASCADE,
  PRIMARY KEY (media_id, wystawa_id)
);

-- 3d. media_pojecia
CREATE TABLE IF NOT EXISTS media_pojecia (
  media_id uuid NOT NULL REFERENCES media(id) ON DELETE CASCADE,
  pojecie_id uuid NOT NULL REFERENCES pojecia(id) ON DELETE CASCADE,
  PRIMARY KEY (media_id, pojecie_id)
);

-- =============================================================================
-- 4. MIGRACJA DANYCH — typ_glowny, typ_szczegolowy, typ_zawartosci,
--    format_pliku, alt_pl, podpis_pl, prawa_autorskie, szerokosc/wysokosc_px,
--    rozmiar_bajty, upload_data
-- =============================================================================

-- 4a. typ_glowny — derive z FK (D2 + D3)
DO $$
DECLARE
  v_wystawa int;
  v_artysta int;
BEGIN
  -- D3: 16 rekordow z wystawa_id → typ_glowny='wystawa'
  UPDATE media
    SET typ_glowny = 'wystawa'
    WHERE wystawa_id IS NOT NULL AND typ_glowny IS NULL;
  GET DIAGNOSTICS v_wystawa = ROW_COUNT;

  -- D2: rek. z tylko artysta_id (typ='praca' lub inne) → typ_glowny='artysta'
  UPDATE media
    SET typ_glowny = 'artysta'
    WHERE wystawa_id IS NULL
      AND praca_id IS NULL
      AND targ_id IS NULL
      AND artysta_id IS NOT NULL
      AND typ_glowny IS NULL;
  GET DIAGNOSTICS v_artysta = ROW_COUNT;

  -- Pozostale (praca_id NOT NULL bez wystawa_id): typ_glowny='praca'
  UPDATE media
    SET typ_glowny = 'praca'
    WHERE praca_id IS NOT NULL AND wystawa_id IS NULL AND typ_glowny IS NULL;

  -- Pozostale (targ_id NOT NULL): typ_glowny='targ'
  UPDATE media
    SET typ_glowny = 'targ'
    WHERE targ_id IS NOT NULL AND typ_glowny IS NULL;

  RAISE NOTICE 'Migracja typ_glowny: % wystawa, % artysta', v_wystawa, v_artysta;
END $$;

-- 4b. typ_szczegolowy ← typ (wartosci 'wernisaz', 'praca', ...)
UPDATE media
  SET typ_szczegolowy = typ
  WHERE typ_szczegolowy IS NULL AND typ IS NOT NULL;

-- 4c. typ_zawartosci z extension URL (CASE WHEN)
UPDATE media SET typ_zawartosci = CASE
  WHEN lower(url) ~ '\.(jpg|jpeg|png|gif|webp|heic|avif|tiff|bmp)(\?.*)?$' THEN 'obraz'
  WHEN lower(url) ~ '\.(mp4|webm|mov|avi|mkv|m4v)(\?.*)?$' THEN 'wideo'
  WHEN lower(url) ~ '\.(mp3|wav|ogg|m4a|flac)(\?.*)?$' THEN 'audio'
  WHEN lower(url) ~ '\.(pdf|doc|docx|txt|rtf)(\?.*)?$' THEN 'dokument'
  WHEN lower(url) ~ '\.svg(\?.*)?$' THEN 'wektor'
  ELSE 'obraz'  -- fallback dla URL bez rozszerzenia / nieznanych
  END
  WHERE typ_zawartosci IS NULL;

-- 4d. format_pliku ← extension z URL
UPDATE media
  SET format_pliku = lower(substring(url FROM '\.([a-zA-Z0-9]+)(?:\?.*)?$'))
  WHERE format_pliku IS NULL AND url ~ '\.[a-zA-Z0-9]+(?:\?.*)?$';

-- 4e. alt_pl ← alt
UPDATE media
  SET alt_pl = alt
  WHERE alt_pl IS NULL AND alt IS NOT NULL;

-- 4f. podpis_pl ← podpis
UPDATE media
  SET podpis_pl = podpis
  WHERE podpis_pl IS NULL AND podpis IS NOT NULL;

-- 4g. prawa_autorskie ← prawa
UPDATE media
  SET prawa_autorskie = prawa
  WHERE prawa_autorskie IS NULL AND prawa IS NOT NULL;

-- 4h. szerokosc_px ← szerokosc
UPDATE media
  SET szerokosc_px = szerokosc
  WHERE szerokosc_px IS NULL AND szerokosc IS NOT NULL;

-- 4i. wysokosc_px ← wysokosc
UPDATE media
  SET wysokosc_px = wysokosc
  WHERE wysokosc_px IS NULL AND wysokosc IS NOT NULL;

-- 4j. rozmiar_bajty ← rozmiar_kb × 1024
UPDATE media
  SET rozmiar_bajty = rozmiar_kb::bigint * 1024
  WHERE rozmiar_bajty IS NULL AND rozmiar_kb IS NOT NULL;

-- 4k. upload_data ← created_at
UPDATE media
  SET upload_data = created_at
  WHERE upload_data IS NULL;

-- =============================================================================
-- 5. INDEKSY (15 CREATE INDEX + 4 PK na M:N = 19+ lacznie)
-- =============================================================================

-- 5a. Indeksy na media (typy, FK partial, hash, upload)
CREATE INDEX IF NOT EXISTS idx_media_typ_glowny ON media(typ_glowny);
CREATE INDEX IF NOT EXISTS idx_media_typ_szczegolowy ON media(typ_szczegolowy);
CREATE INDEX IF NOT EXISTS idx_media_typ_zawartosci ON media(typ_zawartosci);
CREATE INDEX IF NOT EXISTS idx_media_artysta ON media(artysta_id) WHERE artysta_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_media_praca ON media(praca_id) WHERE praca_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_media_wystawa ON media(wystawa_id) WHERE wystawa_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_media_targ ON media(targ_id) WHERE targ_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_media_upload_data ON media(upload_data DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_media_hash ON media(hash) WHERE hash IS NOT NULL;

-- 5b. UNIQUE indeksy "jedno glowne per encja" (partial WHERE glowne=true)
CREATE UNIQUE INDEX IF NOT EXISTS idx_media_glowne_artysta
  ON media(artysta_id) WHERE glowne = true AND artysta_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_media_glowne_praca
  ON media(praca_id) WHERE glowne = true AND praca_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_media_glowne_wystawa
  ON media(wystawa_id) WHERE glowne = true AND wystawa_id IS NOT NULL;

-- 5c. Full-text GIN na alt_pl, podpis_pl, notatka_wewnetrzna ('simple' bo brak slownika polskiego w std)
CREATE INDEX IF NOT EXISTS idx_media_alt_pl_gin
  ON media USING gin(to_tsvector('simple', coalesce(alt_pl, '')));
CREATE INDEX IF NOT EXISTS idx_media_podpis_pl_gin
  ON media USING gin(to_tsvector('simple', coalesce(podpis_pl, '')));
CREATE INDEX IF NOT EXISTS idx_media_notatka_gin
  ON media USING gin(to_tsvector('simple', coalesce(notatka_wewnetrzna, '')));

-- 5d. Reverse-lookup indeksy na M:N (PK juz indeksuje (media_id, X))
CREATE INDEX IF NOT EXISTS idx_media_artysci_artysta ON media_artysci(artysta_id);
CREATE INDEX IF NOT EXISTS idx_media_prace_praca ON media_prace(praca_id);
CREATE INDEX IF NOT EXISTS idx_media_wystawy_wystawa ON media_wystawy(wystawa_id);
CREATE INDEX IF NOT EXISTS idx_media_pojecia_pojecie ON media_pojecia(pojecie_id);

-- =============================================================================
-- 6. TRIGGER zmodyfikowane — BEFORE UPDATE na media
-- =============================================================================

CREATE OR REPLACE FUNCTION trigger_media_zmodyfikowane()
RETURNS TRIGGER AS $func$
BEGIN
  NEW.zmodyfikowane := now();
  RETURN NEW;
END;
$func$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS media_zmodyfikowane ON media;
CREATE TRIGGER media_zmodyfikowane
  BEFORE UPDATE ON media
  FOR EACH ROW
  EXECUTE FUNCTION trigger_media_zmodyfikowane();

-- =============================================================================
-- 7. VIEW media_publiczne — z security_invoker (PG 15+, mamy PG 17.6)
--    Filtruje out dokumenty (faktury, umowy, certyfikaty itp.)
-- =============================================================================

DROP VIEW IF EXISTS media_publiczne;
CREATE VIEW media_publiczne
  WITH (security_invoker = true) AS
SELECT *
FROM media
WHERE typ_glowny IS NULL OR typ_glowny <> 'dokument';

-- Cofnij domyslny SELECT z roli anon/authenticated zeby trzeba bylo
-- explicite go nadac (jak inne widoki w obszarze 0)
REVOKE ALL ON media_publiczne FROM anon, authenticated;
GRANT SELECT ON media_publiczne TO anon, authenticated;

-- =============================================================================
-- 8. WERYFIKACJA — 8 testow PASS/FAIL
-- =============================================================================
DO $$
DECLARE
  v_columns int;
  v_tables int;
  v_indexes int;
  v_checks int;
  v_trigger int;
  v_view int;
  v_count_after int;
  v_typ_glowny_null int;
  v_pass bool := true;
BEGIN
  -- TEST 1: 32 nowe kolumny dodane
  SELECT COUNT(*) INTO v_columns FROM information_schema.columns
  WHERE table_schema='public' AND table_name='media'
    AND column_name IN (
      'format_pliku', 'typ_zawartosci', 'typ_glowny', 'typ_szczegolowy',
      'glowne', 'kolejnosc',
      'alt_pl', 'alt_en', 'alt_de',
      'podpis_pl', 'podpis_en', 'podpis_de',
      'alt_recznie_edytowane',
      'prawa_autorskie', 'licencja', 'zrodlo',
      'szerokosc_px', 'wysokosc_px', 'rozmiar_bajty', 'hash',
      'upload_data', 'upload_kto', 'zmodyfikowane',
      'tagi', 'notatka_wewnetrzna',
      'focal_point_x', 'focal_point_y',
      'ma_thumbnail', 'ma_medium', 'ma_large',
      'poster_url', 'czas_trwania_sek'
    );

  -- TEST 2: 4 nowe tabele M:N
  SELECT COUNT(*) INTO v_tables FROM information_schema.tables
  WHERE table_schema='public' AND table_name IN (
    'media_artysci', 'media_prace', 'media_wystawy', 'media_pojecia'
  );

  -- TEST 3: indeksy >= 20 (na media + 4 M:N)
  SELECT COUNT(*) INTO v_indexes FROM pg_indexes
  WHERE schemaname='public' AND tablename IN (
    'media', 'media_artysci', 'media_prace', 'media_wystawy', 'media_pojecia'
  );

  -- TEST 4: 2 CHECK constraints
  SELECT COUNT(*) INTO v_checks FROM pg_constraint c
  JOIN pg_class t ON c.conrelid = t.oid
  WHERE c.contype = 'c' AND t.relname = 'media'
    AND c.conname IN ('media_typ_glowny_check', 'media_typ_zawartosci_check');

  -- TEST 5: trigger zmodyfikowane
  SELECT COUNT(*) INTO v_trigger FROM pg_trigger
  WHERE tgname = 'media_zmodyfikowane' AND NOT tgisinternal;

  -- TEST 6: view media_publiczne
  SELECT COUNT(*) INTO v_view FROM information_schema.views
  WHERE table_schema='public' AND table_name='media_publiczne';

  -- TEST 7: dane bez utraty — COUNT po migracji
  SELECT COUNT(*) INTO v_count_after FROM media;

  -- TEST 8: typ_glowny migracja OK — 0 rekordow NULL po migracji
  SELECT COUNT(*) INTO v_typ_glowny_null FROM media WHERE typ_glowny IS NULL;

  RAISE NOTICE '====================================================================';
  RAISE NOTICE 'WERYFIKACJA rozbudowy media:';
  RAISE NOTICE '  TEST 1 — 32 nowe kolumny:           % / 32', v_columns;
  RAISE NOTICE '  TEST 2 — 4 tabele M:N:              % / 4', v_tables;
  RAISE NOTICE '  TEST 3 — indeksy lacznie:           % (oczekiwane >= 20)', v_indexes;
  RAISE NOTICE '  TEST 4 — 2 CHECK constraints:       % / 2', v_checks;
  RAISE NOTICE '  TEST 5 — trigger zmodyfikowane:     % / 1', v_trigger;
  RAISE NOTICE '  TEST 6 — view media_publiczne:      % / 1', v_view;
  RAISE NOTICE '  TEST 7 — rekordow po migracji:      % (oczekiwane 21)', v_count_after;
  RAISE NOTICE '  TEST 8 — typ_glowny NULL po migr.:  % (oczekiwane 0)', v_typ_glowny_null;
  RAISE NOTICE '====================================================================';

  IF v_columns < 32 THEN v_pass := false; RAISE WARNING 'FAIL TEST 1 (% z 32 kolumn)', v_columns; END IF;
  IF v_tables < 4 THEN v_pass := false; RAISE WARNING 'FAIL TEST 2 (% z 4 M:N)', v_tables; END IF;
  IF v_indexes < 20 THEN v_pass := false; RAISE WARNING 'FAIL TEST 3 (% indeksow)', v_indexes; END IF;
  IF v_checks < 2 THEN v_pass := false; RAISE WARNING 'FAIL TEST 4 (% z 2 CHECK)', v_checks; END IF;
  IF v_trigger < 1 THEN v_pass := false; RAISE WARNING 'FAIL TEST 5 (trigger brak)'; END IF;
  IF v_view < 1 THEN v_pass := false; RAISE WARNING 'FAIL TEST 6 (view brak)'; END IF;
  IF v_count_after <> 21 THEN v_pass := false; RAISE WARNING 'FAIL TEST 7 (utrata danych — % zamiast 21)', v_count_after; END IF;
  IF v_typ_glowny_null > 0 THEN v_pass := false; RAISE WARNING 'FAIL TEST 8 (% rekordow z typ_glowny=NULL)', v_typ_glowny_null; END IF;

  IF v_pass THEN
    RAISE NOTICE 'PASS — rozbudowa media zakonczona pomyslnie';
  ELSE
    RAISE EXCEPTION 'FAIL — patrz WARNINGI powyzej';
  END IF;
END $$;

COMMIT;
