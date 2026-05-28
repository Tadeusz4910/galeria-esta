# GALERIA ESTA — ARCHITEKTURA SYSTEMU
### Dokument fundamentalny · maj 2026 · wersja robocza do zatwierdzenia

> Ten dokument obejmuje **całość** projektu jako jeden zintegrowany system: stronę publiczną, panel zarządzania, oferty, archiwum, media i wideo, oraz warstwy działania (merytoryczną, sprzedażową, marketingową, organizacyjną, finansową i AI). Jest podstawą wszystkich dalszych decyzji wykonawczych.

---

## 0. ZASADA NADRZĘDNA

**Jedno źródło prawdy (baza Supabase). Każdą rzecz wprowadzasz RAZ. Wszystko linkuje się do wszystkiego. Status/widoczność decyduje co wychodzi na zewnątrz, a co zostaje Twoim zamkniętym zasobem.**

Z tej jednej zasady wynika cała reszta — strona, panel, bezpieczeństwo, AI, marketing.

---

## 1. CZTERY BYTY TECHNICZNE

| Byt | Rola | Technologia | Dostęp do danych |
|---|---|---|---|
| **Nowa strona** | publiczna twarz galerii | Next.js / Vercel | tylko publiczne (anon + widoki) |
| **Stara strona** | archiwum 28 lat | istnieje, niezmieniana | linkowana, nie kopiowana |
| **Panel esta-crm** | centrum dowodzenia | HTML/JS, hosting | pełny (Supabase Auth) |
| **Baza Supabase** | jedyne źródło prawdy | PostgreSQL 17.6 | spina wszystko |

Oferty indywidualne z tokenem to **część nowej strony** (osobna podstrona dostępna po sekretnym linku), nie osobny byt — zastępują dawny PHP-owy viewing-room, który po wdrożeniu wygaszamy.

---

## 2. LINKOWANIE — jak to działa (rozwianie obawy)

**W panelu obsługujesz to multiselectami — dokładnie jak w starym Airtable.** Wybierasz „do tej wystawy: Kozłowski, Dróżdż" i gotowe.

Różnica jest tylko „pod podłogą": to co wybierasz, zapisuje się w tzw. tabeli łączącej (np. `wystawy_artysci`). **Tej tabeli nigdy nie dotykasz ręcznie** — wypełnia się sama z Twojego multiselectu. Airtable robił dokładnie to samo, tylko ukrywał tę tabelkę.

**Dlatego „wiele tabel łączących" = „wiele multiselectów które już znasz".** Nie dochodzi pracy. Nie ma ryzyka, że „o którejś zapomnimy" — bo Ty nie obsługujesz tabel, tylko klikasz powiązania, a panel wie co za tym zapisać.

**Różnica jakościowa wobec starego systemu:** w Airtable spinaczem był artysta (wszystko wisiało na nim). Tu mamy **sieć**, nie drzewo — idea może spinać artystów, praca może łączyć się z filmem i artykułem niezależnie od artysty, artykuł z targów wiąże się z targami + artystami + pracami + ideami naraz. Większa moc, ta sama prostota obsługi.

---

## 3. MODEL DANYCH (serce systemu)

### 3.1. Encje główne (każda = jeden rekord, wprowadzany raz)

