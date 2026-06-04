# OBSZAR 4 — OFERTY: SYSTEM PREZENTACJI I SPRZEDAŻY PRAC GALERII ESTA

**Status:** dokument koncepcyjny do refleksji
**Data:** czerwiec 2026
**Powiązane dokumenty:**
- `docs/ESTA-ARCHITEKTURA-SYSTEMU.md` (fundament całego projektu)
- `docs/OBSZAR-2-IDEE-POJECIA.md` (klasyfikacja kuratorska)
- `docs/OBSZAR-2-UZUPELNIENIE.md` (International + EN/DE w bazie)
- Koncept oferta/prezentacja (DNA wizualne — Nordenhake + ESTA)
- Koncept International Program (kuratorska warstwa międzynarodowa)
- `collection.php` + `praca.php` (sprawdzone wzorce techniczne ze starej strony)

---

## 0. ZASADA NADRZĘDNA

**Oferta to każdy uporządkowany sposób pokazania pracy lub grupy prac galerii.** Nie tylko prywatny link z tokenem, nie tylko sklep, nie tylko katalog. **Oferta to kameralna, kolekcjonerska prezentacja wynikająca z historii galerii, jej programu i relacji z artystami.**

W systemie ESTA wszystkie oferty mają **wspólne DNA wizualne i konceptualne** (Nordenhake redukcja + ciepło galerii ESTA). Różnią się trybem dostępu, zakresem, gęstością — nie tożsamością wizualną. Klient który widział kiedyś jedną ofertę ESTA rozpoznaje każdą następną jako ten sam świat, tę samą galerię.

### Kluczowe rozróżnienie — oferta jako koncept vs oferta jako encja bazodanowa

**"Oferta" w sensie szerokim** (koncept kuratorski) to każda z trzech form prezentacji prac: kolekcja, archiwum, indywidualna. W tym sensie są to "trzy typy ofert".

**"Oferta" w sensie wąskim** (encja bazodanowa) to **wyłącznie oferta indywidualna z tokenem** — pojedynczy rekord w tabeli `oferty`, dedykowany dla konkretnego klienta. Tabela `oferty` NIE zawiera rekordów dla `/kolekcja` ani `/viewing-room`.

**Praktyczne konsekwencje:**

- `/kolekcja` to **publiczna strona Next.js** automatycznie agregująca prace z `prace.widocznosc='kolekcja'`. Galerysta NIE tworzy "oferty kolekcja" w panelu — przypisuje pracom widocznosc='kolekcja' w modal pracy.
- `/viewing-room` to **publiczna strona Next.js** agregująca prace z `prace.widocznosc='archiwum'`. Analogicznie — bez tworzenia "oferty archiwum".
- `/oferta/[token]` to **prywatna strona** fetchująca konkretną ofertę z tabeli `oferty` po tokenie + dołączone prace z `oferty_prace`.

**Praca w ofercie indywidualnej NIEZALEŻNA od jej `widocznosc`:** galerysta tworząc ofertę dla klienta wybiera prace **dowolnie z bazy** — z kolekcji, archiwum, zasobu, nowo wprowadzone. Klient w jednym widoku dostaje uporządkowaną prezentację dedykowaną dla niego, niezależnie od tego gdzie te prace są publicznie widoczne.

**Ceny i opisy per oferta są persistentne historycznie:** ta sama praca w 5 różnych ofertach może mieć 5 różnych cen i 5 różnych tekstów kuratorskich — każdy dla konkretnego klienta. To fundamentalny mechanizm sprzedaży galerii (klient X widzi cenę 18 000, klient Y widzi 22 000 dla tej samej pracy, każdy w swojej ofercie).

---

## 1. TRZY TYPY OFERT — fundament systemu

> **PRZYPOMNIENIE:** "Trzy typy ofert" to **koncept kuratorski** (trzy formy prezentacji prac). Tabela `oferty` w bazie zawiera WYŁĄCZNIE Typ 3 (oferty indywidualne z tokenem). Typy 1 i 2 to publiczne strony Next.js agregujące prace wg `prace.widocznosc`.

### Typ 1: Oferta główna nowej strony (`/kolekcja`)

**Mechanizm techniczny:** publiczna strona Next.js (Server Component) fetchująca wszystkie prace z `prace.widocznosc='kolekcja'`. NIE jest rekordem w tabeli `oferty`. Praca pojawia się automatycznie gdy galerysta przypisze jej widocznosc='kolekcja' w modal pracy.

**Charakter:** najważniejsza warstwa publiczna. Pokazuje **kim galeria jest programowo** — rdzeń konceptualny, program poszerzony, współczesne kontynuacje. Manifest kuratorski.

**Funkcja:** budowanie autorytetu, pierwsze wrażenie, prezentacja programu. Nie głównie sprzedażowa, choć ceny są dyskretne lub "dostępność na zapytanie".

**Charakter ESTA:** najbardziej kuratorska, prestiżowa, wybór wąski. Nie pokazujemy magazynu — pokazujemy wybór.

**Layout:** grid 2-kolumnowy (większe prace, większa ranga), sekcje narracyjne (Rdzeń konceptualny / Geometria / Współczesne kontynuacje), długi tekst kuratorski wstępny.

**Stan implementacji (czerwiec 2026):** ✅ ZROBIONE w Task B3 + naprawa kadrowania obrazów. 14 prac z `widocznosc='kolekcja'` widocznych na żywej stronie. Zdjęcia przez fallback do TheCamels CDN (`https://galeria-esta.pl/viewing-room/images/prace/{id_pracy}.jpg`).

### Typ 2: Oferta archiwum (`/viewing-room`)

**Mechanizm techniczny:** publiczna strona Next.js fetchująca prace z `prace.widocznosc='archiwum'`. NIE jest rekordem w tabeli `oferty`. Galerysta przypisuje widocznosc='archiwum' w modal pracy.

**Charakter:** szeroki publiczny zasób galerii z 28 lat działalności. Praktyczne narzędzie kolekcjonerskie i handlowe.

**Funkcja:** klient sam przegląda zasób, używa filtrów, znajduje konkretne prace. Tu może być więcej prac, większa gęstość, mocniejsza funkcja sprzedażowa.

**Charakter ESTA:** kolekcjonerski browse — discover — search, nie kuratorska narracja. Ale wciąż w tym samym DNA wizualnym (Cormorant + Instrument Sans, biały spokój, dyscyplina rytmu).

**Layout:** grid 3-kolumnowy (więcej prac, mniejsza ranga indywidualnej), wyszukiwarka + 4 filtry (artysta / segment / cena + tekst pełny) + chipy segmentów + tag links.

**Stan implementacji (czerwiec 2026):** ⏳ DO ZROBIENIA (Task B5).

### Typ 3: Oferta indywidualna z tokenem (`/oferta/[token]`)

**Mechanizm techniczny:** rekord w tabeli `oferty` z unikalnym tokenem (16-znakowy hash). Każda oferta dla konkretnego klienta (`klient_id` FK). Lista prac przez M:N `oferty_prace` z dodatkowymi polami per oferta (cena_w_ofercie, opis_do_oferty, kolejnosc).

**Praca w ofercie indywidualnej NIEZALEŻNA od jej `widocznosc`:** galerysta może wybrać do oferty pracę z kolekcji, archiwum, zasobu lub nowo wprowadzoną. Ta sama praca może być w wielu ofertach jednocześnie — każda ze swoją ceną dla konkretnego klienta.

**Charakter:** prywatna prezentacja dla konkretnego klienta. **Najbardziej prestiżowy widok systemu** — kameralne zaproszenie do oglądania prac.

**Funkcja:** konkretny klient, konkretne prace, dedykowana propozycja. Po spotkaniu, po targach, dla kolekcjonera, dla instytucji, dla architekta.

**Charakter ESTA:** najbliżej Nordenhake — private viewing room, nie cennik, nie katalog. Krótki tekst osobisty (bez "prepared for [nazwa klienta]" — dyskretność, klient nie jest etykietowany).

**Layout:** grid 2-kolumnowy (najbliższy oferty głównej, ale z innym tonem osobistym), nawigacja "Prace / Dokumenty / Kontakt", numer oferty w bazie ale niedominujący wizualnie.

**Stan implementacji (czerwiec 2026):** ⏳ CZĘŚCIOWO (Task B2 dał szkielet bez listy prac). Wymaga: Task A1.5 (uproszczenie modalu m-of w panelu — usunięcie wyboru typ_oferty), Task A2 (widget listy prac w modalu z drag&drop), Task B7 (lista prac na froncie z `<WorkCard kontekst="oferta">`).

---

## 2. CZTERY WYMIARY OFERT (układ ortogonalny)

Każda oferta ma cztery niezależne wymiary:

### Wymiar 1: Typ (jeden z trzech powyżej)
- `kolekcja` / `archiwum` / `indywidualna`

### Wymiar 2: Wersja językowa
- `pl` — wersja polska (główna)
- `international` — wersja EN/DE (osobna warstwa kuratorska)

International to nie tłumaczenie wersji PL. **To inny program artystyczny** wynikający z konceptu International:
- Strona PL pokazuje polskich artystów rdzenia ESTA
- Strona International (EN/DE) pokazuje **rdzeń polski + środkowoeuropejską geometrię** (István Haász, Viktor Hulík, Reinhard Roy, Jan Pamuła, Mieczysław Wiśniewski, Jan Berdyszak, Barbara Kozłowska, Natalia Brandt)

Pole `int_publiczne` (już istnieje w bazie po Sesji A) decyduje czy oferta/praca/artysta pokazuje się w wersji International.

### Wymiar 3: Kontekst kuratorski (opcjonalny)
- `idea_glowna_id` — która z 7 idei programu (Idea/Język, Słowo/Znak, Geometria/Struktura...)
- M:N `pojecia_oferty` — które pojęcia (z 45 pojęć kuratorskich)
- `int_segment` — segmenty International (z konceptu: Polish Conceptual Art, Concrete Poetry, Central European Geometry, Visual Poetry...)

Pozwala na prezentacje tematyczne ("Geometria / Struktura — wybór prac", "Język i znak w polskim konceptualizmie") jako warianty oferty głównej lub archiwum.

### Wymiar 4: Rynek priorytetowy (operacyjny, niewidoczny publicznie)
- `rynek_priorytetowy` — multi-select z 8 wartości (DACH, Italy, Central Europe, Wider International, Institutions, Collectors, Architects, Art Fairs)

Operacyjne pole dla galerysty — gdzie dana oferta ma największy potencjał. Niewidoczne publicznie, używane w panelu CRM do filtrowania i strategii.

---

## 3. WSPÓLNE DNA WIZUALNE — fundament każdej oferty

To jest **najważniejsza zasada projektowa**. Bez względu na typ oferty, klient widzi tę samą galerię.

### Typografia (wspólna, zawsze)
- **Cormorant Garamond** — tytuły prezentacji, tytuły prac (italic), nazwy sekcji, warstwa galeryjna
- **Instrument Sans** — dane techniczne, opisy, filtry, ceny, metadata, przyciski, linki, nawigacja

