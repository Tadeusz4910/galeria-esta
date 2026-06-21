-- =============================================================================
-- migrations/seed_zentrum_paul_klee_v2.sql
-- Wyrównanie struktury JSONB `artykuly_sekcje.dane` do rzeczywistych typów
-- TypeScript (lib/types-artykul.ts) dla notatki "Konstrukcja i rytm".
--
-- Powód: seed v1 użył innych nazw pól obrazów niż komponenty Sekcja* (np. T06
-- oczekuje tablicy `zdjecia`, a nie `zdjecie_1/2/3`). Ten skrypt nadpisuje pole
-- `dane` każdej z 10 sekcji pełną, poprawną strukturą.
--
-- KONTRAKT obrazu = ZdjecieRef (obiekt):
--   { "zdjecie_id": null, "zdjecie_url_fallback": null, "zdjecie_alt_override": "<opis>" }
--   Na tym etapie zdjęć nie ma → id i url_fallback = null (komponent Obraz pokaże
--   placeholder), alt_override wypełniony opisowo (gotowy alt, gdy wejdą zdjęcia).
--
-- Match sekcji: artykul_id + kolejnosc + typ_sekcji (każdy typ występuje raz).
-- IDEMPOTENCJA: czyste UPDATE — wielokrotne uruchomienie daje ten sam wynik.
-- Teksty PL: 1:1 z docs/bern-mockup.html.
-- =============================================================================

BEGIN;

-- =============================================================================
-- 0. PRE-FLIGHT
-- =============================================================================
DO $$
DECLARE
  v_id uuid;
  v_count int;
BEGIN
  SELECT id INTO v_id FROM artykuly
  WHERE slug = 'zentrum-paul-klee-konstrukcja-i-rytm';

  IF v_id IS NULL THEN
    RAISE EXCEPTION 'PRE-FLIGHT FAIL: brak artykulu o slug=zentrum-paul-klee-konstrukcja-i-rytm';
  END IF;

  SELECT COUNT(*) INTO v_count FROM artykuly_sekcje WHERE artykul_id = v_id;

  RAISE NOTICE '====================================================================';
  RAISE NOTICE 'PRE-FLIGHT seed v2:';
  RAISE NOTICE '  artykul_id: %', v_id;
  RAISE NOTICE '  sekcji (oczekiwane 10): %', v_count;
  RAISE NOTICE '====================================================================';

  IF v_count <> 10 THEN
    RAISE WARNING 'Liczba sekcji = % (oczekiwano 10). UPDATE-y trafia tylko w istniejace pary kolejnosc+typ_sekcji.', v_count;
  END IF;
END $$;

-- =============================================================================
-- 1. UPDATE sekcji (10×) — pelne nadpisanie pola `dane`
-- =============================================================================

-- ── kolejnosc 1 · T01 HERO ───────────────────────────────────────────────
UPDATE artykuly_sekcje s
SET dane = $j${
  "nadtytul": "Notatki ESTA · czerwiec 2026",
  "tytul": "Konstrukcja i rytm",
  "podtytul": "Notatki z Zentrum Paul Klee w Bernie",
  "zdjecie": {
    "zdjecie_id": null,
    "zdjecie_url_fallback": null,
    "zdjecie_alt_override": "Panoramiczne, falujące dachy Zentrum Paul Klee w Bernie, proj. Renzo Piano"
  },
  "autor_zdjecia": "Fot. Tadeusz Stapowicz",
  "wysokosc_vh": 88
}$j$::jsonb
FROM artykuly a
WHERE s.artykul_id = a.id
  AND a.slug = 'zentrum-paul-klee-konstrukcja-i-rytm'
  AND s.kolejnosc = 1
  AND s.typ_sekcji = 't01_hero';

-- ── kolejnosc 2 · T02 INTRO ──────────────────────────────────────────────
UPDATE artykuly_sekcje s
SET dane = $j${
  "akapity": [
    "Kiedy planowałem wizytę w Centrum Paula Klee w Bernie, głównym powodem była wystawa Kurta Schwittersa. Nie była to przypadkowa decyzja.",
    "Kilka lat wcześniej w Galerii ESTA pokazaliśmy wystawę Natalii Brandt „Spóźnione rozmowy z Kurtem Schwittersem”. Była to jedna z tych wystaw, które zostają w pamięci na długo i które nie kończą się wraz z demontażem prac.",
    "Dopiero później okazało się, że równie silnym doświadczeniem będzie dla mnie sam budynek zaprojektowany przez Renzo Piano. Są miejsca, które ogląda się jak budynki. Są też takie, które odbiera się jak krajobraz."
  ],
  "pojecia": "rytm · powtórzenie · układ · relacja"
}$j$::jsonb
FROM artykuly a
WHERE s.artykul_id = a.id
  AND a.slug = 'zentrum-paul-klee-konstrukcja-i-rytm'
  AND s.kolejnosc = 2
  AND s.typ_sekcji = 't02_intro';

