-- =============================================================================
-- migrations/obszar3_etap2_seed_artysci.sql
-- Etap 2 Obszaru 3 — seed: 19 artystow z mappingu koncepcyjnego.
-- =============================================================================
--
-- ZAKRES:
--   1. Dodaje 6 brakujacych pojec do tabeli `pojecia`:
--      przestrzen, struktura, zapis, geometria, znak, symbol
--   2. Dla wszystkich 19 artystow:
--      a) UPDATE artysci SET idea_glowna_id, status_programowy, potencjal_viewing_room
--      b) INSERT pojecia_artysci (4 pojecia na artyste)
--
-- NIE seeduje: artysci_idee (idee uzupelniajace) — etap pozniej.
--
-- TOLERANCJA:
--   - Artysta matchowany przez ILIKE — toleruje literowki, brak diakrytykow,
--     podwojne spacje w nazwiskach (Kozlowski Jaroslaw ma "  " w DB).
--   - Jesli artysta nie istnieje — RAISE NOTICE 'SKIP' i kontynuujemy.
--   - Jesli pojecie nie istnieje po INSERT 6 nowych — RAISE NOTICE 'SKIP pojecie'.
--   - INSERT pojecia_artysci ma ON CONFLICT DO NOTHING — bezpieczne rerunowanie.
--
-- WERYFIKACJA na koncu:
--   - Liczniki: artystow z idea_glowna_id, ze status_programowy, rekordow pojecia_artysci,
--     zaseedowanych 6 brakujacych pojec.
--   - RAISE WARNING jesli liczby ponizej oczekiwan.
-- =============================================================================

BEGIN;

-- =============================================================================
-- 0. PRE-FLIGHT: sprawdz czy 7 slugow idei istnieje
-- =============================================================================
DO $$
DECLARE
  expected_slugs text[] := ARRAY[
    'geometria-struktura', 'idea-jezyk', 'obraz-komunikat',
    'pamiec-archiwum', 'slowo-znak', 'swiatlo-przestrzen',
    'wspolczesne-kontynuacje'
  ];
  missing text[] := ARRAY[]::text[];
  s text;
BEGIN
  FOREACH s IN ARRAY expected_slugs LOOP
    IF NOT EXISTS (SELECT 1 FROM idee WHERE slug = s) THEN
      missing := array_append(missing, s);
    END IF;
  END LOOP;
  IF array_length(missing, 1) > 0 THEN
    RAISE EXCEPTION 'PRE-FLIGHT FAIL: brakuje slugow idei: %', missing;
  END IF;
  RAISE NOTICE 'PRE-FLIGHT: 7/7 slugow idei OK';
END $$;

-- =============================================================================
-- 1. INSERT 6 brakujacych pojec
-- =============================================================================
INSERT INTO pojecia (slug, nazwa, idea_glowna_id, status_publiczny, etap_wdrozenia, priorytet)
VALUES
  ('przestrzen', 'przestrzeń',
    (SELECT id FROM idee WHERE slug = 'swiatlo-przestrzen'),
    'sygnal', 'etap_1_sygnal', 5),
  ('struktura', 'struktura',
    (SELECT id FROM idee WHERE slug = 'geometria-struktura'),
    'sygnal', 'etap_1_sygnal', 5),
  ('zapis', 'zapis',
    (SELECT id FROM idee WHERE slug = 'pamiec-archiwum'),
    'sygnal', 'etap_1_sygnal', 5),
  ('geometria', 'geometria',
    (SELECT id FROM idee WHERE slug = 'geometria-struktura'),
    'sygnal', 'etap_1_sygnal', 5),
  ('znak', 'znak',
    (SELECT id FROM idee WHERE slug = 'slowo-znak'),
    'sygnal', 'etap_1_sygnal', 5),
  ('symbol', 'symbol',
    (SELECT id FROM idee WHERE slug = 'obraz-komunikat'),
    'sygnal', 'etap_1_sygnal', 5)
ON CONFLICT (slug) DO NOTHING;

-- =============================================================================
-- 2. SEED 18 artystow (z 19 — Kozlowska Barbara SKIP, nie istnieje w bazie)
-- =============================================================================

-- ---- 1. Kozlowski Jaroslaw  (rdzen_kolekcji, bardzo_wysoki) ----
DO $$
DECLARE v_a uuid; v_i uuid; v_p uuid;
  pojecia_arr text[] := ARRAY['pojecie','paradoks','instrukcja','system-znaczen'];
  p text; n_ok int := 0;
