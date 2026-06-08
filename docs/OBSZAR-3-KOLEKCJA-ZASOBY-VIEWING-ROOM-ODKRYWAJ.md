# OBSZAR 3 — KOLEKCJA, ZASOBY, VIEWING ROOM I ODKRYWAJ DALEJ

## Architektura publicznej strony Galerii ESTA — wersja ostateczna

**Wersja dokumentu:** 1.0 (czerwiec 2026)
**Status:** ostateczna synteza koncepcyjna po wielomiesięcznej pracy
**Autor:** Tadeusz Stapowicz, Galeria ESTA

---

## 0. ZASADA NADRZĘDNA — odkrywanie zamiast tłumaczenia

Galeria ESTA przez 28 lat budowała konsekwentny program artystyczny wokół polskiej i środkowoeuropejskiej sztuki konceptualnej, geometrycznej, poezji konkretnej, fotografii i archiwum. Nowa strona internetowa nie ma być wykładem o tym programie. Ma być **przestrzenią jego odkrywania**.

Klient nigdy nie powinien mieć poczucia, że czyta system. Powinien mieć poczucie, że odkrywa galerię. A system ma działać pod spodem.

### Najgłębsza zasada projektowania

> **Najważniejsze jest gdy dochodzimy sami do czegoś — nawet gdy to jest z góry zamierzony cel kogoś innego. Mamy bardzo subtelnie dawać odbiorcy poczucie wartości własnej.**

To zdanie jest fundamentem całego projektu. Każdy element interfejsu — każdy filtr, każdy nagłówek, każdy link, każda etykieta — musi przejść test:

> "Czy to pozwala klientowi **samemu** coś odkryć, czy mu mówi **co ma myśleć**?"

Jeśli element mówi klientowi co ma myśleć — usuwamy go lub przeprojektowujemy. Jeśli element zostawia przestrzeń do samodzielnego odkrycia — zostaje.

To poziom projektowania, którego bardzo niewiele galerii internetowych w ogóle rozważa. Większość galerii mówi klientowi: "to jest minimalizm", "to konceptualizm", "to artysta z lat 70". Galeria ESTA pokazuje prace, daje subtelne ślady, i pozwala klientowi **samodzielnie dojść do wniosków**. To różnica między galerią która tłumaczy a galerią która prowadzi do odkrywania.

### Ścieżka klienta

Cały serwis prowadzi użytkownika jedną ścieżką:

**zachwyt → ciekawość → powiązanie → odkrycie programu → zapytanie o pracę**

Po 15 sekundach klient ma poczuć: "to nie jest zwykła galeria."
Po minucie: "jest tu jakiś porządek i konsekwencja."
Po 5 minutach: "chcę oglądać dalej."
Po 20 minutach klient sam dochodzi do wniosku: "ta galeria od 28 lat mówi o tych samych ważnych rzeczach, tylko za pomocą różnych artystów."

I właśnie wtedy idee spełniają swoją rolę — są niewidoczne, a jednocześnie obecne wszędzie.

### Niewidzialna struktura kuratorska — idee i pojęcia podprogowo

Idee, pojęcia, segmenty, style i dziedziny są silnikiem pod maską. Klient nie musi wiedzieć, że istnieją. Dzięki nim strona zachowuje się jak dobrze zaprojektowane muzeum albo świetnie skomponowana wystawa.

**Idee działają tak samo podprogowo jak pojęcia.** Nazwy idei (Idea/Język, Geometria/Struktura, Słowo/Znak, Światło/Przestrzeń, Pamięć/Archiwum, Obraz/Komunikat, Współczesne kontynuacje) **w większości miejsc nie pojawiają się jako etykiety sekcji** w widoku publicznym. Idea jest mechanizmem klasyfikacji w bazie:

- steruje algorytmem "Odkrywaj dalej"
- jest fundamentem `scoreSimilarity`
- łączy prace w Viewing Roomach
- używana do sortowania i linkowania
- pozwala na budowanie subtelnych powiązań

**Jeden ważny wyjątek: strona artysty `/artysta/[slug]`.**

Profil artysty zachowuje **linię programową z nazwą głównej idei**. To nie jest "etykieta katalogowa" — to **identyfikacja artysty w kontekście programu galerii**. Klient odwiedzający profil Wandy Gołkowskiej, Jana Chwałczyka czy Jarosława Kozłowskiego ma prawo zobaczyć kim oni są w narracji Galerii ESTA. Artysta ma prawo do **swojej linii programowej**.

Przykład na stronie artysty:

```
WANDA GOŁKOWSKA
1928 — 2013

Geometria / Struktura
układ otwarty · system · relacja · powtórzenie
```

To jedyne miejsce w publicznej części serwisu gdzie nazwa idei pojawia się jako etykieta tekstowa. Działa tam jak **dedykacja, identyfikacja, świadectwo programu** — nie jak filtr czy nagłówek katalogowy.

**Wszędzie indziej:**
- na kartach prac (Kolekcja, Zasoby, Viewing Room, oferty) → bez nazwy idei
- w sidebarze szczegółu pracy → bez nazwy idei
- w sekcji "Wątki programu" na stronie głównej → bez nazw idei
- w module "Odkrywaj dalej" → bez nazwy idei jako etykiety sekcji
- na stronach `/kolekcja`, `/zasoby`, `/viewing-room` → bez nazw idei

Klient samodzielnie dostrzega obszary kuratorskie przez pojęcia, prace i dialogi między nimi. Tylko strona artysty stanowi wyjątek, gdzie program galerii deklaruje "to jest miejsce tego artysty w naszej narracji".

Nie pokazujemy systemu. Pokazujemy skutki działania systemu.

---

## 1. CZTERY ŚWIATY GALERII ESTA

Nowa strona organizuje się wokół czterech światów. Każdy ma osobną funkcję, osobną estetykę i osobny tryb dostępu, ale wszystkie korzystają z tej samej bazy danych. Praca jest jednym rekordem w bazie, ale może być pokazywana w różnych kontekstach.

### KOLEKCJA — rdzeń programu galerii

**Kim ESTA jest dziś programowo.**

Aktualny, świadomie wybrany profil galerii. Rdzeń artystów konceptualnych, geometrycznych, fotograficznych. Współczesne kontynuacje. Idee i pojęcia działają tutaj jako niewidzialna oś kuratorska. Klient widzi piękne prace, świetną selekcję, mocnych artystów. Stopniowo odkrywa, że wszystko jest połączone.

W menu: pozycja **KOLEKCJA**.
Adres: `/kolekcja/`
Stan implementacji (czerwiec 2026): **wizualnie prawie gotowa** (Task B3 + naprawa kadrowania obrazów). 14 prac z `widocznosc='kolekcja'` na żywej stronie. Wymaga korekt filozoficznych — przeniesienie akcentu z widocznych idei i ich definicji na delikatne linki pod pracami, artystami i wystawami.

### ZASOBY — biblioteka 28 lat działalności

**Co ESTA zgromadziła przez lata.**

Nie archiwum w sensie martwego magazynu. Rozszerzona biblioteka prac, artystów i śladów 28-letniej działalności. Miejsce dla prac, które nie należą bezpośrednio do aktualnego rdzenia Kolekcji, ale są efektem historii galerii — dawnych wystaw, targów, współprac, komisów i kontaktów. Mogą być bardzo ciekawe kolekcjonersko. Mogą później wejść do Viewing Roomów jako elementy nieoczywistych relacji.

W menu: nowa pozycja **ZASOBY**.
Adres: `/zasoby/`
Stan implementacji: **do zbudowania** (Task B5 w zaktualizowanej formie).

Tu są artyści, którzy sami mogliby być osią programu galerii — Josef Bauer, Vera Molnar, Ryszard Winiarski, Jan Berdyszak, Pamuła, Zilocchi, Wilding, Łapiński, Kossakowski, Pierściński, Lasocki — ale którzy w obecnym profilu Galerii ESTA pełnią rolę gości, kontekstów i pomostów. Zasoby nie są galerią "drugiej kategorii". To inteligentny zapas relacji.

### VIEWING ROOM — kuratorskie wirtualne wystawy

**Jak ESTA interpretuje oba światy dziś.**

NIE jest ofertą. NIE jest katalogiem. NIE ma własnych prac — korzysta z prac znajdujących się w Kolekcji i Zasobach. To **format kuratorski**, miniwystawa online, wirtualna ekspozycja.

W menu: pozycja **VIEWING ROOM**.
Adres: `/viewing-room/`
Stan implementacji: **pusta strona, czeka na nową funkcjonalność** (Task B5 zaktualizowany — wirtualne wystawy).

Każdy Viewing Room odpowiada na jedno pytanie: "co łączy te prace?" Nie "jakie prace są dostępne?". Zestawia prace z Kolekcji i Zasobów w nieoczywiste relacje. Buduje narracje. Wykorzystuje 28-letni materiał galerii do tworzenia nowych spotkań i interpretacji.

To miejsce, gdzie zaczyna się **efekt kuratorski** — bardzo dobry, dojrzały, wizualnie ekspresyjny rezultat oparty na merytoryce galerii.

### OFERTY INDYWIDUALNE — prywatne prezentacje z tokenem

**Co galerysta przygotował dla konkretnego klienta.**

Prywatna prezentacja dla konkretnej osoby. Każda oferta ma unikalny token, dedykowanego klienta, własną listę prac z indywidualnymi cenami negocjowanymi per kontakt. Nie jest częścią publicznej strony.

W menu publicznym **NIE WIDNIEJE**.
Adres: `/oferta/[token]` (dostęp tylko przez unikalny link).
Stan implementacji: częściowo (Task B2 szkielet bez listy prac, Task A1 panel z modalem m-of). Do dokończenia w przyszłych sesjach.

Tutaj NIC FUNKCJONALNIE się nie zmienia po obecnej reorganizacji. Zmienia się tylko **spójność wizualna** — idee i pojęcia przy pracach działają delikatnie, tak samo jak w Kolekcji i Zasobach. Cały system ma jedno DNA wizualne przez wszystkie cztery światy.

---

## 2. KOLEKCJA — korekty wobec obecnego stanu

### Filozofia korekty

Obecnie zaimplementowana `/kolekcja` pokazuje 14 prac z `widocznosc='kolekcja'` w gridzie 2-kolumnowym. Każda karta zawiera artystę, tytuł, technikę, wymiary i jeden segment. To dobry fundament, ale potrzebuje korekty filozofii prezentacji.

**Co należy zmienić:**

Idee przestają być eksponowane jako filtry główne ani sekcje nazwane "Idee". Stają się ścieżkami odkrywania. Pod każdą pracą pojawia się dyskretna linia pojęć, która działa jako klikalne linki prowadzące do dalszej eksploracji. Pod artystą pojawia się subtelna linia programu galerii. Te elementy nie są etykietami — są drogowskazami.

**Co należy zachować:**

Grid 2-kolumnowy, typografia Cormorant Garamond + Instrument Sans, fallback zdjęć do TheCamels CDN, helpery `lib/slug.ts` i `lib/scoreSimilarity.ts`, komponent `<WorkCard>` z propsami warunkowymi, strona `/praca/[slug]` z szczegółem pracy.

### Struktura strony `/kolekcja`

**Sekcja 1: Hero**

Jedna mocna praca w pełnym kadrze. Nie kolaż, nie slider. Jedna praca i duży oddech. Po lewej praca, po prawej minimalistyczny tekst:

> KOLEKCJA GALERII ESTA
>
> Conceptual art, geometry, image and archive.
> Polish neo-avant-garde and its contemporary continuations.

Pod tym dwa przyciski (subtelne, tekstowe):

- Przeglądaj prace →
- Zobacz program →

**Sekcja 2: Wybrane prace**

8-12 prac dobranych kuratorsko (pole `pokaz_na_home` lub priorytet w bazie). Grid 2-kolumnowy. Każda karta to istniejący komponent `<WorkCard>`.

Pod każdą pracą:

```
JAN CHWAŁCZYK
Bez tytułu, 1978
papier, technika własna
40 × 50 cm

światło · cień · projekcja
```

Linia pojęć to **klikalne linki** prowadzące do filtrowanej Kolekcji (zamknięty kontekst — zostają w Kolekcji).

**Sekcja 3: Wątki programu (bez nazywania idei)**

Sześć poziomych sekcji, każda z 2-3 reprezentatywnymi pracami. **Sekcje nie mają nazw idei jako tytułów.** Klient widzi prace i pojęcia — sam dostrzega rytm i obszary myślenia galerii.

Każda sekcja zawiera:
- 2-3 prace w gridzie (różni artyści — to ważne, klient widzi że pojęcia łączą wiele osób)
- Pod gridem subtelna linia pojęć (Instrument Sans 11px, kolor #888, klikalne)
- **Bez nagłówka sekcji** lub z bardzo dyskretnym znacznikiem porządkowym (np. mały rzymski numer "I", "II", "III" obok pojęć)

Przykład pierwszej sekcji:

```
[2-3 prace Kozłowskiego, Dłużniewskiego, Dróżdża]

pojęcie · paradoks · definicja · instrukcja
```

Przykład drugiej sekcji:

```
[2-3 prace Dróżdża, Twożywa, Kozłowskiego]

poezja konkretna · typografia · znak · komunikat
```

I tak dalej dla pozostałych obszarów (układ/rytm/system, światło/cień/projekcja, fotografia/archiwum/ślad, malarstwo/komunikat/ironia).

**Sekcja jako całość** ma wspólny rytm wizualny (grid 3-kolumnowy, równe odstępy, subtelne linie pojęć pod każdą sekcją). Klient przewija stronę i dostrzega że są **różne grupy prac, każda mówi o czymś innym**, ale nigdzie nie jest powiedziane co. Pojęcia są jedynymi tropami. Klient samodzielnie dochodzi do tego że galeria ma 6-7 obszarów zainteresowań kuratorskich — i robi to **sam**.

To esencja zasady "samodzielnego odkrywania". Możliwe nawet bez podtytułów pojęciowych — w wariancie maksymalnie minimalistycznym sekcje to po prostu sekwencje prac z dyskretnymi przejściami, a pojęcia pojawiają się dopiero pod konkretnymi kartami prac.

**Sekcja 4: Współczesne kontynuacje**

Osobny blok pokazujący że program galerii nie kończy się na klasykach. Wizualnie trochę żywszy, ale w tym samym DNA typograficznym.

Artyści główni: Agata Żychlińska, Łukasz Dziedzic, Tom Swoboda, Natalia Brandt.

Jedno zdanie:

> Współczesne kontynuacje pokazują, że język galerii nie jest zamkniętym archiwum, lecz żywym programem rozwijanym przez średnie i młodsze pokolenie artystów.

**Sekcja 5: 28 lat Galerii ESTA**

Krótki elegancki blok z liczbami, bez wielkiej autobiografii:

```
1998 — pierwsza wystawa
28 lat działalności
setki wystaw indywidualnych i zbiorowych
udział w międzynarodowych targach sztuki
publikacje i katalogi
ponad 400 prac w obecnej Kolekcji i Zasobach
```

Małym tekstem pod liczbami:

> Galeria ESTA od 1998 roku konsekwentnie buduje program wokół polskiej i środkowoeuropejskiej sztuki konceptualnej, geometrycznej i archiwalnej.

### Karta pracy — co pokazujemy i co kryjemy

**Karta w Kolekcji pokazuje:**

- zdjęcie pracy (pole 4:3, fallback do CDN, placeholder ESTA gdy brak)
- nazwisko i imię artysty (CAPS, Instrument Sans 11px) — link do `/artysta/[slug]`
- tytuł pracy (italic, Cormorant Garamond 22px) — link do `/praca/[slug]`
- technika (Instrument Sans 13px)
- wymiary
- **2-4 pojęcia jako klikalne linki** (Instrument Sans 11px, kolor #888, hover #11110f)

**Karta NIE POKAZUJE:**

- segmentu (segment widoczny dopiero na stronie pracy)
- stylu (dopiero w szczególe)
- dziedziny (dopiero w szczególe)
- idei jako etykiety (idea działa tylko jako "drogowskaz" przez pojęcia)
- ceny (D2: kolekcja domyślnie bez ceny — "Cena na zapytanie" lub całkowite pominięcie)

**Karta ZAWSZE prowadzi do:**

- `/praca/[slug]` (klik w zdjęcie lub tytuł)
- `/artysta/[slug]` (klik w nazwisko)
- `/kolekcja?tag=[pojecie]` (klik w tag — zamknięty kontekst Kolekcji)

### Filtry — dwa poziomy

**Pierwszy poziom (praktyczny, główny):**

```
Artysta · Segment · Dziedzina · Cena · Dostępność
```

**Drugi poziom (subtelny, kuratorski, mniejszy font):**

```
Odkrywaj przez: język · paradoks · znak · słowo · układ · system · światło · cień · ślad · pamięć · obraz · komunikat · ciało · granica
```

Nie używamy nigdy słowa "idee" jako etykiety filtra. Słowo "Idee" znika z menu głównego. Filtr ten odsłania pojęcia z bazy które galerysta oznaczył jako "publicznie odkrywalne" — klient sam wybiera trop, sam dochodzi do tego co go interesuje.

Strony idei jako odrębne route'y (`/idee/[slug]`) **zostają w mapie strony i sitemap.xml** dla SEO, ale **nie są linkowane z menu głównego ani z głównych sekcji**. Pojawiają się jako głębokie linki — np. z Kompendium ("zobacz też pełen kontekst") lub jako wynik zaawansowanego wyszukiwania. To pozwala zainteresowanym dotrzeć do całościowych opisów idei, ale nie wymusza tego na klientach którzy wolą odkrywać.

### Strona pracy `/praca/[slug]`

Komponent już istnieje (Task B4). Wymaga drobnych korekt filozoficznych.

**Layout 70/30:**

Lewa kolumna 70% — galeria zdjęć (główne + miniatury 1-20 z TheCamels).
Prawa kolumna 30% sticky — dane pracy.

**Sidebar zawiera:**

1. Nazwa artysty (CAPS, link)
2. Tytuł, rok (italic Cormorant)
3. Technika
4. Wymiary
5. Sygnatura (jeśli)
6. Edycja (jeśli)
7. Stan zachowania (jeśli)
8. **Cena** (D23: widoczna na publicznym szczególe)
9. Przycisk "Zapytaj o pracę →" (mailto z pre-wypełnionym subject/body)

**Blok pod ceną (subtelny, NIE nazywany "W programie galerii"):**

```
układ · rytm · system

Klasycy polskiej awangardy
relief · obiekt
geometria · minimalizm
```

Wszystkie te elementy są **klikalne** (prowadzą do filtrowanej Kolekcji lub strony pojęcia). **Bez nagłówków "Segment:", "Dziedzina:", "Styl:"** — to są etykiety katalogowe, które rozbijają poczucie odkrywania. Klient widzi linijki pojęć, fraz i terminów. Sam pojmuje czego dotyczą.

**Nazwa idei nie pojawia się nigdzie** w sidebarze. Idea steruje algorytmem "Odkrywaj dalej" w bazie, ale jako klasyfikator wewnętrzny — nie etykieta wyświetlana klientowi.

**Sekcje "Odkrywaj dalej" pod galerią (NOWE):**

Zastąpienie obecnych "Inne prace artysty" i "Podobne prace" pełniejszym modułem (patrz Sekcja 6 — Odkrywaj dalej).

### Strona artysty `/artysta/[slug]` — z linią programową

To jedyne miejsce w publicznej części serwisu gdzie **nazwa idei pojawia się jako etykieta**. Profil artysty ma prawo do swojej linii programowej — identyfikacji w kontekście Galerii ESTA.

**Layout strony artysty:**

```
[Hero — duża praca artysty w pełnym kadrze]

WANDA GOŁKOWSKA
1928 — 2013, Wrocław

[krótka nota biograficzna — 2-3 zdania]

────────────────

Geometria / Struktura
układ otwarty · system · relacja · powtórzenie

────────────────

[Sekcja "Wybrane prace" — grid prac artysty z Kolekcji i Zasobów]

────────────────

[Sekcja "Wystawy" — kluczowe wystawy artysty w galerii i poza]

────────────────

[Sekcja "Teksty" — kompendium dotyczące artysty, jeśli istnieją]

────────────────

[Moduł "Odkrywaj dalej" — w kręgu pokrewnych poszukiwań,
inni artyści z bliskim językiem, powiązane Viewing Roomy]
```

**Linia programowa** (`Geometria / Struktura · układ otwarty · system · relacja`) działa jako:

- identyfikacja artysty w narracji galerii
- dedykacja, świadectwo, oznaczenie pokrewieństwa
- klikalne linki — nazwa idei prowadzi do `/idee/[slug]` (głęboki link, nie wymuszany), pojęcia prowadzą do `/kolekcja?tag=...`

**Wizualnie:**
- Nazwa idei: Cormorant Garamond 18px, italic, kolor #444
- Pojęcia: Instrument Sans 13px, regular, kolor #777, klikalne
- Subtelne oddzielenie cienką linią od noty biograficznej i sekcji prac
- Bez prefixu "Linia programowa:", "Idea:", "Należy do:" — sama fraza wystarczy

Klient widzi nazwę idei tutaj **świadomie** — jest na stronie konkretnego artysty, w kontekście jego całej twórczości. Wie że to nie etykieta katalogowa, ale **jego miejsce w programie**.

**Status programowy artysty** (Rdzeń Kolekcji / Współczesne kontynuacje / Zasoby / Gość programu / Archiwum galerii) **pozostaje w bazie jako klasyfikator wewnętrzny** — nigdy nie wyświetlany jako tekst na stronie artysty. Wpływa na sortowanie, na podsuwanie powiązanych artystów, na obecność w sekcjach strony głównej. Ale klient nie widzi "Rdzeń Kolekcji" jako napisu pod nazwiskiem.

---

### Co zmienia się technicznie w Kolekcji

**W komponencie `<WorkCard>`:**

- Linia pojęć już istnieje, wymaga drobnego stylowania (delikatniejsze, klikalne)
- Tag `tagLinkBase="/kolekcja"` dla kontekstu kolekcji (zamknięty kontekst)
- Brak nowych pól w bazie — wszystkie potrzebne dane już są

**W layoutie strony:**

- Hero section (nowy blok)
- Sekcja "Wątki programu" (nowy blok z 6 mini-witrynami)
- Sekcja "Współczesne kontynuacje" (nowy blok)
- Sekcja "28 lat" (nowy blok)
- Filtry dwa poziomy (rozbudowa obecnego mechanizmu filtra)

**W menu głównym:**

- Usunięcie pozycji **IDEE** (zostaje pod Kompendium lub w mapie strony)
- Dodanie pozycji **ZASOBY** (pomiędzy KOLEKCJA a VIEWING ROOM)

---

## 3. ZASOBY — nowa pozycja w menu

### Definicja

Zasoby to nie archiwum, nie magazyn, nie wyprzedaż. To **rozszerzona biblioteka prac, artystów i śladów 28-letniej działalności Galerii ESTA**. Miejsce dla prac, które:

- nie należą bezpośrednio do aktualnego rdzenia programu Kolekcji,
- są efektem historii galerii,
- pochodzą z dawnych wystaw, targów, współprac, komisów i kontaktów,
- mogą być bardzo ciekawe kolekcjonersko,
- mogą później wejść do Viewing Roomów jako elementy relacji.

**Najkrótsza formuła:**

> Kolekcja pokazuje program galerii.
> Zasoby pokazują pamięć i szerokość galerii.
> Viewing Room pokazuje, jak galeria interpretuje oba światy.

### Czym Zasoby nie są

Zasoby nie są wyprzedażą, magazynem, przypadkowym katalogiem, drugim sklepem, "tańszą kolekcją" ani działem mniej ważnym. Powinny wyglądać jak **gabinet odkryć galerii** albo **biblioteka prac i relacji**.

### Nazwa działu

**Polska:** Zasoby
**International:** Resources

Możliwy podtytuł:

> Prace, artyści i archiwalne ślady z 28 lat działalności Galerii ESTA.

International:

> Works, artists and archival traces from 28 years of Galeria ESTA.

### Funkcja Zasobów na stronie

Trzy funkcje:

1. **Kolekcjonerska** — pokazują prace dostępne lub możliwe do zapytania
2. **Historyczna** — pokazują szerokość działań galerii przez lata
3. **Kuratorska** — dostarczają materiału do Viewing Roomów

Najważniejsze: **Zasoby są źródłem nieoczywistych relacji.**

### Strona główna Zasobów `/zasoby/`

**Sekcja 1: Hero**

Tytuł:

> ZASOBY

Podtytuł:

> Rozszerzony zbiór prac, artystów i archiwalnych śladów z 28 lat działalności Galerii ESTA.

Krótki tekst:

> Zasoby Galerii ESTA to obszar odkryć, kontekstów i relacji, które mogą uzupełniać aktualny program Kolekcji oraz budować nowe prezentacje w Viewing Room.

Przycisk:

- Przeglądaj zasoby →

**Sekcja 2: Artyści w Zasobach**

Spokojna siatka nazwisk (nie nudna lista). Przy każdym mała linia kontekstowa:

```
JOSEF BAUER
geometria · obiekt · struktura

VERA MOLNAR
system · algorytm · układ

RYSZARD WINIARSKI
przypadek · system · obraz

JAN BERDYSZAK
przestrzeń · obiekt · ślad

ANDRZEJ PAMUŁA
geometria · obraz · system

JERZY KOSSAKOWSKI
fotografia · pejzaż · pamięć

JERZY PIERŚCIŃSKI
fotografia · dokument · pejzaż

LECH LASOCKI
prace na papierze · obiekt

WALDEMAR ZILOCCHI
abstrakcja · obraz · znak

LUDWIK WILDING
optyka · ruch · iluzja

EDMUND ŁAPIŃSKI
malarstwo · znak · obraz
```

Lista nie jest finalna — uzupełnia się w czasie. Każde nazwisko klika do `/artysta/[slug]` (te same strony co dla rdzenia Kolekcji).

**Sekcja 3: Odkrywaj przez obszary**

Delikatne wejścia tematyczne, bez ciężaru "idei":

```
Geometria i system
Fotografia i pamięć
Obiekt i przestrzeń
Obraz i znak
Prace na papierze
Archiwalia i dokumenty
```

Każdy link prowadzi do filtrowanych Zasobów (np. `/zasoby?obszar=geometria-system`).

**Sekcja 4: Z Zasobów do Viewing Room**

Bardzo ważny blok — pokazuje że Zasoby nie są ślepym zaułkiem, ale źródłem aktywnej narracji.

Tekst:

> Wybrane prace z Zasobów pojawiają się w Viewing Roomach, gdzie tworzą nowe relacje z artystami Kolekcji.

Lista przykładowych relacji (klikalna do konkretnych VR jeśli istnieją):

- Bauer + Dróżdż → Viewing Room "Słowo jako obraz"
- Molnar + Gołkowska → Viewing Room "Układ, system, przypadek"
- Winiarski + Gostomski → Viewing Room "Geometria po geometrii"
- Berdyszak + Chwałczyk → Viewing Room "Otwór i przestrzeń"
- Pamuła + Brandt → Viewing Room "Obraz jako system"

**Sekcja 5: Grid prac z Zasobów**

Layout 3-kolumnowy (więcej prac, mniejsza ranga indywidualna niż w Kolekcji 2-kolumnowej). Karta używa istniejącego komponentu `<WorkCard>` z propsem `kontekst="zasoby"` i drobnym znacznikiem tekstowym "Zasoby" pod artystą.

```
[ Zdjęcie pracy ]

JAN BERDYSZAK
Bez tytułu, 1959
obiekt, technika własna
35 × 35 cm

obiekt · przestrzeń · ślad

— Zasoby
```

### Filtry w Zasobach

**Filtry główne (praktyczne):**

```
Artysta · Dziedzina · Dekada · Dostępność · Cena · Format
```

**Filtry dodatkowe (subtelnie, mniejszy font):**

```
Styl · Segment · Pojęcia · Potencjał Viewing Room
```

Nie eksponujemy mocno idei w Zasobach. Idee działają silniej w Kolekcji. W Zasobach lepiej działa **obszar / medium / ślad / potencjał relacji**.

### Strona pracy z Zasobów

Wspólny szablon `/praca/[slug]` (ten sam co dla Kolekcji), ale z warunkowym kontekstem.

**Breadcrumb:**

```
Galeria ESTA / Zasoby / Berdyszak Jan — Bez tytułu, 1959
```

**W sidebarze blok "W zasobach galerii":**

```
obiekt · przestrzeń · ślad

Segment: Klasycy awangardy środkowoeuropejskiej
Dziedzina: obiekt, relief
Styl: geometria, minimalizm

Praca znajduje się w rozszerzonych Zasobach Galerii ESTA i może być
czytana w relacji do geometrii, systemu oraz powojennych praktyk
konceptualnych.
```

Ostatni akapit pochodzi z pola `kontekst_zasobowy_pl` (nowe pole w bazie, patrz Sekcja 7).

**Sekcja "Może pojawić się w relacjach z" (NOWA):**

Pokazuje artystów z Kolekcji, z którymi praca z Zasobów może pracować w przyszłych Viewing Roomach:

```
Może pojawić się w relacjach z:
Jan Chwałczyk · Barbara Kozłowska · Wanda Gołkowska · Tom Swoboda
```

To zbudowane przez pole `relacje_z_kolekcja` w tabeli `artysci` (patrz Sekcja 7).

### Styl wizualny Zasobów

**Różnica wizualna względem Kolekcji:**

- **Kolekcja:** biel `#fbfaf8`, dużo światła, mocna selekcja, większe kadry, premium gallery wall, mniej filtrów od razu widocznych
- **Zasoby:** złamana biel `#faf6f0` (lekko ciemniejsza, cieplejszy ton), gabinetowy rytm, spokojniejsza siatka, więcej filtrów praktycznych, więcej kontekstu pod każdą pracą

Subtelnie cieplejsze tło daje wrażenie **biblioteki** zamiast **galerii**. Nie robimy z tego staroci ani sepia — ma być eleganckie i współczesne, tylko spokojniejsze tonalnie.

### Algorytm wyświetlania prac w Zasobach

```sql
SELECT * FROM prace
WHERE publiczne = TRUE
  AND widocznosc = 'zasoby'  -- nowa wartość, dodawana migracją
ORDER BY
  priorytet_zasoby DESC NULLS LAST,
  potencjal_viewing_room DESC,
  artysci.nazwisko_i_imie ASC,
  rok DESC;
```

Nowa wartość `'zasoby'` w polu `widocznosc` zastępuje wcześniejszą wartość `'archiwum'` (migracja jednorazowa).

---

## 4. VIEWING ROOM — kuratorskie wirtualne wystawy

### Definicja

Viewing Room **nie jest ofertą**. Nie jest katalogiem. Nie jest archiwum. Nie ma własnych prac — korzysta z prac znajdujących się w Kolekcji i Zasobach.

Viewing Room to **cyfrowa wystawa kuratorska** budowana z istniejących w bazie prac. To miejsce interpretacji, odkrywania relacji i budowania nowych znaczeń. Pokazuje nie tylko co galeria posiada, ale przede wszystkim **jak galeria myśli**.

### Trzy światy galerii — pełna mapa relacji

```
KOLEKCJA
↓
Program galerii

ZASOBY
↓
Pamięć galerii

VIEWING ROOM
↓
Interpretacja galerii
```

Najmocniejszą siłą Viewing Room jest **łączenie obu światów** — Kolekcji i Zasobów. Każdy VR może mieszać prace rdzenia programu z odkryciami z Zasobów, tworząc nieoczywiste spotkania i nowe konteksty.

### Funkcja Viewing Room

Każdy Viewing Room odpowiada na **jedno pytanie kuratorskie**:

- Nie "jakie prace są dostępne?"
- Lecz "co łączy te prace?"

Dlatego każdy VR budowany jest wokół:

- idei (np. Geometria / Struktura)
- pojęcia (np. układ otwarty)
- relacji (np. Gołkowska + Molnar)
- problemu (np. system vs przypadek)
- motywu (np. cień i projekcja)
- wystawy historycznej (np. retrospektywa 2008)
- rocznicy (np. 20 lat Galerii ESTA)
- odkrycia (np. fotografia powojenna)

### Sześć typów Viewing Room

Każdy VR ma jeden z sześciu typów (`typ_vr` w bazie):

1. **Relacja** — zestawienie artystów (np. Kozłowski + Dłużniewski)
2. **Idea** — wokół jednej z głównych idei (Geometria / Struktura)
3. **Pojęcie** — wokół jednego pojęcia (układ otwarty)
4. **Monografia** — jeden artysta w wybranych pracach
5. **Archiwum** — z naciskiem na materiały historyczne galerii
6. **Współczesne kontynuacje** — pokazanie żywego programu

Najwięcej powstanie typu **Relacja** (Bauer + Dróżdż, Molnar + Gołkowska, Berdyszak + Chwałczyk), bo to esencja siły Galerii ESTA jako interpretatora.

### Zasada konstrukcji

**Viewing Room nie powinien być tworzony dla artysty. Powinien być tworzony dla relacji.**

Lepszy VR:
- "Język i paradoks" (Kozłowski + Dłużniewski)
- "Słowo jako obraz" (Dróżdż + Kozłowski + Twożywo)

Gorszy VR (zwykle):
- "Viewing Room Kozłowski" (monograficzny, zbyt blisko zwykłego profilu artysty)

VR ma robić coś, czego nie robi strona artysty ani Kolekcja — pokazywać **myślenie Galerii ESTA**, a nie tylko pojedynczego twórcę. Wyjątek: monograficzne VR z mocnym fokusem na konkretny aspekt twórczości (np. "Układ otwarty Wandy Gołkowskiej" — to nie cała Gołkowska, ale wybrany kontekst kuratorski).

### Struktura pojedynczego Viewing Room

Każdy VR ma **stały szablon strukturalny** (6 sekcji), ale **elastyczność w sekcji 3** (główna narracja może mieć różne sekwencje bloków).

#### Sekcja 1 — Hero

- Duża praca (pole `praca_hero_id` w bazie)
- Tytuł VR (Cormorant Garamond, 64-96px)
- Jedno zdanie (subtitle, Instrument Sans 18px)

Przykład:

```
[ Duża praca Wandy Gołkowskiej w pełnym kadrze ]

UKŁAD, RYTM, RELACJA
Od układu otwartego Wandy Gołkowskiej po współczesne interpretacje geometrii.
```

#### Sekcja 2 — Wprowadzenie

100-150 słów. Nie esej. Nie tekst akademicki. Krótka kuratorska opowieść wprowadzająca w narrację.

Pole `tekst_otwierajacy_pl` w bazie (plus `_en` dla International).

#### Sekcja 3 — Główna narracja (sekwencja prac)

To jest sekcja **elastyczna**. Sekwencja bloków zapisana w polu `sekcje_jsonb` jako tablica obiektów. Galerysta w panelu CRM układa sekwencję drag&drop.

Dostępne typy bloków:

**Bloki narracyjne:**

- `praca` — pojedyncza praca z opisem (`praca_id`, `kontekst_w_vr` jako tekst)
- `tekst` — kuratorski tekst pomiędzy pracami
- `detal` — fragment pracy w powiększeniu (`asset_id` z `viewing_room_assets`)
- `cytat` — cytat z artysty / kuratora
- `archiwum` — zdjęcie historyczne / katalog / wystawa (`asset_id`)

**Bloki wizualne (rozszerzone):**

- `praca_in_situ` — praca w renderingu wnętrza galerii (`praca_id` + `asset_id` z renderingiem AI)
- `dwie_prace` — dwie prace obok siebie pokazujące relację (`praca_id_a`, `praca_id_b`)
- `triptyk` — trzy prace w jednym rytmie
- `panorama` — widok ściany wystawy z wieloma pracami (`asset_id`)
- `video` — krótki klip wideo (np. ujęcia z dawnej wystawy, `asset_id`)

**Bloki interaktywne:**

- `before_after` — slider porównujący (np. szkic vs finalna praca)
- `scroll_porownanie` — scrollytelling: jedna praca przekształca się w drugą

#### Sekcja 4 — Współczesna kontynuacja

Jeżeli temat na to pozwala, pokazujemy dialog z młodszym pokoleniem:

- Brandt
- Żychlińska
- Dziedzic
- Swoboda

To nie jest dodatek — to integralna część narracji VR pokazująca ciągłość programu.

#### Sekcja 5 — Odkrywaj dalej

Powiązani artyści, wystawy, teksty kompendium, inne Viewing Roomy. To miejsce wykorzystuje moduł `<DiscoverFurther>` (patrz Sekcja 6).

#### Sekcja 6 — Zapytaj o prace

Dopiero na końcu. Sprzedaż nie otwiera narracji. Sprzedaż zamyka narrację.

Forma:

```
Wszystkie prace prezentowane w tym Viewing Roomie są dostępne.
Skontaktuj się z galerią, aby otrzymać szczegółowe informacje
o pracy, cenie i dostępności.

[Zapytaj o prace →]
```

Każda praca w VR ma swoje "Zapytaj o cenę" lub cenę widoczną (zależnie od decyzji galerysty per VR).

### Styl wizualny Viewing Room

Viewing Room powinien przypominać:

- katalog wystawy
- książkę artystyczną
- ekspozycję muzealną

Nie powinien wyglądać jak:

- sklep internetowy
- marketplace
- PDF z cenami

**Typografia:**

- Nagłówki: Cormorant Garamond
- Tekst: Instrument Sans
- Podpisy: Instrument Sans Light

**Kolorystyka:**

- Biel `#fbfaf8` (jak Kolekcja, ale można per VR zdecydować o niuansie tonalnym)
- Jasna szarość
- Grafit dla tekstów
- Czerń dla nagłówków
- Kolor wyłącznie z prac

**Animacje (Poziom 1):**

- Płynne przewijanie (CSS smooth scroll)
- Subtelne pojawianie się obrazów (Intersection Observer + fade-in)
- Lekka paralaksa na hero (CSS transform)
- Brak efektów marketingowych
- Brak krzykliwych CTA

### Renderingi wnętrz (blok `praca_in_situ`)

To kluczowy element "efektu kuratorskiego". Pokazanie pracy nie jako pliku JPG, ale jako **obiektu zawieszonego we wnętrzu galerii**.

**Implementacja Poziom 1 (realna teraz):**

- Galerysta generuje rendering wnętrza **poza systemem** (Midjourney, Flux, Stable Diffusion)
- Prompt sugerowany: "modernist art gallery interior, white walls, parquet floor, soft natural light, museum quality, no people, minimalist"
- Galerysta nakłada zdjęcie pracy na ścianę renderingu (Photoshop, Canva, Figma)
- Plik wgrywa do TheCamels CDN lub Supabase Storage
- W panelu CRM wkleja URL do pola asset
- W bazie zapisuje `prompt_ai` (jeśli generowane AI — dla powtórzenia później)

**Implementacja Poziom 2 (przyszłość, "hak" w bazie):**

- Pole `prompt_ai` już istnieje (przygotowane na Poziom 2)
- W przyszłości integracja z API generatorów obrazów (Replicate, Flux Pro)
- Galerysta klika "Generuj wnętrze" → backend wywołuje API → URL pojawia się automatycznie
- Wymaga osobnego Obszaru implementacyjnego (Obszar 7 — AI Integration)

**Inne realne dziś możliwości wizualne:**

- Panoramy ścian z wieloma pracami (composing w Photoshop, wynik jako jeden plik)
- Detale prac w powiększeniu (proste, wymaga tylko HiRes źródła)
- Sliderzy before/after (CSS + JS, standardowy komponent)
- Krótkie wideo z dawnych wystaw (jeśli galeria ma archiwum filmowe — pole `asset` z typem `video`)

### Asystent AI w panelu CRM Viewing Room

**A) Generator tekstu otwierającego VR (Poziom 1, realny dziś):**

Przycisk w modalu `m-vr`: **"Wygeneruj propozycję tekstu otwierającego"**

AI otrzymuje kontekst:
- Tytuł VR
- Wybrane prace (z ich tytułami, artystami, technikami)
- Idee i pojęcia tych prac
- Typ VR (Relacja / Idea / Monografia)
- Język outputu (PL / EN / DE)

AI generuje 3 warianty tekstu (100-150 słów każdy). Galerysta wybiera jeden, edytuje, zatwierdza.

Implementacja techniczna: wywołanie Claude API (model `claude-sonnet-4-6` lub nowszy) z dedykowanym promptem systemowym opisującym DNA Galerii ESTA i zasady pisania tekstów kuratorskich (krótko, nie akademicko, prowadząc przez sztukę a nie definicje).

**B) Generator komentarzy kuratorskich per praca w VR (Poziom 1, realny dziś):**

