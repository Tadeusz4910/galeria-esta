# ESTA-MEDIA — Architektura mediów Galerii ESTA

**Wersja:** 1.0  
**Data:** 9 czerwca 2026  
**Status:** Dokument decyzyjny — finalna specyfikacja  
**Autorzy:** Tadeusz Stapowicz + Claude

---

## SPIS TREŚCI

1. Filozofia
2. Architektura storage
3. Schemat tabeli `media`
4. Tabele M:N (relacje wielokrotne)
5. Typy główne i szczegółowe (enum)
6. Hierarchia zdjęć — `glowne` + `kolejnosc`
7. Auto-generator alt / podpisów / tytułów
8. Workflow uploadu (5 scenariuszy z modali)
9. Picker zdjęć w modalach
10. Widok Media Library (wyszukiwarka)
11. Render publiczny — strona galerii
12. Helper `<WorkImage>` i `<MediaImage>`
13. Warianty rozmiarów (Etap 2)
14. Migracja istniejących URL → tabela media
15. Plan implementacji (etapy)
16. Co NIE robi system (świadome wyłączenia)

---

## 1. FILOZOFIA

Trzy zasady fundamentalne, z których wynika cała architektura:

**Zasada 1 — Zdjęcie to neutralny zasób.**  
Sam plik nie wie czy jest publiczny, ani co przedstawia. Wie tylko *gdzie należy* (do jakiej encji). Publikacja idzie z encji (pracy, artysty, wystawy, artykułu) — nigdy z atrybutu zdjęcia.

**Zasada 2 — Jeden plik, wiele zastosowań.**  
Zdjęcie wernisażu może być jednocześnie: zdjęciem wystawy, ilustracją w artykule blogowym, materiałem do Viewing Roomu. Plik istnieje raz. Relacje wskazują gdzie i jak go używamy.

**Zasada 3 — Automatyka pisze, człowiek koryguje.**  
Alt/podpisy/SEO generują się automatycznie z powiązanej encji (artysta + praca + rok + technika = `"Jarosław Kozłowski, Pojęcie, 1972..."`). Tadeusz akceptuje lub edytuje ręcznie tylko wtedy gdy auto-generator nie ma wszystkich danych (zwłaszcza wernisaże z wieloma artystami).

---

## 2. ARCHITEKTURA STORAGE

### Supabase Storage

**Jeden bucket:** `media` (publiczny, RLS=true z policies dla anon)

**Struktura wewnętrzna:** PŁASKA — bez folderów semantycznych. Nazwa pliku = UUID + rozszerzenie.

```
media/
  a3f1b2c4-d5e6-7890-abcd-ef1234567890.jpg
  b4e2c3d5-e6f7-8901-bcde-f23456789012.pdf
  c5f3d4e6-f7g8-9012-cdef-345678901234.png
  ...
```

**Dlaczego płaski:**
- Zdjęcie wernisażu z 3 artystami nie ma "swojego" folderu (do którego folderu należy?)
- Nazwa pliku może się zmienić bez zmiany UUID
- Łatwe sprzątanie sierot (porównanie storage vs tabela media)
- Jeśli kiedyś zmienimy dostawcę storage (S3, R2), UUID-y zostają

**Foldery które już istnieją w storage** (`artysci/`, `prace/`, `wystawy/`, `test/`) — zachowujemy stare URL-e na żywo (działają), ale nowe zdjęcia idą do korzenia płasko. Stopniowa migracja.

### Policies storage (już ustawione w poprzednich sesjach):

```sql
CREATE POLICY "public upload" ON storage.objects
  FOR INSERT TO anon WITH CHECK (bucket_id = 'media');

CREATE POLICY "public read" ON storage.objects
  FOR SELECT TO anon USING (bucket_id = 'media');

CREATE POLICY "public update" ON storage.objects
  FOR UPDATE TO anon USING (bucket_id = 'media');
```

---

## 3. SCHEMAT TABELI `media`