- **`idee`** — 6 głównych + blok współczesny (wg konceptu idei: numer, slug, opis_home, opis_dlugi, detal, SEO)
- **`pojecia`** — z polami `status_publiczny` (ukryte/sygnał/tag/filtr/strona) + `etap_wdrozenia` + `idea_glowna` + `meta_index`
- **`artysci`** — + pole **`krag`** (rdzeń / poszerzony / współczesne) — osobny wymiar od idei
- **`artysci_dokumenty`** — sekcje profilu artysty: biografia, wystawy indywidualne (spis CV), wystawy zbiorowe (spis CV), bibliografia, nagrody, **prace w zbiorach** (muzea/kolekcje). **Każdy wpis wspiera linki zewnętrzne** (np. praca Gostomskiego w zbiorach MoMA → link do katalogu instytucji). Edytor WYSIWYG (już istnieje).
- **`prace`** — z modelem statusów widoczności (3.3) + pola publiczne i poufne (3.4) + pola wielojęzyczne (`_pl/_en/_de`) + flagi International (`int_publiczne`, `int_priorytet`, `rynek_priorytetowy`, `cena_eur`, `int_visual_wall`, relacja `prace_powiazane`) — sekcja 5B
- **`wystawy`** — typ (indywidualna / zbiorowa), własna galerii / z CV artysty
- **`targi`** — pełnoprawny byt (obecność w obiegu: ArtBasel, Art Collect…)
- **`media`** — zdjęcia i pliki (Storage); pojedyncze i wsadowe (z imprez)
- **`filmy`** — materiały wideo (własne + osadzane z YouTube/Vimeo)
- **`kompendium`** — teksty pogłębiające
- **`artykuly`** (blog) — bieżące: przepisane najistotniejsze ze starej bazy + nowe
- **`klienci`** + domena CRM (poufne)
- **`oferty`** — indywidualne z tokenem
- **finanse:** `koszty`, `wplywy`, `transakcje`, `projekty_finansowe`

### 3.2. Sieć powiązań (tabele łączące = multiselecty)

Każdy byt łączy się z każdym istotnym. Kluczowe powiązania:

```
idee ↔ artysci          pojecia ↔ artysci        wystawy ↔ artysci
idee ↔ prace            pojecia ↔ prace          wystawy ↔ prace
artykuly ↔ artysci      targi ↔ artysci          filmy ↔ artysci
artykuly ↔ idee         targi ↔ prace            filmy ↔ wystawy
artykuly ↔ prace        kompendium ↔ idee        filmy ↔ targi
artykuly ↔ wystawy      kompendium ↔ artysci     media ↔ (wystawy/targi/artysci/prace/artykuly)
artykuly ↔ targi
```

Artysta: **1 idea główna + N idei uzupełniających + N pojęć + 1 krąg.**
Praca: **1 idea główna + N pojęć + N wystaw + N targów.**

### 3.3. Statusy pracy — sterują wyjściem (3 okna + zasób zamknięty)

Zamiast dzisiejszego chaosu (4 pola, które muszą być spójne) — jeden czytelny wymiar:

| Status widoczności | Gdzie pokazywana |
|---|---|
| `kolekcja` | **Okno 1** — oferta główna nowej strony |
| `archiwum` | **Okno 2** — publiczny zasób 28 lat |
| `oferta_token` | **Okno 3** — tylko przez sekretny token |
| `zasob` | nigdzie publicznie — tylko panel (analizy/finanse/AI) |

Ortogonalnie: **`status_handlowy`** (dostępna / zarezerwowana / sprzedana) — bo sprzedana praca może wciąż być widoczna z adnotacją „sprzedane" (buduje prestiż), ale bez ujawniania kwoty.

Wszystkie 3 okna mają **ten sam premium design**; różnią się formą prezentacji (grid / przestrzeń wirtualna / układ wg idei) wybieraną per widok.

### 3.4. Pola poufne — NIGDY na zewnątrz (w żadnym oknie)

Ceny (zakup/sprzedaż/min/marża), koszty, proweniencja wewnętrzna, oceny i uzasadnienia AI, prawdopodobieństwa, notatki, status własności, daty transakcyjne. Realizacja: **publiczne widoki** (`prace_public`, `artysci_public`…) wystawiające tylko bezpieczne kolumny.

---

## 4. MEDIA I WIDEO (zdjęcia + filmy)

To pełnoprawny wątek systemu, nie dodatek. Powstaje masowo: wystawy, wernisaże, targi, ArtBasel, wizyty na obcych imprezach.

### Zdjęcia
- panel ma już obsługę: upload **pojedynczy** i **wsadowy** (cała impreza naraz) do Supabase Storage
- przy wgrywaniu: auto-nazwy, auto-alt, **automatyczne SEO** (tytuł, opis, alt, tagi) generowane przez AI
- każde zdjęcie wpinane multiselektem do: wystawy / targów / artysty / pracy / artykułu
- pojawia się wszędzie tam, gdzie zostało przypisane