-- ── kolejnosc 3 · T04 TEKST_MIĘDZY (Krajobraz) ───────────────────────────
UPDATE artykuly_sekcje s
SET dane = $j${
  "tytul_sekcji": "Krajobraz",
  "zdjecie_duze": {
    "zdjecie_id": null,
    "zdjecie_url_fallback": null,
    "zdjecie_alt_override": "Duże zdjęcie krajobrazowe — Zentrum Paul Klee wpisane we wzgórza nad Bernem"
  },
  "podpis_duzy": "Architektura nie jako dominanta, lecz jako część krajobrazu.",
  "akapity": [
    "Najbardziej zaskoczyło mnie to, że budynek praktycznie nie kończy się w żadnym konkretnym miejscu. Patrząc z różnych stron trudno powiedzieć, gdzie kończy się wzgórze, a zaczyna architektura.",
    "Przy dobrej pogodzie pewnie wygląda to inaczej. Trafiłem na dzień z niskimi chmurami i lekkim deszczem. Paradoksalnie chyba właśnie dzięki temu budynek pokazał swój charakter. Nie wyglądał jak ikona architektury. Wyglądał jak część krajobrazu."
  ],
  "zdjecie_lewe": {
    "zdjecie_id": null,
    "zdjecie_url_fallback": null,
    "zdjecie_alt_override": "Detal ukształtowania terenu wokół Zentrum Paul Klee"
  },
  "zdjecie_prawe": {
    "zdjecie_id": null,
    "zdjecie_url_fallback": null,
    "zdjecie_alt_override": "Inny widok budynku wtopionego w krajobraz"
  },
  "podpis_para": null,
  "pojecia": "krajobraz · linia · rytm · układ"
}$j$::jsonb
FROM artykuly a
WHERE s.artykul_id = a.id
  AND a.slug = 'zentrum-paul-klee-konstrukcja-i-rytm'
  AND s.kolejnosc = 3
  AND s.typ_sekcji = 't04_tekst_miedzy';

-- ── kolejnosc 4 · T05 PIONOWE_OBOK (Rytm) ────────────────────────────────
UPDATE artykuly_sekcje s
SET dane = $j${
  "tytul_sekcji": "Rytm",
  "zdjecie": {
    "zdjecie_id": null,
    "zdjecie_url_fallback": null,
    "zdjecie_alt_override": "Pionowe ujęcie powtarzającej się konstrukcji budynku"
  },
  "strona": "left",
  "akapity": [
    "Spacerując wokół budynku co chwilę łapałem się na tym samym. Patrzyłem nie na całość, ale na powtarzające się elementy. Linie. Podziały. Łuki. Kolejne fragmenty konstrukcji.",
    "Ten rytm pojawia się wszędzie. Nie jest nachalny. Nie dominuje. Ale cały czas porządkuje sposób patrzenia.",
    "Pomyślałem wtedy, że dokładnie z tym samym spotykam się od lat w pracach Wandy Gołkowskiej czy Zbigniewa Gostomskiego."
  ],
  "podpis": "Powtórzenie nie jest tu ornamentem. Jest zasadą porządkującą przestrzeń.",
  "pojecia": "rytm · powtórzenie · system · relacja"
}$j$::jsonb
FROM artykuly a
WHERE s.artykul_id = a.id
  AND a.slug = 'zentrum-paul-klee-konstrukcja-i-rytm'
  AND s.kolejnosc = 4
  AND s.typ_sekcji = 't05_pionowe_obok';