Przy każdej pracy w sekwencji VR — przycisk **"Krótki komentarz kuratorski"**.

AI otrzymuje kontekst:
- Dane pracy (artysta, tytuł, rok, technika, opis ogólny z bazy)
- Kontekst VR (typ, tytuł, inne prace w sekwencji)
- Pojęcia i idee pracy
- Pozycja w sekwencji VR (np. "3 z 8")

AI generuje **krótki komentarz** (2-3 zdania), **różny od ogólnego opisu pracy**. To komentarz dopasowany do kontekstu **tego konkretnego VR**.

Przykład: praca Gołkowskiej w VR "Układ, rytm, relacja" dostanie inny komentarz niż ta sama praca w VR "Geometria po geometrii".

**C) Generator tekstów dla Kolekcji i Zasobów (Poziom 1, realny dziś):**

Dla nowo dodanego artysty lub pracy w panelu CRM — propozycje tekstów dla strony:

- Krótka nota artysty (jeśli pusta) — bazując na imieniu/nazwisku, dacie urodzenia, wzmiance w bazie
- Linia programowa artysty — bazując na idee/pojecia/segmenty
- Krótki opis pracy (jeśli pusty) — bazując na tytule, technice, kontekście artysty
- `kontekst_zasobowy_pl/en` — dla prac w Zasobach: dlaczego ta praca jest w Zasobach, jak może łączyć się z Kolekcją