### Filmy (do dobudowania — jeszcze nie ma obsługi)
- **dwa źródła:** filmy własne (upload) oraz osadzane z **YouTube / Vimeo** (link → osadzenie na stronie)
- ten sam model powiązań co zdjęcia: film ↔ artysta / wystawa / targi / idea
- automatyczne SEO opisy do filmów
- warstwa wideo publikowalna na stronie (profile artystów, wystawy, blog) oraz materiał do social media

**Scenariusz ArtBasel:** robisz setki zdjęć i filmików → wsadowy upload do panelu z przypisaniem do „Targi: ArtBasel 2026" → AI generuje SEO, opisy, serię postów social i szkic artykułu na blog → wszystko wpięte w artystów, których prezentowałeś. Materiał staje się treścią automatycznie.

---

## 5. WARSTWY DZIAŁANIA — jak żyje galeria każdego dnia

### 5.1. MERYTORYCZNA — budowanie programu
Wprowadzasz artystę raz (krąg, idea główna, pojęcia, bio, hero). Od tej chwili **sam pojawia się wszędzie**: na planszy swojej idei, w swoim kręgu, na stronie idei, w wyszukiwaniu po pojęciu. Praca dziedziczy idee, wpada do kolekcji, łączy się z wystawami. Nawigacja „przez idee" buduje się sama z Twoich powiązań — to Wasz wyróżnik.

### 5.2. SPRZEDAŻOWA — od pracy do pieniędzy
Kolekcjoner zainteresowany geometrią → filtrujesz prace po idei + dostępność + budżet → **AI podpowiada które prace i dlaczego + strategię rozmowy** → zaznaczasz, klikasz „Generuj ofertę" → powstaje **indywidualny viewing-room z tokenem** (premium, opisy PL+EN od AI, ceny ofertowe bez zakupowych) → wysyłasz link → klient ogląda na telefonie, nikt inny nie widzi → kupuje → status „sprzedana" automatycznie: znika z dostępnych, wpływa do finansów, generuje certyfikat i umowę. **Jeden przepływ od zainteresowania do dokumentu.**

### 5.3. MARKETINGOWA — w tym social media
Praca/wystawa/targi/nowy nabytek → klik „Post na Instagram/Facebook" → **AI generuje gotowy post (PL+EN)** w stylu galerii, z odniesieniem do idei → zatwierdzasz, publikujesz. Filmy i zdjęcia z imprez → materiał na posty + blog. **Marketing przestaje być osobną pracą — staje się produktem ubocznym tego co i tak robisz w panelu.** To główna dźwignia czasu: nie tworzysz od zera, tylko zatwierdzasz to co AI wygeneruje z zasobu.

### 5.4. ORGANIZACYJNA — wystawy, targi, dokumenty, archiwum
Wystawy i targi = **dowód programu i historii**, pełnoprawne byty. Tworzysz wystawę → multiselect artystów i prac → dokumentacja, film, plakat → generujesz protokoły (panel już to ma). Po wystawie: wpina się w CV artystów, idee, archiwum. Każda praca „pamięta" wystawy i targi → proweniencja i prestiż przy sprzedaży.

**Profil artysty jako mała strona kuratorska** — sekcje (biografia, wystawy indywidualne, zbiorowe, bibliografia, nagrody, prace w zbiorach) z **linkowaniem zewnętrznym do instytucji**. Praca w MoMA, Muzeum Sztuki w Łodzi, kolekcji prywatnej → link do katalogu/strony instytucji. To buduje **prestiż, wiarygodność i SEO** (linki do renomowanych instytucji wzmacniają autorytet strony). Wymóg: wszystkie pola dokumentowe artysty wspierają linki zewnętrzne.

### 5.5. FINANSOWA — kontrola i decyzje
Każda praca ma pełny obraz finansowy (tylko dla Ciebie): zakup, koszty, cena ofertowa, marża, prawdopodobieństwo. Dashboard: wpływy, koszty, wynik, cele, prace w negocjacji. **AI analizuje zasób:** „te prace zalegają — rozważ viewing-room tematyczny", „ten segment się sprzedaje — dokup". Finanse jako narzędzie decyzji w czasie rzeczywistym, nie Excel po fakcie.