-- ── kolejnosc 5 · T06 TRIPTYCH (Konstrukcja) ─────────────────────────────
UPDATE artykuly_sekcje s
SET dane = $j${
  "tytul_sekcji": "Konstrukcja",
  "zdjecia": [
    {
      "zdjecie_id": null,
      "zdjecie_url_fallback": null,
      "zdjecie_alt_override": "Cięgna konstrukcyjne budynku"
    },
    {
      "zdjecie_id": null,
      "zdjecie_url_fallback": null,
      "zdjecie_alt_override": "Słup stalowy i przeszklenie"
    },
    {
      "zdjecie_id": null,
      "zdjecie_url_fallback": null,
      "zdjecie_alt_override": "Detal połączenia konstrukcyjnego"
    }
  ],
  "podpis": "Konstrukcja staje się językiem budynku.",
  "akapity": [
    "Najwięcej zdjęć zrobiłem chyba nie samemu budynkowi, ale jego detalom. Linkom. Połączeniom. Przeszkleniom. Elementom, których większość odwiedzających pewnie nawet nie zauważa.",
    "Zawsze interesowało mnie to, jak rzeczy są zrobione. W sztuce jest podobnie. Często bardziej interesuje mnie logika pracy niż sam efekt końcowy.",
    "Konstrukcja nie została ukryta. Stała się częścią opowieści o budynku. Każdy element wydaje się konieczny. Nic nie sprawia wrażenia dekoracji dodanej po fakcie."
  ],
  "pojecia": "konstrukcja · detal · system · układ"
}$j$::jsonb
FROM artykuly a
WHERE s.artykul_id = a.id
  AND a.slug = 'zentrum-paul-klee-konstrukcja-i-rytm'
  AND s.kolejnosc = 5
  AND s.typ_sekcji = 't06_triptych';

-- ── kolejnosc 6 · T07 MOMENT (Przestrzeń + cytat) ────────────────────────
UPDATE artykuly_sekcje s
SET dane = $j${
  "zdjecie": {
    "zdjecie_id": null,
    "zdjecie_url_fallback": null,
    "zdjecie_alt_override": "Schody w Zentrum Paul Klee z sylwetką człowieka — moment zatrzymania"
  },
  "podpis": "Przestrzeń jako prowadzenie widza.",
  "cytat": "Dobra przestrzeń nie prowadzi wzroku. Prowadzi człowieka.",
  "autor_cytatu": null
}$j$::jsonb
FROM artykuly a
WHERE s.artykul_id = a.id
  AND a.slug = 'zentrum-paul-klee-konstrukcja-i-rytm'
  AND s.kolejnosc = 6
  AND s.typ_sekcji = 't07_moment';

-- ── kolejnosc 7 · T08 ROZKŁADÓWKA (Wnętrze) ──────────────────────────────
UPDATE artykuly_sekcje s
SET dane = $j${
  "tytul_sekcji": "Wnętrze",
  "bloki": [
    {
      "zdjecie": {
        "zdjecie_id": null,
        "zdjecie_url_fallback": null,
        "zdjecie_alt_override": "Wnętrze — drewno i naturalne światło"
      },
      "akapity": [
        "O jakości tego miejsca decyduje nie tylko ogólna forma budynku. Równie ważne są szczegóły: oznaczenia, przejścia, światło, materiały, sposób prowadzenia informacji, obecność książek i wydawnictw."
      ]
    },
    {
      "zdjecie": {
        "zdjecie_id": null,
        "zdjecie_url_fallback": null,
        "zdjecie_alt_override": "Przeszklenia i perspektywa wnętrza"
      },
      "akapity": [
        "Profesjonalizm instytucji kultury nie polega wyłącznie na sile programu. Widać go także w tym, jak zaprojektowane są progi, szyby, kierunki ruchu, miejsca odpoczynku i punkty informacji.",
        "Detal buduje zaufanie. Jest częścią języka miejsca."
      ]
    }
  ],
  "pojecia": "detal · informacja · światło · porządek"
}$j$::jsonb
FROM artykuly a
WHERE s.artykul_id = a.id
  AND a.slug = 'zentrum-paul-klee-konstrukcja-i-rytm'
  AND s.kolejnosc = 7
  AND s.typ_sekcji = 't08_rozkladowka';