```sql
CREATE TABLE media (
  -- TOŻSAMOŚĆ
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  url text NOT NULL,                 -- pełen URL do storage
  format_pliku text NOT NULL,        -- 'jpg' / 'png' / 'webp' / 'pdf' / 'doc'
  typ_zawartosci text NOT NULL CHECK (typ_zawartosci IN ('obraz', 'dokument', 'wektor', 'inne')),
  
  -- KATEGORYZACJA
  typ_glowny text NOT NULL CHECK (typ_glowny IN (
    'praca', 'artysta', 'wystawa', 'targ', 'blog', 'dokument', 'inne'
  )),
  typ_szczegolowy text,              -- patrz sekcja 5
  
  -- POWIĄZANIA GŁÓWNE (jeden FK per encja — najsilniejsza relacja)
  artysta_id uuid REFERENCES artysci(id) ON DELETE SET NULL,
  praca_id uuid REFERENCES prace(id) ON DELETE SET NULL,
  wystawa_id uuid REFERENCES wystawy(id) ON DELETE SET NULL,
  targ_id uuid REFERENCES targi(id) ON DELETE SET NULL,
  artykul_id uuid REFERENCES artykuly(id) ON DELETE SET NULL,
  viewing_room_id uuid REFERENCES viewing_room(id) ON DELETE SET NULL,
  
  -- HIERARCHIA W OBRĘBIE ENCJI
  glowne boolean DEFAULT FALSE,      -- czy główne zdjęcie tej encji
  kolejnosc integer DEFAULT 0,       -- porządek w galerii encji
  
  -- METADANE OPISOWE (auto-generowane, edytowalne)
  alt_pl text,
  alt_en text,
  alt_de text,
  podpis_pl text,
  podpis_en text,
  podpis_de text,
  
  -- META AUTORSKIE
  autor_zdjecia text,
  prawa_autorskie text DEFAULT '© Galeria ESTA',
  licencja text DEFAULT 'do_uzytku_galerii',
  zrodlo text,                       -- 'wlasne' / 'od_artysty' / 'archiwum' / URL źródła
  
  -- META TECHNICZNE PLIKU
  szerokosc_px integer,
  wysokosc_px integer,
  rozmiar_bajty bigint,
  hash text,                         -- SHA256 do wykrywania duplikatów
  
  -- META AUDIT
  upload_data timestamptz DEFAULT now(),
  upload_kto text,                   -- 'Tadeusz' / 'Jacek'
  zmodyfikowane timestamptz DEFAULT now(),
  
  -- DODATKOWE
  tagi text,                         -- tagi wolne, CSV
  notatka_wewnetrzna text,           -- tylko panel, nie publikowane
  focal_point_x numeric,             -- 0.0-1.0, dla croppingu
  focal_point_y numeric,             -- 0.0-1.0, dla croppingu
  
  -- WARIANTY (Etap 2)
  ma_thumbnail boolean DEFAULT FALSE,
  ma_medium boolean DEFAULT FALSE,
  ma_large boolean DEFAULT FALSE
);

-- INDEKSY KRYTYCZNE
CREATE INDEX idx_media_typ_glowny ON media(typ_glowny);
CREATE INDEX idx_media_typ_szczegolowy ON media(typ_szczegolowy);
CREATE INDEX idx_media_artysta ON media(artysta_id) WHERE artysta_id IS NOT NULL;
CREATE INDEX idx_media_praca ON media(praca_id) WHERE praca_id IS NOT NULL;
CREATE INDEX idx_media_wystawa ON media(wystawa_id) WHERE wystawa_id IS NOT NULL;
CREATE INDEX idx_media_artykul ON media(artykul_id) WHERE artykul_id IS NOT NULL;
CREATE INDEX idx_media_upload_data ON media(upload_data DESC);
CREATE INDEX idx_media_hash ON media(hash) WHERE hash IS NOT NULL;

-- INDEKSY UNIKALNOŚCI 'glowne' (jedno per encja)
CREATE UNIQUE INDEX uq_media_praca_glowne 
  ON media(praca_id) 
  WHERE glowne = TRUE AND praca_id IS NOT NULL;

CREATE UNIQUE INDEX uq_media_artysta_glowne_portret 
  ON media(artysta_id) 
  WHERE glowne = TRUE AND artysta_id IS NOT NULL AND typ_glowny = 'artysta';

CREATE UNIQUE INDEX uq_media_wystawa_glowne_plakat 
  ON media(wystawa_id) 
  WHERE glowne = TRUE AND wystawa_id IS NOT NULL AND typ_szczegolowy = 'plakat';

-- INDEKSY FULL-TEXT (PL)
CREATE INDEX idx_media_alt_pl_fts ON media USING gin(to_tsvector('polish', coalesce(alt_pl, '')));
CREATE INDEX idx_media_podpis_pl_fts ON media USING gin(to_tsvector('polish', coalesce(podpis_pl, '')));
CREATE INDEX idx_media_notatka_fts ON media USING gin(to_tsvector('polish', coalesce(notatka_wewnetrzna, '')));

-- TRIGGER updated
CREATE OR REPLACE FUNCTION media_zmodyfikowane()
RETURNS TRIGGER AS $$
BEGIN
  NEW.zmodyfikowane := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_media_zmodyfikowane
  BEFORE UPDATE ON media
  FOR EACH ROW EXECUTE FUNCTION media_zmodyfikowane();
```

---

## 4. TABELE M:N (RELACJE WIELOKROTNE)

Gdy jedno zdjęcie ma wiele powiązań (np. wernisaż z 3 artystami):

```sql
-- M:N artystów na zdjęciu
CREATE TABLE media_artysci (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  media_id uuid NOT NULL REFERENCES media(id) ON DELETE CASCADE,
  artysta_id uuid NOT NULL REFERENCES artysci(id) ON DELETE CASCADE,
  rola text,                         -- 'widoczny' / 'autor_zdjecia' / 'wspolnie'
  UNIQUE (media_id, artysta_id)
);

-- M:N prac na zdjęciu (np. wernisaż gdzie widać konkretne prace)
CREATE TABLE media_prace (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  media_id uuid NOT NULL REFERENCES media(id) ON DELETE CASCADE,
  praca_id uuid NOT NULL REFERENCES prace(id) ON DELETE CASCADE,
  rola text,                         -- 'glowna' / 'w_tle' / 'fragment'
  UNIQUE (media_id, praca_id)
);

-- M:N wystaw (rzadko - zazwyczaj wystawa_id wystarczy)
CREATE TABLE media_wystawy (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  media_id uuid NOT NULL REFERENCES media(id) ON DELETE CASCADE,
  wystawa_id uuid NOT NULL REFERENCES wystawy(id) ON DELETE CASCADE,
  UNIQUE (media_id, wystawa_id)
);

-- M:N pojęć (tagi konceptualne)
CREATE TABLE media_pojecia (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  media_id uuid NOT NULL REFERENCES media(id) ON DELETE CASCADE,
  pojecie_id uuid NOT NULL REFERENCES pojecia(id) ON DELETE CASCADE,
  UNIQUE (media_id, pojecie_id)
);

-- INDEKSY
CREATE INDEX idx_media_artysci_media ON media_artysci(media_id);
CREATE INDEX idx_media_artysci_artysta ON media_artysci(artysta_id);
CREATE INDEX idx_media_prace_media ON media_prace(media_id);
CREATE INDEX idx_media_prace_praca ON media_prace(praca_id);
CREATE INDEX idx_media_wystawy_media ON media_wystawy(media_id);
CREATE INDEX idx_media_wystawy_wystawa ON media_wystawy(wystawa_id);
CREATE INDEX idx_media_pojecia_media ON media_pojecia(media_id);
CREATE INDEX idx_media_pojecia_pojecie ON media_pojecia(pojecie_id);
```