### 5.6. AI — przekrojowo, konkretne dźwignie
- **dobiera kupca do pracy i pracę do kupca** (główny problem sprzedażowy → automat)
- **pisze opisy, SEO, posty, maile** (PL+EN, docelowo DE) z Twojego zasobu, w Twoim stylu
- **tłumaczy treści** przy zapisie (PL→EN→DE), Ty tylko korygujesz — to czyni wielojęzyczność wykonalną bez armii tłumaczy
- **analizuje zasób i sprzedaż** — co robić z czym
- **generuje treści marketingowe** z tego co i tak wprowadzasz

Efekt: czas tracony dziś na pisanie/dobieranie/marketing wraca do Ciebie. Wprowadzasz raz — AI mnoży na wszystkie kanały.

---

## 5A. WIELOJĘZYCZNOŚĆ I RYNEK MIĘDZYNARODOWY (strategiczne)

**Diagnoza odbiorcy:** konceptualizm i geometria trafiają do **doświadczonego kolekcjonera**, nie do początkującego. Kluczowy rynek tej niszy to **DACH (Niemcy, Austria, Szwajcaria)** — głęboka tradycja sztuki konkretnej, konceptualnej i systemów, silne kolekcje muzealne i prywatne. To realna przewaga, jeśli galeria tam dotrze.

**Decyzja architektoniczna:** budujemy bazę i stronę **wielojęzycznie OD FUNDAMENTU** — nie „polska strona + tłumaczenie potem", lecz struktura na N języków. Dzięki temu dołożenie kolejnego języka to ten sam mechanizm, nie przebudowa.

### Poziom A — pełna wersja angielska (obowiązkowy)
- każde istotne pole ma wersję PL i EN (część pól `_en` już istnieje w bazie)
- AI generuje tłumaczenia przy zapisie → Ty korygujesz
- osobne adresy `/en/...` z własnym, pełnym SEO pod klienta europejskiego

### Poziom B — niemiecki (mocno rekomendowany, etapowo)
- skoro DACH to kluczowy rynek — wersja DE kluczowych treści (idee, profile rdzenia, viewing-roomy, oferty) może być przewagą, której nie ma prawie żadna polska galeria
- nie musi być pełna od razu: najpierw treści programowe i sprzedażowe
- baza projektowana pod wielojęzyczność → DE dokłada się bez bólu

### Poziom C — dotarcie do rynku DACH (osobna warstwa strategii)
- SEO niemieckie, obecność w niemieckich katalogach sztuki
- targi: Art Karlsruhe, Positions Berlin, Art Basel
- bezpośredni kontakt z kolekcjonerami niszy konkret/konceptualizm
- *(do rozpisania osobno po wdrożeniu fundamentu — ale wpływa na to, jakie języki i SEO budujemy już teraz)*

---

## 5B. PROGRAM INTERNATIONAL (warstwa międzynarodowa)

> **Zasada nadrzędna tej sekcji:** International to NIE osobny moduł ani osobna baza — to **warstwa flag i widoków nad tym samym jednym źródłem prawdy.** Treść (opisy, bio, pojęcia) jest jedna i wielojęzyczna; flagi `INT_*` decydują tylko CO i GDZIE wchodzi do działu międzynarodowego. Zero dublowania treści.

### Pozycjonowanie: publicznie szeroko, operacyjnie wąsko
- **Publicznie:** „International Program — Central European Conceptual, Concrete & Geometric Art". NIE „DACH" (zawężałoby — odpychało Włochy, Czechy, Skandynawię, USA).
- **Operacyjnie:** DACH (Niemcy/Austria/Szwajcaria) to pierwszy priorytet SEO i dotarcia — trzymany w polu `rynek_priorytetowy`, nie w nazwie publicznej.
- **Adresy:** `/international/` oraz `/international/central-european-conceptual-geometric-art/`, podstrony `/international/polish-conceptual-art/`, `/international/central-european-geometric-art/`, `/international/selected-works/`, `/international/artists/`, `/international/sold-related-works/`.