**Wszystkie 3 generatory działają w trzech językach:** PL / EN / DE.

Galerysta wybiera język w panelu. AI generuje w tym języku. Możliwe też "tłumaczenie z PL na EN/DE" jako osobna funkcja (przyciski "Tłumacz na EN", "Tłumacz na DE" obok pól).

### System publikacji VR

**Cykl życia Viewing Room:**

- **Szkic** — w panelu CRM, niewidoczny publicznie
- **Aktywny** — opublikowany, widoczny w `/viewing-room/`
- **Archiwalny** — schodzi z aktywnej listy, ale pozostaje dostępny pod swoim URL (SEO, historia myślenia galerii)

**Docelowo:**

- 8-12 aktywnych VR na stronie głównej `/viewing-room/`
- Nowe VR publikowane regularnie (np. raz w miesiącu)
- Starsze przechodzą do archiwum VR po 3-6 miesiącach
- Po 5 latach galeria ma 60-80 gotowych cyfrowych wystaw — **cyfrową historię myślenia Galerii ESTA**

To unikalna wartość, której praktycznie żadna polska galeria nie buduje konsekwentnie.

### Strona główna `/viewing-room/`

**Layout:**

- Hero z aktualnym najmocniejszym VR (pole `pokaz_na_home` lub najwyższy `priorytet_vr`)
- Grid kart aktywnych VR (3-kolumnowy, eleganckie miniatury)
- Sekcja "Archiwum Viewing Roomów" (link do `/viewing-room/archiwum/`)
- Sekcja "Co to jest Viewing Room" (krótka definicja na dole, dla nowych odwiedzających)

**Karta VR:**

- Obraz hero (pole `praca_hero_id` lub asset hero)
- Tytuł (Cormorant Garamond, 28-36px)
- Jedno zdanie (Instrument Sans 15px)
- Klikalne pojęcia (max 3-4)
- Subtelnie: "5 prac · 3 artystów"
- Klik prowadzi do `/viewing-room/[slug]`

### 12 pierwszych Viewing Roomów (plan kuratorski)

Wstępny plan VR do realizacji po wdrożeniu funkcjonalności:

**01 — UKŁAD, RYTM, RELACJA**
Idea: Geometria / Struktura
Artyści: Wanda Gołkowska + Zbigniew Gostomski + Natalia Brandt
Pojęcia: układ, rytm, system, układ otwarty
Typ: Relacja

**02 — SŁOWO JAKO OBRAZ**
Idea: Słowo / Znak
Artyści: Stanisław Dróżdż + Jarosław Kozłowski + Twożywo + Josef Bauer (z Zasobów)
Pojęcia: poezja konkretna, tekst, komunikat, typografia
Typ: Relacja

**03 — CIEŃ I PROJEKCJA**
Idea: Światło / Przestrzeń
Artyści: Jan Chwałczyk + Barbara Kozłowska + Mieczysław Wiśniewski
Pojęcia: cień, światło, projekcja, obiekt
Typ: Idea

