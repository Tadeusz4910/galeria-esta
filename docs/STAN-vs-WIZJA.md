# STAN vs WIZJA — mapa różnic

Porównanie wizji z dokumentów `docs/ESTA-KONCEPT.md` i `docs/ESTA-OPIS-PELny.md`
ze stanem faktycznym: kod stron w `app/` + tabele Supabase.

**Data analizy:** 2026-05-20
**Zakres:** wyłącznie mapowanie różnic. Niczego nie wdrożono, nie poprawiono w kodzie ani w bazie.

## Zasady przyjęte w tej analizie

- Dokumenty to **wizja i bank pomysłów, NIE nakaz.** Pierwszeństwo mają: stan faktyczny (kod + baza) oraz najnowsze decyzje użytkownika.
- **Baza Supabase nie była odpytywana** (zasada „nie ruszać bazy"). Listę 15 tabel i ich pól odtworzono z wywołań `.from()` / `.select()` w kodzie. Kolumny, których kod nie czyta, oznaczono jako *nieweryfikowalne z repo*.
- **Menu — najnowsza decyzja użytkownika ma pierwszeństwo nad dokumentami.** Docelowe menu:
  `ARTYSCI · WYSTAWY · TARGI · IDEE · KOLEKCJA · KOMPENDIUM · BLOG · VIEWING ROOM · O NAS`
  (czyli jak obecne w kodzie + nowa pozycja **BLOG** po KOMPENDIUM). Wersja menu z dokumentów (`START | ARTYŚCI | KOLEKCJA | IDEE | VIEWING ROOM | WYSTAWY I TARGI | KOMPENDIUM | O GALERII | KONTAKT`) jest **nieaktualna** i nie jest punktem odniesienia.

---

## (A) ZGODNE — zrobione zgodnie z wizją

1. **Stos technologiczny i charakter platformy.** Next.js (App Router) + Supabase, strona prezentacyjna oparta na danych — zgodne z założeniem „nowoczesna platforma prezentacji".
2. **Warstwa wizualna.** Typografia Cormorant Garamond (nagłówki) + Instrument Sans (teksty/menu), paleta biel/czerń/grafit/beż, duże marginesy, cienkie linie, siatka, karty prac/wystaw/targów, tagi idei — dokładnie jak sekcja „Warstwa wizualna".
3. **Hasło przewodnie.** „Idea · Słowo · Obraz · Struktura · Światło · Pamięć · Proces" obecne na `/idee` (sekcja hasła przewodniego).
4. **Podział artystów na kręgi programu.** Pole `artysci.kreg_programu` z wartościami `rdzen` / `poszerzony` + etykiety na profilu artysty („Rdzeń programu" / „Program poszerzony") — zgodne z podziałem rdzeń konceptualno-konkretny vs program poszerzony.
5. **Artyści jako mapa idei, nie tylko lista nazwisk.** Profil artysty (`/artysta/[slug]`) pokazuje powiązane idee (tagi + karty), wystawy i prace — realizacja postulatu „wchodzenia w sztukę przez pojęcia".
6. **Sekcja Idee istnieje** (`/idee` + `/idee/[slug]`): mapa pojęć, opisy, powiązania idea↔artysta, idea↔kompendium, „Zobacz także" (powiązane idee). Zgodne ze schematem strony pojedynczej idei (większość bloków).
7. **Sekcja Kompendium istnieje** (`/kompendium` + `/kompendium/[slug]`): rozdziały z kategoriami, lead, treść, powiązania z artystami i ideami, „inne rozdziały". Zgodne z rozróżnieniem „Kompendium = długie/eksperckie, Idee = krótkie/nawigacyjne".
8. **Wystawy i targi jako filar / dowód działalności.** Sekcje `/wystawy`, `/wystawa/[url]`, `/targi`, `/targ/[url]` z dokumentacją zdjęciową, opisami, powiązaniami z artystami.
9. **Model widoczności prac (częściowo).** Pole `prace.widocznosc` istnieje; kod filtruje `archiwum` i `ukryty` — zgodne z duchem modelu widoczności (szczegóły: patrz sekcja B).
10. **Powiązania krzyżowe (relacje many-to-many).** Tabele łączące `idee_artysci`, `idee_idee`, `kompendium_artysci`, `kompendium_idee`, `wystawy_artysci` realizują „sieć znaczeń" artysta↔idea↔kompendium↔wystawa.
11. **CTA sprzedażowe / kontaktowe.** Liczne `mailto:` „Zapytaj o pracę / o wystawę / o prace artysty" — zalążek warstwy relacji.

---

## (B) INACZEJ — istnieje, ale różni się od wizji

1. **Struktura Idei: główna/rozszerzona zamiast 8 rodzin.**
   - *Wizja:* 8 „rodzin" idei (Idea/Język, Słowo/Znak, Geometria/Struktura, Światło/Cień, Przestrzeń/Proces, Fotografia/Pamięć, Obraz/Krytyka, Miasto/Komunikat), każda jako kafel → `/idee/[rodzina]`, plus ~35 pojęć przypisanych do rodzin.
   - *Stan:* `idee.kategoria` ma wartości `glowna` / `rozszerzona`; strona `/idee` dzieli pojęcia na „główne" i „rozszerzone", nie na 8 rodzin. Brak pola `rodzina_idei`. URL idei to `/idee/[slug]` pojedynczego pojęcia, nie rodziny.
   - *Różnica:* inny model porządkujący (dychotomia ważności zamiast 8 rodzin tematycznych).

2. **Wystawy i Targi: dwie osobne sekcje zamiast jednej `/wystawy-targi/`.**
   - *Wizja:* jeden filar pod adresem `/wystawy-targi/`.
   - *Stan:* osobno `/wystawy` (+`/wystawa/[url]`) i `/targi` (+`/targ/[url]`), dwie osobne tabele `wystawy` i `targi`. Brak połączonego widoku i trasy `/wystawy-targi/`.

3. **Viewing Room: placeholder zamiast systemu 3-poziomowego.**
   - *Wizja:* trzy poziomy — Public Collection, Curated Viewing Rooms, Private Tokenized Offers (oferty z tokenem, generowane z panelu CRM, PDF-y, ceny).
   - *Stan:* na stronie głównej tylko blok-zajawka „Viewing Room — wkrótce", link `/viewing-room` w menu prowadzi donikąd (strona nie istnieje). Brak jakiejkolwiek logiki tokenów/ofert (uwaga: oferty z tokenem to docelowo domena panelu **esta-crm**, nie tej strony).

4. **Nawigacja — niespójna i niepełna względem decyzji o menu.**
   - *Decyzja docelowa:* `ARTYSCI · WYSTAWY · TARGI · IDEE · KOLEKCJA · KOMPENDIUM · BLOG · VIEWING ROOM · O NAS`.
   - *Stan:* `components/Nav.tsx` ma `Artysci · Wystawy · Targi · Idee · Kolekcja · Kompendium · Viewing Room · O nas` — **brak pozycji BLOG**. Dodatkowo Nav używają tylko 4 strony (`/`, `/artysci`, `/wystawy`, `/targi`); strony `artysta`, `wystawa`, `targ`, `idee`, `kompendium` mają **zduplikowany, ręcznie wpisany `<nav>`** z innym zestawem pozycji (np. „Publikacje/Artykuly/Filmy" albo skrócony zestaw).

5. **Model widoczności prac — wartości częściowo inne.**
   - *Wizja:* `glowny_nurt` / `kolekcja` / `ukryty` / `archiwum`.
   - *Stan:* w kodzie potwierdzone wartości `archiwum` i `ukryty` (są odfiltrowywane na profilu artysty). Wartości `glowny_nurt` i `kolekcja` *nieweryfikowalne z repo* — nie ma kodu, który by je czytał (brak strony `/kolekcja`, brak `/oferta`).

6. **Prezentacja prac — jest tylko na profilu artysty.**
   - *Wizja:* prace jako osobna warstwa „Zasób/Kolekcja" z segmentami, tagami idei, cenami, statusami, filtrowaniem (`/kolekcja`).
   - *Stan:* `prace` czytane wyłącznie na `/artysta/[slug]` (max 12, sortowane po roku), zdjęcia z `media` (`typ='praca'`). Brak widoku przekrojowego kolekcji, brak tagów idei na pracach, brak cen w warstwie publicznej.

7. **Strona główna — układ uproszczony względem wireframe'u z sekcji 23–24.**
   - *Wizja (10 bloków):* Hero → 28 lat → Idee (siatka) → Artyści → Kolekcja → Viewing Room → Wystawy i targi → Kompendium → Archiwum → Kontakt.
   - *Stan:* Hero → aktualna wystawa → upcoming → wystawy → targi → artyści → Viewing Room (placeholder) → footer. Brak bloków: „28 lat", siatka Idei, „wybrane prace z kolekcji", Kompendium, „Archiwum Galerii ESTA", Kontakt.

8. **Treść Kompendium renderowana jako surowy HTML.**
   - *Stan:* `kompendium.tresc` wstrzykiwane przez `dangerouslySetInnerHTML`. Nie kłóci się z wizją funkcjonalnie, ale to świadoma decyzja techniczna warta odnotowania (treść musi być zaufana — pochodzi z panelu CRM).

---

## (C) BRAKUJE — jest w wizji, nie istnieje w kodzie/bazie

### Strony / trasy
1. **`/kolekcja`** — publiczna kolekcja prac z tagami idei i segmentami. Brak (link w menu martwy).
2. **`/viewing-room`** — strona/system viewing-room. Brak (jest tylko placeholder na home, link martwy).
3. **`/o-nas` (O galerii)** — narracja o 28 latach, programie, działalności. Brak (link martwy).
4. **`/kontakt`** — strona kontaktu/zapytań. Brak (są tylko `mailto:`).
5. **`BLOG`** — nowa pozycja menu wg najnowszej decyzji (po KOMPENDIUM). Brak strony i brak pozycji w `Nav.tsx`.
6. **`/wystawy-targi/`** — połączony filar wystaw i targów (obecnie rozbity na dwie sekcje).
7. **Strony „rodzin idei"** (`/idee/idea-jezyk/`, `/idee/slowo-znak/` itd.) — 8 kafli tematycznych. Brak (model oparty na pojedynczych pojęciach).

### Funkcje
8. **Wersja angielska (PL/EN).** Przełącznik „PL / EN" w nawigacji jest martwym linkiem; brak treści EN, brak routingu językowego.
9. **Połączenie ze „starą stroną" / archiwum.** Brak bloków „Zobacz archiwum artysty" / „Aktualna prezentacja artysty", brak pola `link_archiwalny`, brak trasy/sekcji „Archiwum Galerii ESTA".
10. **Warstwa SEO per strona.** Brak pól i obsługi `seo_title`, `seo_description`, `canonical`, `og_image`, `meta_index`. Globalny `metadata` jest tylko w `app/layout.tsx` (jeden tytuł dla całej strony); strony szczegółowe nie generują własnych metadanych.
11. **Oferty tokenizowane / PDF-y ofertowe.** Brak (docelowo domena panelu esta-crm).

### Model danych (tabele/pola proponowane w sekcji 26 dokumentu)
12. **Tabela `TEKSTY`** (uniwersalne teksty: kompendium, artist focus, blog/artykuły, viewing-room, collecting guide). Brak — obecnie treści tekstowe trzyma `kompendium`. Brak osobnej tabeli pod **BLOG**.
13. **Tabela `WYSTAWY_TARGI`** (połączona, z polem `typ`, `status`, `link_archiwalny`, `czy_nowe_opracowanie`). Brak — są osobne `wystawy` i `targi`.
14. **Pola w `idee`:** `rodzina_idei`, `prace_powiazane`, `teksty_powiazane`, statusy/SEO. Brak rodzin i powiązań prac/tekstów.
15. **Pola w `prace`:** `cena_oferowana`, `status_dostepnosci`, `tagi_publiczne`, `segmenty`, `style`, `priorytet_promocji`, pola SEO/canonical/OG. *Nieweryfikowalne z repo* (kod ich nie czyta) — najpewniej nieobecne w warstwie publicznej.
16. **Pola w `artysci`:** `bio_krotkie`/`bio_dlugie` (jest jedno `biografia`), `link_archiwalny`, pola SEO, `targi_powiazane`. Brak powiązania artysta↔targi (jest tylko `wystawy_artysci`).

---

## Podsumowanie jednym zdaniem

Zrealizowany jest **trzon „warstwy 1" (program/wiedza)** — artyści, idee, kompendium, wystawy, targi, w docelowej estetyce. Najwięcej brakuje w **„warstwie 2" (kolekcja/prace jako osobny zasób)** i **„warstwie 3" (viewing-room/sprzedaż/relacje, EN, SEO, archiwum)** — przy czym część z nich (oferty z tokenem, zapis treści) należy do osobnego panelu **esta-crm**, nie do tej strony.