**Zasada używania:**
- `media.artysta_id` (FK) = **główny** artysta zdjęcia (np. autor pracy, portret artysty)
- `media_artysci` (M:N) = **dodatkowi** artyści na zdjęciu (wernisaż grupowy, artyści w tle)

Analogicznie dla `praca_id` / `media_prace`, `wystawa_id` / `media_wystawy`.

---

## 5. TYPY GŁÓWNE I SZCZEGÓŁOWE (ENUM)

Lista minimum operacyjnego (22 wartości typ_szczegolowy):

### `typ_glowny = 'praca'` (4 typy szczegółowe)
```
'front'       — główne zdjęcie pracy (default glowne=TRUE)
'detal'       — fragment, faktura, zbliżenie
'odwrocie'    — tył pracy
'sygnatura'   — podpis artysty
```

### `typ_glowny = 'artysta'` (2 typy szczegółowe)
```
'portret'     — głowa/popiersie (default glowne=TRUE dla hero artysty)
'w_pracowni'  — artysta w atelier lub na wernisażu
```

### `typ_glowny = 'wystawa'` (3 typy szczegółowe)
```
'plakat'      — afisz wystawy (default glowne=TRUE)
'ekspozycja'  — widok przestrzeni wystawowej
'wernisaz'    — ze spotkania otwarcia
```

### `typ_glowny = 'targ'` (2 typy szczegółowe)
```
'stoisko'     — ogólny widok stoiska (default glowne=TRUE)
'praca'       — konkretna praca na stoisku
```

### `typ_glowny = 'blog'` (2 typy szczegółowe)
```
'okladka'     — hero artykułu (default glowne=TRUE)
'ilustracja'  — w treści artykułu
```

### `typ_glowny = 'dokument'` (6 typów szczegółowych)
```
'certyfikat'    — certyfikat autentyczności
'protokol'      — protokoły zakupu/wydania/zwrotu
'umowa'         — umowy komisowe, depozytowe
'katalog'       — katalog wystawy/targu PDF
'biografia'     — skan biografii/CV artysty
'inne_dokument' — pozostałe
```

### `typ_glowny = 'inne'` (1 typ szczegółowy)
```
'inne'        — sieroty, ad-hoc
```

**Razem: 22 wartości typ_szczegolowy.** Można rozszerzać w przyszłości jeśli pokażą się luki.

---

## 6. HIERARCHIA ZDJĘĆ — `glowne` + `kolejnosc`

### Reguły:

**Reguła 1:** Każda encja (praca/artysta/wystawa/targ) ma **dokładnie jedno** zdjęcie `glowne=TRUE`.  
Wymuszone constraintem unikalności (sekcja 3).

**Reguła 2:** Pierwsze zdjęcie wgrane do encji → `glowne=TRUE` automatycznie.

**Reguła 3:** Ustawienie nowego głównego → odznaczenie poprzedniego (transaction).

**Reguła 4:** `kolejnosc` określa porządek w galerii encji. Standard: zdjęcie główne ma `kolejnosc=0`, kolejne `1, 2, 3...`.

### Akcje w panelu:

- **"Ustaw jako główne"** (kontekstowo na miniaturze) → atomicznie odznacza stare + zaznacza nowe
- **Drag & drop** w gridzie zdjęć → zmiana `kolejnosc`
- **"Usuń"** (kontekstowo) → DELETE rekord media + plik w storage

### Render:

- **Lista prac na stronie:** `media WHERE praca_id = X AND glowne = TRUE` → jedno zdjęcie
- **Galeria w stronie pracy:** `media WHERE praca_id = X ORDER BY glowne DESC, kolejnosc ASC` → wszystkie, główne pierwsze

---

## 7. AUTO-GENERATOR ALT / PODPISÓW / TYTUŁÓW

Funkcja `generateAlt(media_id, language)` generuje opis na podstawie powiązań.

### Algorytm

```
1. Pobierz rekord media + JOIN powiązań (artysta, praca, wystawa, ...)
2. Sprawdź typ_glowny + typ_szczegolowy
3. Wybierz template
4. Wypełnij placeholderami z danych
5. Zwróć string (PL / EN / DE w zależności od parametru)
```

### Templaty per typ

#### `praca` + `front`
```
PL: "{artysta.nazwisko_i_imie}, {praca.tytul}, {praca.rok}, {praca.technika}, {praca.wymiary}. Galeria ESTA."
EN: "{artysta.nazwisko_i_imie}, {praca.tytul_en}, {praca.rok}, {praca.technika_en}, {praca.wymiary}. Galeria ESTA."
DE: "{artysta.nazwisko_i_imie}, {praca.tytul_de}, {praca.rok}, {praca.technika_de}, {praca.wymiary}. Galeria ESTA."
```