**04 — UKŁAD OTWARTY**
Monografia: Wanda Gołkowska
Pojęcia: układ otwarty, zmienność, relacja, system
Typ: Monografia (z fokusem na jeden kuratorski aspekt)

**05 — JESZCZE WSCHÓD SŁOŃCA**
Punkt wyjścia: praca Gostomskiego
Artyści: Gostomski + Gołkowska + Brandt
Pojęcia: krajobraz strukturalny, przestrzeń, horyzont
Typ: Relacja

**06 — ŚLAD I DOKUMENT**
Idea: Pamięć / Archiwum
Artyści: Jerzy Lewczyński + Barbara Kozłowska + Andrzej Paruzel + Jerzy Kossakowski (z Zasobów)
Pojęcia: fotografia, archiwum, ślad, czas
Typ: Idea

**07 — JĘZYK I PARADOKS**
Artyści: Jarosław Kozłowski + Andrzej Dłużniewski + Josef Bauer (z Zasobów)
Pojęcia: pojęcie, paradoks, definicja, instrukcja
Typ: Relacja (wzorcowy dla International)

**08 — OBRAZ I KOMUNIKAT**
Artyści: Marek Sobczyk + Twożywo + Agata Żychlińska
Pojęcia: komunikat, obraz, tekst, ironia
Typ: Idea

**09 — GRANICE OBRAZU**
Artyści: Łukasz Dziedzic + Agata Żychlińska + Tom Swoboda
Pojęcia: granica, ciało, relacja, pamięć
Typ: Współczesne kontynuacje

**10 — UKŁAD, SYSTEM, PRZYPADEK**
Rdzeń: Wanda Gołkowska + Zbigniew Gostomski
Zasoby: Ryszard Winiarski + Vera Molnar
Współczesne: Natalia Brandt
Pojęcia: układ, system, algorytm, powtórzenie, przypadek
Typ: Relacja (najmocniejsza siła konceptu — mieszanie światów)

**11 — OTWÓR I PRZESTRZEŃ**
Rdzeń: Jan Chwałczyk + Barbara Kozłowska
Zasoby: Jan Berdyszak
Pojęcia: przestrzeń, otwór, widzenie, miejsce
Typ: Relacja

**12 — 28 LAT GALERII ESTA**
Najważniejszy Viewing Room — połączenie wystaw, targów, artystów, archiwów, fotografii, prac z wybranych kontekstów historycznych.
Typ: Archiwum
Nie jako historia galerii, ale jako historia idei rozwijanych przez galerię od 1998 roku do dziś.

---

## 5. OFERTY INDYWIDUALNE — spójność wizualna, niezmienna funkcjonalność

Oferty indywidualne z tokenem dla konkretnych klientów to **osobny świat**. Nie pojawia się w menu publicznym. Dostęp tylko przez unikalny link `/oferta/[token]`.

**Funkcjonalnie nic się nie zmienia** wobec wcześniejszych ustaleń (dokument `OBSZAR-4-OFERTY.md`):

- Tabela `oferty` zawiera wyłącznie oferty indywidualne z tokenem
- Każda oferta dla konkretnego klienta (`klient_id`)
- Lista prac przez M:N `oferty_prace` z polami `cena_w_ofercie`, `cena_widoczna`, `opis_do_oferty`, `kolejnosc`
- Ceny per oferta są persistentne historycznie (klient X widzi swoją cenę, klient Y widzi swoją)
- Modal m-of w panelu CRM (Task A1, do uproszczenia w Task A1.5)
- Strona `/oferta/[token]` (Task B2 szkielet, Task B7 dokończenie z listą prac)

**Zmienia się tylko spójność wizualna:**

- Pod każdą pracą w ofercie indywidualnej pojawiają się **dyskretne pojęcia** — tak samo jak w Kolekcji i Zasobach
- Tagi w ofercie indywidualnej **zawsze prowadzą do `/kolekcja`** (promocja publicznej strony, wyjątek od zasady zamknięcia kontekstu)
- Stopka oferty zawiera dyskretne CTA "Pełen program Galerii ESTA" z linkami do Kolekcji i Viewing Room (już ustaliliśmy w poprzednich sesjach)

To daje **jedno DNA wizualne** przez wszystkie cztery światy. Klient który widział kiedyś jedną ofertę ESTA rozpoznaje każdą następną prezentację jako ten sam świat — Kolekcję, Zasoby, Viewing Room, indywidualną ofertę.

---

## 6. ODKRYWAJ DALEJ — moduł powiązań

### Zasada

Po Twoim doprecyzowaniu: **"merytorycznie musi być bardzo dobrze pomyślne, bo to sposób na wykorzystanie tego pierwszego pomysłu galerii poprzez idee"**.

Moduł "Odkrywaj dalej" to **serce systemu odkrywania**. Bez niego klient zobaczy pracę i odejdzie. Z nim — klient zaczyna podróż przez program galerii.

### Lokalizacja modułu

Komponent `<DiscoverFurther>` używany na:

- `/praca/[slug]` — szczegół pracy publicznej
- `/artysta/[slug]` — profil artysty
- `/wystawa/[slug]` — strona pojedynczej wystawy
- `/viewing-room/[slug]` — Viewing Room
- `/kompendium/[slug]` — tekst kompendium

**NIE używamy** na:

- listach (`/kolekcja`, `/zasoby`, `/viewing-room`)
- stronie głównej (tam działa hero + wybór prac)
- `/oferta/[token]` — oferta indywidualna ma zamkniętą narrację, klient nie powinien być wypychany z prywatnej prezentacji

### Algorytm hybrydowy: ręczne + automatyczne

**Priorytet 1 — Powiązania ręczne (kuratorskie):**

Pole `prace_powiazane_recznie` w tabeli `prace` (M:N do `prace`).

Galerysta w panelu CRM ręcznie wskazuje najważniejsze powiązania. To są **kuratorskie decyzje** mające pierwszeństwo nad wszystkim. Maksymalnie 3-5 ręcznych powiązań per praca.

Analogicznie pole `artysci_powiazani_recznie` w tabeli `artysci` (już planowane w poprzednich dokumentach).

**Priorytet 2 — Inne prace tego samego artysty:**

```sql
SELECT * FROM prace
WHERE artysta_id = current.artysta_id
  AND id <> current.id
  AND publiczne = TRUE
  AND widocznosc IN ('kolekcja', 'zasoby')
ORDER BY priorytet_kolekcja DESC NULLS LAST, rok DESC
LIMIT 8;
```

**Priorytet 3 — Powiązane Viewing Roomy:**

Wszystkie aktywne VR, w których ta praca występuje (M:N `viewing_room_prace`). Plus VR, do których praca może pasować przez wspólne pojęcia (potencjalnie automatyczne sugestie dla galerysty).

**Priorytet 4 — Algorytm scoreSimilarity (już mamy):**

Z istniejącego `lib/scoreSimilarity.ts`:

- +30 wspólny segment
- +25 wspólna idea_glowna
- +15 wspólny styl
- +10 wspólna dziedzina
- +5×n wspólne pojęcia (max +15)
- +10 cena ±25%

Zwraca prace z innych artystów (kolekcja + zasoby) z najwyższymi wynikami.

**Priorytet 5 — Powiązane wystawy:**

Wystawy, w których praca występowała (z M:N `wystawy_prace` lub `wystawy_artysci`).

**Priorytet 6 — Powiązane teksty kompendium:**

Teksty, które wspominają tę pracę lub artystę (z M:N `kompendium_artysci`, `kompendium_prace`).

### Sekcje wyświetlania

Moduł renderuje sekcje w stałej kolejności. **Nagłówki sekcji są bardzo subtelne** — Instrument Sans 11px, CAPS, letter-spacing 0.12em, kolor `#777`. Nie używamy nazw idei jako etykiet.

```
INNE PRACE ARTYSTY (max 6)
[grid 3-kolumnowy mini-WorkCard]

W KRĘGU POKREWNYCH POSZUKIWAŃ (max 6)
[grid 3-kolumnowy mini-WorkCard]
(z innych artystów, na podstawie scoreSimilarity — wspólne pojęcia, idea_glowna w bazie, segmenty)

W VIEWING ROOM (max 3)
[karty VR z miniaturą]

Z WYSTAW GALERII (max 4)
[karty wystaw]

Z KOMPENDIUM (max 3)
[karty tekstów]
```

Sekcje **puste są ukrywane** (jeśli np. brak powiązanych tekstów kompendium, sekcja w ogóle się nie pojawia).

**Ważne — odejście od nazewnictwa "w programie galerii":**

Wcześniejsze wersje używały nagłówka "W PROGRAMIE GALERII ZOBACZ TAKŻE", co sugerowało etykietę kategorii. Nowy nagłówek "W KRĘGU POKREWNYCH POSZUKIWAŃ" jest:
- bardziej poetycki, mniej kategoryczny
- nie odwołuje się do "programu" ani "idei"
- sugeruje że klient sam może zauważyć pokrewieństwo
- pozostawia interpretację po stronie klienta

Można też rozważyć jeszcze prostszą formę: "ZOBACZ TAKŻE" (bez "W kręgu pokrewnych poszukiwań") albo "POKREWNE PRACE INNYCH ARTYSTÓW". Wariant wybierany w czasie implementacji na podstawie testów.

### Wariant dla Zasobów

Praca z `widocznosc='zasoby'` ma dodatkową sekcję:

```
W RELACJACH Z (z Kolekcji)
[karty artystów z Kolekcji, którzy są wskazani w polu relacje_z_kolekcja]
```

To pokazuje że praca z Zasobów nie jest samotna — jest aktywnym uczestnikiem ekosystemu relacji.

### Wariant dla Viewing Room

Na stronie pojedynczego VR moduł pokazuje:

```
POWIĄZANE VIEWING ROOMY (max 3)
[karty innych VR, na podstawie wspólnych artystów/pojęć/idei]

W PROGRAMIE GALERII ZOBACZ TAKŻE
[artyści powiązani z artystami tego VR]

Z WYSTAW
[wystawy historyczne z artystami tego VR]
```

### Wizualnie

- Cała sekcja "Odkrywaj dalej" jest oddzielona delikatną linią od głównej treści
- Nagłówek sekcji minimalistyczny: "Odkrywaj dalej" (Cormorant Garamond, 28px, centered)
- Każda mini-sekcja ma własny mini-nagłówek (Instrument Sans 11px, CAPS, letter-spacing 0.12em, kolor `#777`)
- Karty mini-WorkCard używają tego samego komponentu z propsem `maxTags={0}` (bez tagów na małych kartach)
- Zachowuje DNA wizualne strony — biel, dyscyplina rytmu

### Implementacja techniczna

Komponent `<DiscoverFurther>` jako Server Component (Next.js App Router).

Props:

```typescript
interface DiscoverFurtherProps {
  kontekst: 'praca' | 'artysta' | 'wystawa' | 'viewing_room' | 'kompendium';
  contextId: string;  // ID rekordu z którego "odkrywamy"
  excludeIds?: string[];  // ID do wykluczenia (np. bieżąca praca)
}
```

Server Component fetchuje wszystkie potrzebne dane w jednym lub kilku zapytaniach (z JOIN-ami), uruchamia algorytm scoreSimilarity, układa sekcje i renderuje.

Implementacja w `components/DiscoverFurther.tsx`.

---

## 7. STRUKTURA BAZY DANYCH — nowe pola i tabele

### Filozofia bazy: pola wewnętrzne vs publiczne

Zasadnicze rozróżnienie do utrzymania w całej bazie:

