# GALERIA ESTA — PLAN PRZEBUDOWY: BAZA + PANEL
### Dokument wykonawczy · maj 2026 · do zatwierdzenia przed realizacją

> **Cel:** doprowadzić bazę (61 tabel) i panel (3 pliki HTML) do stanu czystego, spójnego, bez duplikatów i zaszłości — zgodnie z architekturą systemu (`ESTA-ARCHITEKTURA-SYSTEMU.md`). Baza i panel zmieniane RAZEM, obszar po obszarze, testowane wspólnie.

> **Zasada nadrzędna:** czystość kodu i bazy ponad zachowanie danych roboczych. Multiselecty i dobre komponenty panelu zostają — zmienia się to, czego nie widać (sposób zapisu). Dane merytoryczne (artyści, prace, kompendium) zachowujemy, o ile siedzą w dobrej strukturze.

---

## STAN WYJŚCIOWY — co wiemy

**Baza:** 61 tabel. Część czysta (kompendium, słowniki, finanse, tabele łączące), część z długiem (idee w starym modelu, duplikaty pól, martwe `_txt`), część zduplikowana (sprzedaz vs transakcje, dokumenty vs dokumenty_galerii), część rozproszona (5 tabel zdjęć).

**Panel (3 pliki):**
- `esta-panel.html` (4838 linii) — główny CRUD, używa: prace, artysci, klienci, finanse, wystawy, targi, oferty, media, zdjecia, artykuly, nurty, idee, słowniki. Ma dobry komponent multiselect, ale **zapisuje klasyfikację do pól `_txt`** zamiast tabel łączących.
- `esta-dokumenty.html` (1773 linie) — generator dokumentów, używa `dokumenty_galerii` + `szablony_dokumentow`. NIE używa `dokumenty`.
- `esta-dopasowania-ai.html` (1436 linii) — AI, czyta prace+klientów, woła Claude API, **NIE zapisuje wyników do `dopasowania`**.

**Architektura techniczna panelu:** jedna funkcja `api(path)`, klucz w localStorage, ES5, reużywalne komponenty (multiselect). Stan: dobry do ewolucji, nie do przepisania.

---

## OBSZARY PRZEBUDOWY

Legenda trudności: 🟢 łatwe · 🟡 średnie · 🔴 trudne/wymaga uwagi

---

### OBSZAR 0 — STATUSY WIDOCZNOŚCI PRAC (fundament: kolekcja / archiwum / oferta / zasób) 🟡
**To jest fundament całego modelu „wprowadzam raz, status decyduje gdzie widoczne". Definiuje m.in. ARCHIWUM (viewing-room).**

**Jak jest:** `prace` ma 5 pól sterujących widocznością, które muszą być ręcznie spójne: `status` (dostepna/sprzedana/niedostepna), `widocznosc` (ukryty/kolekcja), `publiczne` (bool), `w_dorobku` (bool), `dostepna_do_sprzedazy` (bool). To mylące i podatne na błędy (5 pól zamiast jednej decyzji).

**Jak ma być:** jeden czytelny wymiar widoczności (gdzie praca się pokazuje) + osobny status handlowy (czy dostępna):