#### `praca` + `detal`
```
PL: "{artysta.nazwisko_i_imie}, {praca.tytul}, {praca.rok}, detal. Galeria ESTA."
```

#### `praca` + `odwrocie`
```
PL: "{artysta.nazwisko_i_imie}, {praca.tytul}, {praca.rok}, odwrocie. Galeria ESTA."
```

#### `praca` + `sygnatura`
```
PL: "Sygnatura artysty: {artysta.nazwisko_i_imie}, {praca.tytul}, {praca.rok}. Galeria ESTA."
```

#### `artysta` + `portret`
```
PL: "{artysta.nazwisko_i_imie}, portret. Galeria ESTA."
EN: "{artysta.nazwisko_i_imie}, portrait. Galeria ESTA."
DE: "{artysta.nazwisko_i_imie}, Porträt. Galeria ESTA."
```

#### `artysta` + `w_pracowni`
```
PL: "{artysta.nazwisko_i_imie} w pracowni. Galeria ESTA."
```

#### `wystawa` + `plakat`
```
PL: "Plakat wystawy '{wystawa.tytul}' w Galerii ESTA, {wystawa.rok}."
```

#### `wystawa` + `ekspozycja`
```
PL: "Widok wystawy '{wystawa.tytul}' w Galerii ESTA, {wystawa.rok}."
```

#### `wystawa` + `wernisaz`
```
JEŚLI media_artysci.length > 0:
  PL: "Wernisaż wystawy '{wystawa.tytul}'. {nazwiska_artystow_z_M:N_join_przecinkami}. Galeria ESTA, {wystawa.rok}."
JEŚLI brak M:N:
  PL: "Wernisaż wystawy '{wystawa.tytul}'. Galeria ESTA, {wystawa.rok}."
```

#### `targ` + `stoisko`
```
PL: "Stoisko Galerii ESTA na targach '{targ.tytul}', {targ.rok}."
```

#### `targ` + `praca`
```
PL: "{artysta.nazwisko_i_imie}, {praca.tytul}, na stoisku Galerii ESTA na targach '{targ.tytul}', {targ.rok}."
```

#### `blog` + `okladka`
```
PL: "{artykul.tytul}. Galeria ESTA."
```

#### `blog` + `ilustracja`
```
PL: "Ilustracja do artykułu '{artykul.tytul}'. Galeria ESTA."
```

#### `dokument` + `certyfikat`
```
PL: "Certyfikat autentyczności: {artysta.nazwisko_i_imie}, {praca.tytul}, {praca.rok}."
```

#### `dokument` + `biografia`
```
PL: "Biografia artysty: {artysta.nazwisko_i_imie}. Galeria ESTA."
```

(itd. — pozostałe typy dokumentów analogicznie)

### Edycja przez użytkownika

Po wygenerowaniu auto-alt → pole edytowalne w panelu. Tadeusz może:
- Zaakceptować (default)
- Skorygować ręcznie (np. dla wernisażu dodać konkretne nazwiska)
- Wyczyścić → kliknąć "Wygeneruj ponownie"

Jeśli zmienisz powiązania (np. dodasz artystę do M:N media_artysci) — wygeneruj alt ponownie ręcznie.

### Flaga `alt_recznie_edytowane`

```sql
ALTER TABLE media ADD COLUMN alt_recznie_edytowane boolean DEFAULT FALSE;
```

Gdy Tadeusz ręcznie edytuje alt — ustawiamy flagę. Jeśli encja powiązana się zmieni (np. tytuł pracy się zmieni) — system **NIE nadpisuje** ręcznie edytowanych altów. Pyta Tadeusza: "Tytuł pracy się zmienił, czy zregenerować alt?"

---

## 8. WORKFLOW UPLOADU (5 SCENARIUSZY Z MODALI)

### Scenariusz A — Upload z modalu PRACY

**Kontekst:** Modal m-p Kozłowski "Pojęcie" 1972

**Akcja:** "+ Wgraj zdjęcia" → drag&drop 5 plików

**System wypełnia automatycznie:**
- `typ_glowny = 'praca'`
- `artysta_id = Kozłowski`
- `praca_id = ta-praca`
- `typ_szczegolowy = 'front'` (1. zdjęcie) lub `'detal'` (pozostałe)
- `glowne = TRUE` dla 1. zdjęcia (jeśli to pierwsze zdjęcie pracy), `FALSE` dla pozostałych
- `kolejnosc = 0, 1, 2, 3, 4`
- `alt_pl/en/de` — auto-generator
- `podpis_pl` = "Jarosław Kozłowski, Pojęcie, 1972"
- `prawa_autorskie = '© Jarosław Kozłowski / © Galeria ESTA'`
- `upload_kto = 'Tadeusz'` (z localStorage)
- `szerokosc_px / wysokosc_px / rozmiar_bajty / hash` — z meta pliku

**Co Tadeusz robi ręcznie:**
- (opcjonalnie) zmienia `typ_szczegolowy` dropdown na "odwrocie" lub "sygnatura"
- (opcjonalnie) edytuje alt

**Czas:** 30 sekund na 5 zdjęć.

### Scenariusz B — Upload z modalu ARTYSTY

**Kontekst:** Modal m-a Wanda Gołkowska

**Akcja:** "+ Wgraj zdjęcia" → 1 plik `golkowska-portret.jpg`

**System wypełnia:**
- `typ_glowny = 'artysta'`
- `artysta_id = Gołkowska`
- `typ_szczegolowy = 'portret'` (default dla 1. zdjęcia artysty)
- `glowne = TRUE` (jeśli artysta nie miał wcześniej portretu)
- `alt_pl = "Wanda Gołkowska, portret. Galeria ESTA."`