BEGIN
  SELECT id INTO v_a FROM artysci WHERE nazwisko_i_imie ILIKE '%Kozłowski%Jarosław%' LIMIT 1;
  IF v_a IS NULL THEN RAISE NOTICE 'SKIP artysta: Kozlowski Jaroslaw'; RETURN; END IF;
  SELECT id INTO v_i FROM idee WHERE slug = 'idea-jezyk';
  UPDATE artysci SET idea_glowna_id = v_i, status_programowy = 'rdzen_kolekcji', potencjal_viewing_room = 'bardzo_wysoki' WHERE id = v_a;
  FOREACH p IN ARRAY pojecia_arr LOOP
    SELECT id INTO v_p FROM pojecia WHERE slug = p;
    IF v_p IS NULL THEN RAISE NOTICE 'SKIP pojecie [Kozlowski J.]: %', p;
    ELSE INSERT INTO pojecia_artysci (artysta_id, pojecie_id) VALUES (v_a, v_p) ON CONFLICT DO NOTHING; n_ok := n_ok + 1; END IF;
  END LOOP;
  RAISE NOTICE 'OK Kozlowski Jaroslaw — % pojec', n_ok;
END $$;

-- ---- 2. Dluzniewski Andrzej  (rdzen_kolekcji, wysoki) ----
DO $$
DECLARE v_a uuid; v_i uuid; v_p uuid;
  pojecia_arr text[] := ARRAY['pojecie','paradoks','ironia','tekst'];
  p text; n_ok int := 0;
BEGIN
  SELECT id INTO v_a FROM artysci WHERE nazwisko_i_imie ILIKE '%Dłużniewski%Andrzej%' LIMIT 1;
  IF v_a IS NULL THEN RAISE NOTICE 'SKIP artysta: Dluzniewski Andrzej'; RETURN; END IF;
  SELECT id INTO v_i FROM idee WHERE slug = 'idea-jezyk';
  UPDATE artysci SET idea_glowna_id = v_i, status_programowy = 'rdzen_kolekcji', potencjal_viewing_room = 'wysoki' WHERE id = v_a;
  FOREACH p IN ARRAY pojecia_arr LOOP
    SELECT id INTO v_p FROM pojecia WHERE slug = p;
    IF v_p IS NULL THEN RAISE NOTICE 'SKIP pojecie [Dluzniewski A.]: %', p;
    ELSE INSERT INTO pojecia_artysci (artysta_id, pojecie_id) VALUES (v_a, v_p) ON CONFLICT DO NOTHING; n_ok := n_ok + 1; END IF;
  END LOOP;
  RAISE NOTICE 'OK Dluzniewski Andrzej — % pojec', n_ok;
END $$;

-- ---- 3. Drozdz Stanislaw  (rdzen_kolekcji, bardzo_wysoki) ----
DO $$
DECLARE v_a uuid; v_i uuid; v_p uuid;
  pojecia_arr text[] := ARRAY['poezja-konkretna','typografia','litera','uklad'];
  p text; n_ok int := 0;
BEGIN
  SELECT id INTO v_a FROM artysci WHERE nazwisko_i_imie ILIKE '%Dróżdż%Stanisław%' LIMIT 1;
  IF v_a IS NULL THEN RAISE NOTICE 'SKIP artysta: Drozdz Stanislaw'; RETURN; END IF;
  SELECT id INTO v_i FROM idee WHERE slug = 'slowo-znak';
  UPDATE artysci SET idea_glowna_id = v_i, status_programowy = 'rdzen_kolekcji', potencjal_viewing_room = 'bardzo_wysoki' WHERE id = v_a;
  FOREACH p IN ARRAY pojecia_arr LOOP
    SELECT id INTO v_p FROM pojecia WHERE slug = p;
    IF v_p IS NULL THEN RAISE NOTICE 'SKIP pojecie [Drozdz S.]: %', p;
    ELSE INSERT INTO pojecia_artysci (artysta_id, pojecie_id) VALUES (v_a, v_p) ON CONFLICT DO NOTHING; n_ok := n_ok + 1; END IF;
  END LOOP;
  RAISE NOTICE 'OK Drozdz Stanislaw — % pojec', n_ok;
END $$;