**Pola wewnętrzne (klasyfikatory kuratorskie):**
- `idea_glowna_id` (w `prace`, `viewing_room`)
- `idee_uzupelniajace` (M:N)
- `status_programowy` (w `artysci`)
- `rola_w_zasobach` (w `prace`)
- `segmenty`, `style`, `dziedziny` (na poziomie pracy — wewnętrzne klasyfikacje wpływające na sortowanie i rekomendacje)

Te pola **sterują algorytmami** (Odkrywaj dalej, scoreSimilarity, sortowanie, łączenie w VR), ale **nazwy ich wartości nigdy nie pojawiają się jako etykiety wyświetlane klientowi**. Klient nie widzi "Idea: Geometria / Struktura" ani "Status programowy: Rdzeń Kolekcji" jako tekstu na stronie.

**Pola publiczne (etykiety klikalne):**
- `pojecia_publiczne` (M:N z `pojecia`)
- pola tekstowe opisów
- nazwy artystów, tytuły prac, daty

Te pola **mogą być wyświetlane jako klikalne linki** prowadzące do dalszej eksploracji. Pojęcia są głównym mechanizmem **odkrywalności** dla klienta.

Implementacja: nie wymaga separacji w schemacie SQL — wystarczy konsekwencja w warstwie prezentacji (komponentach Next.js). Komponent `<WorkCard>` nie renderuje `idea_glowna_id`. Komponent `<WorkDetailSidebar>` nie renderuje nazwy idei jako etykiety. Tylko pojęcia, segmenty (jako fraza, nie z prefixem "Segment:"), style i dziedziny w neutralnej formie tekstowej.

### Migracja: `migrations/obszar3_kolekcja_zasoby_vr.sql`

#### 7.1 Korekta pola `prace.widocznosc`

Aktualna wartość `'archiwum'` (jeśli istnieje) migrowana do `'zasoby'`. Nowe CHECK constraint:

```sql
ALTER TABLE prace DROP CONSTRAINT IF EXISTS prace_widocznosc_check;

UPDATE prace
SET widocznosc = 'zasoby'
WHERE widocznosc = 'archiwum';

ALTER TABLE prace
ADD CONSTRAINT prace_widocznosc_check
CHECK (widocznosc IN ('kolekcja', 'zasoby', 'oferta_token', 'zasob', 'ukryte'));
```

Słownik wartości:

- `kolekcja` — publiczna na `/kolekcja`
- `zasoby` — publiczna na `/zasoby`
- `oferta_token` — tylko w ofertach indywidualnych z tokenem
- `zasob` — tylko w panelu CRM (rzadko używane, "tu jest, ale jeszcze nie wiem gdzie")
- `ukryte` — nigdzie nie pokazywane (sprzedana, niedostępna, etc.)

#### 7.2 Nowe pola w tabeli `prace`

```sql
ALTER TABLE prace
ADD COLUMN potencjal_viewing_room text
  CHECK (potencjal_viewing_room IN ('bardzo_wysoki', 'wysoki', 'sredni', 'niski'));

ALTER TABLE prace
ADD COLUMN rola_w_zasobach text
  CHECK (rola_w_zasobach IN (
    'kluczowa', 'uzupelniajaca', 'archiwalium',
    'dokumentacja', 'komis', 'kontekst', 'odkrycie'
  ));

ALTER TABLE prace ADD COLUMN kontekst_zasobowy_pl text;
ALTER TABLE prace ADD COLUMN kontekst_zasobowy_en text;
ALTER TABLE prace ADD COLUMN priorytet_zasoby integer DEFAULT 0;
ALTER TABLE prace ADD COLUMN priorytet_viewing_room integer DEFAULT 0;
```

Te pola są **opcjonalne** — wypełniają się stopniowo dla prac w Zasobach. Prace w Kolekcji mogą mieć `priorytet_kolekcja` (już istnieje) ale nie potrzebują `priorytet_zasoby`.

#### 7.3 Nowe pola w tabeli `artysci`

```sql
ALTER TABLE artysci
ADD COLUMN status_programowy text
  CHECK (status_programowy IN (
    'rdzen_kolekcji', 'wspolczesne_kontynuacje',
    'zasoby', 'gosc_programu', 'archiwum_galerii'
  ));

ALTER TABLE artysci
ADD COLUMN potencjal_viewing_room text
  CHECK (potencjal_viewing_room IN ('bardzo_wysoki', 'wysoki', 'sredni', 'niski'));
```

Plus M:N dla ręcznych relacji programowych:

```sql
CREATE TABLE artysci_relacje_recznie (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  artysta_id uuid NOT NULL REFERENCES artysci(id) ON DELETE CASCADE,
  powiazany_artysta_id uuid NOT NULL REFERENCES artysci(id) ON DELETE CASCADE,
  rodzaj_relacji text,  -- 'rdzen-wspolczesne', 'rdzen-zasoby', 'pomost'
  notatka text,
  kolejnosc integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT artysci_relacje_unique UNIQUE (artysta_id, powiazany_artysta_id),
  CONSTRAINT artysci_relacje_different CHECK (artysta_id <> powiazany_artysta_id)
);
```

#### 7.4 M:N ręczne powiązania prac (juz częściowo istnieje jako prace_related z Obszaru 4)

Tabela `prace_related` z migracji Obszaru 4 może służyć jako mechanizm ręcznych powiązań prac. Sprawdzamy czy ma pola które potrzebujemy:

Z migracji Obszaru 4:

```sql
-- już istnieje:
prace_related (
  id, praca_id, related_id, kolejnosc, notatka, created_at
)
```

Wystarczy. Używamy tej tabeli dla pola `prace_powiazane_recznie`.

#### 7.5 Nowa tabela `viewing_room`

```sql
CREATE TABLE viewing_room (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Tożsamość
  tytul_pl text NOT NULL,
  tytul_en text,
  tytul_de text,
  podtytul_pl text,
  podtytul_en text,
  podtytul_de text,
  slug text NOT NULL UNIQUE,

  -- Klasyfikacja
  typ_vr text NOT NULL
    CHECK (typ_vr IN (
      'relacja', 'idea', 'pojecie', 'monografia',
      'archiwum', 'wspolczesne_kontynuacje'
    )),

  -- Status publikacji
  status_publiczny text NOT NULL DEFAULT 'szkic'
    CHECK (status_publiczny IN ('szkic', 'aktywny', 'archiwalny')),
  data_publikacji date,
  data_archiwizacji date,

  -- Hero i klasyfikacja kuratorska
  praca_hero_id uuid REFERENCES prace(id) ON DELETE SET NULL,
  idea_glowna_id uuid REFERENCES idee(id) ON DELETE SET NULL,

  -- Treści PL/EN/DE
  tekst_otwierajacy_pl text,
  tekst_otwierajacy_en text,
  tekst_otwierajacy_de text,

  -- Sekcje sekwencji (główna narracja)
  sekcje_jsonb jsonb,

  -- Ekspozycja
  pokaz_na_home boolean NOT NULL DEFAULT false,
  pokaz_w_international boolean NOT NULL DEFAULT false,
  priorytet_vr integer DEFAULT 0,
  priorytet_international integer DEFAULT 0,
  kolejnosc integer DEFAULT 0,

  -- Hero rozszerzony (opcjonalnie zamiast praca_hero_id)
  hero_url text,
  hero_focalpoint_x numeric,
  hero_focalpoint_y numeric,
  accent_color text,

  -- SEO
  seo_title_pl text,
  seo_title_en text,
  seo_title_de text,
  seo_description_pl text,
  seo_description_en text,
  seo_description_de text,

  -- Metadane
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_vr_status ON viewing_room(status_publiczny);
CREATE INDEX idx_vr_typ ON viewing_room(typ_vr);
CREATE INDEX idx_vr_priorytet ON viewing_room(priorytet_vr DESC);
CREATE INDEX idx_vr_data_publikacji ON viewing_room(data_publikacji DESC NULLS LAST);
CREATE UNIQUE INDEX idx_vr_slug ON viewing_room(slug);
```

#### 7.6 M:N tabele dla Viewing Room

```sql
-- Prace w Viewing Room
CREATE TABLE viewing_room_prace (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vr_id uuid NOT NULL REFERENCES viewing_room(id) ON DELETE CASCADE,
  praca_id uuid NOT NULL REFERENCES prace(id) ON DELETE CASCADE,
  kolejnosc integer NOT NULL DEFAULT 0,
  kontekst_w_vr_pl text,  -- krótki komentarz kuratorski per VR (różny niż ogólny opis pracy)
  kontekst_w_vr_en text,
  kontekst_w_vr_de text,
  pokaz_cene boolean NOT NULL DEFAULT false,
  cena_w_vr numeric,  -- opcjonalnie nadpisanie ceny per VR (rzadko używane)
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT vr_prace_unique UNIQUE (vr_id, praca_id)
);
CREATE INDEX idx_vr_prace_vr ON viewing_room_prace(vr_id);
CREATE INDEX idx_vr_prace_praca ON viewing_room_prace(praca_id);
CREATE INDEX idx_vr_prace_kolejnosc ON viewing_room_prace(vr_id, kolejnosc);

-- Pojęcia w Viewing Room
CREATE TABLE viewing_room_pojecia (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vr_id uuid NOT NULL REFERENCES viewing_room(id) ON DELETE CASCADE,
  pojecie_id uuid NOT NULL REFERENCES pojecia(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT vr_pojecia_unique UNIQUE (vr_id, pojecie_id)
);

-- Artyści w Viewing Room (lookup z prac, ale opcjonalnie ręczne)
CREATE TABLE viewing_room_artysci (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vr_id uuid NOT NULL REFERENCES viewing_room(id) ON DELETE CASCADE,
  artysta_id uuid NOT NULL REFERENCES artysci(id) ON DELETE CASCADE,
  rola_w_vr text,  -- 'glowny', 'kontekst', 'zasoby', 'kontynuacja'
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT vr_artysci_unique UNIQUE (vr_id, artysta_id)
);

-- Powiązania między Viewing Roomami (dla "Odkrywaj dalej")
CREATE TABLE viewing_room_powiazane (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vr_id uuid NOT NULL REFERENCES viewing_room(id) ON DELETE CASCADE,
  powiazany_vr_id uuid NOT NULL REFERENCES viewing_room(id) ON DELETE CASCADE,
  notatka text,
  kolejnosc integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT vr_powiazane_unique UNIQUE (vr_id, powiazany_vr_id),
  CONSTRAINT vr_powiazane_different CHECK (vr_id <> powiazany_vr_id)
);
```

#### 7.7 Tabela `viewing_room_assets` — bogate media

Renderingi wnętrz, panoramy, video, detale:

```sql
CREATE TABLE viewing_room_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vr_id uuid NOT NULL REFERENCES viewing_room(id) ON DELETE CASCADE,

  typ_asset text NOT NULL
    CHECK (typ_asset IN (
      'rendering_wnetrze', 'panorama', 'video',
      'detail', 'archiwum', 'cytat_obraz', 'inne'
    )),

  url text NOT NULL,
  url_low_res text,  -- preview, lazy load
  url_thumbnail text,  -- miniatura

  -- Powiązanie z konkretną pracą (opcjonalne)
  praca_id uuid REFERENCES prace(id) ON DELETE SET NULL,

  -- Metadata
  podpis_pl text,
  podpis_en text,
  podpis_de text,
  prompt_ai text,  -- jeśli generowane AI - dla powtórzenia w przyszłości
  zrodlo text,  -- 'midjourney', 'flux', 'photoshop', 'archiwum_galerii', etc.

  -- Pozycja w sekwencji VR
  kolejnosc integer DEFAULT 0,

  -- Dodatkowe dane jsonb (np. dla video: duration; dla 360: angles)
  dane_jsonb jsonb,

  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_vr_assets_vr ON viewing_room_assets(vr_id);
CREATE INDEX idx_vr_assets_praca ON viewing_room_assets(praca_id) WHERE praca_id IS NOT NULL;
```