**Bonus:** automatyczne ustawienie `artysci.zdjecie_hero = url` jeśli pole było puste.

### Scenariusz C — Upload z modalu WYSTAWY (galeria wernisażu)

**Kontekst:** Modal m-w "Recycled News" 2024

**Akcja:** Tab "Wernisaż" → "+ Wgraj zdjęcia" → 16 plików

**System wypełnia dla każdego:**
- `typ_glowny = 'wystawa'`
- `wystawa_id = Recycled-News`
- `typ_szczegolowy = 'wernisaz'`
- `glowne = FALSE` (zdjęcia wernisażu nie są "głównymi" wystawy — to plakat ma `glowne=TRUE`)
- `kolejnosc = 1..16` (w kolejności drag&drop)
- `alt_pl = "Wernisaż wystawy 'Recycled News'. Galeria ESTA, 2024."`

**Plus:** otwiera się prosty edytor "Kto jest na zdjęciu?":
- Tadeusz klika na zdjęciu → wybiera artystów z dropdown
- System dodaje rekordy do `media_artysci`
- Auto-alt aktualizuje się: "Wernisaż wystawy 'Recycled News'. Marek Sobczyk, Jerzy Lewczyński. Galeria ESTA, 2024."

### Scenariusz D — Upload z modalu ARTYKUŁU BLOGA

**Kontekst:** Modal m-bl "Schwitters w Zentrum Paul Klee"

**Akcja:** Widget galerii zdjęć → "+ Wgraj zdjęcia" → 10 plików

**System wypełnia:**
- `typ_glowny = 'blog'`
- `artykul_id = ten-artykul`
- `typ_szczegolowy = 'ilustracja'` (lub 'okladka' dla pierwszego, jeśli artykuł nie ma jeszcze okładki)
- `glowne = TRUE` dla 1. zdjęcia jeśli to pierwsze
- `kolejnosc = 1..10`
- `alt_pl = "Ilustracja do artykułu 'Schwitters w Zentrum Paul Klee'. Galeria ESTA."`

**Plus:** dodanie rekordów do `artykuly_zdjecia` (już istniejąca tabela M:N artykuł-zdjęcie z `kolejnosc`).

### Scenariusz E — Upload "ogólny" w Media Library

**Kontekst:** Widok Media Library → "+ Wgraj zdjęcia"

**Akcja:** Tadeusz wgrywa zdjęcia **bez konkretnego kontekstu** (np. archiwa, materiały do późniejszego przypisania)

**System wypełnia:**
- `typ_glowny = 'inne'` (default)
- `typ_szczegolowy = 'inne'`
- Brak FK powiązań
- `alt_pl = nazwa_pliku_oryginalna` (placeholder)
- `status_specjalny = 'sierota'` (do późniejszego przypisania)

W widoku Media Library te zdjęcia pojawiają się z **czerwoną etykietą "⚠ do przypisania"**. Filtr "Sieroty" w lewym sidebarze pozwala je szybko znaleźć i przypisać hurtem.

### Scenariusz F — Upload dokumentu (PDF/DOC)

**Kontekst:** Modal m-p → sekcja "Dokumenty pracy" → "+ Dodaj dokument"

**Akcja:** Upload `certyfikat_kozlowski_pojecie.pdf`

**System wypełnia:**
- `typ_glowny = 'dokument'`
- `praca_id = ta-praca`
- `artysta_id = Kozłowski`
- `typ_szczegolowy = 'certyfikat'`
- `format_pliku = 'pdf'`
- `typ_zawartosci = 'dokument'`
- `alt_pl = "Certyfikat autentyczności: Kozłowski, Pojęcie, 1972."`

**Render:** w panelu pokazuje się ikona PDF + nazwa + button "Otwórz". Na stronie publicznej **nie pokazuje się** — komponenty filtrują `WHERE typ_glowny != 'dokument'`.

---

## 9. PICKER ZDJĘĆ W MODALACH

Gdy chcesz wybrać **istniejące** zdjęcie z bazy (np. zdjęcie pracy do dodania do artykułu bloga):

### Modal `m-picker` (otwiera się NAD aktualnym modalem)

```
┌──────────────────────────────────────────────────────────────────┐
│ WYBIERZ ZDJĘCIA                                                  │
├──────────────────────────────────────────────────────────────────┤
│ Pre-filtr automatyczny (z kontekstu modalu nadrzędnego):         │
│   ✓ Powiązane z aktualnym artystą (Kozłowski Jarosław)           │
│   ✓ Typ: praca                                                   │
│                                                                  │
│ [edytuj filtry...]                                               │
│                                                                  │
│ Pozostałe filtry:                                                │
│ Typ: [select]   Artysta: [autocomplete]   Wystawa: [autocomplete]│
│ Szukaj: [input pełnotekstowe]                                    │
│                                                                  │
│ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐                      │
│ │  ✓     │ │        │ │  ✓     │ │        │                      │
│ │ [img]  │ │ [img]  │ │ [img]  │ │ [img]  │                      │
│ │ front  │ │ detal  │ │ detal  │ │ sygn.  │                      │
│ └────────┘ └────────┘ └────────┘ └────────┘                      │
│                                                                  │
│ [Wgraj nowe...] (przeciągnij plik tutaj)                         │
│                                                                  │
│ ┌──────────────────────────────────────────────────────────────┐ │
│ │  [Anuluj]    [Wybierz 2 zdjęcia]                             │ │
│ └──────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘
```