-- ---- 4. Golkowska Wanda  (rdzen_kolekcji, bardzo_wysoki) ----
-- UWAGA: DB ma "Golkowska Wanda" BEZ polskiego "l", stad pattern "%olkowska%Wanda%"
DO $$
DECLARE v_a uuid; v_i uuid; v_p uuid;
  pojecia_arr text[] := ARRAY['uklad-otwarty','system','rytm','relacja'];
  p text; n_ok int := 0;
BEGIN
  SELECT id INTO v_a FROM artysci WHERE nazwisko_i_imie ILIKE '%olkowska%Wanda%' LIMIT 1;
  IF v_a IS NULL THEN RAISE NOTICE 'SKIP artysta: Golkowska Wanda'; RETURN; END IF;
  SELECT id INTO v_i FROM idee WHERE slug = 'geometria-struktura';
  UPDATE artysci SET idea_glowna_id = v_i, status_programowy = 'rdzen_kolekcji', potencjal_viewing_room = 'bardzo_wysoki' WHERE id = v_a;
  FOREACH p IN ARRAY pojecia_arr LOOP
    SELECT id INTO v_p FROM pojecia WHERE slug = p;
    IF v_p IS NULL THEN RAISE NOTICE 'SKIP pojecie [Golkowska W.]: %', p;
    ELSE INSERT INTO pojecia_artysci (artysta_id, pojecie_id) VALUES (v_a, v_p) ON CONFLICT DO NOTHING; n_ok := n_ok + 1; END IF;
  END LOOP;
  RAISE NOTICE 'OK Golkowska Wanda — % pojec', n_ok;
END $$;

-- ---- 5. Gostomski Zbigniew  (rdzen_kolekcji, bardzo_wysoki) ----
DO $$
DECLARE v_a uuid; v_i uuid; v_p uuid;
  pojecia_arr text[] := ARRAY['uklad','system','rytm','przestrzen'];
  p text; n_ok int := 0;
BEGIN
  SELECT id INTO v_a FROM artysci WHERE nazwisko_i_imie ILIKE '%Gostomski%Zbigniew%' LIMIT 1;
  IF v_a IS NULL THEN RAISE NOTICE 'SKIP artysta: Gostomski Zbigniew'; RETURN; END IF;
  SELECT id INTO v_i FROM idee WHERE slug = 'geometria-struktura';
  UPDATE artysci SET idea_glowna_id = v_i, status_programowy = 'rdzen_kolekcji', potencjal_viewing_room = 'bardzo_wysoki' WHERE id = v_a;
  FOREACH p IN ARRAY pojecia_arr LOOP
    SELECT id INTO v_p FROM pojecia WHERE slug = p;
    IF v_p IS NULL THEN RAISE NOTICE 'SKIP pojecie [Gostomski Z.]: %', p;
    ELSE INSERT INTO pojecia_artysci (artysta_id, pojecie_id) VALUES (v_a, v_p) ON CONFLICT DO NOTHING; n_ok := n_ok + 1; END IF;
  END LOOP;
  RAISE NOTICE 'OK Gostomski Zbigniew — % pojec', n_ok;
END $$;

-- ---- 6. Chwalczyk Jan  (rdzen_kolekcji, bardzo_wysoki) ----
DO $$
DECLARE v_a uuid; v_i uuid; v_p uuid;
  pojecia_arr text[] := ARRAY['swiatlo','cien','projekcja','obiekt'];
  p text; n_ok int := 0;
BEGIN
  SELECT id INTO v_a FROM artysci WHERE nazwisko_i_imie ILIKE '%Chwałczyk%Jan%' LIMIT 1;
  IF v_a IS NULL THEN RAISE NOTICE 'SKIP artysta: Chwalczyk Jan'; RETURN; END IF;
  SELECT id INTO v_i FROM idee WHERE slug = 'swiatlo-przestrzen';
  UPDATE artysci SET idea_glowna_id = v_i, status_programowy = 'rdzen_kolekcji', potencjal_viewing_room = 'bardzo_wysoki' WHERE id = v_a;
  FOREACH p IN ARRAY pojecia_arr LOOP
    SELECT id INTO v_p FROM pojecia WHERE slug = p;
    IF v_p IS NULL THEN RAISE NOTICE 'SKIP pojecie [Chwalczyk J.]: %', p;
    ELSE INSERT INTO pojecia_artysci (artysta_id, pojecie_id) VALUES (v_a, v_p) ON CONFLICT DO NOTHING; n_ok := n_ok + 1; END IF;
  END LOOP;
  RAISE NOTICE 'OK Chwalczyk Jan — % pojec', n_ok;