-- ── kolejnosc 8 · T04 TEKST_MIĘDZY (Schwitters jako kontekst) ─────────────
-- ZMIANA TYPU: t03_solo → t04_tekst_miedzy. Sekcja kontekstowa z 2 zdjęciami
-- (plakat + katalog) i tekstem rozwijającym. BEZ zdjecie_duze/podpis_duzy
-- (mniejsza sekcja — komponent pomija duże zdjęcie warunkowo).
-- WHERE bez typ_sekcji, bo właśnie typ zmieniamy.
UPDATE artykuly_sekcje s
SET typ_sekcji = 't04_tekst_miedzy',
    dane = $j${
  "tytul_sekcji": "Schwitters jako kontekst",
  "akapity": [
    "W czasie wizyty w Zentrum Paul Klee prezentowana była wystawa poświęcona jednej z najważniejszych postaci europejskiej awangardy XX wieku.",
    "Nie rozwijam tutaj jeszcze osobnej refleksji o Schwittersie. Ten temat wymaga oddzielnej notatki. Warto jednak odnotować, że sama obecność tej wystawy w przestrzeni zaprojektowanej przez Renzo Piano stworzyła dodatkową relację: między awangardowym myśleniem o fragmencie, konstrukcji i znaku a architekturą, która również opiera się na rytmie, podziale i relacji elementów."
  ],
  "zdjecie_lewe": {
    "zdjecie_id": null,
    "zdjecie_url_fallback": null,
    "zdjecie_alt_override": "Plakat wystawy Schwittersa „Grenzgänger der Avantgarde”"
  },
  "zdjecie_prawe": {
    "zdjecie_id": null,
    "zdjecie_url_fallback": null,
    "zdjecie_alt_override": "Katalog wystawy Schwittersa w Zentrum Paul Klee"
  },
  "pojecia": "fragment · awangarda · znak · konstrukcja"
}$j$::jsonb,
    zmodyfikowane = now()
FROM artykuly a
WHERE s.artykul_id = a.id
  AND a.slug = 'zentrum-paul-klee-konstrukcja-i-rytm'
  AND s.kolejnosc = 8;

-- ── kolejnosc 9 · T09 OUTRO (zakończenie) ────────────────────────────────
UPDATE artykuly_sekcje s
SET dane = $j${
  "akapity": [
    "Lubię takie miejsca. Nie dlatego, że próbują imponować. Raczej dlatego, że pozwalają spokojnie patrzeć.",
    "Po kilku godzinach spędzonych w Zentrum Paul Klee miałem poczucie, że nie oglądałem tylko muzeum. Była to również lekcja o relacji pomiędzy formą, przestrzenią i krajobrazem.",
    "A może właśnie dlatego podczas spaceru wokół budynku co jakiś czas wracały do mnie skojarzenia z artystami, którzy od lat pojawiają się w programie Galerii ESTA — o układach otwartych Wandy Gołkowskiej, systemach Zbigniewa Gostomskiego, świetle i przestrzeni Jana Chwałczyka czy współczesnych realizacjach Natalii Brandt.",
    "Bo niezależnie od tego, czy mówimy o architekturze czy sztuce, pewne pojęcia wracają nieustannie. Nie są to bezpośrednie analogie. Raczej podobny sposób myślenia o relacjach pomiędzy formą, przestrzenią i porządkiem."
  ]
}$j$::jsonb
FROM artykuly a
WHERE s.artykul_id = a.id
  AND a.slug = 'zentrum-paul-klee-konstrukcja-i-rytm'
  AND s.kolejnosc = 9
  AND s.typ_sekcji = 't09_outro';

-- ── kolejnosc 10 · T10 POWIĄZANIA (Odkrywaj dalej) ───────────────────────
-- URL-e wg konwencji strony: pojęcia → /blog?tag=<slug>, artyści → /artysta/<slug>.
-- Do weryfikacji ze stanem bazy (pojecia.slug / artysci.url_artysty) — jeśli
-- slug inny, link da 404 (strona NIE crashuje dzięki hardeningowi).
UPDATE artykuly_sekcje s
SET dane = $j${
  "tytul": "Odkrywaj dalej",
  "pojecia": [
    { "etykieta": "rytm",        "url": "/blog?tag=rytm" },
    { "etykieta": "powtórzenie", "url": "/blog?tag=powtorzenie" },
    { "etykieta": "układ",       "url": "/blog?tag=uklad" },
    { "etykieta": "konstrukcja", "url": "/blog?tag=konstrukcja" },
    { "etykieta": "przestrzeń",  "url": "/blog?tag=przestrzen" },
    { "etykieta": "krajobraz",   "url": "/blog?tag=krajobraz" },
    { "etykieta": "detal",       "url": "/blog?tag=detal" },
    { "etykieta": "relacja",     "url": "/blog?tag=relacja" }
  ],
  "artysci": [
    { "imie_nazwisko": "Wanda Gołkowska",     "url": "/artysta/wanda-golkowska",     "opis": "układ otwarty · system · relacja" },
    { "imie_nazwisko": "Zbigniew Gostomski",  "url": "/artysta/zbigniew-gostomski",  "opis": "geometria · struktura · przestrzeń" },
    { "imie_nazwisko": "Jan Chwałczyk",       "url": "/artysta/jan-chwalczyk",       "opis": "światło · cień · projekcja" },
    { "imie_nazwisko": "Natalia Brandt",      "url": "/artysta/natalia-brandt",      "opis": "współczesna geometria · rytm · relacja" }
  ]
}$j$::jsonb
FROM artykuly a
WHERE s.artykul_id = a.id
  AND a.slug = 'zentrum-paul-klee-konstrukcja-i-rytm'
  AND s.kolejnosc = 10
  AND s.typ_sekcji = 't10_powiazania';