### Kontekstowe pre-filtry

| Modal nadrzędny | Pre-filtr | Cel |
|---|---|---|
| m-p (praca) → "+ Dodaj zdjęcia" | artysta=ten + typ=praca | Wybór z istniejących zdjęć tego artysty |
| m-a (artysta) → "+ Zdjęcie hero" | artysta=ten + typ_szczegolowy=portret | Wybór z istniejących portretów |
| m-w (wystawa) → "+ Wybierz zdjęcia do galerii" | wystawa=ta | Wybór ze zdjęć tej wystawy |
| m-bl (artykuł) → "+ Wybierz zdjęcia" | (zależy od głównego powiązania artykułu) | Wybór z artysty/wystawy/pracy do której artykuł |
| m-vr (Viewing Room) → "+ Hero" | praca z wybranych prac VR | Wybór głównego zdjęcia VR |

**Wynik wyboru:** dodanie rekordu w odpowiedniej tabeli M:N (`artykuly_zdjecia`, `wystawy_zdjecia`, `viewing_room_assets`). Zdjęcie pozostaje jednym rekordem w `media`.

---

## 10. WIDOK MEDIA LIBRARY (WYSZUKIWARKA)

Niezależny widok w panelu — dostęp z sidebar "Media Library".

### Layout

```
┌─────────────────────────────────────────────────────────────────┐
│ FILTRY (lewy sidebar, sticky)                                   │
├─────────────────────────────────────────────────────────────────┤
│ Typ główny:                                                     │
│   ☐ Praca (1247)                                                │
│   ☐ Artysta (89)                                                │
│   ☐ Wystawa (456)                                               │
│   ☐ Targ (123)                                                  │
│   ☐ Blog (45)                                                   │
│   ☐ Dokument (78)                                               │
│                                                                 │
│ Typ szczegółowy: [select - zależny od głównego]                 │
│ Artysta: [autocomplete]                                         │
│ Wystawa: [autocomplete]                                         │
│ Praca: [autocomplete + filtr po artyście]                       │
│ Rok wykonania: [od] [do]                                        │
│ Tagi: [multiselect z pojecia]                                   │
│ Pełnotekstowo: [input - alt/podpis/notatka]                     │
│                                                                 │
│ Specjalne:                                                      │
│   ☑ Tylko publiczne (publikowane przez encję)                   │
│   ☐ Tylko sieroty (do przypisania)                              │
│   ☐ Tylko dokumenty                                             │
│                                                                 │
│ [Wyczyść]   [Zapisz jako pre-set]                               │
├─────────────────────────────────────────────────────────────────┤
│ Pre-sety:                                                       │
│   📌 Sieroty                                                    │
│   📌 Prace Kozłowskiego                                         │
│   📌 Wernisaże 2024                                             │
└─────────────────────────────────────────────────────────────────┘
```

```
┌─────────────────────────────────────────────────────────────────┐
│ WYNIKI (główny obszar)                                          │
├─────────────────────────────────────────────────────────────────┤
│ Widok: [Grid 6 kol] [Grid 4 kol] [Lista miniatur] [Tabela]      │
│ Sortuj: [Najnowsze] [Artysta A-Z] [Typ] [Ręcznie]               │
│                                                                 │
│ Znaleziono: 47 zdjęć                                            │
│                                                                 │
│ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐                     │
│ │ [img]  │ │ [img]  │ │ [img]  │ │ [img]  │                     │
│ │ Kozłow.│ │ Kozłow.│ │ Sobczyk│ │ Wernis.│                     │
│ │ Pojęcie│ │ detal  │ │ Bez tyt│ │ RN 2024│                     │
│ │ 1972   │ │        │ │ 2003   │ │        │                     │
│ └────────┘ └────────┘ └────────┘ └────────┘                     │
└─────────────────────────────────────────────────────────────────┘
```

### Akcje na zdjęciu (klik na miniaturę):

**Modal `m-ml-edit` (Media Library edit):**
- Podgląd dużego zdjęcia
- Pola edycyjne: alt_pl/en/de, podpis_pl/en/de, autor_zdjecia, prawa, tagi, notatka_wewnetrzna, focal_point
- Powiązania: artysta_id, praca_id, wystawa_id, targ_id, artykul_id, viewing_room_id (selecty)
- M:N: media_artysci, media_prace (multiselecty)
- Typ_glowny + typ_szczegolowy
- Flaga `glowne` (z ostrzeżeniem o zmianie głównego)
- Kolejność
- Button "Wygeneruj alt ponownie"
- Button "Usuń"

---

## 11. RENDER PUBLICZNY — STRONA GALERII

### `/kolekcja`, `/zasoby` — listy prac

```typescript
// Każda praca ma "główne" zdjęcie wybierane przez glowne=TRUE
const { data: prace } = await supabase
  .from('prace')
  .select(`
    *,
    artysta:artysci(*),
    zdjecie_glowne:media!inner(*)
  `)
  .eq('zdjecie_glowne.glowne', true)
  .eq('zdjecie_glowne.typ_glowny', 'praca')
  .eq('widocznosc', 'kolekcja');
```

### `/praca/[slug]` — pojedyncza praca

```typescript
// Hero + galeria
const { data: praca } = await supabase
  .from('prace')
  .select(`
    *,
    artysta:artysci(*),
    zdjecia:media(*)
  `)
  .eq('slug', slug)
  .order('zdjecia.glowne', { ascending: false })
  .order('zdjecia.kolejnosc', { ascending: true })
  .single();

// W komponencie:
const hero = praca.zdjecia.find(z => z.glowne);
const galeria = praca.zdjecia.filter(z => !z.glowne);
```