### Jak to realizujemy w modelu danych (BEZ duplikacji)
Kluczowe rozróżnienie wobec dokumentu źródłowego: nie tworzymy równoległych pól `INT_TEKST_PL/EN/DE` obok zwykłych opisów. Zamiast tego:

- **Treść = jedna, wielojęzyczna.** Opisy prac, bio artystów, teksty — w polach `_pl` / `_en` / `_de` (wielojęzyczność z sekcji 5A). Ten sam opis obsługuje stronę PL i dział International. Jedno miejsce prawdy.
- **`INT_SEGMENT` = nasze IDEE i POJĘCIA po angielsku/niemiecku.** „System/Structure", „Open Arrangement", „Concrete Poetry", „Language/Sign" to istniejące idee i pojęcia, nie nowy słownik. Dodajemy im nazwy EN/DE (`nazwa_en`, `nazwa_de`) — filtr International używa tych samych pojęć co reszta strony.
- **Flagi sterujące (nowe, lekkie pola — to jest właściwa warstwa INT):**
  - `int_publiczne` (bool) — czy praca/artysta wchodzi do działu International
  - `int_priorytet` (1 kluczowa / 2 mocna / 3 uzupełniająca)
  - `rynek_priorytetowy` (multi: DACH / Italy / Central Europe / Wider International / Institutions / Collectors / Architects / Art Fairs) — gdzie praca/artysta/oferta ma potencjał
  - `int_kraj` (artysta: Poland/Hungary/Slovakia/Germany/Austria/Switzerland/Italy/Czech/Other)
  - `cena_eur` (currency) — cena do ofert międzynarodowych (poufna, jak inne ceny)
  - `prace_powiazane` (relacja praca↔praca) — „related works", kluczowe dla sprzedanych (zapytanie o sprzedaną pracę → pokrewne dostępne)
- **Oferty** dostają flagi `int_oferta`, `int_typ_oferty`, `int_jezyk`, `int_rynek` — ale to ta sama tabela `oferty` z tokenem (sekcja 1), nie osobny byt.

