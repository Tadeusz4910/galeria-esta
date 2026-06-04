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

### OBSZAR 0 — STATUSY WIDOCZNOŚCI PRAC (fundament: kolekcja / archiwum / oferta / zasób) ✅

**Status:** ✅ **ZROBIONE** — czerwiec 2026  
**Commits:** `1441367` (migracja statusów + International + rynki + wielojęzyczność) → `d85ec39` (rozszerzenie modelu: rola_pracy + status_fizyczny) → `74e521c` (fix CHECK kolejność) → `bc9e06b` (pre-flight + DROP VIEW) → `cd212c6` (restrukturyzacja clean-known → check-unknown)  
**Stan bazy:** 108 prac zmigrowane (14 kolekcja/dostepna, 84 ukryta/dostepna, 9 ukryta/sprzedana, 1 ukryta/niedostepna). Backup `prace_backup_obszar0` zachowany.  
**Stan panelu:** 3 pliki dostosowane (24 edyty), wgrane przez Transmit, działa.

**Lekcje dla kolejnych obszarów (wzorzec do powielenia):**
1. Każda migracja w transakcji `BEGIN/COMMIT` — rollback przy każdym błędzie chroni dane
2. Sekcja "0. Higieniczne usuwanie znanych obiektów" PRZED pre-flight: `DROP VIEW`/`INDEX`/`CONSTRAINT` zależne od kolumn które będą usuwane
3. Sekcja "0a' Pre-flight check" — DO block sprawdzający NIEZNANE zależności (views, matviews, FK, indeksy) + sanity check wartości w danych. `RAISE EXCEPTION` zatrzymuje migrację z czytelną listą pułapek.
4. Backup tabeli (`CREATE TABLE ... AS SELECT ...`) na początku transakcji — bezpiecznik na rollback po commicie
5. Migracja danych w bloku DO z warunkowym IF (`kolumna_stara IS NULL OR ...`) — idempotency na ponowne uruchomienia
6. `CREATE INDEX` na nowych kolumnach których panel używa do filtrów — performance od początku
7. Sekwencja: clean-known → check-unknown → backup → migrate → verify

Te zasady stosować w Obszarach 1–12.

---

**To jest fundament całego modelu „wprowadzam raz, status decyduje gdzie widoczne". Definiuje m.in. ARCHIWUM (viewing-room).**

**Jak było (przed migracją):** `prace` ma 5 pól sterujących widocznością, które muszą być ręcznie spójne: `status` (dostepna/sprzedana/niedostepna), `widocznosc` (ukryty/kolekcja), `publiczne` (bool), `w_dorobku` (bool), `dostepna_do_sprzedazy` (bool). To mylące i podatne na błędy (5 pól zamiast jednej decyzji).

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

### OBSZAR 2 — IDEE + POJĘCIA (przebudowa) ✅

**Status:** ZROBIONE czerwiec 2026 (commit 7b592d5)

**Sesja A SQL: ✅** — ukończona 2026-06-02 (commit `4c617af`). Migracja `obszar2_uzupelnienie.sql` uruchomiona pomyślnie z PASS na wszystkich sekcjach. Stan po migracji: 8 tabel z `idea_glowna_id` (7 encji programu + słownik `pojecia`), 7 tabel M:N pojęć (po jednej dla każdej z 7 encji), 66 nowych kolumn (idea_glowna_id na 4 encjach + International + EN/DE), 22 nowe indeksy.

**Częściowe pokrycie Obszaru 9:** zgodnie z zasadą „raz, kompletnie, bez powrotów" Sesja A wprowadziła International + EN/DE dla 6 encji (`artysci`/`wystawy`/`targi`/`oferty`/`artykuly`/`kompendium`): pole `int_publiczne` na wszystkich 6, `int_visual_wall` na 4 (bez `targi`/`oferty` — decyzja kuratorska), kompletna wielojęzyczność EN+DE (66 pól tekstowych). Po tej migracji żaden kolejny obszar nie dodaje pól strukturalnych do 7 encji programu galerii.

**Jak było (przed migracją):**
- 35 idei w jednej tabeli (mieszanka idei głównych i pojęć pomocniczych)
- 8 starych rodzin (`kategoria`: glowna/rozszerzona + `rodzina_idei` jako stringi)
- 5 tabel łączących M:N (`idee_artysci` 7 rekordów, `idee_idee` 44 samoreferencje, reszta puste)
- 6 kolumn `_txt` w `artysci`/`prace`/`wystawy`/`targi`/`oferty` (powiązania jako stringi przecinkowe)