END $$;

-- ---- 7. Kozlowska Barbara  (rdzen_kolekcji, wysoki) ----
DO $$
DECLARE v_a uuid; v_i uuid; v_p uuid;
  pojecia_arr text[] := ARRAY['miejsce','dzialanie','slad','przestrzen'];
  p text; n_ok int := 0;
BEGIN
  SELECT id INTO v_a FROM artysci WHERE nazwisko_i_imie ILIKE '%Kozłowska%Barbara%' LIMIT 1;
  IF v_a IS NULL THEN RAISE NOTICE 'SKIP artysta: Kozlowska Barbara'; RETURN; END IF;
  SELECT id INTO v_i FROM idee WHERE slug = 'swiatlo-przestrzen';
  UPDATE artysci SET idea_glowna_id = v_i, status_programowy = 'rdzen_kolekcji', potencjal_viewing_room = 'wysoki' WHERE id = v_a;
  FOREACH p IN ARRAY pojecia_arr LOOP
    SELECT id INTO v_p FROM pojecia WHERE slug = p;
    IF v_p IS NULL THEN RAISE NOTICE 'SKIP pojecie [Kozlowska B.]: %', p;
    ELSE INSERT INTO pojecia_artysci (artysta_id, pojecie_id) VALUES (v_a, v_p) ON CONFLICT DO NOTHING; n_ok := n_ok + 1; END IF;
  END LOOP;
  RAISE NOTICE 'OK Kozlowska Barbara — % pojec', n_ok;
END $$;

-- ---- 8. Lewczynski Jerzy  (rdzen_kolekcji, bardzo_wysoki) ----
DO $$
DECLARE v_a uuid; v_i uuid; v_p uuid;
  pojecia_arr text[] := ARRAY['fotografia','archiwum','slad','czas'];
  p text; n_ok int := 0;
BEGIN
  SELECT id INTO v_a FROM artysci WHERE nazwisko_i_imie ILIKE '%Lewczyński%Jerzy%' LIMIT 1;
  IF v_a IS NULL THEN RAISE NOTICE 'SKIP artysta: Lewczynski Jerzy'; RETURN; END IF;
  SELECT id INTO v_i FROM idee WHERE slug = 'pamiec-archiwum';
  UPDATE artysci SET idea_glowna_id = v_i, status_programowy = 'rdzen_kolekcji', potencjal_viewing_room = 'bardzo_wysoki' WHERE id = v_a;
  FOREACH p IN ARRAY pojecia_arr LOOP
    SELECT id INTO v_p FROM pojecia WHERE slug = p;
    IF v_p IS NULL THEN RAISE NOTICE 'SKIP pojecie [Lewczynski J.]: %', p;
    ELSE INSERT INTO pojecia_artysci (artysta_id, pojecie_id) VALUES (v_a, v_p) ON CONFLICT DO NOTHING; n_ok := n_ok + 1; END IF;
  END LOOP;
  RAISE NOTICE 'OK Lewczynski Jerzy — % pojec', n_ok;
END $$;

-- ---- 9. Paruzel Andrzej  (rdzen_kolekcji, wysoki) ----
DO $$
DECLARE v_a uuid; v_i uuid; v_p uuid;
  pojecia_arr text[] := ARRAY['dokument','archiwum','zapis','dzialanie'];
  p text; n_ok int := 0;
BEGIN
  SELECT id INTO v_a FROM artysci WHERE nazwisko_i_imie ILIKE '%Paruzel%Andrzej%' LIMIT 1;
  IF v_a IS NULL THEN RAISE NOTICE 'SKIP artysta: Paruzel Andrzej'; RETURN; END IF;
  SELECT id INTO v_i FROM idee WHERE slug = 'pamiec-archiwum';
  UPDATE artysci SET idea_glowna_id = v_i, status_programowy = 'rdzen_kolekcji', potencjal_viewing_room = 'wysoki' WHERE id = v_a;
  FOREACH p IN ARRAY pojecia_arr LOOP
    SELECT id INTO v_p FROM pojecia WHERE slug = p;
    IF v_p IS NULL THEN RAISE NOTICE 'SKIP pojecie [Paruzel A.]: %', p;
    ELSE INSERT INTO pojecia_artysci (artysta_id, pojecie_id) VALUES (v_a, v_p) ON CONFLICT DO NOTHING; n_ok := n_ok + 1; END IF;
  END LOOP;
  RAISE NOTICE 'OK Paruzel Andrzej — % pojec', n_ok;