### `/artysta/[slug]` — strona artysty

```typescript
const { data: artysta } = await supabase
  .from('artysci')
  .select(`
    *,
    hero:media!inner(*)
  `)
  .eq('hero.typ_glowny', 'artysta')
  .eq('hero.glowne', true)
  .eq('slug', slug)
  .single();
```

### `/wystawa/[slug]` — strona wystawy

```typescript
const { data: wystawa } = await supabase
  .from('wystawy')
  .select(`
    *,
    plakat:media(*),
    galeria:media(*)
  `)
  .eq('slug', slug)
  .single();

// Plakat = media z wystawa_id + typ_szczegolowy='plakat' + glowne=TRUE
// Galeria = pozostałe media z wystawa_id
```

### Pomijanie dokumentów na stronie publicznej

Wszystkie zapytania frontend dodają filtr:

```typescript
.neq('media.typ_glowny', 'dokument')
```

Lub można użyć **widok bazodanowy** `media_publiczne`:

```sql
CREATE VIEW media_publiczne AS
SELECT * FROM media WHERE typ_glowny != 'dokument';
```

I frontend zawsze fetcuje z `media_publiczne` zamiast z `media`.

---

## 12. HELPER `<WorkImage>` I `<MediaImage>`

### Komponent `<WorkImage praca={p} variant="thumbnail">`

Renderuje główne zdjęcie pracy z fallback.

```typescript
// components/WorkImage.tsx
'use client';

import Image from 'next/image';
import { useState } from 'react';

type Props = {
  praca: {
    id: string;
    id_pracy?: string;
    tytul: string;
    artysta?: { nazwisko_i_imie: string };
    zdjecie_glowne?: { url: string; alt_pl: string };
    obraz_url?: string;  // legacy fallback
  };
  variant?: 'thumbnail' | 'medium' | 'large' | 'hero';
};

export function WorkImage({ praca, variant = 'medium' }: Props) {
  const [error, setError] = useState(false);
  
  // 1. Spróbuj zdjęcia z nowego modelu (media table)
  let src = praca.zdjecie_glowne?.url;
  let alt = praca.zdjecie_glowne?.alt_pl;
  
  // 2. Fallback do legacy obraz_url
  if (!src && praca.obraz_url) {
    src = praca.obraz_url;
    alt = `${praca.artysta?.nazwisko_i_imie || ''}, ${praca.tytul}`;
  }
  
  // 3. Ostateczny fallback do CDN galeria-esta.pl
  if (!src && praca.id_pracy) {
    src = `https://galeria-esta.pl/viewing-room/images/prace/${praca.id_pracy}.jpg`;
    alt = `${praca.artysta?.nazwisko_i_imie || ''}, ${praca.tytul}`;
  }
  
  if (error || !src) {
    return <div className="placeholder">Brak zdjęcia</div>;
  }
  
  const sizes = {
    thumbnail: { w: 200, h: 200 },
    medium: { w: 600, h: 600 },
    large: { w: 1200, h: 1200 },
    hero: { w: 1600, h: 1600 }
  };
  
  return (
    <Image
      src={src}
      alt={alt || ''}
      width={sizes[variant].w}
      height={sizes[variant].h}
      onError={() => setError(true)}
    />
  );
}
```

### Komponent `<MediaImage media={m} variant="thumbnail">`

Bardziej ogólny — renderuje dowolne zdjęcie z `media` (nie tylko pracę):

```typescript
export function MediaImage({ media, variant = 'medium' }: Props) {
  // Logika analogiczna, ale media.url + media.alt_pl bezpośrednio
}
```

---

## 13. WARIANTY ROZMIARÓW (ETAP 2)

### MVP (teraz)

Wgrywamy oryginalne pliki. Bez transformacji.

Frontend renderuje przez `next/image` (automatyczne resize w Vercel Edge).

### Etap 2 — automatyczne warianty

Edge Function w Supabase która po INSERT do `media` generuje:

```
- thumbnail (400×400 kwadrat, smart-crop z focal_point)
- medium (800px max bok, zachowane proporcje)
- large (1600px max bok, zachowane proporcje)
- og_image (1200×630 dla Open Graph, smart-crop)
```

Zapisuje warianty w storage (np. `prace/UUID-thumb.jpg`, `prace/UUID-medium.jpg`).

Aktualizuje flagi `ma_thumbnail / ma_medium / ma_large` w tabeli.

### Format

- Oryginał: JPEG (artysta dostarcza)
- Warianty: WebP (mniej miejsca, szybsze ładowanie) lub AVIF jeśli się da

### Implementacja

Funkcja `generateMediaVariants(media_id)` wywołana:
- Automatycznie po INSERT (trigger)
- Ręcznie w Media Library (button "Wygeneruj warianty")

---

## 14. MIGRACJA ISTNIEJĄCYCH URL → TABELA MEDIA

### Stan obecny

- `prace.obraz_url` — pole z URL do starego CDN
- `prace.id_pracy` — używane jako klucz do `https://galeria-esta.pl/viewing-room/images/prace/{id_pracy}.jpg`
- Część zdjęć już w Supabase Storage (z prób uploadu w maju 2026)
- Tabela `media` istnieje, ma trochę rekordów

### Strategia: stopniowa migracja