**Jak jest (po migracji):**
- 7 idei (6 głównych + 1 `wspolczesne_kontynuacje`) z polem `typ` jako enum w CHECK
- 45 pojęć w osobnej tabeli `pojecia` z FK `idea_glowna_id` (ON DELETE RESTRICT)
- Statusy publiczne 5-stopniowe: `ukryte`/`sygnal`/`tag_publiczny`/`klikalny_filtr`/`strona_pojecia`
- Etapy wdrożenia 4-stopniowe: `etap_1_sygnal` → `etap_4_strona_pojecia`
- 36 pojęć ze statusem `sygnal`, 9 z `tag_publiczny` (etap startowy)
- 4 nowe tabele M:N (puste, do ręcznego wypełnienia w panelu): `artysci_idee` (z polem `rola`: glowna/uzupelniajaca), `pojecia_artysci`, `pojecia_prace`, `pojecia_wystawy`
- 3 nowe FK `idea_glowna_id` na `artysci`/`prace`/`wystawy` (single, nullable, ON DELETE SET NULL)
- Pełna trójjęzyczność `_pl`/`_en`/`_de` od fundamentu (planowane było tylko EN)

**Świadome decyzje:**
- Bez backupu — 11 wartości w starym modelu (7 par Kozłowskiego w `idee_artysci` + 3 stringi `idee_glowne_txt` + 1 wystawa Recycled news) Tadeusz odtworzy ręcznie w panelu po migracji
- Wartości statusów w CHECK constraint na poziomie bazy, nie w aplikacji
- Sub-SELECT po slug idei w seedzie pojęć zamiast hardcoded UUID
- ON DELETE strategie świadomie wybrane: RESTRICT dla `pojecia→idee` (bezpiecznik), SET NULL dla single FK na głównych tabelach, CASCADE dla tabel M:N

**Lekcje wzorca migracyjnego z Obszaru 0 sprawdzone:**
- BEGIN/COMMIT z RAISE EXCEPTION zatrzymuje migrację przy najmniejszej rozbieżności
- Sekcja higieniczna PRZED pre-flight (clean-known) — bez nieudanych prób tym razem
- Pre-flight szuka tylko NIEZNANYCH zależności (po sprzątaniu znanych)
- Weryfikacja końcowa z licznikami w DO block flaguje wszystko jeszcze przed COMMIT

**Co następne:**
- Panel CRM: multiselect `idea_glowna_id` w formularzach artysty/pracy/wystawy + edycja 45 pojęć (osobne sesje)
- Strona Next.js: `/idee/` z 7 planszami + podstrony `/idee/[slug]/` (osobna sesja)
- Ręczne przypisania w panelu: idee i pojęcia dla artystów, prac, wystaw (Tadeusz)

---

### OBSZAR 3 — ZDJĘCIA / MEDIA (scalenie + auto-SEO + upload bez URL) 🟡
**Jak jest:** zdjęcia rozproszone w 5 tabelach (`media`, `zdjecia`, `wystawy_zdjecia`, `targi_zdjecia`, `artykuly_zdjecia`). Panel uploaduje do Storage, ale wymaga ręcznych operacji; powiązania media przez pojedyncze FK.

**Jak ma być:** jedna tabela `media` na wszystko (zdjęcia + docelowo filmy). Upload drag&drop → panel SAM: wgrywa do Storage, generuje nazwę SEO (`artysta-tytul-rok-nr`), pobiera URL, zapisuje wymiary, generuje alt+podpis przez AI (PL+EN), przypina do encji. Powiązania grupowe (wernisaż = wiele prac) przez tabelę łączącą tam gdzie trzeba.

**Baza:** rozbudować `media` (pola SEO już są: alt, podpis, nazwa_pliku, wymiary); dodać `_de` do alt/podpis; zmigrować `zdjecia`/`*_zdjecia` → `media`; usunąć puste tabele zdjęć po migracji. Dodać tabelę łączącą `media_prace` dla zdjęć grupowych.

**Panel:** ujednolicić upload do jednego mechanizmu; dodać auto-generowanie nazwy SEO z danych pracy; podłączyć AI do generowania alt/podpisu; **koniec z ręcznym wklejaniem URL**.

**Trudność:** 🟡 — upload istnieje, trzeba wzbogacić + migracja + auto-SEO.

---

### OBSZAR 4 — OFERTY (oferty_prace, token) 🟡

**Status (baza):** ✅ ZROBIONE czerwiec 2026 (commit `b00bdc6`, 2026-06-04). Migracja `migrations/obszar4_oferty.sql` (585 linii) uruchomiona pomyślnie. Dokument koncepcyjny `docs/OBSZAR-4-OFERTY.md` (1302 linie).

**Stan bazy po migracji:**
- 6 nowych tabel: `rynki_priorytetowe` (słownik 8 rynków z PL/EN/DE), `oferty_rynki`, `prace_rynki`, `oferty_dokumenty`, `prace_related`, `oferty_analityka`
- 25 nowych kolumn: 14 w `oferty` (typ_oferty, token, status, klient_id, daty, język, hero), 5 w `oferty_prace` (cena EUR, cena_widoczna, opisy EN/DE, status), 6 w `prace` (int_priorytet, int_status, Visual Wall PL/EN/DE, notatki)
- 18 indeksów performance (w tym partial unique na `oferty.token` gdy NOT NULL)
- 8 CHECK constraints walidujących enum-like wartości