### Kolor i tło (wspólne)
- Białe tło (paper #fbfaf8), czarna typografia (#11110f)
- Jeden akcent — linia/border (#e7e0d7)
- Bez gradientów, animacji, cienia. Czysta forma.

### Karta pracy (uniwersalny komponent)
Zawsze ta sama struktura:
- Zdjęcie w polu 4:3 z `object-fit: contain` (nigdy nie kadrujemy brutalnie)
- ARTYSTA (Instrument Sans, CAPS, letter-spacing)
- Tytuł, rok (Cormorant Garamond, italic)
- Technika, wymiary (Instrument Sans, kolor muted)
- Cena lub status (kontekstowo)

Różnice tylko w gęstości: oferta główna ma więcej tekstu kontekstowego, archiwum prostsze.

### Szczegół pracy (wspólny widok niezależny od źródła)
Klient kliknie pracę z kolekcji / archiwum / oferty indywidualnej — trafia na ten sam widok szczegółu:
- Lewa kolumna 70% — duże zdjęcie + miniatury
- Prawa kolumna 30% (sticky na desktop) — wszystkie dane pracy
- Sekcje pod spodem: Opis / Proweniencja / Wystawy / Bibliografia / Dokumenty (puste sekcje ukrywamy)
- Pod spodem: "Inne prace artysty" (grid 12) + "Podobne prace" (grid 12, wg algorytmu z `praca.php`)

### Stopka i kontakt (wspólne)
Stopka dyskretna, kontakt osobisty ("For further information, please contact Tadeusz Stapowicz, Galeria ESTA"). Klient widzi człowieka za galerią, nie platformę.

### Mobile-first
Wszystkie widoki responsywne. Grid 2- i 3-kolumnowy przechodzi w 1 kolumnę na telefonie. Szczegół pracy: prawa kolumna pod zdjęciem (nie obok).

---

## 4. SPRAWDZONE WZORCE Z `collection.php` I `praca.php` — co przenosimy 1:1

### 4.1. Algorytm "podobne prace" (`scoreSimilarity`)

To **konkretny, sprawdzony w działaniu wzorzec matchingu** prac dla kolekcjonera, rozszerzony o warstwę kuratorską (idee/pojęcia) z bazy po Sesji A:

```
Wspólny SEGMENT       = +30 punktów (fundament klasyfikacji)
Wspólna IDEA GŁÓWNA   = +25 punktów (kuratorskie podobieństwo)
Wspólny STYL          = +15 punktów
Wspólna DZIEDZINA     = +10 punktów
Wspólne POJĘCIE       = +5 punktów × n (max 3 = +15)
Cena w ±25% pracy     = +10 punktów
```

**Dlaczego segment dominuje:** segment to klasyfikacja **klient-orientowana** (Polish Conceptual Art, Central European Geometry, Concrete Poetry) — to język świata sztuki, w którym klient szuka. **Idea główna** to kuratorskie wzmocnienie — jeśli dwie prace są w tym samym segmencie I tej samej idei, to bardzo mocne dopasowanie. **Pojęcia** to delikatny dodatek — kilka wspólnych pojęć sygnalizuje subtelne pokrewieństwo.

**Cena ±25%** to praktyczna kotwica budżetowa — klient szukający dzieła do 30k nie powinien widzieć "podobnych" po 200k.

Algorytm działa w każdym kontekście tak samo — niezależnie czy klient wszedł z kolekcji programowej, archiwum, czy oferty indywidualnej. Wszystkie warstwy (segment + idea + pojęcia + style + dziedziny + cena) brane pod uwagę razem.

### 4.2. Dwie osobne sekcje pod szczegółem pracy

**"Inne prace artysty"** — max 12 prac tego samego artysty (głębia jednego artysty).
**"Podobne prace"** — max 12 prac innych artystów wg `scoreSimilarity` (poszerzenie zainteresowania).

To genialne rozróżnienie. **Klient zainteresowany Kozłowskim** widzi dalsze prace Kozłowskiego ORAZ podobne prace innych artystów z tego samego pola.

### 4.3. Filtry archiwum

Z `collection.php` — 4 filtry + chipy + tag links:
- **Tekst pełny** (przeszukuje: artysta + tytuł + rok + technika + segmenty + style + dziedziny + tagi publiczne)
- **Artysta** (dropdown z aktywnych artystów)
- **Segment** (dropdown z aktywnych segmentów)
- **Cena** (5 widełek: do 10k / 10-30k / 30-50k / 50-100k / pow. 100k)
- **Chipy segmentów** — szybkie klikanie tych samych segmentów co dropdown
- **Tag links** — kliknięcie tagu na karcie filtruje całą stronę po tym tagu

Wszystko działa real-time, JavaScript po stronie klienta (po wczytaniu danych z Supabase).

### 4.4. Dwa tryby tej samej strony pracy

Stary `praca.php` ma dwa tryby dostępu:
- **Publiczny** (jeśli `PUBLICZNE = TAK`) — stały URL, indeksowalny
- **Prywatny przez ofertę** (`?id=X&oferta=NUMER&token=TOKEN`) — sprawdza czy token oferty zawiera daną pracę

W Next.js modyfikujemy logikę:
- Wejście publiczne: `/praca/[id]` — pokazuje pracę jeśli `widocznosc='kolekcja'` lub `widocznosc='archiwum'`
- Wejście przez ofertę: `/oferta/[token]/praca/[id]` — zachowuje kontekst oferty, pokazuje pracę jeśli jest w `oferty_prace`

### 4.5. Klikalny tag jako filtr

Z `collection.php`: tagi publiczne na kartach prac są klikalne — kliknięcie filtruje całą kolekcję. To dobre UX dla kolekcjonera. Przenosimy.

---

## 4A. DWIE WARSTWY KLASYFIKACJI — narracyjna i sprzedażowa, obecne wszędzie

**Fundamentalna zasada projektowa:** ESTA to jednocześnie kuratorska tożsamość i narzędzie sprzedaży. Obie warstwy muszą współistnieć na każdej stronie z pracami, w różnych pozycjach i z różnym ciężarem wizualnym.

### Warstwa narracyjna — mówi o programie galerii

**Idee (6+1) + Pojęcia (45)** — to **wewnętrzny język ESTA**, kuratorska narracja, wyróżnik programowy.

- **Idee** jako nawigacja: chipy/karuzela na liście prac, podstrony tematyczne `/kolekcja/idea/idea-jezyk`
- **Pojęcia** jako klikalne tagi na kartach prac (max 3-4) — odkrywanie eksploracyjne ("aha, ta praca ma 'tautologia' — pokaż mi wszystkie")
- **Strony idei** jako pełnoprawne podstrony z tekstem kuratorskim + pracami

**To NIE jest warstwa SEO publicznego.** "Idea / Język" jako fraza wyszukiwania Google jest niespotykana — to nazwa wewnętrzna ESTA, nie kategoria katalogowa świata.

### Warstwa sprzedażowa — pomaga klientowi znaleźć pracę i indeksuje SEO

**Segmenty + Style + Dziedziny** — to **język świata sztuki**, w którym klient szuka.

- **Segmenty** dominują: "Polish Conceptual Art", "Central European Geometry", "Concrete Poetry", "Works on Paper", "Visual Poetry", "Geometric Abstraction" — w PL + EN + DE
- **Style** uzupełniają: "Konceptualizm", "Abstrakcja geometryczna", "Sztuka konkretna"
- **Dziedziny** klasyfikują formalnie: "Prace na papierze", "Obiekty", "Rzeźba", "Malarstwo", "Fotografia"

**To jest fundament SEO:**
- SEO title używa segmentu jako kontekstu
- SEO description wzbogacony pojęciami (idee i pojęcia w tekście, ale segment jako klucz)
- Alt zdjęć: artysta + tytuł + segment + technika
- Filtry rynkowe (artysta / segment / cena) — sprawdzone w działaniu w `collection.php`

**Każda praca MUSI mieć minimum jeden segment.** Bez tego SEO jest puste i wyszukiwarki nie wiedzą jak zaklasyfikować pracę. Walidacja w panelu CRM.

### Konkretna implementacja per typ oferty

#### `/kolekcja` (oferta główna nowej strony)

Ekspozycja **narracja-first**:

```
[ Hero z tekstem programowym ESTA ]
                ↓
[ CHIPY IDEI - duże, wizualnie mocne ]                          ← warstwa narracyjna PRIORYTET
[ Idea/Język | Słowo/Znak | Geometria/Struktura | ... +1 ]
                ↓
[ Filtry rozwijane - dyskretne pod chipami ]                    ← warstwa sprzedażowa DOSTĘPNA
[ Artysta ▾  Segment ▾  Dziedzina ▾  Cena ▾  Szukaj... ]
                ↓
[ Grid prac 2-kolumnowy ]
   Karty z klikalnymi tagami pojęć (max 3)
   Z dyskretnym podpisem segmentu
```

Klient eksplorujący widzi kuratorską narrację. Klient szukający konkretnie używa filtrów.

#### `/viewing-room` (oferta archiwum)

Ekspozycja **sprzedaż-first**:

```
[ Hero z krótkim wstępem ]
                ↓
[ FILTRY ROZWIJANE - główne, na pierwszym planie ]              ← warstwa sprzedażowa PRIORYTET
[ Artysta ▾  Segment ▾  Dziedzina ▾  Cena ▾  Szukaj... ]
                ↓
[ Chipy/karuzela idei - mniejsze, jako dodatek ]                ← warstwa narracyjna DOSTĘPNA
[ Idea/Język | Słowo/Znak | ... ]
                ↓
[ Grid prac 3-kolumnowy ]
   Karty z klikalnymi tagami pojęć
   Z dyskretnym podpisem segmentu
```

Klient browsujący ma filtry pod ręką. Klient eksplorujący kuratorsko ma chipy idei dostępne.

#### `/oferta/[token]` (indywidualna)

Bez filtrów — to dedykowana selekcja:

```
[ Hero osobisty - "prepared for [klient]" + krótki tekst ]
                ↓
[ Grid prac 2-kolumnowy ]
   Karty z komentarzami kuratorskimi (D7)
   Klikalne tagi pojęć prowadzące do /viewing-room?tag=...
```

Klient nie szuka — galerysta już wybrał. Pojęcia jako linki do dalszej eksploracji.

#### `/international/*` (wersja EN/DE)

Identyczna struktura co PL, z różnicami:
- Segmenty mają wartości międzynarodowe ("Polish Conceptual Art", "Central European Geometry", "Concrete Poetry")
- Idee przetłumaczone (pola `nazwa_en`, `nazwa_de` w tabeli `idee`)
- Pojęcia przetłumaczone (pola `nazwa_en`, `nazwa_de` w tabeli `pojecia`)

### Karta pracy — obie warstwy widoczne

```
[ Zdjęcie pracy 4:3 ]

JAROSŁAW KOZŁOWSKI                          ← artysta
Deka-log, 1972                              ← tytuł, rok (italic)
acrylic on paper, 70 × 100 cm               ← technika, wymiary

[ język ] [ znak ] [ system ]               ← max 3 pojęcia kuratorskie (klikalne)
Polish Conceptual Art                       ← segment (dyskretny, mały font)

Cena na zapytanie / Zobacz pracę            ← D2: cena domyślnie ukryta
```

Obie warstwy widoczne — narracja (pojęcia jako tag links) i sprzedaż (segment jako dyskretna informacja).

### Szczegół pracy — pełna dwuwarstwowość

Po prawej stronie zdjęcia, w danych pracy:

```
─── PROGRAM GALERII ───
Idea główna: Idea / Język               → /kolekcja/idea/idea-jezyk
Pojęcia kuratorskie:
• język                                  → /viewing-room?tag=jezyk
• znak                                   → /viewing-room?tag=znak
• system
• tautologia

─── KLASYFIKACJA ───
Segmenty: Polish Conceptual Art, Works on Paper
Style: Konceptualizm
Dziedziny: Prace na papierze, Rysunek
```

Klient widzi obie warstwy jednocześnie — kuratorską identyfikację i katalogową klasyfikację.

---

## 5. WARSTWA SOLD/RELATED WORKS — strategiczna funkcja sprzedażowa

Z konceptu International (punkty 7.5 i 20):

**Sprzedane prace nie znikają.** Pozostają jako SEO entry points + prestiżowe dowody programu. Klient wpisuje w Google "Kozłowski Deka-log" → trafia na stronę pracy oznaczonej "Sold" → pod spodem widzi sekcję "Related available works" → kontaktuje galerię.

### Mechanizm
- Praca sprzedana ma status handlowy `sprzedana` (z Obszaru 0)
- Strona pracy nadal istnieje (URL nie znika), pokazuje "Sold" zamiast ceny
- Pod spodem dwie sekcje: "Inne prace artysty" + "Podobne prace" (wg algorytmu) — wszystkie dostępne
- Plus opcjonalnie pole manualne `int_related` (M:N) — galerysta może ręcznie wskazać konkretne related works dla najważniejszych sprzedanych prac

### Wartość biznesowa
- SEO: strona z 28-letnim historicznym title (np. "Jarosław Kozłowski Deka-log 1972") pozostaje indeksowalna i przyciąga ruch
- Sprzedaż: klient szukający konkretnej pracy dostaje natychmiast podobne dostępne
- Prestiż: 28 lat sprzedanych prac to dowód programu galerii

To **strategiczna decyzja architektoniczna** — utrzymujemy ślad sprzedanych prac jako część systemu, nie usuwamy.

---

## 6. MODEL DANYCH — co już mamy, co dobudować

### 6.1. Tabela `oferty` — stan obecny po Sesji A

Już istnieje w bazie:
- `id`, `slug`, `numer_oferty` (z poprzednich sesji)
- `idea_glowna_id` (Sesja A — kontekst kuratorski)
- M:N `pojecia_oferty` (Sesja A — pojęcia kuratorskie)
- `int_publiczne` (Sesja A — czy w wersji International)
- Pola tekstowe PL/EN/DE (Sesja A): `tytul`, `wstep`, `tekst_kuratorski`, `tekst_dla_klienta`
- Pola SEO PL/EN/DE (Sesja A): `seo_title`, `seo_description`

### 6.2. Tabela `oferty` — co dobudować (rozszerzenie OBSZARU 4)

**Pola dostępu i identyfikacji:**
- `typ_oferty` (single select: `kolekcja` / `archiwum` / `indywidualna`)
- `token` (varchar, unique, generowany automatycznie dla wszystkich ofert — także publicznych, dla spójności URL i analityki)
- `slug` (rozszerzenie istniejącego — dla URL kolekcji/archiwum w stylu `/viewing-room/[slug]`)
- `status_oferty` (single select: `robocze` / `do_uzupelnienia` / `gotowe` / `wysłane` / `follow_up` / `zamknięte` / `sprzedaz`)

**Pola dla oferty indywidualnej (z konceptu International punkt 11):**
- `klient_txt` (text — "prepared for [klient]", w MVP zwykłe pole, tabela `klienci` w późniejszym Obszarze 5)
- `klient_typ` (single select: `collector` / `advisor` / `gallery` / `institution` / `architect` / `other`)
- `data_wyslania` (date)
- `data_follow_up` (date)
- `data_waznosci` (date, opcjonalna — kiedy token wygasa, na razie pusta = bez wygaśnięcia)
- `haslo_hash` (text, opcjonalne — w MVP pomijamy, dodamy w późniejszej iteracji)

**Pola operacyjne (niewidoczne publicznie):**
- `rynek_priorytetowy` (jsonb lub osobna M:N — wartości DACH/Italy/Central Europe/etc.)
- `typ_oferty_szczegolowy` (z konceptu International 11.2: `private_preview` / `related_works` / `artist_focus` / `fair_follow_up` / `collector_selection` / `institutional_proposal` / `architect_selection` / `italy_artissima_follow_up` / `dach_follow_up`)
- `jezyk_oferty` (single select z 11.3: `pl` / `en` / `de` / `en_de` / `pl_en` / `pl_en_de`)

**Pola hero / branding:**
- `hero_url` (text — URL do zdjęcia hero oferty, opcjonalne)
- `hero_focalpoint_x`, `hero_focalpoint_y` (numeric — pozycjonowanie hero, jak w PrivateViews)
- `accent_color` (text — kolor akcentu dla tej konkretnej oferty, opcjonalne, domyślnie czarny)

### 6.3. Nowa tabela `oferty_prace` (M:N z dodatkowymi polami)

To kluczowa tabela. Łączy oferty z pracami, ale **z bogactwem dodatkowych pól per praca w ofercie**:

```sql
CREATE TABLE oferty_prace (
  id            uuid PRIMARY KEY,
  oferta_id     uuid NOT NULL REFERENCES oferty(id) ON DELETE CASCADE,
  praca_id      uuid NOT NULL REFERENCES prace(id) ON DELETE CASCADE,

  -- pozycja w ofercie
  kolejnosc     integer NOT NULL DEFAULT 0,

  -- ceny per oferta (opcjonalne nadpisanie cen pracy)
  cena_w_ofercie_pln  numeric,
  cena_w_ofercie_eur  numeric,
  cena_widoczna       boolean DEFAULT true,   -- czy pokazać cenę czy "Na zapytanie"

  -- komentarze kuratorskie per praca w tej konkretnej ofercie (PL/EN/DE)
  komentarz_kuratorski_pl  text,
  komentarz_kuratorski_en  text,
  komentarz_kuratorski_de  text,

  -- status pracy w ofercie (może odbiegać od ogólnego statusu pracy)
  status_w_ofercie  text,  -- 'dostepna' / 'zarezerwowana_dla_tego_klienta' / 'sprzedana_w_miedzyczasie'

  created_at    timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT oferty_prace_unique UNIQUE (oferta_id, praca_id)
);
```

### 6.4. Tabela `prace` — uzupełnienia (rozszerzenie OBSZARU 4)

Z konceptu International (punkt 9), część zrobiona w Sesji A, część do dobudowania:

**Już mamy (Sesja A):**
- `int_publiczne`, `int_visual_wall`, `cena_eur`, pola EN/DE dla wszystkich pól opisowych

**Do dobudowania w Obszarze 4:**
- `int_priorytet` (single select: `1_kluczowa` / `2_mocna` / `3_uzupelniajaca`) — waga w programie International
- `int_segment` (M:N do nowej tabeli `segmenty_int`, lub jsonb — zawiera wartości jak Polish Conceptual Art / Concrete Poetry / Central European Geometry / Visual Poetry / Light Shadow / itd.)
- `rynek_priorytetowy` (M:N lub jsonb — DACH / Italy / Central Europe / etc.)
- `int_status` (single select: `robocze` / `do_opisu_pl` / `do_opisu_en` / `do_opisu_de` / `gotowe` / `opublikowane` / `wysłane` / `sprzedane` / `archiwalne`)
- `int_visual_wall_tekst_pl/en/de` (text — krótkie teksty na ekran 85" dla Visual Wall)
- `int_notatki` (text — wewnętrzne uwagi)

### 6.5. Nowa tabela `prace_related` (M:N do Related Works)

Dla manualnego wskazywania related works dla najważniejszych sprzedanych prac:

```sql
CREATE TABLE prace_related (
  id            uuid PRIMARY KEY,
  praca_id      uuid NOT NULL REFERENCES prace(id) ON DELETE CASCADE,    -- praca sprzedana
  related_id    uuid NOT NULL REFERENCES prace(id) ON DELETE CASCADE,    -- praca podobna dostępna
  kolejnosc     integer NOT NULL DEFAULT 0,
  created_at    timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT prace_related_unique UNIQUE (praca_id, related_id)
);
```

Manualna lista uzupełnia automatyczny algorytm `scoreSimilarity`.

### 6.6. Tabela `segmenty` — czy potrzebna jako nowa encja?

W starym `collection.php` segmenty są w osobnym CSV (`SEGMENTY.csv`). W nowej bazie:
- Mamy już `idee` (7 idei programu) + `pojecia` (45 pojęć kuratorskich)
- Potrzebujemy też **segmenty rynkowe** (klient-orientowane: "geometryczne", "konceptualne", "na papierze", "kolekcjonerskie")

**Dwie opcje:**
- A) Segmenty jako osobna tabela `segmenty` (analogicznie do `idee` i `pojecia`) z M:N `prace_segmenty`
- B) Wykorzystać istniejące tabele `style`, `dziedziny`, `segmenty_sprzedazy` (które już są w bazie z wcześniejszych sesji — sprawdzić w Sesji B2 lub Obszarze 12)

**Rekomendacja:** odkryć stan obecny bazy (`SELECT table_name FROM information_schema.tables`) przed decyzją. Możliwe że już mamy to co potrzebne, tylko niewykorzystane.

---

## 7. STRUKTURA URL

### 7.1. Wersja PL

| URL | Zawartość |
|---|---|
| `/` | strona główna galerii — 7 idei programu + 3 kręgi (rdzeń/poszerzony/współczesne) |
| `/artysta/[slug]` | profil artysty (wspólny widok, monograficzny) |
| `/praca/[id]` | szczegół pracy (wspólny widok z każdego wejścia) |
| `/kolekcja` | oferta główna nowej strony (typ_oferty = 'kolekcja') |
| `/viewing-room` | oferta archiwum (typ_oferty = 'archiwum') |
| `/viewing-room/[slug]` | konkretna oferta archiwum z tematem ("Geometria 2026", "Konceptualizm na papierze") |
| `/oferta/[token]` | oferta indywidualna z tokenem |
| `/oferta/[token]/praca/[id]` | szczegół pracy w kontekście oferty indywidualnej |

### 7.2. Wersja International (EN/DE)

| URL | Zawartość |
|---|---|
| `/international/` | strona główna International Program |
| `/international/central-european-conceptual-geometric-art/` | główna strona programu (oferta kolekcji INT) |
| `/international/polish-conceptual-art/` | oferta tematyczna International (typ_oferty = 'kolekcja', kontekst kuratorski) |
| `/international/central-european-geometric-art/` | oferta tematyczna International |
| `/international/selected-works/` | International viewing-room (typ_oferty = 'archiwum') |
| `/international/artists/[slug]` | profil artysty International |
| `/international/works/[id]` | szczegół pracy International |
| `/international/sold-related-works/[id]` | strona sprzedanej pracy z Related Works |

### 7.3. Stara strona `galeria-esta.pl`

**ZOSTAJE jako kapitał SEO i archiwum 28 lat.** Z dokumentu architektury (sekcja 1): "linkowana, nie kopiowana". Stopniowo wprowadzamy linki ze starych podstron do nowej strony.

**Nie migrujemy domeny** dopóki nowa strona nie jest dojrzała i sprawdzona w realnym ruchu. W MVP nowa strona działa pod `galeria-esta.vercel.app`.

---

## 8. SCENARIUSZE PRAKTYCZNE — jak system działa w codziennej pracy

### Scenariusz 1: Polski kolekcjoner przegląda kolekcję
1. Klient wchodzi na `/kolekcja`
2. Widzi 7 idei programu + kuratorską selekcję prac w gridzie 2-kolumnowym
3. Klika pracę Kozłowskiego → wchodzi na `/praca/koz-1972-deka` (wspólny widok szczegółu)
4. Pod spodem widzi "Inne prace Kozłowskiego" + "Podobne prace" (Dróżdż, Chwałczyk wg algorytmu)
5. Klika "Zapytaj o pracę" → mail do galerysty

### Scenariusz 2: Niemiecki kolekcjoner przez Google
1. Klient wpisuje "polnische konkrete Kunst" w Google
2. Trafia na `/international/central-european-conceptual-geometric-art/`
3. Widzi prezentację programu po niemiecku + selected works (z `int_publiczne = true`)
4. Klika pracę Haásza → `/international/works/haa-2020-relief-3`
5. Widzi szczegół pracy po niemiecku + Related Works innych artystów geometrii środkowoeuropejskiej
6. Klika Enquire → mail z preferowanym językiem komunikacji DE

### Scenariusz 3: Klient po spotkaniu z galerystą
1. Galerysta wraca ze spotkania, otwiera panel CRM
2. Tworzy nową ofertę typu `indywidualna`, wpisuje "prepared for [klient]", wybiera 8 prac z bazy, ustawia kolejność
3. Dla każdej pracy dodaje krótki komentarz kuratorski PL
4. Klika "Generuj token" → system tworzy `/oferta/[token]`
5. Wysyła klientowi mailem link
6. Klient klika z telefonu, widzi prywatną prezentację, klika pracę → `/oferta/[token]/praca/[id]` (szczegół w kontekście oferty)
7. Klient klika "Enquire" → mail bezpośrednio do galerysty

### Scenariusz 4: Klient z Włoch szuka Dróżdża
1. Klient wpisuje w Google "Stanisław Dróżdż concrete poetry"
2. Trafia na `/international/sold-related-works/dro-1968-pomiedzy` (praca sprzedana w 2024)
3. Widzi pracę z notką "Sold" + sekcję "Related available works" (inne prace Dróżdża + Kozłowski "Lekcja Języka" + Dłużniewski "Tekst")
4. Klient klika dostępną pracę Dróżdża → szczegół → Enquire → kontakt do galerii

### Scenariusz 5: Targi Basel — fizyczna oferta + Visual Wall
1. Galerysta na stoisku — ekran 85" pokazuje Visual Wall (20 plansz: logo + International Program + 14 artystów + Selected Works + QR code)
2. Klient zatrzymuje się, ogląda Visual Wall, skanuje QR
3. Trafia na `/international/selected-works/` z telefonu
4. Przegląda kolekcję, klika prace, zostawia zapytanie
5. Galerysta po powrocie z targów otwiera panel CRM, tworzy ofertę indywidualną typu `fair_follow_up` dla tego klienta z wybranymi pracami

---

## 9. PANEL CRM — moduł ofert (do dobudowania w Obszarze 4)

### 9.1. Lista ofert
- Tabela z filtrami (typ, status, język, rynek_priorytetowy, data_wyslania)
- Sortowanie po dacie utworzenia / wysłania
- Statystyki: ile ofert wysłanych, ile w follow_up, ile zamkniętych

### 9.2. Modal tworzenia/edycji oferty
Sekcje:
1. **Podstawowe:** typ_oferty (kolekcja/archiwum/indywidualna), token (auto-generowany), status
2. **Język i rynek:** jezyk_oferty, rynek_priorytetowy, typ_oferty_szczegolowy
3. **Klient (dla indywidualnych):** klient_txt, klient_typ, data_wyslania, data_follow_up
4. **Kontekst kuratorski:** idea_glowna_id, M:N pojecia_oferty, int_segment
5. **Treść PL/EN/DE w zakładkach:** tytul, wstep, tekst_kuratorski, tekst_dla_klienta, SEO (analogicznie do innych modali z Sesji B1)
6. **Hero i branding:** hero_url, focalpoint, accent_color
7. **Lista prac:** osobny widget (patrz 9.3)
8. **Visual Wall:** opcjonalne pola dla `int_visual_wall` (jeśli oferta ma być na ekranie 85")

### 9.3. Widget "Lista prac w ofercie"
Najważniejszy element modalu. Pozwala:
- Wybrać prace z bazy (multiselect z filtrami: artysta, segment, idea, status)
- Ustawić **kolejność** (drag & drop lub input number)
- Dla każdej pracy: opcjonalne nadpisanie ceny (cena_w_ofercie_pln/eur), widoczność ceny (checkbox), komentarz kuratorski PL/EN/DE
- Podgląd live jak będzie wyglądać oferta

### 9.4. Generator URL i pakiet do wysyłki
Po zapisie oferty panel generuje:
- URL z tokenem (gotowe do skopiowania)
- Szablon maila (PL/EN/DE w zależności od `jezyk_oferty`) z linkiem i krótkim wstępem
- Opcjonalnie: PDF oferty (do załącznika lub do druku)

### 9.5. Tracking otworzeń (osobna tabela `oferty_analityka`)
```sql
CREATE TABLE oferty_analityka (
  id            uuid PRIMARY KEY,
  oferta_id     uuid NOT NULL REFERENCES oferty(id) ON DELETE CASCADE,
  data_otworzenia timestamptz NOT NULL DEFAULT now(),
  ip_hash       text,
  user_agent    text,
  sekcja        text,  -- 'lista_prac' / 'szczegol_pracy' / 'documents' / 'contact'
  praca_id      uuid REFERENCES prace(id) ON DELETE SET NULL  -- jeśli sekcja = szczegol_pracy
);
```

W panelu galerysta widzi: ile razy oferta była otwarta, kiedy ostatnio, które prace klient oglądał najdłużej.

---

## 10. STRONA PUBLICZNA NEXT.JS — komponenty do zbudowania

### 10.1. Komponenty wspólne (używane we wszystkich typach ofert)
- `<Header />` — logo + minimalna nawigacja
- `<PresentationHeader />` — typ prezentacji + tytuł + opis (różne warianty: kolekcja / archiwum / indywidualna)
- `<IdeaChips />` — chipy idei jako warstwa narracyjna (sekcja 4A)
- `<FilterBar />` — filtry sprzedażowe (artysta / segment / dziedzina / cena / szukaj), z propsem `mode="narrative-first"` lub `mode="sales-first"` decydującym o pozycji i wadze wizualnej
- `<WorkCard />` — uniwersalna karta pracy (różne gęstości, zawsze pokazuje pojęcia jako tag links + segment jako dyskretny podpis)
- `<WorkGrid />` — kontener gridu (2 lub 3 kolumny, z propsem)
- `<WorkDetail />` — szczegół pracy (lewa 70% / prawa 30%, sticky), prawa kolumna pokazuje obie warstwy klasyfikacji
- `<RelatedWorks />` — sekcja "Inne prace artysty" + "Podobne prace"
- `<Documents />` — sekcja dokumentów (PDF, biografie, condition reports)
- `<Contact />` — sekcja kontaktu (osobista, z podpisem galerysty)
- `<Footer />` — stopka

### 10.2. Strony (Next.js routes)
- `app/kolekcja/page.tsx` — oferta główna PL
- `app/viewing-room/page.tsx` — oferta archiwum PL z filtrami
- `app/viewing-room/[slug]/page.tsx` — konkretna oferta archiwum z tematem
- `app/oferta/[token]/page.tsx` — oferta indywidualna z tokenem
- `app/oferta/[token]/praca/[id]/page.tsx` — szczegół pracy w kontekście oferty
- `app/praca/[id]/page.tsx` — szczegół pracy publiczny
- `app/artysta/[slug]/page.tsx` — profil artysty
- `app/international/page.tsx` — strona główna International
- `app/international/central-european-conceptual-geometric-art/page.tsx` — główna oferta INT
- `app/international/selected-works/page.tsx` — oferta archiwum INT
- (i pozostałe wg punktu 7)

### 10.3. Logika dostępu
- Strony publiczne (`/kolekcja`, `/viewing-room`, `/praca/[id]`, profile artystów) — dostęp przez Supabase anon, używają widoków `prace_public`, `oferty_public`, `artysci_public` (filtrowanie po `widocznosc` i statusie)
- Strony z tokenem (`/oferta/[token]`) — server-side fetch oferty po tokenie, sprawdzenie czy istnieje i czy nie wygasła, dopiero wtedy renderowanie

---

## 11. RELACJA Z OBSZAREM 9 (INTERNATIONAL)

**Obszar 4 (Oferty)** częściowo nakłada się na **Obszar 9 (International)** — bo wersja International ofert to nie tylko tłumaczenie, lecz osobny program artystyczny.

Z konceptu International (punkty 7-12) wynika że International to:
- Osobna struktura URL `/international/...`
- Osobny zestaw artystów (14 zamiast tylko polskich rdzenia)
- Osobny SEO pod DACH/Italy/Central Europe
- Visual Wall jako fizyczna manifestacja
- Pola `int_*` na pracach, artystach, ofertach (częściowo zrobione w Sesji A)

**Sugestia rozdziału prac:**
- **Obszar 4 (ten dokument)** — system ofert jako całość (3 typy × 2 języki × kontekst kuratorski)
- **Obszar 9 (osobny dokument)** — kuratorska warstwa International (artyści, SEO niemieckie, strategia DACH, Visual Wall, tematy programowe EN/DE)

W praktyce oba obszary się przenikają — ale dokument koncepcyjny Obszaru 4 to fundament systemowy, a Obszar 9 to nadbudowa kuratorska. Łączą się przez pola `int_publiczne`, `int_segment`, `rynek_priorytetowy` w tabeli `oferty` i `prace`.

---

## 11A. AUTOMATYZACJA AI — co system robi za galerystę

**Zasada:** AI proponuje, galerysta zatwierdza. Wszystko edytowalne, nic na siłę.

Z dokumentu architektury (sekcja 5.6): *"AI pisze opisy, SEO, posty, maile (PL+EN, docelowo DE) z Twojego zasobu, w Twoim stylu"*. W Obszarze 4 konkretyzujemy to dla ofert i prac.

### 11A.1. Przy zapisie pracy w panelu CRM

Po wypełnieniu podstawowych pól pracy (artysta, tytuł, rok, technika, idea, segmenty, pojęcia, opis), galerysta klika **"Generuj automatycznie"** i AI proponuje:

#### Slug URL
Sanityzacja z artysty + tytułu + roku, bez polskich znaków:
```
artysta="Jarosław Kozłowski" + tytuł="Deka-log" + rok=1972
  → slug: "kozlowski-deka-log-1972"
```

#### SEO title PL/EN/DE
Szablon używa **segmentu** jako kontekstu (warstwa katalogowa świata):
```
PL: "Jarosław Kozłowski, Deka-log, 1972 | Polish Conceptual Art | Galeria ESTA"
EN: "Jarosław Kozłowski, Deka-log, 1972 | Polish Conceptual Art | Galeria ESTA"
DE: "Jarosław Kozłowski, Deka-log, 1972 | Polnische Konzeptkunst | Galeria ESTA"
```

#### SEO description PL/EN/DE
Krótki opis 140-160 znaków, wzbogacony **pojęciami** (warstwa kuratorska wzmacnia tekst SEO):
```
PL: "Praca z obszaru polskiej sztuki konceptualnej. Język, znak, system 
     w twórczości Jarosława Kozłowskiego — Galeria ESTA."
EN: "A work from the field of Polish conceptual art. Language, sign and system 
     in the practice of Jarosław Kozłowski — Galeria ESTA."
DE: "Eine Arbeit aus dem Bereich der polnischen Konzeptkunst. Sprache, Zeichen 
     und System im Werk von Jarosław Kozłowski — Galeria ESTA."
```

#### Alt zdjęć PL/EN/DE
Szablon: artysta + tytuł + rok + technika + segment, plus 1-2 pojęcia dla wzbogacenia:
```
PL: "Jarosław Kozłowski, Deka-log, 1972, akryl na papierze, polska sztuka 
     konceptualna, język znak, Galeria ESTA"
EN: "Jarosław Kozłowski, Deka-log, 1972, acrylic on paper, Polish conceptual art, 
     language sign, Galeria ESTA"
DE: "Jarosław Kozłowski, Deka-log, 1972, Acryl auf Papier, polnische Konzeptkunst, 
     Sprache Zeichen, Galeria ESTA"
```

#### Tłumaczenia opisu pracy
AI bierze polski opis pracy i tłumaczy na EN i DE w stylu galerii. Galerysta zatwierdza albo poprawia.

#### OG image i meta dla social
Automatyczne ustawienie `og:image` na pierwsze zdjęcie pracy, `og:title` = SEO title, `og:description` = SEO description.

### 11A.2. Przy tworzeniu oferty w panelu CRM

#### Szablon tytułu oferty
Na podstawie typu i kontekstu:
```
Indywidualna dla kolekcjonera Wandy K.:
  "Polska sztuka konceptualna — wybór dla Wandy K."
  EN: "Polish Conceptual Art — Private Selection"
  DE: "Polnische Konzeptkunst — Private Auswahl"

Tematyczna w archiwum:
  "Geometria / Struktura — wybór prac z zasobu"
  EN: "Geometry / Structure — selected works"
  DE: "Geometrie / Struktur — ausgewählte Arbeiten"
```

#### Wstęp oferty PL/EN/DE
AI generuje 3-5 zdań na podstawie:
- Typu oferty (kolekcja / archiwum / indywidualna)
- Wybranych prac i artystów
- Idei i pojęć
- Typu klienta (dla indywidualnej: collector / advisor / institution / architect)

#### Komentarze kuratorskie per praca w ofercie (D7)
W widgecie "Lista prac w ofercie" — dla każdej dodanej pracy AI proponuje krótki komentarz kuratorski (3-5 zdań, PL/EN/DE) wyjaśniający dlaczego ta praca w tej konkretnej ofercie.

AI bierze pod uwagę:
- Ogólny tekst kuratorski oferty
- Dane pracy (artysta, idea, pojęcia, segmenty)
- Opis pracy z bazy
- Kontekst innych prac w tej samej ofercie

#### Szablon maila do klienta (D6)
Gotowy mail z linkiem do oferty, w odpowiednim języku:
```
Szanowny Panie / Szanowna Pani,

z przyjemnością przygotowałem dla Pana/Pani kameralny wybór prac z obszaru 
polskiej sztuki konceptualnej. Prezentacja obejmuje 8 prac dialogujących 
z konceptualizmem Jarosława Kozłowskiego.

Prywatna prezentacja dostępna pod linkiem:
https://galeria-esta.pl/oferta/{token}

W razie pytań proszę o kontakt.

Z poważaniem,
Tadeusz Stapowicz
Galeria ESTA
```

#### Generator postów Instagram / Facebook
Krótki, wizualny, osobisty ton. Hasztagi, emocje, "link in bio". Cytaty kuratorskie, fragmenty pojęć. Domyślnie PL + EN.

Przykład:
```
Jan Chwałczyk
Światło, cień i problem reprodukcji.

Nowy wybór prac dostępny w przestrzeni viewing-room Galerii ESTA.
Link w bio.

#JanChwalczyk #PolishConceptualArt #ConceptualArt #GaleriaESTA
```

#### Generator postów LinkedIn (osobny przycisk, trzy języki)
LinkedIn to **rejestr profesjonalny** — architekci, kolekcjonerzy korporacyjni, doradcy inwestycyjni, instytucje, rynek DACH. Inny ton niż Instagram/Facebook.

Charakterystyka:
- Dłuższy post (200-400 słów)
- Bez emoji, bez nadmiaru hasztagów (lub minimum 3-5)
- Kontekst rynkowy, instytucjonalny, programowy
- Linkowanie do strony oferty/kolekcji
- **Trzy zakładki językowe: PL / EN / DE** — DE szczególnie ważne dla DACH

Przykład PL:
```
Galeria ESTA rozwija program międzynarodowy poświęcony 
środkowoeuropejskiej sztuce konceptualnej, konkretnej i geometrycznej.

Prezentujemy wybór prac łączący polską neoawangardę z szerszym 
dialogiem Europy Środkowej wokół systemu, struktury, języka 
i poezji konkretnej.

W programie m.in. Jarosław Kozłowski, Wanda Gołkowska, Stanisław Dróżdż,
István Haász, Viktor Hulík, Reinhard Roy.

Selected Works: galeria-esta.pl/international/selected-works/

#ConceptualArt #CentralEuropeanArt #PolishArt #PrivateCollection
```

Przykład EN:
```
Galeria ESTA develops an international program dedicated to Central 
European conceptual, concrete and geometric art.

We present a focused selection of works connecting Polish neo-avant-garde 
with broader Central European dialogues around system, structure, language 
and concrete poetry.

Featured artists include Jarosław Kozłowski, Wanda Gołkowska, 
Stanisław Dróżdż, István Haász, Viktor Hulík, Reinhard Roy.

Selected Works: galeria-esta.pl/international/selected-works/

#ConceptualArt #CentralEuropeanArt #ConcreteArt #GeometricArt
```

Przykład DE:
```
Galeria ESTA entwickelt ein internationales Programm, das der zentral- 
und osteuropäischen Konzeptkunst, konkreten Kunst und geometrischen 
Kunst gewidmet ist.

Wir präsentieren eine fokussierte Auswahl von Arbeiten, die polnische 
Neoavantgarde mit einem breiteren mitteleuropäischen Dialog über System, 
Struktur, Sprache und konkrete Poesie verbindet.

Im Programm u.a. Jarosław Kozłowski, Wanda Gołkowska, Stanisław Dróżdż, 
István Haász, Viktor Hulík, Reinhard Roy.

Ausgewählte Werke: galeria-esta.pl/international/selected-works/

#Konzeptkunst #KonkreteKunst #PolnischeKunst #Mitteleuropa
```

AI bierze pod uwagę:
- Typ oferty (kolekcja / archiwum / indywidualna)
- Wybrane prace i artystów
- Idee i pojęcia (warstwa narracyjna ESTA)
- Segmenty (warstwa SEO / klasyfikacja świata)
- Rynek priorytetowy oferty (DACH → DE dominuje, Italy → akcent włoski w EN)

Wzorzec techniczny: ten sam mechanizm AI co generator Instagram/Facebook (istniejący w panelu), tylko z innym promptem i wynikiem w trzech językach.

#### Newsletter
Spokojny ton, "Selected works from Galeria ESTA" (lub "Wybrane prace z Galerii ESTA" / "Ausgewählte Werke aus der Galeria ESTA"). Wybrane prace, krótkie konteksty, link do kolekcji. Trzy języki.

#### Schema.org dla strony pracy
Automatyczne wygenerowanie JSON-LD dla każdej pracy:
```json
{
  "@context": "https://schema.org",
  "@type": "VisualArtwork",
  "name": "Deka-log",
  "creator": { "@type": "Person", "name": "Jarosław Kozłowski" },
  "dateCreated": "1972",
  "artMedium": "acrylic on paper",
  "artform": "Polish conceptual art",
  "provider": { "@type": "ArtGallery", "name": "Galeria ESTA" }
}
```

### 11A.3. Co AI generuje automatycznie bez klikania "Generuj"

Niektóre pola system uzupełnia **w tle przy zapisie**, bez przycisku:

- **OG image** = pierwsze zdjęcie pracy (jeśli puste)
- **Canonical URL** = build z slug pracy
- **Robots meta** = `index,follow` dla publicznych, `noindex,nofollow` dla prac dostępnych tylko przez token
- **Created_at / updated_at timestamps** — standardowo
- **Hash IP klienta** w analityce ofert (dla śledzenia bez identyfikacji)

### 11A.4. Wzorzec techniczny — jak to wpisuje się w istniejący panel

Panel ESTA już ma generatory AI z dokumentu architektury (sekcja 7): "Generuj opis pracy", "Generuj SEO", "Dopasuj klientów AI", "Generuj post Instagram/Facebook".

W Obszarze 4 dodajemy:
- **Przycisk "Generuj automatycznie"** w modalu pracy (uruchamia wszystkie generatory naraz, zwraca propozycje do zatwierdzenia)
- **Przycisk "Generuj wstęp oferty"** w modalu oferty
- **Przycisk "Generuj komentarz"** per praca w widgecie listy prac w ofercie
- **Przycisk "Generuj mail"** w sekcji "Wyślij klientowi" w modalu oferty

Wszystkie używają tej samej infrastruktury Claude API co istniejące generatory panelu.

### 11A.5. Co to zmienia dla galerysty

**Dziś:** każdą ofertę galerysta klepi ręcznie — tytuł, wstęp, opisy, komentarze, mail. To 1-2h pracy per oferta.

**Po Obszarze 4:** galerysta wybiera prace, klika "Generuj automatycznie", dostaje 90% gotowego materiału. Koryguje 10% (osobiste szczegóły, niuanse). To 15-20 minut per oferta.

**Czas zaoszczędzony idzie w to co AI nie zrobi** — rozmowy z klientami, decyzje kuratorskie, jakość zakupu nowych prac, strategia.

### 11A.6. Kompletna mapa kanałów promocji ofert

Z dokumentu architektury (sekcja 5.3 marketingowa) i konceptu oferta/prezentacja (sekcja 25 sugestie marketingowe) wynika kompletna mapa kanałów. Każdy kanał generowany z tego samego materiału (oferta + prace + kontekst kuratorski), AI dostosowuje rejestr:

| Kanał | Charakter | Język | Generator AI | Status w panelu |
|---|---|---|---|---|
| **Email do klienta** (oferta indywidualna) | Osobisty, krótki, "prepared for" | PL/EN/DE | ✅ z modalu oferty | Dobudować w Obszarze 4 |
| **Newsletter** "Selected works from Galeria ESTA" | Spokojny, kuratorski, miesięczny | PL/EN/DE | ✅ z modalu oferty | Dobudować w Obszarze 4 |
| **Instagram / Facebook** | Wizualny, krótki, hasztagi, emocje | PL+EN | ✅ z modalu oferty | Istnieje w panelu, rozszerzenie do trzech języków |
| **LinkedIn** | Profesjonalny, dłuższy, instytucjonalny, kontekst rynkowy | **PL/EN/DE** (trzy zakładki) | ✅ z modalu oferty (NOWY) | Dobudować w Obszarze 4 |
| **Instagram Stories** | Wieloplanszowy, "oprowadzanie" po prywatnym view | PL+EN | Etap późniejszy | Po Obszarze 4 |
| **QR codes na targach** | Wizytówka z linkiem do prezentacji | n/d | Generator w panelu (osobny przycisk) | Etap późniejszy |
| **PDF oferty** (do druku lub mailowego załącznika) | Identyczny z online, do PDF eksport | PL/EN/DE | ✅ z modalu oferty (D6) | Dobudować w Obszarze 4 |

W modalu oferty CRM, sekcja **"Promocja"** ma cztery przyciski uruchamiające odpowiednie generatory:

```
[ Generuj Instagram/Facebook ]   [ Generuj LinkedIn ]
[ Generuj Email do klienta ]     [ Generuj Newsletter ]
[ Eksportuj PDF ]                [ Generuj QR code ]
```

Każdy generator otwiera modal z propozycją AI w odpowiednich językach, do zatwierdzenia lub korekty przez galerystę. Po zatwierdzeniu — kopiowanie do schowka, pobieranie pliku, lub wysyłka (jeśli email).

**LinkedIn z trzema językami** to specyficzny przypadek — bo to jedyny kanał profesjonalny gdzie warto mieć równoległą wersję DE. Instagram polski klient czyta po angielsku bez problemu, ale niemiecki manager kolekcji firmowej oczekuje komunikatu w swoim języku.

---

## 11B. AI MATCHING KLIENT ↔ PRACA — kompletna infrastruktura w bazie

Z dokumentu architektury (sekcja 5.6): *"AI dobiera kupca do pracy i pracę do kupca (główny problem sprzedażowy → automat)"*. Po analizie bazy (czerwiec 2026) widzimy że **cała infrastruktura już istnieje** — pozostaje implementacja logiki.

### 11B.1. Co mamy w bazie (zweryfikowane)

**Klasyfikacja prac (M:N):**
- `prace_segmenty` (Polish Conceptual Art, Concrete Poetry, Geometric Abstraction...)
- `prace_style` (Konceptualizm, Abstrakcja, Minimalizm...)
- `prace_dziedziny` (Prace na papierze, Obiekty, Rzeźba, Malarstwo...)
- Plus z Sesji A: `idee.idea_glowna_id`, M:N `pojecia_prace`, `prace.cena_oferowana`, `cena_eur`

**Klasyfikacja klientów (M:N — gotowe!):**
- `klienci_segmenty` — czym klient się interesuje (Polish Conceptual Art, Concrete Poetry...)
- `klienci_style` — jakie style
- `klienci_dziedziny` — jakie dziedziny
- `klienci.budzet_min/max` — w jakim przedziale szuka
- `klienci.zakres_cen` — kategoryzacja cenowa
- `klienci.typ_klienta` — collector / advisor / institution / architect

**Historia (dla wykluczania duplikatów):**
- `klienci_oferowane` — co już proponowano (z datą i notatką)
- `kolekcja_klienta` — co klient kupił

**Już zaczęta warstwa AI:**
- `klienci.ai_score` (integer) — rating dopasowania
- `klienci.ai_notatka` (text) — notatka AI

### 11B.2. Dwa scenariusze użycia

**Scenariusz A — galerysta ma pracę, szuka klienta:**

```
GIVEN: Praca "Kozłowski Deka-log" — Polish Conceptual Art, Konceptualizm,
       Prace na papierze, idea "Idea/Język", pojęcia [język, znak, system],
       cena_eur = 8000

FIND: klienci ORDERED BY score DESC LIMIT 10
WHERE:
  - klienci_segmenty zawiera "Polish Conceptual Art"
    (lub przekroje style/dziedziny dające >0 punktów)
  - klienci.budzet_min <= 8000 AND klienci.budzet_max >= 8000
  - klient_id NOT IN (SELECT klient_id FROM klienci_oferowane WHERE praca_id = "deka-log")
  - praca_id NOT IN (SELECT praca_id FROM kolekcja_klienta WHERE klient_id = klienci.id)

SCORE:
  +30 punktów za każdy wspólny segment
  +20 punktów za każdy wspólny styl
  +10 punktów za każdą wspólną dziedzinę
  +20 punktów jeśli cena_eur w przedziale 70-100% budżetu (sweet spot)
  +10 punktów jeśli cena_eur poniżej 50% budżetu (komfort)
  +15 punktów jeśli klient kupił już pracę tego artysty
  +10 punktów jeśli ostatni_kontakt < 90 dni
```

AI dodatkowo generuje **uzasadnienie** dla każdego klienta z top 10:
> "Anna Kowalska — wysoki score 87. Kolekcjonuje polski konceptualizm (3 prace 
> w kolekcji: Dróżdż, Dłużniewski, Chwałczyk). Budżet 5-15k EUR pasuje. 
> Ostatni kontakt 6 tygodni temu. Sugerowana strategia: e-mail z odniesieniem 
> do Dróżdża którego ma w kolekcji."

**Scenariusz B — galerysta ma klienta, szuka prac:**

```
GIVEN: Klient "Anna Kowalska" — klienci_segmenty zawiera "Polish Conceptual Art"
       i "Concrete Poetry", klienci_dziedziny zawiera "Prace na papierze",
       budzet 5000-15000 EUR

FIND: prace ORDERED BY score DESC LIMIT 20
WHERE:
  - prace.cena_eur BETWEEN 5000 AND 15000
  - prace.widocznosc = 'kolekcja' OR 'archiwum'
  - prace.status_handlowy = 'dostepna'
  - praca_id NOT IN (SELECT praca_id FROM klienci_oferowane WHERE klient_id = "anna")
  - praca_id NOT IN (SELECT praca_id FROM kolekcja_klienta WHERE klient_id = "anna")

SCORE: analogicznie + waga idei (Idea/Język = +25) + pojęć (wspólne pojęcie = +5)
```

AI generuje **propozycję oferty indywidualnej** — wybór 8-12 prac z najwyższym score, z gotowym wstępem oferty i komentarzami kuratorskimi.

### 11B.3. Workflow w panelu CRM

**Z modalu pracy:** przycisk "Dobierz klienta" → modal pokazuje top 10 klientów z score i uzasadnieniem AI → galerysta wybiera → przycisk "Stwórz ofertę z tą pracą".

**Z modalu klienta:** przycisk "Dobierz pracę" → modal pokazuje top 20 prac z score → galerysta zaznacza 8-12 → przycisk "Generuj ofertę indywidualną" — system tworzy szkic oferty z wybranymi pracami, automatycznie generuje wstęp i komentarze.

**Z listy ofert:** przycisk "Sugestie AI" → dla każdej oferty pokazuje "follow-up po 30 dniach", "klienci podobni do adresata" itp.

### 11B.4. Co już istnieje w panelu

Z dokumentu architektury (sekcja 7): *"silnik dopasowań AI; generatory opisów/postów/maili"*. Z transkryptów wcześniejszych sesji wiem że `esta-dopasowania-ai.html` to osobny moduł panelu (~63 KB). **Modul fizycznie istnieje, ale wymaga przejścia z klucza anon na Supabase Auth + persystencji wyników AI w bazie** (dziś wyniki znikają po odświeżeniu).

W Obszarze 4 dobudowujemy **integrację dopasowań z modulem ofert** — bezpośrednie wywołanie z modalu oferty zamiast osobnego ekranu.

---

## 12. PLAN ETAPOWY — kolejność implementacji

Bez konkretnych dat — kolejność logiczna, tempo zależne od Twojej dyspozycji.

### Etap 1: Fundament bazy
- Migracja SQL Obszaru 4: rozszerzenie tabeli `oferty` o pola typu/statusu/klienta/hero, nowe tabele `oferty_prace`, `prace_related`, `oferty_analityka`, uzupełnienie pól `int_*` na pracach
- Sprawdzenie i decyzja co do tabel `segmenty` / `style` / `dziedziny` (czy używamy istniejących, czy nowych)
- Widoki publiczne `oferty_public`, `oferty_prace_public` z odpowiednim filtrowaniem RLS

### Etap 2: Panel CRM moduł ofert
- Modal tworzenia/edycji oferty od zera (sekcje 1-6 z punktu 9.2)
- Widget "Lista prac w ofercie" z drag&drop (D4), cenami per oferta (D2), komentarzami PL/EN/DE (D7)
- **Integracja z infrastrukturą AI panelu** (sekcja 11A): "Generuj automatycznie" dla SEO/alt/slug, generator wstępu oferty, generator komentarzy kuratorskich per praca, generator maila do klienta
- Generator URL z tokenem dla ofert indywidualnych (D1)
- **Walidacja: minimum jeden segment** na każdej pracy przed zapisem
- Lista ofert w panelu z filtrami i sortowaniem

### Etap 3: Strona publiczna — komponenty wspólne
- Komponenty z punktu 10.1 (`<Header />`, `<WorkCard />`, `<WorkGrid />`, `<WorkDetail />`, `<RelatedWorks />`, etc.)
- Typografia, layout, CSS zmienne wg konceptu oferta/prezentacja
- Konfiguracja Next.js + Supabase client + auth

### Etap 4: Strona publiczna — pierwsza oferta indywidualna z tokenem
- Routing `/oferta/[token]` + `/oferta/[token]/praca/[id]`
- Pierwsza realna oferta wygenerowana z panelu → test end-to-end z polskim klientem
- Iteracja i poprawki na podstawie realnego użycia

### Etap 5: Strona publiczna — kolekcja i archiwum PL
- `/kolekcja` z 7 ideami programu + selekcja prac
- `/viewing-room` z filtrami z `collection.php`
- `/praca/[id]` jako wspólny widok szczegółu
- Profile artystów `/artysta/[slug]`

### Etap 6: International (PL → EN/DE)
- Routing `/international/*`
- Wersje EN/DE komponentów wspólnych
- Pierwsza oferta indywidualna w EN/DE dla niemieckiego klienta

### Etap 7: Sold/Related Works + Visual Wall
- Mechanizm utrzymania sprzedanych prac w bazie z sekcją Related
- Visual Wall jako osobna prezentacja na ekran 85" (Keynote lub strona web w trybie fullscreen)
- Tracking analityki ofert

### Etap 8: Iteracje i ulepszenia
- Optymalizacja SEO (schema.org dla VisualArtwork, hreflang)
- Hasła i daty wygaśnięcia dla ofert indywidualnych (jeśli potrzebne)
- Tabela `klienci` z FK zamiast pola tekstowego `klient_txt`
- Dodatkowe filtry, analityka, automatyzacja

**Etap 1 i 2 są niezbędne przed jakimkolwiek użyciem.** Etap 3 i 4 to absolutne MVP. Etap 5-8 to rozszerzenia w naturalnej kolejności.

---

## 13. KLUCZOWE DECYZJE — ROZSTRZYGNIĘTE

Decyzje strategiczne podjęte przez Tadeusza w czerwcu 2026:

### D1 — ROZSTRZYGNIĘTE: Token tylko dla ofert indywidualnych
Oferty publiczne (kolekcja i archiwum) mają stałe, czytelne URL bez tokena:
- `/kolekcja`
- `/viewing-room` lub `/viewing-room/[slug]` dla tematycznych
- `/international/...` dla wersji EN/DE

Pole `token` w tabeli `oferty` jest **wymagane tylko dla `typ_oferty = 'indywidualna'`**. Dla `kolekcja` i `archiwum` pole jest nullable (NULL).

To upraszcza architekturę i URL strony publicznej.

### D2 — ROZSTRZYGNIĘTE (skorygowane): Cena widoczna per typ oferty

**Korekta z dyskusji czerwiec 2026:** Tadeusz wyjaśnił że cena nie jest stała dla pracy — **jest negocjowana per klient w ofercie indywidualnej**. Klient korporacyjny pierwszy raz dostaje cenę katalogową; stały kolekcjoner z 5 zakupami dostaje rabat 10%; instytucja muzealna ma swoją cenę specjalną.

**Domyślne zachowanie ceny per typ oferty:**

- **`/kolekcja` (publiczna programowa):** cena domyślnie **UKRYTA**. To manifest kuratorski, nie sklep. Pokazujemy "Cena na zapytanie" lub całkowicie pomijamy. Galerysta może świadomie odsłonić cenę dla konkretnej pracy.

- **`/viewing-room` (publiczne archiwum):** cena domyślnie **WIDOCZNA** (jak w starym `collection.php`). Klienci przeglądający archiwum mają dostęp do orientacyjnych cen.

- **`/oferta/[token]` (indywidualna):** cena **WIDOCZNA** (kluczowy mechanizm sprzedaży). Galerysta wpisuje konkretną cenę dla konkretnego klienta w `oferty_prace.cena_w_ofercie`. Klient widzi swoją negocjowaną cenę.

**Cena per oferta jest persistentna historycznie:** ta sama praca w 5 różnych ofertach może mieć 5 różnych cen. Klient X widzi 18 000, klient Y widzi 22 000 — każdy w swojej ofercie, każda cena zafiksowana w momencie utworzenia oferty. Galerysta wracający za miesiąc do oferty X widzi tę samą cenę 18 000, nawet jeśli `prace.cena_oferowana` (cena katalogowa) w międzyczasie się zmieniła.

**Stan implementacji:**
- ✅ `/kolekcja` (Task B3): cena ukryta (showPrice={false} w `<WorkCard>`)
- ✅ `/praca/[slug]` (Task B4): cena widoczna (D23 wybrane Tadeusza)
- ⏳ `/viewing-room` (Task B5): cena widoczna (do zrobienia)
- ⏳ `/oferta/[token]` z listą prac (Task B7): cena z `oferty_prace.cena_w_ofercie` (do zrobienia)

**Pole `cena_widoczna BOOLEAN` w `oferty_prace`** zostaje jako mechanizm nadpisania per praca (np. w ofercie indywidualnej galerysta może ukryć cenę dla jednej konkretnej pracy nawet jeśli reszta ofert ma cenę widoczną).

**Logika domyślnego ustawiania `cena_widoczna` w panelu CRM przy dodawaniu pracy do oferty:**
- typ_oferty = 'kolekcja' → `cena_widoczna = false`
- typ_oferty = 'archiwum' → `cena_widoczna = true`
- typ_oferty = 'indywidualna' → `cena_widoczna = true`
- Galerysta świadomie nadpisuje dla konkretnej pracy

**Strategicznie dobra decyzja** — sztuka galeryjna nie jest produktem z metki. Cena jako element relacji w kolekcji programowej, narzędzie operacyjne w archiwum, negocjowana propozycja w ofercie indywidualnej.

### D3 — ROZSTRZYGNIĘTE: Tabela `klienci` jest bogata, używamy FK od razu

Tabela `klienci` ma już **30 pól** (zweryfikowane w bazie czerwiec 2026): identyfikacja, lokalizacja (`miasto`, `kraj`), klasyfikacja (`typ_klienta`, `zakres_cen`, `budzet_min/max`), preferencje (M:N `klienci_segmenty/style/dziedziny`), CRM operacyjny (`status_klienta`, `priorytet_kontaktu`, `ostatni_kontakt`, `liczba_ofert`, `wartosc_zakupow`), historia (`klienci_oferowane`, `kolekcja_klienta`), warstwa AI (`ai_score`, `ai_notatka`).

**To znacznie więcej niż "MVP klient_txt"** — możemy używać `klient_id` jako FK od razu.

W modalu oferty indywidualnej:
- **Dropdown z klientów** (zamiast pola tekstowego)
- Po wyborze klienta — system od razu wie: język preferowany (z kraju), budżet (do filtrowania prac), preferencje (do rankingowania prac), typ, historia ofert (żeby nie duplikować)
- Pole `klient_id` (uuid FK) w tabeli `oferty`, opcjonalne — bo oferty publiczne (kolekcja/archiwum) nie mają klienta

**Konsekwencja dla algorytmu AI "dobierz klienta do pracy" / "dobierz pracę do klienta":**
Mając kompletną infrastrukturę bazy — algorytm działa od razu, bez dodatkowych nakładów. Patrz sekcja 11B.

**Drobny dług techniczny:** tabela `klienci` ma jednocześnie stare pola tekstowe (`segmenty_ulubione`, `dziedziny_ulubione`, `style_ulubione` jako CSV) i nowe M:N (`klienci_segmenty/style/dziedziny`). To pozostałość z migracji starego Airtable. W Obszarze 4 **używamy tylko M:N**. Stare pola tekstowe — do sprzątnięcia w Obszarze 12 (analogicznie do `idee_glowne_txt` na artystach).

**Tabela `klienci_profil`** (16 pól, duplikuje większość pól z `klienci` plus `artysci_w_kolekcji`) — prawdopodobnie widok publiczny lub dług. Do weryfikacji w Obszarze 12, **nie blokuje** Obszaru 4.

### D4 — ROZSTRZYGNIĘTE: TAK, drag & drop dla kolejności prac w ofercie
W widgecie "Lista prac w ofercie" w panelu CRM — drag & drop dla `kolejnosc`. Galerysta przesuwa karty prac w górę/dół, system automatycznie aktualizuje pole `kolejnosc` w tabeli `oferty_prace`.

Implementacja: biblioteka HTML5 drag & drop API (natywna, bez zewnętrznych zależności) lub `sortablejs` (popularna, lekka).

To znacząco poprawia UX galerysty podczas tworzenia oferty — kuratorska kolejność prac to klucz dla narracji oferty.

### D5 — ROZSTRZYGNIĘTE: Visual Wall na później, po zakupie ekranu 85"
Visual Wall zostaje w dokumencie koncepcyjnym jako **planowana funkcjonalność**, ale **NIE implementujemy jej teraz**. Powód: Tadeusz jeszcze nie kupił ekranu 85".

Konsekwencja:
- Pola `int_visual_wall`, `int_visual_wall_tekst_pl/en/de` zostają w bazie (już są po Sesji A) — są gotowe do wypełnienia w przyszłości
- W modalu CRM zakładka "Visual Wall" zostaje, ale jako opcjonalna sekcja, nieblokująca głównego flow
- Strona web fullscreen `/visual-wall/[slug]` lub Keynote — decyzja po zakupie ekranu

### D6 — ROZSTRZYGNIĘTE: TAK, generujemy PDF jako załącznik, ale dopuszczamy inne formaty
Z każdej oferty (szczególnie indywidualnej) można wygenerować **PDF jako załącznik mailowy lub do druku**.

W panelu CRM przycisk "Generuj PDF" w sekcji oferty:
- Eksport oferty do PDF wg layoutu zgodnego z DNA wizualnym (Cormorant Garamond + Instrument Sans, grid 2-kolumnowy, prace + opisy)
- Możliwość pobrania pliku do załącznika mailowego

Plus opcja **dodawania innych załączników** (PDF zewnętrzny, fact sheet, condition report, biografia artysty, certyfikat) przez sekcję `oferty_dokumenty` — nowa tabela M:N do tabeli `oferty`:

```sql
CREATE TABLE oferty_dokumenty (
  id            uuid PRIMARY KEY,
  oferta_id     uuid NOT NULL REFERENCES oferty(id) ON DELETE CASCADE,
  typ          text NOT NULL,  -- 'pdf_oferty' / 'fact_sheet' / 'condition_report' / 'biography' / 'certificate' / 'inne'
  nazwa        text NOT NULL,
  url          text NOT NULL,  -- URL do Supabase Storage lub zewnętrzny
  kolejnosc    integer NOT NULL DEFAULT 0,
  created_at   timestamptz NOT NULL DEFAULT now()
);
```

Galerysta może też ręcznie dodać link do zewnętrznego PDFa (np. już istniejący w `esta-dokumenty.html`).

### D7 — ROZSTRZYGNIĘTE: AI generuje komentarze kuratorskie z korektą galerysty
W modalu CRM dla każdej pracy w ofercie pole `komentarz_kuratorski_pl/en/de` ma przycisk **"Generuj z AI"**.

Workflow:
1. AI bierze pod uwagę: ogólny tekst kuratorski oferty + dane pracy (artysta, idea, pojęcia, segment) + ewentualny opis pracy z bazy
2. Generuje propozycję krótkiego komentarza kuratorskiego (3-5 zdań) w PL
3. Galerysta widzi propozycję, edytuje wg uznania
4. Tłumaczenie EN i DE — AI generuje na podstawie zatwierdzonej wersji PL
5. Korekta EN/DE też przez galerystę

Wzorzec znany z innych modułów panelu (generator opisów prac, generator postów). Tutaj integracja z istniejącą infrastrukturą AI panelu.

To wpisuje się w warstwę AI z dokumentu architektury (sekcja 5.6): *"AI pisze opisy, SEO, posty, maile (PL+EN, docelowo DE) z Twojego zasobu, w Twoim stylu"*.

### D8 — ROZSTRZYGNIĘTE: Hasła i daty wygaśnięcia na później
W MVP token jest jedynym zabezpieczeniem oferty indywidualnej. Kto ma link — widzi.

Pola `data_waznosci` i `haslo_hash` zostają w tabeli `oferty` jako nullable — przygotowane na przyszłość, ale niewypełniane w tym etapie.

W drugiej iteracji (po pierwszych realnych użyciach) — dodamy:
- W modalu CRM checkbox "Ustaw datę wygaśnięcia" + date picker
- W modalu CRM checkbox "Ustaw hasło" + input
- Na stronie publicznej `/oferta/[token]` — formularz hasła jeśli `haslo_hash` istnieje, sprawdzenie `data_waznosci` przed wyświetleniem

To naturalne rozszerzenie po sprawdzeniu czy faktycznie potrzebne w realnej pracy.

---

## 13B. DECYZJE IMPLEMENTACYJNE (D9-D24) — z sesji czerwiec 2026

Decyzje techniczne i projektowe podjęte podczas budowania frontend strony publicznej (Task B1-B4) i panelu CRM (Task A1).

### D9 — Stylowanie Next.js: zostać przy inline styles

Po inwentaryzacji 16 istniejących routów (artyści, wystawy, idee, kompendium, blog) okazało się że wszystkie używają **inline styles** w stylu `const C = '"Cormorant Garamond"...'`. Tailwind v4 jest zainstalowany ale nieużywany.

**Decyzja:** zostać przy obecnym wzorcu dla Obszaru 4. Nie naruszamy 16 działających routów. Komponenty Obszaru 4 piszemy w tym samym wzorcu. Migracja na Tailwind = osobny refactor techniczny (Obszar 14), nie blokuje pracy nad ofertami.

### D10 — Drag & drop w panelu: SortableJS via CDN

Dla kolejności prac w ofercie indywidualnej (`oferty_prace.kolejnosc`):
- Krótki kod (~10 linii inicjalizacji vs ~50 native handlers)
- Sprawdzona biblioteka (tysiące galerii internetowych używa)
- Touch support out-of-the-box dla mobile
- Zero zależności w panelu poza CDN

### D11 — Cena per oferta: sugestia z `cena_oferowana`, fiksacja po zapisie

W modalu m-of przy dodawaniu pracy do oferty:
- Pole `cena_w_ofercie` startuje z wartością `prace.cena_oferowana` jako **sugestia**
- Galerysta świadomie modyfikuje lub akceptuje dla konkretnego klienta
- Po zapisaniu — cena zafiksowana w `oferty_prace` (nawet jeśli `prace.cena_oferowana` się potem zmieni)

Plus widget **"Historia tej pracy w ofertach"** — pokazuje galerystowi w jakich cenach była już oferowana, dla jakich klientów, z jakim rezultatem. Galerysta sam decyduje na podstawie kontekstu.

### D12 — Opisy ofert PL/EN/DE w zakładkach

Wzorzec z Sesji B1 (modale artystów, prac, wystaw, targów, blogów) — wszystkie pola tekstowe oferty mają zakładki PL/EN/DE z funkcją `lng()`. Dotyczy: `tytul`, `wstep`, `tekst_kuratorski`, `tekst_dla_klienta`, `seo_title`, `seo_description`.

### D13 — Konsolidacja Supabase client w `lib/supabase.ts`

Po inwentaryzacji okazało się że `./supabase.ts` istnieje ale nikt nie importuje. Każda strona robi własny `createClient`. To **must-fix przed Obszarem 4** żeby uniknąć debugowania 8 niezależnych instancji.

**Zrobione w Task B1** (commit 75a5415):
- Stworzony `lib/supabase.ts` jako singleton (6 linii)
- Stary `./supabase.ts` usunięty
- `app/targi/page.tsx` zmigrowany testowo (HTTP 200 PASS)
- Świadomy dług: pozostałe 7 page.tsx wciąż inline (artysci, artysta/[slug], idee, idee/[slug], kompendium, kompendium/[slug], targ/[url], wystawa/[url])

### D14 — Karta jednolita z propsami warunkowymi

Jeden komponent `<WorkCard>` używany na 3 stronach (kolekcja, viewing-room, oferta). Propsy:

```typescript
<WorkCard 
  praca={praca}
  kontekst="kolekcja"      // "kolekcja" | "viewing-room" | "oferta"
  showPrice={false}         // ukrywa lub pokazuje cenę
  showSegment={true}        // dyskretny podpis segmentu
  maxTags={3}               // 3 dla kolekcji, 4 dla viewing-room
  tagLinkBase="/kolekcja"   // patrz D16
/>
```

Jeden komponent, różne ekspozycje. Reuse w `/oferta/[token]` (Task B7).

### D15 — Linki w karcie

- **Zdjęcie + tytuł** → `/praca/[slug]` (wspólny szczegół pracy)
- **Nazwa artysty** → `/artysta/[slug]` (istniejący profil artysty)
- **Tag pojęcia** → filtr w kontekście, patrz D16

### D16 — Zamknięcie kontekstów + wyjątek oferta promuje kolekcję

**Zasada zamknięcia kontekstowego:** kolekcja i archiwum są samowystarczalne. Tag pojęcia klikany w karcie na `/kolekcja` filtruje **tylko prace z kolekcji**. Klikany na `/viewing-room` → tylko archiwum. Klient nie jest przerzucany między obszarami.

**Wyjątek strategiczny:** w ofertach indywidualnych tagi **ZAWSZE prowadzą do `/kolekcja`** (promocja publicznej strony jako "domu" galerii). Klient oferty indywidualnej odkrywa publiczny program galerii przez naturalne kliknięcia eksploracyjne.

**Mapa kierowania tagów:**

| Skąd klika | Dokąd prowadzi |
|---|---|
| `/kolekcja` | `/kolekcja?tag=...` |
| `/viewing-room` | `/viewing-room?tag=...` |
| `/oferta/[token]` | `/kolekcja?tag=...` (PROMOCJA) |
| `/praca/[slug]` | `/kolekcja?tag=...` (publiczny szczegół jest częścią galerii publicznej) |

### D17 — Placeholder dla braku zdjęcia: subtelne logo ESTA

Zamiast tekstu "Brak zdjęcia" (jak `collection.php`) — subtelny placeholder z napisem **ESTA** w Cormorant Garamond 32px, kolor #cfc6ba na tle #fbfaf8 (jaśniejszy niż tło strony). Galeria klasy europejskiej nie pisze "brak zdjęcia".

### D18 — URL szczegółu pracy: slug generowany w locie

Format: `/praca/[slug]` gdzie slug = `{artysta-slug}-{tytul-slug}-{rok}`.
Przykład: `/praca/josef-bauer-a-1971`

**Implementacja "dobrze ale bez specjalnego skomplikowania":**
- Slug generowany przez `workSlug()` w `lib/slug.ts`
- NIE przechowywany w bazie (zero migracji SQL)
- Wyszukiwanie: fetch wszystkich publicznych prac → filter w pamięci po wygenerowanym slug

**Świadomy dług:** workSlug może dawać duplikaty (rzadkie — dwie prace tego samego artysty o identycznym tytule i roku). Przy 500+ prac dodać kolumnę `slug` do bazy (Obszar 12).

### D19 — Layout szczegółu pracy: 70/30 desktop, stack mobile

- **Desktop (>900px):** lewa kolumna 70% z galerią (główne zdjęcie max 78vh + miniatury), prawa kolumna 30% sticky z danymi pracy
- **Mobile (<900px):** stack vertikalnie, sticky wyłączone

Wzorzec Nordenhake/PrivateViews — sprawdzony, profesjonalny.

### D20 — Galeria miniatur: client-side z onError

Dla każdej pracy w `<WorkGallery>` ('use client') próbujemy załadować 20 potencjalnych URL:
- `https://galeria-esta.pl/viewing-room/images/prace/{id_pracy}.jpg`
- `https://galeria-esta.pl/viewing-room/images/prace/{id_pracy}_2.jpg`
- ... do `_20.jpg`

Każda miniatura ma `onError` → pomijamy z UI. Jeśli wszystkie 20 dają 404 → placeholder ESTA.

### D21 — Sekcje sidebar pracy: puste ukrywane

W `<WorkDetailSidebar>` (Server Component):
- PROGRAM (idea + pojęcia) — pokazuje się jeśli `idea_glowna_id` lub `pojecia.length > 0`
- KLASYFIKACJA (segmenty + style + dziedziny) — jeśli `segmenty.length > 0` lub style/dziedziny
- PROWENIENCJA — jeśli pole niepuste
- WYSTAWY/BIBLIOGRAFIA — jeśli pola niepuste

Sekcje puste są ukrywane (zgodnie z `praca.php`). Mobile: wszystkie pokazane domyślnie (nie ma toggle — świadomy dług dla mikro-tasku).

### D22 — Related Works: i "Inne prace artysty" i "Podobne prace"

W Task B4 zaimplementowane **OD RAZU** oba (zamiast odkładać scoreSimilarity do Task B6).

Algorytm `scoreSimilarity` (z `praca.php` rozszerzony o idee/pojęcia):
- +30 wspólny segment (najwyższa waga, fundament klasyfikacji)
- +25 wspólna idea_glowna_id (kuratorskie podobieństwo)
- +15 wspólny styl
- +10 wspólna dziedzina
- +5×n wspólne pojęcia (max +15)
- +10 cena ±25%

Lokalizacja: `lib/scoreSimilarity.ts`.

### D23 — Cena na `/praca/[slug]`: WIDOCZNA

Publiczny szczegół pracy (z `widocznosc='kolekcja'` lub `widocznosc='archiwum'`) pokazuje cenę z `prace.cena_oferowana` jeśli jest. Spójność z `collection.php` (stary wzorzec) — orientacyjna cena pomocna dla klienta przeglądającego.

Decyzja niezgodna z D2 dla kolekcji (gdzie cena ukryta) — bo `/praca/[slug]` to **szczegół pracy**, nie kontekst kolekcji. Klient kliknął "Zobacz pracę →" świadomie szukając pełnych informacji.

### D24 — Breadcrumb z `widocznosc` pracy

Na `/praca/[slug]` breadcrumb pokazuje kontekst z którego pracy pochodzi:
- `widocznosc='kolekcja'` → "Galeria ESTA / KOLEKCJA / Bauer Josef — A, 1971"
- `widocznosc='archiwum'` → "Galeria ESTA / VIEWING ROOM / [tytuł]"

Prosty mechanizm, działa zawsze, bez query params ani Referer header.

---

## 13C. INFRASTRUKTURA ZAIMPLEMENTOWANA — strona publiczna (czerwiec 2026)

Sesja czerwcowa zbudowała pełen fundament strony publicznej Galerii ESTA. Stan po Task B1-B4:

### Pliki w repozytorium `~/Documents/galeria-esta/`

**Helpers (lib/):**
- `lib/supabase.ts` — singleton Supabase client (Task B1)
- `lib/slug.ts` — `artistSlug()` + `workSlug()` z normalizacją polskich znaków (Task B4)
- `lib/scoreSimilarity.ts` — algorytm rekomendacji prac (Task B4)

**Komponenty (components/):**
- `components/WorkCard.tsx` — uniwersalna karta pracy (Server Component) z propsami warunkowymi (Task B3)
- `components/WorkImage.tsx` — obraz w polu 4:3 z onError fallback (Client Component) (Task B3 + fix kadrowania)
- `components/WorkGallery.tsx` — galeria główne zdjęcie + miniatury 1-20 (Client Component) (Task B4)
- `components/WorkDetailSidebar.tsx` — prawa kolumna 30% z danymi pracy (Server Component) (Task B4)
- `components/RelatedWorks.tsx` — grid mini-WorkCard dla sekcji related (Server Component) (Task B4)

**Routy (app/):**
- `app/kolekcja/page.tsx` — żywa strona z fetch prac `widocznosc='kolekcja'`, grid 2-kolumnowy, filtr ?tag= (Task B3)
- `app/praca/[slug]/page.tsx` — szczegół pracy 70/30, galeria + sidebar + related works (Task B4)
- `app/oferta/[token]/page.tsx` — szkielet bez listy prac, fetch oferty po tokenie (Task B2)

### Stan bazy danych

**Tabela `prace`:**
- 108 prac w bazie
- 14 prac z `widocznosc='kolekcja'` (Bauer, Berdyszak, Roy, Chwałczyk, Kossakowski, Sobczyk, Zilocchi + 7 innych)
- 15/108 prac z segmentami (niejednolite pokrycie)
- 0 prac z pojęciami (`pojecia_prace` puste — uzupełnimy przez panel)
- 25/42 artystów z `url_artysty` (50% prac kolekcji ma NULL — fallback przez `artistSlug` helper)

**Zdjęcia:**
- W bazie: 0 (brak `prace.zdjecie_hero`, brak tabeli `prace_zdjecia`)
- Na TheCamels CDN: setki zdjęć z 28 lat działalności pod schematem `https://galeria-esta.pl/viewing-room/images/prace/{id_pracy}.jpg`
- Strategia: 3-poziomowy fallback (Supabase Storage przyszłości → TheCamels CDN → placeholder ESTA)
- Migracja do Supabase Storage: osobny Obszar 3 na przyszłość

### Stan deployu

**Production URL:** `https://galeria-esta.vercel.app`
- `/kolekcja` ✅ ZROBIONE (14 prac, każda karta linkuje do `/praca/[slug]`)
- `/praca/[slug]` ✅ ZROBIONE (np. `/praca/josef-bauer-a-1971` — pełen szczegół z galerią + sidebar + 8 podobnych prac)
- `/viewing-room` ⏳ DO ZROBIENIA (Task B5)
- `/oferta/[token]` ⏳ CZĘŚCIOWO (szkielet bez listy prac, Task B7 dokończenie)

### Świadome długi techniczne do uporządkowania

1. **workSlug duplikaty** — przy 500+ prac dodać kolumnę `slug` do bazy (Obszar 12)
2. **generateMetadata fetch all** — przy 1000+ prac dodać cache lub dedykowany SELECT po slug
3. **Sekcje sidebar mobile** — toggle z + przyciskami (mikro-task)
4. **Inline styles w 8 page.tsx** — osobny refactor (Task B1 odsłonił dług)
5. **Migracja zdjęć** do Supabase Storage — Obszar 3
6. **Pojęcia/segmenty w bazie** — uzupełnić przez panel CRM dla 14 prac kolekcji
7. **Modal m-of typ_oferty** — Task A1.5 niedokończone (panel pyta o typ_oferty, semantyczny błąd, do uproszczenia)
8. **Lista prac w ofercie** — Task A2 (drag&drop, ceny per oferta, opisy PL/EN/DE) — kluczowe dla `/oferta/[token]`

---

## 13A. SYNTEZA DECYZJI — wpływ na model danych

Po rozstrzygnięciu D1-D8 oraz audycie bazy (czerwiec 2026) model danych Obszaru 4 jest następujący.

### Co JUŻ istnieje w bazie (zweryfikowane)

**Klasyfikacja (wszystko gotowe):**
- ✅ `segmenty` — z pełną warstwą SEO (slug, h1, opis_publiczny, seo_title, seo_description, url, aktywny_publicznie, priorytet_seo)
- ✅ `style` (id, nazwa)
- ✅ `dziedziny` (id, nazwa)
- ✅ M:N `prace_segmenty`, `prace_style`, `prace_dziedziny`

**Klienci (kompletna infrastruktura CRM):**
- ✅ `klienci` — **30 pól**: identyfikacja, lokalizacja (miasto, kraj), klasyfikacja (typ_klienta, zakres_cen, budzet_min/max), preferencje (segmenty_ulubione, dziedziny_ulubione, style_ulubione + M:N), CRM operacyjny (status_klienta, priorytet_kontaktu, ostatni_kontakt, liczba_ofert, wartosc_zakupow), AI (ai_score, ai_notatka)
- ✅ M:N `klienci_segmenty`, `klienci_style`, `klienci_dziedziny`
- ✅ `klienci_oferowane` (historia: kto co dostawał, data, notatka)
- ✅ `kolekcja_klienta` (jakie prace klient kupił/posiada)
- ⚠️ `klienci_profil` — duplikuje większość `klienci`, prawdopodobnie dług (do Obszaru 12)

**Oferty (częściowo gotowe):**
- ✅ Tabela `oferty` z polami z Sesji A: `idea_glowna_id`, `int_publiczne`, tytul/wstep/tekst_kuratorski/tekst_dla_klienta PL/EN/DE, seo_* PL/EN/DE
- ✅ M:N `pojecia_oferty` (Sesja A)
- ✅ M:N `oferty_prace` z polami: `oferta_id`, `praca_id`, `kolejnosc`, `opis_do_oferty`, `cena_w_ofercie`

**Prace:**
- ✅ Wszystkie pola Obszaru 0 (statusy, ceny)
- ✅ Wszystkie pola Sesji A (idea_glowna_id, int_publiczne, int_visual_wall, cena_eur, M:N pojecia_prace, pola EN/DE)
- ✅ M:N `prace_segmenty/style/dziedziny`

### Co dobudowujemy w Obszarze 4

**Rozszerzenie tabeli `oferty` (kolumny do dodania):**
- `typ_oferty` (text — `kolekcja` / `archiwum` / `indywidualna`) — NOT NULL po migracji
- `token` (text, nullable) — wymagane tylko dla `typ_oferty='indywidualna'` (D1)
- `status_oferty` (text — `robocze` / `do_uzupelnienia` / `gotowe` / `wysłane` / `follow_up` / `zamknięte` / `sprzedaz`)
- `klient_id` (uuid FK do `klienci`, nullable) — bo oferty publiczne nie mają klienta (D3)
- `data_wyslania` (date, nullable)
- `data_follow_up` (date, nullable)
- `data_waznosci` (date, nullable — D8: NULL w MVP)
- `haslo_hash` (text, nullable — D8: NULL w MVP)
- `jezyk_oferty` (text — `pl` / `en` / `de` / `en_de` / `pl_en` / `pl_en_de`)
- `typ_oferty_szczegolowy` (text z 9 wartości konceptu International)
- `rynek_priorytetowy` (jsonb lub M:N) — DACH/Italy/Central Europe/etc.
- `hero_url` (text, nullable)
- `hero_focalpoint_x`, `hero_focalpoint_y` (numeric, nullable)
- `accent_color` (text, nullable)

**Rozszerzenie tabeli `oferty_prace` (kolumny do dodania):**
- `cena_w_ofercie_eur` (numeric, nullable) — bo już mamy `cena_w_ofercie` jako PLN
- `cena_widoczna` (boolean DEFAULT false) — D2: domyślnie ukryta
- `opis_do_oferty_en` (text, nullable) — konsystencja z bazą EN/DE
- `opis_do_oferty_de` (text, nullable) — konsystencja
- `status_w_ofercie` (text, nullable) — opcjonalne nadpisanie statusu pracy

**Nowe tabele:**

```sql
-- D6: PDF i inne załączniki
CREATE TABLE oferty_dokumenty (
  id            uuid PRIMARY KEY,
  oferta_id     uuid NOT NULL REFERENCES oferty(id) ON DELETE CASCADE,
  typ          text NOT NULL,
  nazwa        text NOT NULL,
  url          text NOT NULL,
  kolejnosc    integer NOT NULL DEFAULT 0,
  created_at   timestamptz NOT NULL DEFAULT now()
);

-- Sold/Related Works
CREATE TABLE prace_related (
  id            uuid PRIMARY KEY,
  praca_id      uuid NOT NULL REFERENCES prace(id) ON DELETE CASCADE,
  related_id    uuid NOT NULL REFERENCES prace(id) ON DELETE CASCADE,
  kolejnosc     integer NOT NULL DEFAULT 0,
  created_at    timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT prace_related_unique UNIQUE (praca_id, related_id)
);

-- Tracking otworzeń ofert
CREATE TABLE oferty_analityka (
  id            uuid PRIMARY KEY,
  oferta_id     uuid NOT NULL REFERENCES oferty(id) ON DELETE CASCADE,
  data_otworzenia timestamptz NOT NULL DEFAULT now(),
  ip_hash       text,
  user_agent    text,
  sekcja        text,
  praca_id      uuid REFERENCES prace(id) ON DELETE SET NULL
);
```

**Uzupełnienie pól `int_*` w `prace`** (z konceptu International, niezrobione w Sesji A):
- `int_priorytet` (text — `1_kluczowa` / `2_mocna` / `3_uzupelniajaca`)
- `int_status` (text z 9 wartości: `robocze` / `do_opisu_pl` / `do_opisu_en` / `do_opisu_de` / `gotowe` / `opublikowane` / `wysłane` / `sprzedane` / `archiwalne`)
- `int_visual_wall_tekst_pl/en/de` (text — D5: zostają, niewypełniane teraz)
- `int_notatki` (text — wewnętrzne)
- `rynek_priorytetowy` (jsonb lub M:N — analogicznie do oferty)

### Walidacja w panelu — minimum jeden segment

**Obowiązkowe pole:** każda praca musi mieć przynajmniej jeden segment przypisany przez M:N `prace_segmenty`. To wynika z fundamentalnej zasady sekcji 4A — segment jest fundamentem SEO i klasyfikacji świata.

W modalu CRM pracy:
- Sekcja "Klasyfikacja" ma na górze alert walidacyjny: *"Praca musi mieć przynajmniej jeden segment do SEO i wyszukiwania"*
- Przycisk "Zapisz" jest nieaktywny dopóki nie wybrano minimum jednego segmentu
- Idee, pojęcia, style, dziedziny są opcjonalne — segment jest twardy

### Skala migracji Obszaru 4 (po uwzględnieniu bazy)

**Znacznie mniejsza niż początkowo zakładano** — bo cała infrastruktura klasyfikacji (segmenty/style/dziedziny + M:N), klientów (30 pól + M:N + historia) i podstawowych ofert (z Sesji A) już istnieje.

| Element | Stan |
|---|---|
| Tabele klasyfikacji (`segmenty`, `style`, `dziedziny`) | ✅ Gotowe |
| M:N klasyfikacji (`prace_*`) | ✅ Gotowe |
| Tabela `klienci` (30 pól) | ✅ Gotowa |
| M:N klientów (`klienci_*`) | ✅ Gotowe |
| Historia ofert klientom | ✅ `klienci_oferowane`, `kolekcja_klienta` |
| Tabela `oferty` podstawowa | ✅ Z Sesji A (idea, pojęcia, int_publiczne, PL/EN/DE) |
| M:N `oferty_prace` z `kolejnosc` | ✅ Istnieje (dobudować 5 kolumn) |
| Rozszerzenie `oferty` o pola Viewing Room | ⏳ Dobudować ~14 kolumn |
| Tabela `oferty_dokumenty` | ⏳ Nowa (D6) |
| Tabela `prace_related` | ⏳ Nowa (Sold/Related Works) |
| Tabela `oferty_analityka` | ⏳ Nowa (tracking otworzeń) |
| Uzupełnienie `prace.int_*` | ⏳ Dobudować ~5 kolumn |

**Razem migracja Obszaru 4 to ~24 nowe kolumny + 3 nowe tabele.** Wcześniejsze szacunki "wielkiej migracji" — nieaktualne. Pracujemy na fundamencie który już zbudowałeś.

---

## 14. PODSUMOWANIE — co ten system zmienia

**Dziś (stara strona + Airtable):**
- Oferta to PDF wysłany mailem albo link do `viewing-room/collection.php`
- Każda oferta ręcznie sklejana z różnych źródeł
- Brak spójności wizualnej między różnymi typami prezentacji
- Brak analityki kto i kiedy oglądał

**Po wdrożeniu Obszaru 4:**
- Każda prezentacja prac galerii (kolekcja / archiwum / indywidualna) ma to samo DNA wizualne
- Klient rozpoznaje galerię ESTA niezależnie od typu oferty
- Galerysta tworzy ofertę indywidualną w 10 minut (wybór prac + komentarze + generuj token)
- Sprzedane prace zostają jako kapitał SEO i Related Works
- International jako osobna warstwa kuratorska otwiera rynek DACH/Italy/Central Europe
- Analityka pokazuje co klient ogląda, kiedy, jak długo

**System nie zastępuje galerysty — wzmacnia go.** Ty wprowadzasz raz (praca, idea, pojęcie), system mnoży na kolekcję, archiwum, ofertę indywidualną, Visual Wall, posty, mailing. Marketing przestaje być osobną pracą — staje się produktem ubocznym pracy z bazą.

**Najważniejszy efekt:** ESTA wygląda i działa jak galeria klasy europejskiej. Z polskim DNA, kuratorskim programem, 28-letnią historią. Otwarta na polskich kolekcjonerów (rdzeń) i międzynarodowych (potencjał).

---

*Dokument koncepcyjny z rozstrzygniętymi decyzjami strategicznymi (D1-D8). Następny krok: konkretna migracja SQL Obszaru 4 i implementacja w naturalnej kolejności etapów (sekcja 12).*