END $$;

-- ---- 10. Wisniewski Mieczyslaw  (rdzen_kolekcji, wysoki) ----
DO $$
DECLARE v_a uuid; v_i uuid; v_p uuid;
  pojecia_arr text[] := ARRAY['uklad','rytm','relief','struktura'];
  p text; n_ok int := 0;
BEGIN
  SELECT id INTO v_a FROM artysci WHERE nazwisko_i_imie ILIKE '%Wiśniewski%Mieczysław%' LIMIT 1;
  IF v_a IS NULL THEN RAISE NOTICE 'SKIP artysta: Wisniewski Mieczyslaw'; RETURN; END IF;
  SELECT id INTO v_i FROM idee WHERE slug = 'geometria-struktura';
  UPDATE artysci SET idea_glowna_id = v_i, status_programowy = 'rdzen_kolekcji', potencjal_viewing_room = 'wysoki' WHERE id = v_a;
  FOREACH p IN ARRAY pojecia_arr LOOP
    SELECT id INTO v_p FROM pojecia WHERE slug = p;
    IF v_p IS NULL THEN RAISE NOTICE 'SKIP pojecie [Wisniewski M.]: %', p;
    ELSE INSERT INTO pojecia_artysci (artysta_id, pojecie_id) VALUES (v_a, v_p) ON CONFLICT DO NOTHING; n_ok := n_ok + 1; END IF;
  END LOOP;
  RAISE NOTICE 'OK Wisniewski Mieczyslaw — % pojec', n_ok;
END $$;

-- ---- 11. Berdyszak Jan  (rdzen_kolekcji, bardzo_wysoki) ----
DO $$
DECLARE v_a uuid; v_i uuid; v_p uuid;
  pojecia_arr text[] := ARRAY['obiekt','przestrzen','slad','relacja'];
  p text; n_ok int := 0;
BEGIN
  SELECT id INTO v_a FROM artysci WHERE nazwisko_i_imie ILIKE '%Berdyszak%Jan%' LIMIT 1;
  IF v_a IS NULL THEN RAISE NOTICE 'SKIP artysta: Berdyszak Jan'; RETURN; END IF;
  SELECT id INTO v_i FROM idee WHERE slug = 'swiatlo-przestrzen';
  UPDATE artysci SET idea_glowna_id = v_i, status_programowy = 'rdzen_kolekcji', potencjal_viewing_room = 'bardzo_wysoki' WHERE id = v_a;
  FOREACH p IN ARRAY pojecia_arr LOOP
    SELECT id INTO v_p FROM pojecia WHERE slug = p;
    IF v_p IS NULL THEN RAISE NOTICE 'SKIP pojecie [Berdyszak J.]: %', p;
    ELSE INSERT INTO pojecia_artysci (artysta_id, pojecie_id) VALUES (v_a, v_p) ON CONFLICT DO NOTHING; n_ok := n_ok + 1; END IF;
  END LOOP;
  RAISE NOTICE 'OK Berdyszak Jan — % pojec', n_ok;
END $$;

-- ---- 12. Sobczyk Marek  (rdzen_kolekcji, sredni) ----
DO $$
DECLARE v_a uuid; v_i uuid; v_p uuid;
  pojecia_arr text[] := ARRAY['malarstwo','tekst-w-obrazie','ironia','komunikat'];
  p text; n_ok int := 0;
BEGIN
  SELECT id INTO v_a FROM artysci WHERE nazwisko_i_imie ILIKE '%Sobczyk%Marek%' LIMIT 1;
  IF v_a IS NULL THEN RAISE NOTICE 'SKIP artysta: Sobczyk Marek'; RETURN; END IF;
  SELECT id INTO v_i FROM idee WHERE slug = 'obraz-komunikat';
  UPDATE artysci SET idea_glowna_id = v_i, status_programowy = 'rdzen_kolekcji', potencjal_viewing_room = 'sredni' WHERE id = v_a;
  FOREACH p IN ARRAY pojecia_arr LOOP
    SELECT id INTO v_p FROM pojecia WHERE slug = p;
    IF v_p IS NULL THEN RAISE NOTICE 'SKIP pojecie [Sobczyk M.]: %', p;
    ELSE INSERT INTO pojecia_artysci (artysta_id, pojecie_id) VALUES (v_a, v_p) ON CONFLICT DO NOTHING; n_ok := n_ok + 1; END IF;
  END LOOP;
  RAISE NOTICE 'OK Sobczyk Marek — % pojec', n_ok;