### Sold / Related Works — wykorzystanie sprzedanych prac
Sprzedana ważna praca NIE znika — zostaje jako punkt wejścia SEO i dowód prestiżu („Kozłowski, Deka-log, 1972 — Sold"), z relacją `prace_powiazane` → dostępne prace pokrewne. To realizuje `status_handlowy = sprzedana` + widoczność (sekcja 3.3) + relacja powiązań. Mechanizm już mamy — tu tylko go wykorzystujemy.

### Program artystyczny International (rozszerzony)
Trzy osie (artysta może być w kilku naraz — sieć, nie szuflady):
- **Oś 1 — Conceptual / Language / System:** Kozłowski, Dróżdż, Dłużniewski, Chwałczyk, Barbara Kozłowska
- **Oś 2 — Open Arrangement / Space / Object:** Gołkowska, Berdyszak, Gostomski, Chwałczyk, Brandt
- **Oś 3 — Geometry / Concrete / Structure:** Pamuła, Haász, Hulík, Roy, Wiśniewski, Berdyszak, Gołkowska

> **Decyzja do podjęcia osobno:** artyści zagraniczni (István Haász/HU, Viktor Hulík/SK, Reinhard Roy/DE) i polscy nowi w bazie (Berdyszak, Pamuła, Brandt, Barbara Kozłowska) — rozdzielić na „mam prace, wprowadzam" vs. „programowo pożądani, do pozyskania". Wpływa na zakres pracy, nie na model.

### Visual Wall — czwarte okno wyjścia (ekran w galerii w Gliwicach)
Ta sama baza zasila ekran fizyczny w galerii (85", przez Apple TV/Keynote na start, docelowo zasilany ze strony). To **kolejne okno** obok kolekcji/archiwum/oferty — nie nowy system.
- `int_visual_wall` (bool) — czy praca wchodzi na ekran
- `int_visual_wall_tekst_pl/en/de` — krótki tekst na ekran (jedyne pola tekstowe specyficzne dla VW, bo to inny, skrótowy format niż opis pełny)
- program plansz: logo → International Program → dwa filary → artyści z hasłami → selected works → QR do `/international/` → kontakt
- **Strategiczna wartość:** strona, ekran w galerii, oferty i social media to cztery wyjścia tego samego zasobu. Visual Wall czyni stronę dosłownie „witryną" galerii.

### SEO i języki (spójne z 5A)
- EN = główny język międzynarodowy (dociera globalnie), DE = przewaga w DACH, PL = źródło/kontrola
- frazy EN (Central European conceptual art, Polish neo-avant-garde…) i DE (polnische Konzeptkunst, konkrete Kunst…) — w polach SEO wielojęzycznych
- `hreflang` dopiero gdy powstaną równoległe wersje EN/DE; na start jedna wersja EN wystarczy
- dane strukturalne (schema.org VisualArtwork) — etap późniejszy
- AI generuje tłumaczenia i teksty SEO (PL→EN→DE), Ty korygujesz

---

## 6. BEZPIECZEŃSTWO (Droga A — docelowe)

- **Strona (anon):** widzi tylko publiczne widoki (`*_public`) i tylko publiczne wiersze wg statusu. RLS + REVOKE na tabelach bazowych. *(klienci/finanse — już zabezpieczone w maju 2026)*
- **Panel (Supabase Auth):** logowanie kontem; zalogowany właściciel widzi wszystko; **klucz master nigdy w przeglądarce.** To naprawia obecny problem (panel na anon stracił dostęp do klientów po włączeniu RLS) w trwały, profesjonalny sposób.
- **Oferty z tokenem:** dostęp po sekretnym tokenie bez logowania — klient widzi swoją ofertę, nikt inny jej nie znajdzie.

---

## 7. PANEL — czy budowany w dobrym, przyszłościowym modelu?

**Uczciwa ocena.**

### Co jest DOBRE i zostaje (mocny, realny dorobek)
Pełny CRUD prac/artystów/klientów; finanse (koszty/wpływy/projekty/transakcje); Media Library + Storage z uploadem wsadowym; generator dokumentów (umowy/protokoły/certyfikaty); silnik dopasowań AI; generatory opisów/postów/maili. Czytelna konwencja kodu, łatwo znaleźć funkcje. Wgrywanie przez Transmit = prostota bez buildu.

### Co wymaga ZMIANY (bo powstało dla wcześniejszego, niepełnego konceptu)
- klucz `anon` → **Supabase Auth** (bezpieczeństwo + odzyskanie dostępu panelu)
- klasyfikacja `_txt` (CSV) → **relacje** (warunek trafnego AI i poprawnych filtrów)
- cele sprzedaży z `localStorage` → **baza** (praca na wielu urządzeniach)
- AI kontekst max 80 klientów → **pełny zasób** (inaczej przy setkach klientów analiza jest ślepa)
- **persystencja wyników AI** (dziś znikają po odświeżeniu)

### Co DOBUDOWUJEMY (brakujące ogniwa po PHP/Airtable)
- moduł **generowania ofert z tokenem** (zastępuje stary viewing-room)
- podłączenie martwych przycisków „Generuj ofertę" / „Dopasuj klientów AI"
- moduły: **idee/pojęcia** (nowe tabele), wystawy z typami, targi z relacjami, **filmy**, blog z pełnymi powiązaniami
- automatyzacja: SEO (PL/EN) i posty social przy zapisie

### Czy model jest przyszłościowy? — ODPOWIEDŹ
**Tak, fundament jest dobry i rozwojowy — pod jednym warunkiem: przejścia na relacje i Auth.** Powody:
1. **Wydajność przy skali (1000+ prac, setki klientów):** ograniczeniem NIE jest panel (jeden plik HTML uniesie to spokojnie) — ograniczeniem byłaby klasyfikacja tekstowa. Po przejściu na relacje + indeksy w PostgreSQL, baza obsłuży dziesiątki tysięcy rekordów bez problemu. To jest skala na lata.
2. **Monolit (duże pliki HTML) — świadoma, dobra decyzja na teraz:** prostota wgrywania (Transmit, brak buildu) przewyższa korzyści z rozbicia. Rozbijemy na moduły TYLKO jeśli realnie zacznie przeszkadzać w pracy — nie dla samej zasady. To pragmatyzm, nie dług.
3. **Kierunek rozwoju:** panel jest gotowy rosnąć modułami — dokładasz sekcje (filmy, idee, oferty) bez przebudowy reszty. Architektura „sekcja = blok funkcji" to umożliwia.

**Wniosek:** nie zaczynamy panelu od zera (szkoda dorobku i czasu). Doprowadzamy go do docelowego modelu trzema zmianami fundamentalnymi (relacje, Auth, persystencja AI) + dobudową brakujących modułów. To jest model przyszłościowy.

---

## 8. KOLEJNOŚĆ WDROŻENIA

### FAZA 1 — FUNDAMENT DANYCH I BEZPIECZEŃSTWA *(„domknięcie panelu")*
1. Pełny docelowy **schemat bazy** (encje + relacje + statusy + **struktura wielojęzyczna PL/EN/DE**) — do zatwierdzenia
2. Wdrożenie: tabele `idee`/`pojecia`, kręgi, nowy model statusów prac, kluczowe tabele łączące
3. **Supabase Auth + RLS + publiczne widoki** (bezpieczeństwo docelowe)
4. Dostosowanie panelu: relacje zamiast txt, wprowadzanie idei/pojęć/kręgów/statusów, Auth, pola wielojęzyczne, linkowanie zewnętrzne w dokumentach artysty

### FAZA 2 — STRONA POD ARTBASEL
5. Strona główna (6 plansz idei + blok współczesny + 3 kręgi), profile artystów (dokończyć hero+sekcje+dokumenty z linkami), kolekcja (okno 1) — mobile-first, **PL + EN**

### FAZA 3 — SPRZEDAŻ I MEDIA
6. Oferty indywidualne (token), zasób archiwalny (okno 2), wystawy/targi z pełnymi relacjami, **moduł filmów (upload + YouTube)**, media z imprez, blog wpięty w sieć

### FAZA 4 — GŁĘBIA, AUTOMATYZACJA, RYNEK MIĘDZYNARODOWY
7. Strony idei/pojęć, kompendium, dopasowania AI podłączone + persystencja, automatyzacja SEO/social media
8. **Dział International** (`/international/`): flagi `int_*` + `rynek_priorytetowy`, nazwy EN/DE dla idei/pojęć, podstrony programu, selected works, sold/related works, wersja DE kluczowych treści, strategia dotarcia (DACH priorytet)
9. **Visual Wall** — ekran w galerii zasilany z bazy (flaga `int_visual_wall` + teksty na ekran); start: Keynote/Apple TV, docelowo żywe zasilanie ze strony

---

## 9. CO ZYSKUJESZ — bilans wobec czasu

Dziś sprzedajesz „ręcznie": szukasz, piszesz, dobierasz, marketujesz osobno, finanse w Excelu po fakcie.

Po wdrożeniu: **wprowadzasz raz, a system sam** pokazuje pracę we właściwym oknie, dobiera klienta, generuje ofertę i dokumenty, tworzy posty i SEO, pilnuje finansów, buduje nawigację przez idee.

To różnica między **galerią którą obsługujesz** a **galerią która się napędza, a Ty nią sterujesz.** Czas zainwestowany teraz to fundament tej dźwigni — zwraca się z każdą kolejną pracą, ofertą i postem, których już nie robisz od zera.

---

## 10. FORMUŁA SYSTEMU (do zapamiętania)

> Idee tworzą mapę. Pojęcia — tropy. Artyści nadają im ciało. Prace pokazują formę.
> Wystawy i targi potwierdzają historię. Media i filmy ją utrwalają.
> Kompendium rozwija znaczenia. Blog pokazuje bieżące życie.
> Viewing-room (oferty) przekłada wszystko na sprzedaż. AI mnoży to na wszystkie kanały.
> Współczesne kontynuacje pokazują, że program żyje dalej.
> Program International otwiera go na świat (publicznie szeroko, DACH operacyjnie).
> Visual Wall przenosi go na ścianę galerii w Gliwicach.
>
> **Jedno źródło. Wiele wyjść: strona, oferty, ekran w galerii, social media, świat.**
> **Wprowadzasz raz. Działa wszędzie. Poufne zostaje poufne.**