#### 7.8 Struktura `sekcje_jsonb` — przykład

Pole `viewing_room.sekcje_jsonb` przechowuje sekwencję bloków sekcji 3 (główna narracja). Przykład struktury:

```json
[
  {
    "id": "block-1",
    "typ": "tekst",
    "tekst_pl": "Wanda Gołkowska wprowadziła pojęcie układu otwartego...",
    "tekst_en": "..."
  },
  {
    "id": "block-2",
    "typ": "praca",
    "praca_id": "uuid-pracy-1",
    "kontekst_pl": "Praca z 1974 roku — fundamentalna deklaracja..."
  },
  {
    "id": "block-3",
    "typ": "praca_in_situ",
    "praca_id": "uuid-pracy-1",
    "asset_id": "uuid-renderingu-1"
  },
  {
    "id": "block-4",
    "typ": "tekst",
    "tekst_pl": "Vera Molnar, pracująca w Paryżu, dochodziła do podobnych wniosków..."
  },
  {
    "id": "block-5",
    "typ": "dwie_prace",
    "praca_id_a": "uuid-golkowska",
    "praca_id_b": "uuid-molnar",
    "kontekst_pl": "Po lewej Gołkowska, po prawej Molnar..."
  },
  {
    "id": "block-6",
    "typ": "archiwum",
    "asset_id": "uuid-zdjecia-wystawy-2008"
  },
  {
    "id": "block-7",
    "typ": "cytat",
    "tresc_pl": "Układ otwarty to dla mnie...",
    "autor": "Wanda Gołkowska",
    "zrodlo": "rozmowa z Galerią ESTA, 2008"
  }
]
```

Builder w panelu CRM pozwala dodawać/usuwać/przestawiać bloki drag&drop.

---

## 8. WYTYCZNE PROGRAMISTYCZNE

### 8.1 Struktura plików w `~/Documents/galeria-esta/` (Next.js)

**Helpery (`lib/`):**

```
lib/
├── supabase.ts             (już jest - singleton)
├── slug.ts                 (już jest - artistSlug, workSlug)
├── scoreSimilarity.ts      (już jest - algorytm)
├── discoverFurther.ts      (NOWY - logika modułu Odkrywaj dalej)
├── vrSections.ts           (NOWY - rendering sekcji_jsonb)
└── claudeApi.ts            (NOWY - wrapper dla Claude API w generatorach AI)
```

**Komponenty (`components/`):**

```
components/
├── WorkCard.tsx            (już jest)
├── WorkImage.tsx           (już jest - z fix kadrowania)
├── WorkGallery.tsx         (już jest)
├── WorkDetailSidebar.tsx   (już jest - aktualizacja: blok "W programie galerii")
├── RelatedWorks.tsx        (już jest - DEPRECATED, zastępowany przez DiscoverFurther)
├── DiscoverFurther.tsx     (NOWY - moduł Odkrywaj dalej)
├── VRHero.tsx              (NOWY - hero Viewing Room)
├── VRSequence.tsx          (NOWY - renderowanie sekcji_jsonb)
├── VRBlockPraca.tsx        (NOWY)
├── VRBlockTekst.tsx        (NOWY)
├── VRBlockDetal.tsx        (NOWY)
├── VRBlockCytat.tsx        (NOWY)
├── VRBlockArchiwum.tsx     (NOWY)
├── VRBlockPracaInSitu.tsx  (NOWY)
├── VRBlockDwiePrace.tsx    (NOWY)
├── VRBlockTriptyk.tsx      (NOWY)
├── VRBlockPanorama.tsx     (NOWY)
├── VRBlockVideo.tsx        (NOWY - Client Component)
├── VRBlockBeforeAfter.tsx  (NOWY - Client Component)
├── VRBlockScrollPorownanie.tsx (NOWY - Client Component, framer-motion)
└── DiscreteCTA.tsx         (NOWY - mała subtelna sekcja CTA na końcu)
```

**Routy (`app/`):**

```
app/
├── kolekcja/
│   └── page.tsx            (już jest - aktualizacja: korekty filozoficzne)
├── zasoby/                 (NOWY)
│   ├── page.tsx
│   └── [obszar]/
│       └── page.tsx        (NOWY - filtrowanie po obszarze tematycznym)
├── viewing-room/           (NOWY)
│   ├── page.tsx            (lista VR)
│   ├── [slug]/
│   │   └── page.tsx        (pojedynczy VR)
│   └── archiwum/
│       └── page.tsx        (archiwum VR)
├── praca/[slug]/page.tsx   (już jest - aktualizacja: DiscoverFurther)
├── artysta/[slug]/page.tsx (istnieje - aktualizacja: DiscoverFurther + status_programowy)
├── oferta/[token]/page.tsx (już jest - aktualizacja: dyskretne CTA)
└── api/
    └── ai/                 (NOWE - generatory AI)
        ├── vr-tekst-otwierajacy/route.ts
        ├── vr-komentarz-pracy/route.ts
        └── tekst-kolekcja/route.ts
```

### 8.2 Struktura plików w panelu CRM (`esta-panel.html`)

Panel jest jednym plikiem HTML. Nowe modały:

- **`m-vr`** (Viewing Room) — analogiczny do `m-of`, z builderem sekcji jsonb
- Aktualizacja **`m-p`** (praca) — dodanie pól: `potencjal_viewing_room`, `rola_w_zasobach`, `kontekst_zasobowy_pl/en`, `priorytet_zasoby`, `priorytet_viewing_room`
- Aktualizacja **`m-a`** (artysta) — dodanie: `status_programowy`, `potencjal_viewing_room`, lista relacji ręcznych

Nowe funkcje JS:

- `loadV()` — lista Viewing Roomów (jak `loadO()` dla ofert)
- `opV(id)` — otwiera modal VR
- `editV(id)`, `_fillV(o)`, `saveV()`, `delV(id)` — pełen CRUD
- `addVrBlock(typ)` — dodawanie bloku do sekcji_jsonb
- `removeVrBlock(blockId)` — usuwanie bloku
- `moveVrBlock(blockId, direction)` — przestawianie (SortableJS)
- `genVrText()` — wywołanie generatora AI (przycisk obok pola tekstu)
- `genWorkComment(workId, vrId)` — generator komentarza kuratorskiego per praca w VR
- `genResourceContext(workId)` — generator `kontekst_zasobowy_pl`

### 8.3 Endpointy API dla generatorów AI

Wszystkie 3 generatory mają osobne route'y w Next.js App Router:

**A) `/api/ai/vr-tekst-otwierajacy/route.ts`:**

```typescript
POST /api/ai/vr-tekst-otwierajacy
Body: {
  vr_id: string,
  jezyk: 'pl' | 'en' | 'de',
  ilosc_wariantow: number  // default 3
}
Response: {
  warianty: [
    { tekst: string, dlugosc: number, ton: string },
    ...
  ]
}
```

Server-side wywołuje Claude API z system promptem opisującym DNA galerii ESTA.

**B) `/api/ai/vr-komentarz-pracy/route.ts`:**

```typescript
POST /api/ai/vr-komentarz-pracy
Body: {
  vr_id: string,
  praca_id: string,
  jezyk: 'pl' | 'en' | 'de'
}
Response: {
  komentarz: string  // 2-3 zdania
}
```

**C) `/api/ai/tekst-kolekcja/route.ts`:**

```typescript
POST /api/ai/tekst-kolekcja
Body: {
  typ: 'nota_artysty' | 'linia_programowa' | 'opis_pracy' | 'kontekst_zasobowy',
  artysta_id?: string,
  praca_id?: string,
  jezyk: 'pl' | 'en' | 'de'
}
Response: {
  tekst: string
}
```

### 8.4 Server Components vs Client Components

**Server Components (default):**

- Wszystkie strony list (`/kolekcja`, `/zasoby`, `/viewing-room`)
- Strony szczegółów (`/praca/[slug]`, `/artysta/[slug]`, `/viewing-room/[slug]`)
- Komponent `<DiscoverFurther>`
- Komponent `<VRSequence>` (główny renderer sekwencji VR)
- Komponenty `<VRBlock*>` statyczne (Praca, Tekst, Detal, Cytat, Archiwum, DwiePrace, Triptyk, Panorama, PracaInSitu)

**Client Components (`'use client'`):**

- Filtry interaktywne (jeśli używają stanu)
- `<WorkImage>` (już jest — onError handler)
- `<VRBlockVideo>` (kontrolki video)
- `<VRBlockBeforeAfter>` (slider)
- `<VRBlockScrollPorownanie>` (framer-motion scroll animations)

### 8.5 Stylowanie

Zostajemy przy konwencji obecnego projektu — inline styles + CSS Modules dla bardziej złożonych komponentów (np. VR sequence).

**Stałe typograficzne (powtarzane wszędzie):**

```typescript
const C = '"Cormorant Garamond", Georgia, serif';
const I = '"Instrument Sans", -apple-system, BlinkMacSystemFont, sans-serif';
```

**Kolory globalne:**

```typescript
const COLORS = {
  bgKolekcja: '#fbfaf8',
  bgZasoby: '#faf6f0',   // lekko cieplejsze
  bgViewing: '#fbfaf8',  // jak Kolekcja
  bgOferta: '#fbfaf8',
  text: '#11110f',
  textMuted: '#777',
  textLight: '#aaa',
  border: '#e7e0d7',
  accent: '#11110f',
  hover: '#444'
};
```

### 8.6 Algorytm priorytetów wyświetlania w listach

**`/kolekcja`:**

```sql
ORDER BY
  pokaz_na_home DESC,
  priorytet_kolekcja DESC NULLS LAST,
  artysci.nazwisko_i_imie ASC,
  rok DESC
```

**`/zasoby`:**

```sql
ORDER BY
  priorytet_zasoby DESC NULLS LAST,
  potencjal_viewing_room DESC NULLS LAST,
  artysci.nazwisko_i_imie ASC,
  rok DESC
```

**`/viewing-room` (lista aktywnych VR):**

```sql
WHERE status_publiczny = 'aktywny'
ORDER BY
  pokaz_na_home DESC,
  priorytet_vr DESC,
  data_publikacji DESC NULLS LAST
```

---

## 9. ETAPY REALIZACJI — naturalna kolejność

### Etap 1: Migracja SQL (1 sesja)

Plik `migrations/obszar3_kolekcja_zasoby_vr.sql`:

- Korekta `prace.widocznosc` (`archiwum` → `zasoby`)
- Nowe pola w `prace` (potencjal_viewing_room, rola_w_zasobach, kontekst_zasobowy_pl/en, priorytet_zasoby, priorytet_viewing_room)
- Nowe pola w `artysci` (status_programowy, potencjal_viewing_room)
- M:N `artysci_relacje_recznie`
- Tabela `viewing_room` + M:N (prace, pojęcia, artyści, powiązane)
- Tabela `viewing_room_assets`
- Indeksy + CHECK constraints
- Weryfikacja końcowa