END $$;

-- ---- 13. Grupa Twozywo  (rdzen_kolekcji, wysoki) ----
-- UWAGA: DB ma "Grupa Twozywo", pattern "%Twożywo%"
DO $$
DECLARE v_a uuid; v_i uuid; v_p uuid;
  pojecia_arr text[] := ARRAY['typografia','tekst','komunikat','znak-publiczny'];
  p text; n_ok int := 0;
BEGIN
  SELECT id INTO v_a FROM artysci WHERE nazwisko_i_imie ILIKE '%Twożywo%' LIMIT 1;
  IF v_a IS NULL THEN RAISE NOTICE 'SKIP artysta: Twozywo'; RETURN; END IF;
  SELECT id INTO v_i FROM idee WHERE slug = 'slowo-znak';
  UPDATE artysci SET idea_glowna_id = v_i, status_programowy = 'rdzen_kolekcji', potencjal_viewing_room = 'wysoki' WHERE id = v_a;
  FOREACH p IN ARRAY pojecia_arr LOOP
    SELECT id INTO v_p FROM pojecia WHERE slug = p;
    IF v_p IS NULL THEN RAISE NOTICE 'SKIP pojecie [Twozywo]: %', p;
    ELSE INSERT INTO pojecia_artysci (artysta_id, pojecie_id) VALUES (v_a, v_p) ON CONFLICT DO NOTHING; n_ok := n_ok + 1; END IF;
  END LOOP;
  RAISE NOTICE 'OK Twozywo — % pojec', n_ok;
END $$;

-- ---- 14. Bauer Josef  (zasoby, bardzo_wysoki) ----
DO $$
DECLARE v_a uuid; v_i uuid; v_p uuid;
  pojecia_arr text[] := ARRAY['obiekt','uklad','struktura','relief'];
  p text; n_ok int := 0;
BEGIN
  SELECT id INTO v_a FROM artysci WHERE nazwisko_i_imie ILIKE '%Bauer%Josef%' LIMIT 1;
  IF v_a IS NULL THEN RAISE NOTICE 'SKIP artysta: Bauer Josef'; RETURN; END IF;
  SELECT id INTO v_i FROM idee WHERE slug = 'geometria-struktura';
  UPDATE artysci SET idea_glowna_id = v_i, status_programowy = 'zasoby', potencjal_viewing_room = 'bardzo_wysoki' WHERE id = v_a;
  FOREACH p IN ARRAY pojecia_arr LOOP
    SELECT id INTO v_p FROM pojecia WHERE slug = p;
    IF v_p IS NULL THEN RAISE NOTICE 'SKIP pojecie [Bauer J.]: %', p;
    ELSE INSERT INTO pojecia_artysci (artysta_id, pojecie_id) VALUES (v_a, v_p) ON CONFLICT DO NOTHING; n_ok := n_ok + 1; END IF;
  END LOOP;
  RAISE NOTICE 'OK Bauer Josef — % pojec', n_ok;
END $$;

-- ---- 15. Roy Reinhard  (zasoby, wysoki) ----
DO $$
DECLARE v_a uuid; v_i uuid; v_p uuid;
  pojecia_arr text[] := ARRAY['geometria','rytm','znak','system'];
  p text; n_ok int := 0;
BEGIN
  SELECT id INTO v_a FROM artysci WHERE nazwisko_i_imie ILIKE '%Roy%Reinhard%' LIMIT 1;
  IF v_a IS NULL THEN RAISE NOTICE 'SKIP artysta: Roy Reinhard'; RETURN; END IF;
  SELECT id INTO v_i FROM idee WHERE slug = 'geometria-struktura';
  UPDATE artysci SET idea_glowna_id = v_i, status_programowy = 'zasoby', potencjal_viewing_room = 'wysoki' WHERE id = v_a;
  FOREACH p IN ARRAY pojecia_arr LOOP
    SELECT id INTO v_p FROM pojecia WHERE slug = p;
    IF v_p IS NULL THEN RAISE NOTICE 'SKIP pojecie [Roy R.]: %', p;
    ELSE INSERT INTO pojecia_artysci (artysta_id, pojecie_id) VALUES (v_a, v_p) ON CONFLICT DO NOTHING; n_ok := n_ok + 1; END IF;
  END LOOP;
  RAISE NOTICE 'OK Roy Reinhard — % pojec', n_ok;