**Trzy typy ofert:**
- `kolekcja` — oferta główna nowej strony, stały URL `/kolekcja`
- `archiwum` — dawny viewing-room, stały URL `/viewing-room` z filtrami
- `indywidualna` — z tokenem dla konkretnego klienta, URL `/oferta/[token]`

**Rozstrzygnięte decyzje strategiczne (D1-D8):**
- D1: Token tylko dla `indywidualna` (pozostałe oferty mają stałe URL)
- D2: Cena domyślnie ukryta — "Cena na zapytanie", widoczna tylko gdy galerysta zdecyduje
- D3: FK `klient_id → klienci` od razu (30 pól tabeli `klienci` są bogate)
- D4: Drag & drop kolejność prac w widgecie panelu CRM
- D5: Visual Wall na później (po zakupie ekranu 85") — pola są w bazie
- D6: PDF + inne załączniki przez `oferty_dokumenty` (M:N do oferty)
- D7: AI generuje komentarze kuratorskie per praca, galerysta zatwierdza/edytuje
- D8: Hasła i daty wygaśnięcia na później — pola nullable w bazie

**Status (strona publiczna - frontend) — czerwiec 2026:**
- ✅ /kolekcja: Task B3 commit (komponent `<WorkCard>`, fetch `widocznosc='kolekcja'`, 14 prac na żywej stronie)
- ✅ /praca/[slug]: Task B4 commit `c42c4b5` (szczegół z galerią 70/30, scoreSimilarity, "Inne prace artysty" + "Podobne prace")
- ✅ Infrastruktura: `lib/supabase.ts` (singleton), `lib/slug.ts` (artistSlug+workSlug), `lib/scoreSimilarity.ts`
- ✅ Komponenty: `<WorkCard>`, `<WorkImage>`, `<WorkGallery>`, `<WorkDetailSidebar>`, `<RelatedWorks>`

**Decyzje implementacyjne D9-D24 zaprotokołowane w `docs/OBSZAR-4-OFERTY.md` sekcja 13B.**

**Do dokończenia w pozostałych etapach Obszaru 4:**
- Task A1.5 — uproszczenie modalu m-of w panelu (usunięcie wyboru `typ_oferty`)
- Task A2 — widget listy prac w ofercie (drag&drop SortableJS, ceny per oferta, opisy PL/EN/DE, historia oferowania)
- Task B5 — przebudowa `/viewing-room` (grid 3-kolumnowy, filtry z `collection.php`, fetch `widocznosc='archiwum'`)
- Task B7 — dokończenie `/oferta/[token]` z listą prac (po A2)
- Tracking analityki ofert (tabela `oferty_analityka`)
- International routing `/international/*`
- Migracja zdjęć do Supabase Storage (osobny Obszar 3)
- Korekta D2 w bazie: pole `cena_widoczna` ma być TRUE domyślnie dla `typ_oferty='indywidualna'` i `'archiwum'`

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

**Częściowo zrobione (Sesja A Obszaru 2, commit `4c617af`, 2026-06-02):**
- `int_publiczne` na 6 encjach (`artysci`/`wystawy`/`targi`/`oferty`/`artykuly`/`kompendium`)
- `int_visual_wall` na 4 encjach (`artysci`/`wystawy`/`artykuly`/`kompendium`)
- Kompletna wielojęzyczność EN+DE na 6 encjach (66 pól tekstowych)

**Do zrobienia w pełnym Obszarze 9:** 7 pól `int_*` szczegółowych (`int_priorytet`, `int_segment`, `int_status`, `int_related`, `int_notatki`, …) + segmentacja rynków + szczegóły wg konceptu International (Visual Wall content, hreflang, schema.org VisualArtwork, SEO niemieckie).

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

**Widoki (nie tabele) — zostają:** `klienci_profil`, `inwestycja_ramy`. (`prace_pelne` i `prace_do_oferty` skasowane w Obszarze 0, commit cd212c6 — sekcja higieniczna DROP VIEW)

**Trudność:** 🟢 — usuwanie po weryfikacji.

---

## KOLEJNOŚĆ WYKONANIA (proponowana)

Zasada: od fundamentu do nadbudowy; baza+panel każdego obszaru razem; testować po każdym.

**ETAP I — rdzeń klasyfikacji i idei (fundament nawigacji):**
1. Obszar 0 (statusy widoczności prac: kolekcja/archiwum/oferta/zasób) — ✅ ZROBIONE maj 2026 (fundament, definiuje archiwum/viewing-room)
2. Obszar 2 (idee+pojęcia) — ✅ ZROBIONE czerwiec 2026, Sesja A SQL ukończona 2026-06-02 (rdzeń nawigacji „przez idee")
3. Obszar 1 (klasyfikacja txt→relacje) — 🟢
4. Obszar 10 (wystawy/targi porządki + relacje) — 🟡

**ETAP II — sprzedaż i media (pod ArtBasel):**
5. Obszar 3 (zdjęcia/media + auto-SEO) — 🟡
6. Obszar 4 (oferty + token) — 🟡 baza danych ukończona 2026-06-04, commit `b00bdc6` (panel CRM i strona Next.js do dokończenia)
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
