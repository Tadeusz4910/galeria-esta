# OBSZAR 2 + 9 — KOMPLETNE UZUPEŁNIENIE: IDEE, POJĘCIA, INTERNATIONAL, WIELOJĘZYCZNOŚĆ

**Status:** plan do akceptacji
**Data:** czerwiec 2026
**Powiązane dokumenty:** `docs/OBSZAR-2-IDEE-POJECIA.md`, `Koncept International`, `Idee koncept finalny`
**Powiązana migracja:** `migrations/obszar2_uzupelnienie.sql`

---

## 0. ZASADA NACZELNA

**Jeden raz, kompletnie, bez powrotów.** Wszystkie pola które mają sens dla każdej encji — dodane teraz. Pole nie wypełnione to nie problem; brak pola gdy trzeba — to problem.

Po tej migracji **żaden kolejny obszar nie powinien dodawać pól strukturalnych** do tabel `prace/artysci/wystawy/targi/oferty/artykuly/kompendium`. Kolejne obszary mogą dodawać tabele relacyjne (M:N), słowniki, widoki — ale fundament pól na tych 7 encjach jest domknięty.

---

## 1. CO JEST W BAZIE TERAZ (stan przed migracją)

Z weryfikacji SQL Editor (czerwiec 2026):

### Pola International
| Encja | `int_publiczne` | `int_visual_wall` | `cena_eur` |
|---|---|---|---|
| `prace` | ✅ z Obszaru 0 | ✅ z Obszaru 0 | ✅ z Obszaru 0 |
| `artysci` | ❌ | ❌ | — (n/d) |
| `wystawy` | ❌ | ❌ | — (n/d) |
| `targi` | ❌ | ❌ | — (n/d) |
| `oferty` | ❌ | ❌ | — (n/d) |
| `artykuly` | ❌ | ❌ | — (n/d) |
| `kompendium` | ❌ | ❌ | — (n/d) |

### Pola wielojęzyczności (EN/DE)
| Encja | Stan |
|---|---|
| `prace` | ✅ EN + DE komplet (8 pól tekstowych) z Obszaru 0 |
| `artysci` | ⚠️ tylko EN (5 pól), brak DE |
| `wystawy` | ⚠️ tylko EN (5 pól), brak DE |
| `targi` | ❌ ani EN ani DE |
| `oferty` | ❌ ani EN ani DE |
| `artykuly` | ❌ ani EN ani DE |
| `kompendium` | ❌ ani EN ani DE |

### Pola idei i pojęć (z Obszaru 2)
| Encja | `idea_glowna_id` | tabele M:N pojęć |
|---|---|---|
| `artysci` | ✅ z Obszaru 2 | ✅ `pojecia_artysci` (+ `artysci_idee` z rolą) |
| `prace` | ✅ z Obszaru 2 | ✅ `pojecia_prace` |
| `wystawy` | ✅ z Obszaru 2 | ✅ `pojecia_wystawy` |
| `targi` | ❌ | ❌ |
| `oferty` | ❌ | ❌ |
| `artykuly` | ❌ | ❌ |
| `kompendium` | ❌ | ❌ |

---

## 2. DECYZJE KURATORSKIE — co dla której encji

### Kompendium
**Charakter:** artykuły encyklopedyczne o ideach galerii, postaciach, ruchach, pojęciach. **Nie obiekty sprzedażowe, nie wydarzenia. Czysto tekst i wiedza.**