END $$;

-- ---- 16. Brandt Natalia  (wspolczesne_kontynuacje, bardzo_wysoki) ----
DO $$
DECLARE v_a uuid; v_i uuid; v_p uuid;
  pojecia_arr text[] := ARRAY['uklad','rytm','system','powtorzenie'];
  p text; n_ok int := 0;
BEGIN
  SELECT id INTO v_a FROM artysci WHERE nazwisko_i_imie ILIKE '%Brandt%Natalia%' LIMIT 1;
  IF v_a IS NULL THEN RAISE NOTICE 'SKIP artysta: Brandt Natalia'; RETURN; END IF;
  SELECT id INTO v_i FROM idee WHERE slug = 'geometria-struktura';
  UPDATE artysci SET idea_glowna_id = v_i, status_programowy = 'wspolczesne_kontynuacje', potencjal_viewing_room = 'bardzo_wysoki' WHERE id = v_a;
  FOREACH p IN ARRAY pojecia_arr LOOP
    SELECT id INTO v_p FROM pojecia WHERE slug = p;
    IF v_p IS NULL THEN RAISE NOTICE 'SKIP pojecie [Brandt N.]: %', p;
    ELSE INSERT INTO pojecia_artysci (artysta_id, pojecie_id) VALUES (v_a, v_p) ON CONFLICT DO NOTHING; n_ok := n_ok + 1; END IF;
  END LOOP;
  RAISE NOTICE 'OK Brandt Natalia — % pojec', n_ok;
END $$;

-- ---- 17. Zychlinska Agata  (wspolczesne_kontynuacje, wysoki) ----
DO $$
DECLARE v_a uuid; v_i uuid; v_p uuid;
  pojecia_arr text[] := ARRAY['cialo','symbol','natura','emocja'];
  p text; n_ok int := 0;
BEGIN
  SELECT id INTO v_a FROM artysci WHERE nazwisko_i_imie ILIKE '%Żychlińska%Agata%' LIMIT 1;
  IF v_a IS NULL THEN RAISE NOTICE 'SKIP artysta: Zychlinska Agata'; RETURN; END IF;
  SELECT id INTO v_i FROM idee WHERE slug = 'wspolczesne-kontynuacje';
  UPDATE artysci SET idea_glowna_id = v_i, status_programowy = 'wspolczesne_kontynuacje', potencjal_viewing_room = 'wysoki' WHERE id = v_a;
  FOREACH p IN ARRAY pojecia_arr LOOP
    SELECT id INTO v_p FROM pojecia WHERE slug = p;
    IF v_p IS NULL THEN RAISE NOTICE 'SKIP pojecie [Zychlinska A.]: %', p;
    ELSE INSERT INTO pojecia_artysci (artysta_id, pojecie_id) VALUES (v_a, v_p) ON CONFLICT DO NOTHING; n_ok := n_ok + 1; END IF;
  END LOOP;
  RAISE NOTICE 'OK Zychlinska Agata — % pojec', n_ok;
END $$;

-- ---- 18. Dziedzic Lukasz  (wspolczesne_kontynuacje, wysoki) ----
DO $$
DECLARE v_a uuid; v_i uuid; v_p uuid;
  pojecia_arr text[] := ARRAY['cialo','emocja','granica','terytorium'];
  p text; n_ok int := 0;
BEGIN
  SELECT id INTO v_a FROM artysci WHERE nazwisko_i_imie ILIKE '%Dziedzic%Łukasz%' LIMIT 1;
  IF v_a IS NULL THEN RAISE NOTICE 'SKIP artysta: Dziedzic Lukasz'; RETURN; END IF;
  SELECT id INTO v_i FROM idee WHERE slug = 'wspolczesne-kontynuacje';
  UPDATE artysci SET idea_glowna_id = v_i, status_programowy = 'wspolczesne_kontynuacje', potencjal_viewing_room = 'wysoki' WHERE id = v_a;
  FOREACH p IN ARRAY pojecia_arr LOOP
    SELECT id INTO v_p FROM pojecia WHERE slug = p;
    IF v_p IS NULL THEN RAISE NOTICE 'SKIP pojecie [Dziedzic L.]: %', p;
    ELSE INSERT INTO pojecia_artysci (artysta_id, pojecie_id) VALUES (v_a, v_p) ON CONFLICT DO NOTHING; n_ok := n_ok + 1; END IF;
  END LOOP;
  RAISE NOTICE 'OK Dziedzic Lukasz — % pojec', n_ok;