**Etap 1 — Brak akcji.** WorkImage używa kaskady: `media → obraz_url → CDN`. Wszystko nadal działa.

**Etap 2 — Każda nowa praca przez panel zapisuje zdjęcie do `media`.** Stare prace zostają z `obraz_url`.

**Etap 3 — Hurtowy import.** Skrypt który dla każdej pracy z `obraz_url` ALE bez rekordu w `media`:
1. Pobiera zdjęcie z URL (fetch + save jako blob)
2. Uploaduje do Storage (płasko, jako UUID)
3. Tworzy rekord w `media` z auto-alt
4. Ustawia `glowne=TRUE`
5. Opcjonalnie czyści `prace.obraz_url` (zostawiamy do potwierdzenia)

**Bez deadline.** Strona działa nadal. Nowe zdjęcia idą do media. Stare zostają.

### Sprzątanie sierot w storage

Skrypt diagnostyczny:

```sql
-- Pliki w storage które NIE mają rekordu w media
-- (porównujemy storage.objects.name vs media.url)
```

Sieroty można:
- DELETE w storage (jeśli nieużywane)
- INSERT do media (jeśli ważne, ze status 'sierota' do późniejszego przypisania)

---

## 15. PLAN IMPLEMENTACJI (ETAPY)

### Etap 1 — Migracja schematu (1 sesja, ~2h)

**Plik:** `migrations/obszar_media_v1.sql`

- Dodanie brakujących kolumn do `media`
- Utworzenie M:N: `media_artysci`, `media_prace`, `media_wystawy`, `media_pojecia`
- Indeksy + UNIQUE indexes na `glowne`
- Trigger `zmodyfikowane`
- Views: `media_publiczne`

### Etap 2 — Naprawa istniejącego m-import w panelu (1 sesja, ~2h)

**Cele:**
- Naprawić błąd saveMl() z poprzednich sesji
- Sprawdzić upload do Storage (URL, policies)
- Dodać auto-generator alt (templaty z sekcji 7)
- Dodać `glowne` + `kolejnosc` logic

### Etap 3 — Integracja w modalach (2 sesje, ~4h)

- Modal m-p: widget zdjęć (grid miniatur + "+ Wgraj" + "+ Wybierz z bazy")
- Modal m-a: widget zdjęć
- Modal m-w: tab "Galeria" z 3 sekcjami (plakat / ekspozycja / wernisaż)
- Modal m-t: widget zdjęć
- Modal m-bl: aktualizacja istniejącego widgetu z dzisiejszej sesji
- Modal m-vr: hero + sekcje VR

### Etap 4 — Modal `m-picker` (1 sesja, ~2h)

Wspólny komponent wybierania zdjęć z bazy. Otwiera się z każdego modalu.

### Etap 5 — Widok Media Library (1 sesja, ~3h)

Pełnoekranowy widok z filtrami + grid + pre-sety.

### Etap 6 — Frontend integracja (1 sesja, ~2h)

- Komponent `<WorkImage>` z kaskadą fallback
- Aktualizacja fetchy w `/kolekcja`, `/zasoby`, `/praca/[slug]`, `/artysta/[slug]`
- Komponent `<MediaImage>` dla blogu i Viewing Room

### Etap 7 — Migracja stopniowa starych URL (długoterminowo)

Skrypt importu hurtowego. Bez deadline.

### Etap 8 — Warianty rozmiarów (Etap 2, gdy będzie potrzeba)

Edge Function. Po dłuższym używaniu, gdy okaże się że storage / CDN potrzebują optymalizacji.

---

## 16. CO NIE ROBI SYSTEM (ŚWIADOME WYŁĄCZENIA)

**Brak:**
- Edycji zdjęć w panelu (crop, rotate, filtry) — Tadeusz robi to przed uploadem w zewnętrznym narzędziu
- Watermarków automatycznych — opcja dodania w Etapie 3
- Versioning zdjęć (historia zmian) — overkill dla galerii
- AI-generated alt z analizą obrazu — auto-alt wystarcza, AI dodaje tylko niedeterministyczność
- Wgrywanie wideo — Galeria ESTA nie używa wideo (na razie)
- Cloudinary / inne CDN — Supabase + Next.js Image wystarczają
- Storage chunked upload dla wielkich plików — pliki galerii rzadko przekraczają 10MB

**Etap 3 (opcjonalne dodatki):**
- Watermark "© Galeria ESTA" overlay na zdjęciach prac do oferty PDF
- Generowanie OG image dla artykułów bloga z automatycznym tekstem
- Slack/email notification gdy ktoś inny doda zdjęcie (jeśli Jacek będzie operatorem)

---

## ZAKOŃCZENIE

**Galeria ESTA — zdjęcia jako kuratorski zasób.**

Architektura przyjmuje że Tadeusz prowadzi galerię od 28 lat. **Setki prac**, **kilkadziesiąt artystów**, **dziesiątki wystaw i targów**, **rosnąca biblioteka materiałów**. System ma działać przez kolejne 28 lat.

Decyzje techniczne wynikają z tej skali:
- UUID-y w storage (przeniesienie dostawcy bezbólowo)
- Auto-alt (skala wymaga automatyzacji)
- M:N relacje (jedno zdjęcie wernisażu = wielu artystów)
- Stopniowa migracja (nic na siłę, wszystko działa nadal)
- Galeryjne vs dokumenty (separacja przez `typ_glowny`)

**Dokument zatwierdzony przez Tadeusza 9 czerwca 2026.**

Następne kroki — patrz sekcja 15 (Plan implementacji).