-- =============================================================================
-- 2. WERYFIKACJA KOŃCOWA — 10 sekcji + sygnaturowe klucze nowej struktury
-- =============================================================================
DO $$
DECLARE
  v_id uuid;
  v_total int;
  v_t06 int; v_t08 int; v_t10 int; v_t02 int; v_s8 int;
BEGIN
  SELECT id INTO v_id FROM artykuly
  WHERE slug = 'zentrum-paul-klee-konstrukcja-i-rytm';

  SELECT COUNT(*) INTO v_total FROM artykuly_sekcje
  WHERE artykul_id = v_id AND dane IS NOT NULL AND dane <> '{}'::jsonb;

  -- sygnatury nowej struktury (potwierdzaja, ze UPDATE-y trafily)
  SELECT COUNT(*) INTO v_t06 FROM artykuly_sekcje
  WHERE artykul_id = v_id AND typ_sekcji = 't06_triptych'     AND dane ? 'zdjecia';
  SELECT COUNT(*) INTO v_t08 FROM artykuly_sekcje
  WHERE artykul_id = v_id AND typ_sekcji = 't08_rozkladowka'  AND dane ? 'bloki';
  SELECT COUNT(*) INTO v_t10 FROM artykuly_sekcje
  WHERE artykul_id = v_id AND typ_sekcji = 't10_powiazania'   AND dane ? 'artysci';
  SELECT COUNT(*) INTO v_t02 FROM artykuly_sekcje
  WHERE artykul_id = v_id AND typ_sekcji = 't02_intro'        AND dane ? 'akapity';

  -- sekcja 8: zmieniony typ t03_solo → t04_tekst_miedzy z para zdjec
  SELECT COUNT(*) INTO v_s8 FROM artykuly_sekcje
  WHERE artykul_id = v_id AND kolejnosc = 8
    AND typ_sekcji = 't04_tekst_miedzy' AND dane ? 'zdjecie_lewe';

  RAISE NOTICE '====================================================================';
  RAISE NOTICE 'WERYFIKACJA seed v2:';
  RAISE NOTICE '  sekcji z dane:                    % / 10', v_total;
  RAISE NOTICE '  t06_triptych ma "zdjecia":        % / 1', v_t06;
  RAISE NOTICE '  t08_rozkladowka ma "bloki":       % / 1', v_t08;
  RAISE NOTICE '  t10_powiazania ma "artysci":      % / 1', v_t10;
  RAISE NOTICE '  t02_intro ma "akapity":           % / 1', v_t02;
  RAISE NOTICE '  sekcja 8 = t04_tekst_miedzy:      % / 1', v_s8;
  RAISE NOTICE '====================================================================';

  IF v_total <> 10 THEN
    RAISE EXCEPTION 'FAIL: sekcji z dane = % (oczekiwano 10)', v_total;
  END IF;
  IF v_t06 <> 1 OR v_t08 <> 1 OR v_t10 <> 1 OR v_t02 <> 1 OR v_s8 <> 1 THEN
    RAISE EXCEPTION 'FAIL: sygnatury nie zgadzaja sie (t06=%, t08=%, t10=%, t02=%, s8=%) — sprawdz kolejnosc/typ_sekcji w bazie',
      v_t06, v_t08, v_t10, v_t02, v_s8;
  END IF;

  RAISE NOTICE 'PASS — seed v2 OK: 10 sekcji notatki Zentrum Paul Klee wyrownanych do typow TypeScript';
END $$;

COMMIT;