END $$;

-- ---- 19. Swoboda Tom  (wspolczesne_kontynuacje, bardzo_wysoki) ----
DO $$
DECLARE v_a uuid; v_i uuid; v_p uuid;
  pojecia_arr text[] := ARRAY['cialo','terytorium','duchowosc','slad'];
  p text; n_ok int := 0;
BEGIN
  SELECT id INTO v_a FROM artysci WHERE nazwisko_i_imie ILIKE '%Swoboda%Tom%' LIMIT 1;
  IF v_a IS NULL THEN RAISE NOTICE 'SKIP artysta: Swoboda Tom'; RETURN; END IF;
  SELECT id INTO v_i FROM idee WHERE slug = 'wspolczesne-kontynuacje';
  UPDATE artysci SET idea_glowna_id = v_i, status_programowy = 'wspolczesne_kontynuacje', potencjal_viewing_room = 'bardzo_wysoki' WHERE id = v_a;
  FOREACH p IN ARRAY pojecia_arr LOOP
    SELECT id INTO v_p FROM pojecia WHERE slug = p;
    IF v_p IS NULL THEN RAISE NOTICE 'SKIP pojecie [Swoboda T.]: %', p;
    ELSE INSERT INTO pojecia_artysci (artysta_id, pojecie_id) VALUES (v_a, v_p) ON CONFLICT DO NOTHING; n_ok := n_ok + 1; END IF;
  END LOOP;
  RAISE NOTICE 'OK Swoboda Tom — % pojec', n_ok;
END $$;

-- =============================================================================
-- 3. WERYFIKACJA — liczniki PASS/FAIL
-- =============================================================================
DO $$
DECLARE
  v_idea int;
  v_status int;
  v_potencjal int;
  v_pojecia_art int;
  v_nowych_pojec int;
  v_pass bool := true;
BEGIN
  SELECT COUNT(*) INTO v_idea FROM artysci WHERE idea_glowna_id IS NOT NULL;
  SELECT COUNT(*) INTO v_status FROM artysci WHERE status_programowy IS NOT NULL;
  SELECT COUNT(*) INTO v_potencjal FROM artysci WHERE potencjal_viewing_room IS NOT NULL;
  SELECT COUNT(*) INTO v_pojecia_art FROM pojecia_artysci;
  SELECT COUNT(*) INTO v_nowych_pojec FROM pojecia WHERE slug IN ('przestrzen','struktura','zapis','geometria','znak','symbol');

  RAISE NOTICE '=============================================================================';
  RAISE NOTICE 'WERYFIKACJA seeda Etap 2 Obszaru 3:';
  RAISE NOTICE '  Artystow z idea_glowna_id:        % (oczekiwane >= 16)', v_idea;
  RAISE NOTICE '  Artystow ze status_programowy:    % (oczekiwane >= 16)', v_status;
  RAISE NOTICE '  Artystow z potencjal_viewing_room: % (oczekiwane >= 16)', v_potencjal;
  RAISE NOTICE '  Rekordow pojecia_artysci:          % (oczekiwane >= 53)', v_pojecia_art;
  RAISE NOTICE '  Nowych pojec (z 6 brakujacych):    % / 6', v_nowych_pojec;
  RAISE NOTICE '=============================================================================';

  IF v_idea < 16 THEN v_pass := false; RAISE WARNING 'FAIL: za malo artystow z idea_glowna'; END IF;
  IF v_pojecia_art < 53 THEN v_pass := false; RAISE WARNING 'FAIL: za malo pojec_artysci'; END IF;
  IF v_nowych_pojec < 6 THEN v_pass := false; RAISE WARNING 'FAIL: brakuje nowych pojec'; END IF;

  IF v_pass THEN
    RAISE NOTICE 'PASS — seed zakonczony pomyslnie';
  ELSE
    RAISE EXCEPTION 'FAIL — patrz WARNINGI powyzej';
  END IF;
END $$;

COMMIT;