Pola które MAJĄ SENS:
- `idea_glowna_id` — każdy rozdział dotyczy jednej idei głównej (np. rozdział „Poezja konkretna" → idea S/Z Słowo/Znak)
- `int_publiczne` — czy rozdział pokazany w International (większość TAK — kompendium jest fundamentem prestiżu)
- `int_visual_wall` — czy rozdział promowany w Visual Wall (TAK — kuratorska selekcja, np. „Koncepcja Kozłowskiego" jako trzecia karta visual wall)
- `tytul_en`, `tytul_de` — tytuł rozdziału w EN/DE
- `lead_en`, `lead_de` — wstęp w EN/DE
- `tresc_en`, `tresc_de` — pełna treść w EN/DE
- `seo_title_en`, `seo_title_de`, `seo_description_en`, `seo_description_de`
- M:N do pojęć (`pojecia_kompendium`)

Pola które NIE mają sensu: `cena_eur`, `cena_pln`, statusy handlowe — kompendium nie jest sprzedawane.

### Artykuly (blog)
**Charakter:** posty blogowe — informacje o wystawach, refleksje, sygnały sezonowe, wydarzenia. Krótsze niż kompendium, bieżące.

Pola które MAJĄ SENS:
- `idea_glowna_id` — opcjonalnie (post może dotyczyć konkretnej idei)
- `int_publiczne` — czy post w wersji EN/DE na International
- `int_visual_wall` — czy post w Visual Wall (TAK — promocja świeżych treści)
- `tytul_en`, `tytul_de`
- `lead_en`, `lead_de`
- `tresc_en`, `tresc_de`
- `seo_title_en`, `seo_title_de`, `seo_description_en`, `seo_description_de`
- M:N do pojęć (`pojecia_artykuly`)

### Wystawy
**Charakter:** wydarzenia kuratorskie galerii — czas, miejsce, lista prac. Ma już komplet EN, brakuje DE.

Pola które JESZCZE potrzeba:
- `int_publiczne`, `int_visual_wall`
- DOPEŁNIENIE DE: `tytul_de`, `opis_krotki_de`, `opis_pelny_de`, `opis_kuratorski_de`, `opis_artysty_de`

### Targi
**Charakter:** wydarzenia komercyjne — gallery participation w art fairs. Nazwa, miejsce, lista prac wystawionych.

Pola które MAJĄ SENS:
- `idea_glowna_id` — opcjonalnie (targi mogą mieć focus kuratorski)
- `int_publiczne` — czy targi pokazane w sekcji International (większość TAK — targi to często wydarzenia międzynarodowe)
- `int_visual_wall` — NIE (targi to logistyka, nie wizualny kontent)
- `nazwa_targow_en`, `nazwa_targow_de` — nazwa targów
- `opis_en`, `opis_de` — opis udziału galerii
- `info_dla_artystow_en`, `info_dla_artystow_de` — instrukcje (jeśli wystawiamy ich prace)
- `seo_title_en`, `seo_title_de`, `seo_description_en`, `seo_description_de`
- M:N do pojęć (`pojecia_targi`)

### Oferty
**Charakter:** dokumenty handlowe — oferta dla konkretnego klienta lub kolekcja publiczna w Viewing Room. Łączy prace z odbiorcą.

Pola które MAJĄ SENS:
- `idea_glowna_id` — opcjonalnie (oferta może mieć motyw kuratorski np. „Geometria w polskim konceptualizmie")
- `int_publiczne` — czy oferta dla klienta z International (decyduje o języku komunikacji)
- `int_visual_wall` — NIE (oferty są prywatne lub półprywatne)
- `tytul_en`, `tytul_de` — tytuł oferty
- `wstep_en`, `wstep_de` — wprowadzenie
- `tekst_kuratorski_en`, `tekst_kuratorski_de` — narracja oferty
- `tekst_dla_klienta_en`, `tekst_dla_klienta_de` — komunikat osobisty
- `seo_title_en`, `seo_title_de`, `seo_description_en`, `seo_description_de` — dla publicznych ofert kolekcjonerskich
- M:N do pojęć (`pojecia_oferty`)

### Artysci (wyrównanie wielojęzyczności)
**Charakter:** profile artystów. Ma już EN (5 pól) z poprzedniej pracy panelowej. Brakuje DE i pól International.

Pola które JESZCZE potrzeba:
- `int_publiczne`, `int_visual_wall`
- DOPEŁNIENIE DE: `biografia_de`, `dlaczego_wazny_de`, `haslo_de`, `nota_biograficzna_de`, `nota_kuratorska_de`

---

## 3. PEŁNA LISTA ZMIAN — co dodaje migracja

### A. `idea_glowna_id` na 4 nowych encjach (single FK, nullable, ON DELETE SET NULL)
- `targi.idea_glowna_id`
- `oferty.idea_glowna_id`
- `artykuly.idea_glowna_id`
- `kompendium.idea_glowna_id`

### B. `int_publiczne` (boolean DEFAULT false) na 6 encjach
- `artysci.int_publiczne`
- `wystawy.int_publiczne`
- `targi.int_publiczne`
- `oferty.int_publiczne`
- `artykuly.int_publiczne`
- `kompendium.int_publiczne`

### C. `int_visual_wall` (boolean DEFAULT false) na 5 encjach
- `artysci.int_visual_wall`
- `wystawy.int_visual_wall`
- `artykuly.int_visual_wall`
- `kompendium.int_visual_wall`
- (NIE: `targi`, `oferty` — patrz decyzje wyżej)

### D. Wielojęzyczność DE na encjach które już mają EN
**Artysci** (5 pól DE — dopełnienie do istniejących EN):
- `biografia_de`, `dlaczego_wazny_de`, `haslo_de`, `nota_biograficzna_de`, `nota_kuratorska_de`

**Wystawy** (5 pól DE — dopełnienie do istniejących EN):
- `tytul_de`, `opis_krotki_de`, `opis_pelny_de`, `opis_kuratorski_de`, `opis_artysty_de`

### E. Wielojęzyczność EN+DE dla encji które nie mają NIC

**Kompendium** (10 pól: 5 par EN+DE):
- `tytul_en`, `tytul_de`
- `lead_en`, `lead_de`
- `tresc_en`, `tresc_de`
- `seo_title_en`, `seo_title_de`
- `seo_description_en`, `seo_description_de`

**Artykuly** (10 pól: 5 par EN+DE):
- `tytul_en`, `tytul_de`
- `lead_en`, `lead_de`
- `tresc_en`, `tresc_de`
- `seo_title_en`, `seo_title_de`
- `seo_description_en`, `seo_description_de`

**Targi** (10 pól: 5 par EN+DE):
- `nazwa_targow_en`, `nazwa_targow_de`
- `opis_en`, `opis_de`
- `info_dla_artystow_en`, `info_dla_artystow_de`
- `seo_title_en`, `seo_title_de`
- `seo_description_en`, `seo_description_de`

**Oferty** (10 pól: 5 par EN+DE):
- `tytul_en`, `tytul_de`
- `wstep_en`, `wstep_de`
- `tekst_kuratorski_en`, `tekst_kuratorski_de`
- `tekst_dla_klienta_en`, `tekst_dla_klienta_de`
- `seo_title_en`, `seo_title_de`
- `seo_description_en`, `seo_description_de`

### F. 4 tabele M:N pojęć
Wszystkie ze strukturą identyczną jak `pojecia_artysci/prace/wystawy` z Obszaru 2 (PK uuid, FK CASCADE, UNIQUE, priorytet, created_at, 2 indeksy każda).

- `pojecia_targi`
- `pojecia_oferty`
- `pojecia_artykuly`
- `pojecia_kompendium`

### G. Indeksy na nowych kolumnach
- 4 indeksy na `idea_glowna_id` (po jednym na każdej nowej kolumnie)
- 6 indeksów na `int_publiczne` (po jednym na każdej z 6 encji)
- 4 indeksy na `int_visual_wall` (na 4 encjach które mają to pole)
- 8 indeksów na 4 nowych tabelach M:N (po 2 na każdą)

**Razem indeksów:** 22 nowe.

---

## 4. PODSUMOWANIE LICZB

| Kategoria | Ilość |
|---|---|
| Nowe kolumny `idea_glowna_id` | 4 |
| Nowe kolumny `int_publiczne` | 6 |
| Nowe kolumny `int_visual_wall` | 4 |
| Nowe kolumny DE (dopełnienie istniejących EN) | 10 (5 artysci + 5 wystawy) |
| Nowe kolumny EN+DE od zera (4 encje × 10 pól) | 40 |
| Nowe tabele M:N | 4 |
| Nowe indeksy | 22 |
| **Razem nowych kolumn** | **64** |
| **Razem nowych obiektów (tabele + kolumny + indeksy)** | **90** |

---

## 5. SEKWENCJA MIGRACJI

```
BEGIN;

-- SEKCJA 0: Higieniczne usunięcie znanych obiektów
--   Brak — wszystkie 7 docelowych tabel są czyste

-- SEKCJA 0a': Pre-flight check (check-unknown)
--   - Sprawdzenie stanu Obszaru 2 (idee=7, pojecia=45)
--   - Sprawdzenie istnienia 4 tabel docelowych
--   - Idempotency check kolumn i tabel M:N
--   - Kontekst liczb rekordów

-- SEKCJA 1: idea_glowna_id na 4 encjach
--   4 × ALTER TABLE ADD COLUMN + 4 indeksy

-- SEKCJA 2: int_publiczne na 6 encjach
--   6 × ALTER TABLE ADD COLUMN + 6 indeksów

-- SEKCJA 3: int_visual_wall na 4 encjach (bez targi, oferty)
--   4 × ALTER TABLE ADD COLUMN + 4 indeksy

-- SEKCJA 4: Wielojęzyczność DE — dopełnienie do EN
--   artysci: 5 × ALTER TABLE ADD COLUMN (DE)
--   wystawy: 5 × ALTER TABLE ADD COLUMN (DE)

-- SEKCJA 5: Wielojęzyczność EN+DE od zera
--   kompendium: 10 × ALTER TABLE ADD COLUMN
--   artykuly: 10 × ALTER TABLE ADD COLUMN
--   targi: 10 × ALTER TABLE ADD COLUMN
--   oferty: 10 × ALTER TABLE ADD COLUMN

-- SEKCJA 6: 4 tabele M:N pojęć
--   pojecia_targi/oferty/artykuly/kompendium + 8 indeksów

-- SEKCJA 7: Weryfikacja końcowa
--   - Liczba nowych kolumn = 64
--   - Liczba nowych tabel M:N = 4
--   - Liczba rekordów w nowych M:N = 0

COMMIT;
```

---

## 6. CO PO MIGRACJI

Po udanym uruchomieniu **wszystkie 7 encji programu galerii** mają komplet:

| Encja | Pola statusowe | Idea + pojęcia | International | EN | DE |
|---|---|---|---|---|---|
| `prace` | ✅ Obszar 0 | ✅ Obszar 2 | ✅ Obszar 0 | ✅ | ✅ |
| `artysci` | — | ✅ Obszar 2 | ✅ TA migracja | ✅ | ✅ TA migracja |
| `wystawy` | — | ✅ Obszar 2 | ✅ TA migracja | ✅ | ✅ TA migracja |
| `targi` | — | ✅ TA migracja | ✅ TA migracja | ✅ TA migracja | ✅ TA migracja |
| `oferty` | — | ✅ TA migracja | ✅ TA migracja | ✅ TA migracja | ✅ TA migracja |
| `artykuly` | — | ✅ TA migracja | ✅ TA migracja | ✅ TA migracja | ✅ TA migracja |
| `kompendium` | — | ✅ TA migracja | ✅ TA migracja | ✅ TA migracja | ✅ TA migracja |

**Wszystkie pola są nullable lub mają DEFAULT false.** Tadeusz wypełni ręcznie w panelu w kolejnych sesjach (B + C).

**Kolejne obszary planu przebudowy** (1, 3-8, 10-12) nie potrzebują dodawania pól strukturalnych do tych 7 tabel. Mogą:
- Dodawać tabele relacyjne (M:N)
- Dodawać słowniki (jak `rynki` w Obszarze 0)
- Tworzyć widoki publiczne (Obszar bezpieczeństwa)
- Dostosowywać panel CRM i frontend

---

## 7. NASTĘPNE KROKI

1. **Akceptacja planu** przez Tadeusza
2. **Napisanie SQL** `obszar2_uzupelnienie.sql` (~650 linii, wzorzec z Obszaru 0/2)
3. **Commit obu plików** (dokument + SQL) bez push
4. **Uruchomienie SQL w Supabase SQL Editor** ze świeżej zakładki
5. **Weryfikacja**: PASS z RAISE NOTICE, 64 nowe kolumny, 4 nowe tabele, 0 rekordów w nowych M:N
6. **Aktualizacja planu przebudowy** + push
7. **Sesja B**: panel — formularze 6 encji z multiselectami idei/pojęć + checkboxami `int_publiczne`/`int_visual_wall` + zakładkami EN/DE
8. **Sesja C**: panel — moduły CRUD idei i pojęć