| `widocznosc` | gdzie pokazywana (okno) |
|---|---|
| `kolekcja` | Okno 1 — oferta główna nowej strony |
| `archiwum` | Okno 2 — publiczny zasób 28 lat *(= „viewing-room"; nazwa publiczna/etykieta w menu do ustalenia przy budowie strony — technicznie status = `archiwum`)* |
| `oferta_token` | Okno 3 — oferta indywidualna (tylko przez token) |
| `zasob` | nigdzie publicznie — tylko panel (analizy/finanse/AI) |

Ortogonalnie: `status_handlowy` (dostepna / zarezerwowana / sprzedana) — bo sprzedana praca może wciąż być widoczna z adnotacją „sprzedane", bez ujawniania kwoty.

**Baza:** zaprojektować jeden czytelny model statusów; zmapować obecne 5 pól na nowy model (94 ukryte → `zasob`, 14 kolekcja → `kolekcja`, sprzedane → `status_handlowy=sprzedana`); usunąć nadmiarowe pola po migracji.

**Panel:** w formularzu pracy — jeden wybór „gdzie widoczna" (kolekcja/archiwum/oferta/zasób) zamiast 5 pól; osobno status handlowy. Filtry list wg widoczności.

**Strona:** każde okno (kolekcja/archiwum) to ten sam mechanizm, inny filtr statusu. „Archiwum/viewing-room" = lista prac ze statusem `archiwum`, osobny widok z premium designem.

**Trudność:** 🟡 — uproszczenie modelu + migracja istniejących statusów. Fundament — robić wcześnie, bo od tego zależy co gdzie się pokazuje (w tym całe archiwum).

---

### OBSZAR 1 — KLASYFIKACJA (txt → relacje) 🟢
**Jak jest:** panel ma multiselect dziedziny/style/segmenty (czyta ze słowników `dziedziny`/`style`/`segmenty`), ale zapisuje wybór jako CSV do `prace.dziedziny_txt` / `style_txt` / `segmenty_txt`. Tabele łączące (`prace_dziedziny`...) istnieją, ale puste — panel ich nie używa.

**Jak ma być:** multiselect bez zmian (interfejs zostaje!), ale zapis idzie do tabel łączących (`prace_dziedziny`, `prace_style`, `prace_segmenty`). To samo dla artystów (`artysci_dziedziny`, `artysci_style`).

**Baza:** usunąć martwe pola `dziedziny_txt`, `style_txt`, `segmenty_txt`, `idee_txt` z `prace`; analogiczne `_txt` z `wystawy`, `targi`, `artysci` (`idee_glowne_txt`, `idee_dodatkowe_txt`). Tabele łączące już są.

**Panel:** zmienić funkcje zapisu/odczytu prac i artystów — `msGet()` zwraca wybrane nazwy → zamienić na zapis ID do tabeli łączącej (osobny POST powiązań po zapisie pracy). Odczyt: dołączyć powiązania przez `select=...,prace_dziedziny(dziedziny(nazwa))`.

**Trudność:** 🟢 — multiselect i słowniki gotowe, zmiana w kilku funkcjach zapisu.

---

### OBSZAR 2 — IDEE + POJĘCIA (przebudowa) 🔴
**Jak jest:** `idee` = 34 rekordy w starym modelu (`kategoria`: glowna/rozszerzona, `rodzina_idei`: 8 rodzin). Miesza idee z pojęciami. `pojecia` NIE istnieje. Panel ma multiselect idei dla artysty (`ms-a-idee`) zapisujący do `idee_glowne_txt`.

**Jak ma być (wg konceptu idei):**
- `idee` = **6 idei głównych** + blok współczesny (Idea/Język, Słowo/Znak, Geometria/Struktura, Światło/Przestrzeń, Pamięć/Archiwum, Obraz/Komunikat)
- nowa tabela `pojecia` z polami: `nazwa`, `nazwa_en`, `nazwa_de`, `slug`, `idea_glowna_id` (FK→idee), `status_publiczny` (ukryte/sygnał/tag/filtr/strona), `etap_wdrozenia`, `meta_index`, `opis_krotki`, SEO
- powiązania przez tabele łączące (już są: `idee_artysci`, `idee_prace`, `idee_idee`, `idee_teksty`; dodać `pojecia_artysci`, `pojecia_prace`)

**Baza:** wyczyścić starą `idee`, przebudować na 6 (zachować pola EN i strukturę kolumn — usunąć `kategoria`, `rodzina_idei`, dodać brakujące); stworzyć `pojecia` + `pojecia_artysci` + `pojecia_prace`; dodać `_de` do idee.

**Panel:** dostosować multiselect idei (z `_txt` → relacja `idee_artysci`/`idee_prace`); dodać moduł wprowadzania idei (6) i pojęć (z etapami); przy artyście/pracy: wybór 1 idei głównej + N pojęć.

**Trudność:** 🔴 — przebudowa modelu + nowa tabela + nowy moduł panelu. Fundamentalne dla nawigacji „przez idee".

---

### OBSZAR 3 — ZDJĘCIA / MEDIA (scalenie + auto-SEO + upload bez URL) 🟡
**Jak jest:** zdjęcia rozproszone w 5 tabelach (`media`, `zdjecia`, `wystawy_zdjecia`, `targi_zdjecia`, `artykuly_zdjecia`). Panel uploaduje do Storage, ale wymaga ręcznych operacji; powiązania media przez pojedyncze FK.

**Jak ma być:** jedna tabela `media` na wszystko (zdjęcia + docelowo filmy). Upload drag&drop → panel SAM: wgrywa do Storage, generuje nazwę SEO (`artysta-tytul-rok-nr`), pobiera URL, zapisuje wymiary, generuje alt+podpis przez AI (PL+EN), przypina do encji. Powiązania grupowe (wernisaż = wiele prac) przez tabelę łączącą tam gdzie trzeba.

**Baza:** rozbudować `media` (pola SEO już są: alt, podpis, nazwa_pliku, wymiary); dodać `_de` do alt/podpis; zmigrować `zdjecia`/`*_zdjecia` → `media`; usunąć puste tabele zdjęć po migracji. Dodać tabelę łączącą `media_prace` dla zdjęć grupowych.

**Panel:** ujednolicić upload do jednego mechanizmu; dodać auto-generowanie nazwy SEO z danych pracy; podłączyć AI do generowania alt/podpisu; **koniec z ręcznym wklejaniem URL**.

**Trudność:** 🟡 — upload istnieje, trzeba wzbogacić + migracja + auto-SEO.

---

### OBSZAR 4 — OFERTY (oferty_prace, token) 🟡
**Jak jest:** `oferty` (z tokenem, rabatami, prognozą zysku) — panel ją woła. `oferty_prace` (które prace w ofercie) — panel NIE używa. Generowanie ofert z tokenem (okno 3) jeszcze nie działa w pełni.

**Jak ma być:** panel generuje ofertę → zaznacza prace (multiselect/koszyk) → zapisuje powiązania do `oferty_prace` (z ceną/opisem per oferta) → generuje token → tworzy link do `/oferta/[token]` na nowej stronie Next.js.

**Baza:** `oferty` i `oferty_prace` gotowe. Dodać `_de` do treści oferty. Powiązać z `dopasowania` (oferta z dopasowania AI).

**Panel:** dobudować zapis `oferty_prace`; podłączyć „Generuj ofertę" (dziś martwy przycisk); generowanie tokenu i linku.

**Trudność:** 🟡 — struktura gotowa, brakuje logiki w panelu.

---

### OBSZAR 5 — AI (persystencja dopasowań) 🟢
**Jak jest:** moduł AI czyta prace+klientów, woła Claude API, wyświetla wyniki — ale NIE zapisuje do `dopasowania`. Wyniki znikają po odświeżeniu.

**Jak ma być:** po wygenerowaniu dopasowań panel zapisuje je do `dopasowania` (score, poziom, uzasadnienie, podejście). Możliwość przejrzenia historii, przejścia z dopasowania do oferty.

**Baza:** `dopasowania` gotowa (score 0-100, poziom, uzasadnienie, podejscie, powiązania). Bez zmian.

**Panel:** dodać POST do `/dopasowania` po wygenerowaniu wyników; dodać widok historii dopasowań; przy rosnącej bazie — przemyśleć limit 500 (paginacja/filtrowanie kontekstu dla AI).

**Trudność:** 🟢 — tabela gotowa, dodać zapis.

---

### OBSZAR 6 — FINANSE (auto-marża, usunięcie sprzedaz) 🟡
**Jak jest:** `transakcje` ma pola wyniku/marży jako zwykłe (wpisywane). `sprzedaz` to starszy, duplikujący system. `transakcje_prace` istnieje, panel nie używa.

**Jak ma być:** `transakcje` — wynik i marża liczone AUTOMATYCZNIE (pola `GENERATED ALWAYS`, jak w `projekty_finansowe`/`okresy_finansowe`). `sprzedaz` usunięta.

**Baza:** zamienić `wynik_gotowkowy`, `wynik_ekonomiczny`, `marza_procent` w `transakcje` na pola generowane (wpisujesz ceny+koszty → baza liczy). Usunąć `sprzedaz`. Podłączyć `transakcje_prace`.

**Panel:** dostosować moduł transakcji do auto-liczonych pól (nie wpisywać ręcznie wyniku); zapis prac transakcji do `transakcje_prace`.

**Trudność:** 🟡 — zmiana pól na generowane + usunięcie duplikatu.

---

### OBSZAR 7 — DOKUMENTY (usunięcie duplikatu) 🟢
**Jak jest:** `dokumenty` (stara, nieużywana), `dokumenty_galerii` (używana przez generator), `szablony_dokumentow` (używana).

**Jak ma być:** zostaje `dokumenty_galerii` + `szablony_dokumentow`. `dokumenty` usunięta.

**Baza:** usunąć `dokumenty` (panel jej nie dotyka). Sprawdzić `dokumenty_artysci`/`dokumenty_prace` (czy używane — jeśli nie, usunąć). `dokumenty_galerii` trzyma prace jako `jsonb prace_ids` — rozważyć migrację na tabelę łączącą dla spójności (opcjonalne).

**Panel:** bez zmian (już używa właściwych tabel).

**Trudność:** 🟢 — usunięcie nieużywanej tabeli.

---

### OBSZAR 8 — WIELOJĘZYCZNOŚĆ (_de + braki EN) 🟡
**Jak jest:** EN częściowo (kompendium pełne, reszta szczątkowa). DE — zero. Niespójne.

**Jak ma być:** każda istotna treść w PL/EN/DE. Wzorzec jak `kompendium` (każde pole ma `_en`, `_de`). AI generuje tłumaczenia przy zapisie, Ty korygujesz.

**Baza:** dodać brakujące `_en` (SEO na prace/wystawy/targi/artysci) i wszystkie `_de` (idee, pojecia, prace, artysci, wystawy, targi, kompendium, oferty, media, artykuly).

**Panel:** dodać pola EN/DE w formularzach (zakładki językowe); przycisk „przetłumacz AI" przy polach.

**Trudność:** 🟡 — dużo pól, ale mechaniczne; AI pomaga.

---

### OBSZAR 9 — INTERNATIONAL (flagi, rynki, segmenty) 🟡
**Jak jest:** brak warstwy International. `segmenty` istnieje (z SEO). `artysci` ma już jakieś pola int (do sprawdzenia).

**Jak ma być (wg konceptu International):** flagi `int_publiczne`, `int_priorytet`, `rynek_priorytetowy` (multi: DACH/Italy/Central Europe/...), `cena_eur`, `int_visual_wall` na pracach; `int_artysta`, `int_kraj` na artystach. Segmenty EN/DE = idee/pojęcia po angielsku/niemiecku (nie nowy słownik). Publicznie „International Program", DACH operacyjnie.

**Baza:** dodać flagi `int_*` do prace/artysci/oferty; `rynek_priorytetowy`; `cena_eur`; nazwy EN/DE do idei/pojęć/segmentów. Visual Wall: `int_visual_wall` + teksty na ekran.

**Panel:** sekcja International (flagi, rynek, priorytet); filtry „pokaż tylko International / DACH / Visual Wall".

**Trudność:** 🟡 — głównie dodawanie pól + filtry. Warstwa nad istniejącym modelem (nie osobny świat).

---

### OBSZAR 10 — WYSTAWY / TARGI (duplikaty pól, txt→relacje) 🟡
**Jak jest:** `wystawy` i `targi` mają duplikaty pól (`nazwa`/`tytul`, `data_otwarcia`/`data_od`, `data_zakonczenia`/`data_do`), klasyfikację `_txt` (`artysci_txt`, `idee_txt`), niepełne EN.

**Jak ma być:** jedno pole na rzecz (usunąć duplikaty), powiązania przez relacje (`wystawy_artysci`/`wystawy_prace`/`wystawy_idee`, `targi_artysci`/`targi_prace`/`targi_idee`).

**Baza:** scalić duplikaty pól (zachować jedno, usunąć drugie); usunąć `_txt`; dodać brakujące tabele łączące (`wystawy_idee`, `targi_artysci`, `targi_idee`); migrować `artysci_txt` (targi 9/12 wypełnione — przenieść do relacji przed usunięciem).

**Panel:** dostosować formularze wystaw/targów (jedno pole zamiast dwóch); multiselecty artystów/prac/idei zapisujące do relacji.

**Trudność:** 🟡 — porządkowanie + migracja realnych danych w `targi.artysci_txt`.

---

### OBSZAR 11 — ARTYKUŁY / BLOG (M:N — sieć) 🟡
**Jak jest:** `artykuly` ma pojedyncze FK (`artysta_id`, `wystawa_id`, `praca_id`, `targ_id`, `kompendium_id`) — jeden artykuł = jeden artysta/praca.

**Jak ma być:** artykuł jako węzeł w sieci — łączy się z WIELOMA artystami/pracami/ideami/wystawami/targami (zgodnie z „wszystko linkuje się do wszystkiego").

**Baza:** dodać tabele łączące `artykuly_artysci`, `artykuly_prace`, `artykuly_idee`, `artykuly_wystawy`, `artykuly_targi`. Zachować pojedyncze FK jako „główne powiązanie" lub usunąć na rzecz relacji.

**Panel:** moduł blog z multiselectami powiązań (jak inne encje).

**Trudność:** 🟡 — dodanie relacji + rozbudowa modułu blog.

---

### OBSZAR 12 — SPRZĄTANIE (martwe tabele/pola) 🟢
**Do usunięcia po weryfikacji że nieużywane/puste:**
- `sprzedaz` (zastąpiona przez transakcje) — OBSZAR 6
- `dokumenty` (zastąpiona przez dokumenty_galerii) — OBSZAR 7
- martwe pola `_txt` (wszędzie) — OBSZAR 1, 2, 10
- duplikaty pól w wystawy/targi — OBSZAR 10
- ewentualnie `dokumenty_artysci`/`dokumenty_prace` jeśli nieużywane
- stare pola idei (`kategoria`, `rodzina_idei`) — OBSZAR 2

**Widoki (nie tabele) — zostają:** `prace_pelne`, `prace_do_oferty`, `klienci_profil`, `inwestycja_ramy`.

**Trudność:** 🟢 — usuwanie po weryfikacji.

---

## KOLEJNOŚĆ WYKONANIA (proponowana)

Zasada: od fundamentu do nadbudowy; baza+panel każdego obszaru razem; testować po każdym.

**ETAP I — rdzeń klasyfikacji i idei (fundament nawigacji):**
1. Obszar 0 (statusy widoczności prac: kolekcja/archiwum/oferta/zasób) — 🟡 fundament, definiuje archiwum/viewing-room
2. Obszar 2 (idee+pojęcia) — 🔴 najważniejszy, wszystko od niego zależy
3. Obszar 1 (klasyfikacja txt→relacje) — 🟢
4. Obszar 10 (wystawy/targi porządki + relacje) — 🟡

**ETAP II — sprzedaż i media (pod ArtBasel):**
5. Obszar 3 (zdjęcia/media + auto-SEO) — 🟡
6. Obszar 4 (oferty + token) — 🟡
7. Obszar 5 (AI persystencja) — 🟢
8. Obszar 6 (finanse auto-marża) — 🟡

**ETAP III — porządki i nadbudowa:**
9. Obszar 7 (dokumenty) + 12 (sprzątanie) — 🟢
10. Obszar 11 (blog sieć) — 🟡
11. Obszar 8 (wielojęzyczność _de) — 🟡

**ETAP IV — międzynarodowy:**
12. Obszar 9 (International + Visual Wall) — 🟡

**NA KOŃCU — przed wprowadzaniem danych:**
13. BEZPIECZEŃSTWO (RLS + widoki publiczne + Auth) — wg architektury, na finalnej strukturze. 41 tabel bez RLS do zamknięcia (z Security Advisor).

---

## ZASADY WYKONANIA
- **Baza i panel razem** — nigdy nie zmieniamy bazy zostawiając panel niespójny.
- **Po każdym obszarze test** — czy panel zapisuje/czyta poprawnie, czy strona działa.
- **Dane robocze** — usuwamy bez sentymentu; **dorobek** (artyści, prace, kompendium) — zachowujemy w nowej strukturze.
- **Multiselecty i dobre komponenty panelu** — zostają; zmienia się zapis pod spodem.
- **Bezpieczeństwo na końcu** — na finalnej strukturze, przed wprowadzaniem realnych danych.