### Etap 2: Korekty Kolekcji (1 sesja)

- Aktualizacja `<WorkCard>` (subtelne pojęcia jako linki)
- Hero section na `/kolekcja`
- Sekcja "Wątki programu" (6 mini-witryn)
- Sekcja "Współczesne kontynuacje"
- Sekcja "28 lat"
- Filtry dwa poziomy
- **Usunięcie pozycji IDEE z menu głównego**
- **Dodanie pozycji ZASOBY w menu**

### Etap 3: Strona Zasobów (1 sesja)

- `/zasoby/` Server Component
- Fetch prac z `widocznosc='zasoby'`
- Hero + sekcje (Artyści, Odkrywaj przez obszary, Z Zasobów do Viewing Room)
- Grid 3-kolumnowy z `<WorkCard kontekst="zasoby">`
- Filtry praktyczne + dodatkowe
- Styl wizualny (cieplejszy ton `#faf6f0`)
- Aktualizacja strony pracy dla kontekstu Zasobów (breadcrumb, kontekst zasobowy)

### Etap 4a: Viewing Room — frontend (1 sesja)

- `/viewing-room/` lista aktywnych VR
- `/viewing-room/[slug]` pojedynczy VR
- Komponenty: `<VRHero>`, `<VRSequence>` + wszystkie bloki `<VRBlock*>`
- `/viewing-room/archiwum/` lista archiwalnych VR
- Renderowanie `sekcje_jsonb` jako sekwencja bloków

### Etap 4b: Viewing Room — panel CRM (1 sesja)

- Modal `m-vr` w `esta-panel.html`
- Pola podstawowe (tytuł PL/EN/DE, slug, typ_vr, status, praca_hero, idea_glowna)
- Builder sekcji jsonb (drag&drop SortableJS, dodawanie/usuwanie bloków)
- Multiselect prac (z Kolekcji + Zasobów razem)
- Multiselect pojęć i artystów
- Pole tekstu otwierającego PL/EN/DE
- Funkcje CRUD: `loadV`, `opV`, `editV`, `_fillV`, `saveV`, `delV`

### Etap 5: Asystent AI w panelu (1 sesja)

- `lib/claudeApi.ts` w Next.js (wrapper Claude API)
- 3 endpointy w `/api/ai/`:
  - `vr-tekst-otwierajacy`
  - `vr-komentarz-pracy`
  - `tekst-kolekcja`
- Przyciski w panelu CRM uruchamiające generatory
- System prompty opisujące DNA Galerii ESTA dla każdego typu generatora
- Obsługa 3 języków (PL/EN/DE)

### Etap 6: Moduł "Odkrywaj dalej" (1 sesja)

- `lib/discoverFurther.ts` (logika algorytmu hybrydowego)
- Komponent `<DiscoverFurther>` Server Component
- Wstawienie na: `/praca/[slug]`, `/artysta/[slug]`, `/viewing-room/[slug]`, `/wystawa/[slug]`, `/kompendium/[slug]`
- Sekcje: Inne prace artysty, W programie galerii zobacz także, W Viewing Room, Z wystaw, Z kompendium
- Wariant dla Zasobów (sekcja "W relacjach z")
- Wariant dla VR (powiązane VR)

### Etap 7: Korekty Oferty indywidualnej (mała sesja)

- Aktualizacja `<WorkCard>` w kontekście oferty (dyskretne pojęcia)
- Stopka z CTA do `/kolekcja` (już wcześniej zaplanowane)
- Task A1.5 — uproszczenie modalu m-of
- Task A2 — widget listy prac w ofercie
- Task B7 — `/oferta/[token]` z listą prac

### Razem: ~7-8 sesji

To pełen zakres realizacji. Każda sesja samowystarczalna — można robić w kolejności i robić przerwy.

---

## 10. CO ZMIENIA SIĘ DLA TADEUSZA — workflow operacyjny

### Przed reorganizacją

Galerysta:
1. Dodaje pracę w panelu, ustawia `widocznosc='kolekcja'` lub `'archiwum'`
2. Praca pojawia się na `/kolekcja` lub w starym viewing-room
3. Oferty indywidualne tworzone w modal m-of

### Po reorganizacji

Galerysta:

1. **Dodaje pracę** w panelu, ustawia:
   - `widocznosc` (kolekcja / zasoby / oferta_token / zasob / ukryte)
   - `priorytet_kolekcja` lub `priorytet_zasoby`
   - opcjonalnie `potencjal_viewing_room`, `rola_w_zasobach`, `kontekst_zasobowy_pl/en`
   - klika "Wygeneruj opis pracy" → AI proponuje, galerysta edytuje

2. **Tworzy Viewing Room** w nowym modalu m-vr:
   - Wybiera typ_vr (Relacja / Idea / Monografia / etc.)
   - Wpisuje tytuł i slug
   - Wybiera pracę hero
   - Wybiera idea_glowna
   - **Klika "Wygeneruj tekst otwierający"** → AI proponuje 3 warianty, galerysta wybiera, edytuje
   - Buduje sekwencję narracyjną drag&drop (dodaje prace, teksty, detale, archiwa, renderingi wnętrz)
   - Per każda praca w VR: **klika "Krótki komentarz kuratorski"** → AI proponuje, galerysta zatwierdza
   - Publikuje (status_publiczny: szkic → aktywny)

3. **Tworzy ofertę indywidualną** w modal m-of (jak dotychczas, bez zmian funkcjonalnych)

4. **Aktualizuje powiązania ręczne** dla kluczowych prac/artystów (M:N w panelu CRM)

### Asystent AI w workflow

Trzy przyciski wszędzie gdzie się to przydaje:

- **"Wygeneruj propozycję"** (krótka opcja, AI generuje od razu jeden wariant)
- **"Wygeneruj 3 warianty"** (większa opcja, AI daje wybór)
- **"Tłumacz na EN/DE"** (przy każdym polu PL — automatyczne tłumaczenie z opcją edycji)

Wszystkie generatory **zapisują wynik jako sugestię, nie zatwierdzają automatycznie**. Galerysta zawsze ma ostateczną decyzję.

---

## 11. EFEKT KOŃCOWY — co osiągamy

### Dla klienta

Klient wchodzi na stronę Galerii ESTA. Nie czyta o sześciu ideach. Nie studiuje pojęć. Nie analizuje systemu.

Po 20 minutach dochodzi do wniosku:

> "Ta galeria od 28 lat mówi o tych samych ważnych rzeczach, tylko za pomocą różnych artystów."

I właśnie wtedy idee spełniają swoją rolę — są niewidoczne, a jednocześnie obecne wszędzie.

### Dla Galerii ESTA

- **Kolekcja** = bardzo dobra strona sprzedażowa wyglądająca jak premium gallery wall
- **Zasoby** = inteligentny zapas relacji z 28 lat działalności
- **Viewing Room** = unikalny w polskim środowisku format ciągłej działalności kuratorskiej online
- **Oferty indywidualne** = profesjonalne narzędzie sprzedaży z elegancką dyskrecją

Po 5 latach systemowej pracy: **60-80 cyfrowych Viewing Roomów** jako historia myślenia galerii. To poziom, na którym zaczynają działać już nie galerie handlowe, tylko instytucje z własnym głosem kuratorskim.

### Dla Tadeusza operacyjnie

- AI asystent w 3 zakresach (teksty VR, komentarze kuratorskie, teksty Kolekcji/Zasobów)
- Workflow tworzenia VR przyspieszony przez generatory
- Manualne kontrolowanie końcowych decyzji kuratorskich
- Spójne DNA wizualne przez 4 światy (Kolekcja + Zasoby + Viewing Room + Oferta indywidualna)
- Możliwość poszerzania w przyszłości (AI generatory wnętrz, AR, 3D — Obszar 7)

### Najważniejsza zasada do trzymania się

> Nie tworzymy katalogu prac. Tworzymy system odkrywania Galerii ESTA.

To zdanie jest kompasem dla wszystkich decyzji wdrożeniowych. Gdy w wątpliwość — wracamy do tego pytania: "Czy to pomaga w odkrywaniu, czy zamyka odkrywanie?"

### Drugi kompas — poczucie wartości własnej klienta

Cytując zasadę z sekcji 0, którą warto powtórzyć tutaj:

> **Najważniejsze jest gdy dochodzimy sami do czegoś — nawet gdy to jest z góry zamierzony cel kogoś innego. Mamy bardzo subtelnie dawać odbiorcy poczucie wartości własnej.**

Każdy element interfejsu który **mówi klientowi co ma myśleć** odbiera mu radość samodzielnego odkrycia. Każdy element który **zostawia przestrzeń do dostrzeżenia własnego wzoru** wzmacnia jego poczucie wartości własnej.

To różnica między galerią która tłumaczy, a galerią która towarzyszy. Galeria ESTA wybiera drugą drogę.

Idee i pojęcia są w bazie, sterują systemem rekomendacji, łączą prace w spójne obszary. Ale ich nazwy nie pojawiają się jako etykiety przed klientem. Klient widzi prace, dialogi między pracami, subtelne pojęcia jako klikalne tropy — i sam dochodzi do tego co je łączy. Sam odkrywa porządek 28-letniej pracy galerii. I to odkrycie należy do niego — nawet jeśli zostało starannie zaprojektowane.

---

## 12. CO POZA ZAKRESEM TEGO DOKUMENTU

Następujące tematy są w odrębnych dokumentach lub planowane na przyszłość:

- **Oferty indywidualne** — pełen koncept w `docs/OBSZAR-4-OFERTY.md` (aktualizowany pod kątem spójności DNA wizualnego)
- **Obszar 7 — AI Integration** (przyszłość): integracja API generatorów obrazów (Replicate, Flux), automatyzacja renderingów wnętrz, ewentualne AR/3D
- **Obszar 8 — International** (osobny): wersja EN strony z naciskiem na Central European conceptual art (już częściowo opisany w wcześniejszych dokumentach)
- **Obszar 9 — SEO i marketing** (osobny): meta tagi, schema.org, sitemap, integracja z MailChimp dla newslettera
- **Obszar 10 — Mobile experience** (osobny): dedykowane interakcje touch, optymalizacja layoutu na małe ekrany

---

## 13. ZAMKNIĘCIE

Ten dokument zamyka koncepcyjnie pracę nad architekturą publicznej strony Galerii ESTA. Wieloramienne dyskusje doprowadziły do dojrzałej, spójnej wizji opartej na czterech światach z jasnymi rolami i jednym DNA wizualnym.

**Kolekcja** pokazuje program.
**Zasoby** pokazują pamięć i potencjał.
**Viewing Room** pokazuje myślenie.
**Oferta indywidualna** pokazuje relację z konkretnym klientem.

Wszystko działa w jednej narracji, jednej estetyce, jednym ekosystemie odkrywania.

Następny krok: **realizacja techniczna w naturalnej kolejności etapów** (rozdział 9). Każdy etap samodzielny, każdy buduje na poprzednim, każdy przybliża galerię do ostatecznego efektu — przestrzeni gdzie klient po 20 minutach sam odkrywa konsekwencję 28-letniej pracy.

---

*Dokument koncepcyjny v1.0 — Galeria ESTA — czerwiec 2026*
*Autor: Tadeusz Stapowicz, we współpracy z asystentem AI*
*Status: ostateczna synteza, gotowa do realizacji*
