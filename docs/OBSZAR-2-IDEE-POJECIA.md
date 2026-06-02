# OBSZAR 2 — IDEE, POJĘCIA I WSPÓŁCZESNE KONTYNUACJE
## Dokument źródłowy decyzji + mapowanie na Supabase

**Status:** Dokument zatwierdzony. **Autor decyzji:** Tadeusz Stapowicz. **Data:** czerwiec 2026.

---

# CZĘŚĆ A — KONCEPT (dokument źródłowy)

## 1. Główna zasada

Galeria ESTA pokazuje sztukę przez idee. Model 6 + 1: sześć idei głównych jako publiczna mapa programu + jeden blok „Współczesne kontynuacje" jako współczesne echo całej mapy.

## 2. Struktura: 6 + 1

**6 idei głównych:**
1. Idea / Język
2. Słowo / Znak
3. Geometria / Struktura
4. Światło / Przestrzeń
5. Pamięć / Archiwum
6. Obraz / Komunikat

**+1 blok:**
7. Współczesne kontynuacje (Ciało, obraz, pamięć, tożsamość)

## 3. Trzy poziomy widoczności

- **Idee główne** — publiczne, w nawigacji, w menu, w filtrach
- **Pojęcia pomocnicze** — delikatne hasła przy ideach, artystach, pracach
- **Tagi techniczne** — w bazie, niewidoczne publicznie

## 4. Idea a pojęcie

**Idea jest bramą. Pojęcia są tropami.**

Idea = duża kategoria interpretacyjna (np. „Geometria / Struktura").
Pojęcie = doprecyzowanie idei (np. „układ otwarty · rytm · system").

## 5. Statusy pojęć (5 stopni widoczności)

1. **ukryte** — robocze, nie pokazuje się publicznie
2. **sygnał** — delikatne hasło, nieklikalne
3. **tag publiczny** — stabilne hasło, jeszcze nieklikalne
4. **klikalny filtr** — link filtrujący kolekcję
5. **strona pojęcia** — własna strona opisowa

## 6. Etapy wdrożenia (4 stopnie)

1. **Etap 1 — sygnał**
2. **Etap 2 — filtr**
3. **Etap 3 — opis**
4. **Etap 4 — strona pojęcia**

## 7. Kluczowe decyzje terminologiczne

- **„układ otwarty"** — używamy konsekwentnie dla Wandy Gołkowskiej
- **„forma konkretna"** — USUWAMY z publicznej listy pojęć (zostaje jako temat Kompendium pod tytułem „Sztuka konkretna i geometria")
- **„Współczesne kontynuacje"** — NIE jest siódmą zwykłą ideą, to osobny blok z artystami młodszego pokolenia (Żychlińska, Dziedzic, Swoboda)

## 8. Reguły powiązań

- Każdy artysta ma **JEDNĄ ideę główną** (single FK) + opcjonalnie kilka uzupełniających
- Każda praca ma **JEDNĄ ideę główną** (single FK) + opcjonalnie kilka pojęć
- Pojęcia są przypisywane przez M:N (jedno pojęcie może być u wielu artystów/prac)

---

# CZĘŚĆ B — MAPOWANIE NA SUPABASE

## 9. Konkretne mapowanie pól: koncept → PostgreSQL

### Tabela `idee` — 7 rekordów

| Pole z konceptu | Kolumna PostgreSQL | Typ | NOT NULL | DEFAULT | CHECK / UNIQUE |
|---|---|---|---|---|---|
| (brak) | `id` | uuid | ✓ | `gen_random_uuid()` | PRIMARY KEY |
| NAZWA_IDEI | `nazwa` | text | ✓ | — | — |
| (EN) | `nazwa_en` | text | — | — | — |
| (DE) | `nazwa_de` | text | — | — | — |
| SLUG_IDEI | `slug` | text | ✓ | — | UNIQUE |
| NUMER | `numer` | integer | ✓ | — | UNIQUE, CHECK (numer BETWEEN 1 AND 99) |
| **(NOWE)** | `typ` | text | ✓ | `'glowna'` | CHECK IN ('glowna', 'wspolczesne_kontynuacje') |
| OPIS_KROTKI_HOME | `opis_krotki_pl` | text | — | — | — |
| (EN) | `opis_krotki_en` | text | — | — | — |
| (DE) | `opis_krotki_de` | text | — | — | — |
| OPIS_DLUGI | `opis_dlugi_pl` | text | — | — | — |
| (EN) | `opis_dlugi_en` | text | — | — | — |
| (DE) | `opis_dlugi_de` | text | — | — | — |
| ARTYSCI_HOME | `artysci_home` | text | — | — | — |
| DETAL_OBRAZU | `detal_obraz_url` | text | — | — | — |
| ALT_DETALU | `alt_detalu` | text | — | — | — |
| (charakter wizualny) | `charakter_wizualny` | text | — | — | — |
| KOLEJNOSC | `kolejnosc` | integer | ✓ | — | UNIQUE |
| STATUS_PUBLIKACJI | `status_publikacji` | text | ✓ | `'gotowe'` | CHECK IN ('szkic','gotowe','opublikowane','ukryte') |
| SEO_TITLE | `seo_title` | text | — | — | — |
| SEO_DESCRIPTION | `seo_description` | text | — | — | — |
| (NOWE) | `meta_index` | text | ✓ | `'index'` | CHECK IN ('index','noindex') |
| — | `created_at` | timestamptz | ✓ | `now()` | — |
| — | `updated_at` | timestamptz | ✓ | `now()` | — |

**Indeksy:**
- `idx_idee_typ` ON (typ)
- `idx_idee_kolejnosc` ON (kolejnosc)
- `idx_idee_status_publikacji` ON (status_publikacji)

---

### Tabela `pojecia` — 45 rekordów

| Pole z konceptu | Kolumna PostgreSQL | Typ | NOT NULL | DEFAULT | CHECK / UNIQUE |
|---|---|---|---|---|---|
| — | `id` | uuid | ✓ | `gen_random_uuid()` | PRIMARY KEY |
| NAZWA_POJECIA | `nazwa` | text | ✓ | — | — |
| (EN) | `nazwa_en` | text | — | — | — |
| (DE) | `nazwa_de` | text | — | — | — |
| SLUG_POJECIA | `slug` | text | ✓ | — | UNIQUE |
| IDEA_GLOWNA | `idea_glowna_id` | uuid | ✓ | — | FK → idee(id) ON DELETE RESTRICT |
| STATUS_PUBLICZNY | `status_publiczny` | text | ✓ | `'sygnal'` | CHECK IN ('ukryte','sygnal','tag_publiczny','klikalny_filtr','strona_pojecia') |
| ETAP_WDROZENIA | `etap_wdrozenia` | text | ✓ | `'etap_1_sygnal'` | CHECK IN ('etap_1_sygnal','etap_2_filtr','etap_3_opis','etap_4_strona_pojecia') |
| OPIS_KROTKI | `opis_krotki` | text | — | — | — |
| OPIS_DLUGI | `opis_dlugi` | text | — | — | — |
| PRIORYTET | `priorytet` | integer | ✓ | `0` | — |
| POKAZ_NA_STRONIE_IDEI | `pokaz_na_stronie_idei` | boolean | ✓ | `true` | — |
| POKAZ_PRZY_ARTYSCIE | `pokaz_przy_artyscie` | boolean | ✓ | `true` | — |
| POKAZ_PRZY_PRACY | `pokaz_przy_pracy` | boolean | ✓ | `true` | — |
| SEO_TITLE | `seo_title` | text | — | — | — |
| SEO_DESCRIPTION | `seo_description` | text | — | — | — |
| META_INDEX | `meta_index` | text | ✓ | `'noindex'` | CHECK IN ('index','noindex') |
| — | `created_at` | timestamptz | ✓ | `now()` | — |
| — | `updated_at` | timestamptz | ✓ | `now()` | — |

**Indeksy:**
- `idx_pojecia_idea_glowna` ON (idea_glowna_id)
- `idx_pojecia_status_publiczny` ON (status_publiczny)
- `idx_pojecia_etap_wdrozenia` ON (etap_wdrozenia)
- `idx_pojecia_priorytet` ON (priorytet)

---

### Tabele łączące M:N — 4 nowe, puste po migracji

#### `artysci_idee` (artysta ↔ idea, z rolą)

| Kolumna | Typ | NOT NULL | DEFAULT | CHECK / UNIQUE / FK |
|---|---|---|---|---|
| `id` | uuid | ✓ | `gen_random_uuid()` | PRIMARY KEY |
| `artysta_id` | uuid | ✓ | — | FK → artysci(id) ON DELETE CASCADE |
| `idea_id` | uuid | ✓ | — | FK → idee(id) ON DELETE CASCADE |
| `rola` | text | ✓ | `'glowna'` | CHECK IN ('glowna','uzupelniajaca') |
| `opis` | text | — | — | — |
| `kolejnosc` | integer | ✓ | `1` | — |
| `created_at` | timestamptz | ✓ | `now()` | — |

UNIQUE (artysta_id, idea_id) | Indeksy: idx_artysci_idee_artysta (artysta_id), idx_artysci_idee_idea (idea_id)

#### `pojecia_artysci` (pojęcie ↔ artysta)

| Kolumna | Typ | NOT NULL | DEFAULT | CHECK / UNIQUE / FK |
|---|---|---|---|---|
| `id` | uuid | ✓ | `gen_random_uuid()` | PRIMARY KEY |
| `pojecie_id` | uuid | ✓ | — | FK → pojecia(id) ON DELETE CASCADE |
| `artysta_id` | uuid | ✓ | — | FK → artysci(id) ON DELETE CASCADE |
| `priorytet` | integer | ✓ | `0` | — |
| `created_at` | timestamptz | ✓ | `now()` | — |

UNIQUE (pojecie_id, artysta_id) | Indeksy analogiczne

#### `pojecia_prace` (pojęcie ↔ praca)

| Kolumna | Typ | NOT NULL | DEFAULT | CHECK / UNIQUE / FK |
|---|---|---|---|---|
| `id` | uuid | ✓ | `gen_random_uuid()` | PRIMARY KEY |
| `pojecie_id` | uuid | ✓ | — | FK → pojecia(id) ON DELETE CASCADE |
| `praca_id` | uuid | ✓ | — | FK → prace(id) ON DELETE CASCADE |
| `priorytet` | integer | ✓ | `0` | — |
| `created_at` | timestamptz | ✓ | `now()` | — |

UNIQUE (pojecie_id, praca_id) | Indeksy analogiczne

#### `pojecia_wystawy` (pojęcie ↔ wystawa)

| Kolumna | Typ | NOT NULL | DEFAULT | CHECK / UNIQUE / FK |
|---|---|---|---|---|
| `id` | uuid | ✓ | `gen_random_uuid()` | PRIMARY KEY |
| `pojecie_id` | uuid | ✓ | — | FK → pojecia(id) ON DELETE CASCADE |
| `wystawa_id` | uuid | ✓ | — | FK → wystawy(id) ON DELETE CASCADE |
| `priorytet` | integer | ✓ | `0` | — |
| `created_at` | timestamptz | ✓ | `now()` | — |

UNIQUE (pojecie_id, wystawa_id) | Indeksy analogiczne

---

### Nowe pola FK na istniejących tabelach

| Tabela | Nowa kolumna | Typ | NOT NULL | FK |
|---|---|---|---|---|
| `artysci` | `idea_glowna_id` | uuid | — (nullable) | FK → idee(id) ON DELETE SET NULL |
| `prace` | `idea_glowna_id` | uuid | — (nullable) | FK → idee(id) ON DELETE SET NULL |
| `wystawy` | `idea_glowna_id` | uuid | — (nullable) | FK → idee(id) ON DELETE SET NULL |

Indeksy: `idx_<tabela>_idea_glowna` ON (idea_glowna_id) dla każdej tabeli.

**Dlaczego nullable:** wprowadzasz idee ręcznie w panelu po migracji. Nullable pozwala stopniowo przypisywać bez naruszania istniejących wierszy.

**Dlaczego ON DELETE SET NULL:** gdy idea zostanie skasowana, artysta/praca/wystawa nie znika — tylko traci powiązanie.

---

## 10. Tabele i kolumny do USUNIĘCIA — konkretna lista

### Tabele (6 sztuk, DROP CASCADE)

| Tabela | Rekordów | Komentarz |
|---|---|---|
| `idee` | 35 | Stary model, zastępujemy 7 nowymi |
| `idee_artysci` | 7 | Kasujemy, Tadeusz przypisze ręcznie |
| `idee_prace` | 0 | Puste |
| `idee_teksty` | 0 | Puste |
| `kompendium_idee` | 0 | Puste |
| `idee_idee` | 44 | Eksperymentalne samoreferencje, niepotrzebne |

### Kolumny (6 z głównych tabel + 0 z backupu)

| Tabela | Kolumna | Wartości niepuste | Akcja |
|---|---|---|---|
| `artysci` | `idee_glowne_txt` | 3 | DROP COLUMN |
| `artysci` | `idee_dodatkowe_txt` | 0 | DROP COLUMN |
| `prace` | `idee_txt` | 0 | DROP COLUMN |
| `wystawy` | `idee_txt` | 1 | DROP COLUMN |
| `targi` | `idee_txt` | 0 | DROP COLUMN |
| `oferty` | `idee_txt` | 0 | DROP COLUMN |
| `prace_backup_obszar0` | `idee_txt` | (ile było) | NIE RUSZAMY (backup) |

---

## 11. Seed `idee` — 7 rekordów, konkretne wartości

```sql
INSERT INTO idee (numer, slug, typ, nazwa, nazwa_en, kolejnosc,
                  opis_krotki_pl, opis_krotki_en,
                  artysci_home, meta_index) VALUES

(1, 'idea-jezyk', 'glowna',
 'Idea / Język', 'Idea / Language', 1,
 'Dzieło jako sytuacja pojęciowa, językowa i intelektualna.',
 'The artwork as a conceptual, linguistic and intellectual situation.',
 'Kozłowski / Dłużniewski', 'index'),

(2, 'slowo-znak', 'glowna',
 'Słowo / Znak', 'Word / Sign', 2,
 'Słowo jako obraz, przestrzeń, typografia i komunikat.',
 'The word as image, space, typography and communication.',
 'Dróżdż / Twożywo / Kozłowski', 'index'),

(3, 'geometria-struktura', 'glowna',
 'Geometria / Struktura', 'Geometry / Structure', 3,
 'Układ, rytm, powtórzenie i relacja elementów.',
 'Arrangement, rhythm, repetition and relations between elements.',
 'Gołkowska / Gostomski / Wiśniewski / Brandt', 'index'),

(4, 'swiatlo-przestrzen', 'glowna',
 'Światło / Przestrzeń', 'Light / Space', 4,
 'Cień, obiekt, projekcja, miejsce i działanie.',
 'Shadow, object, projection, place and action.',
 'Chwałczyk / B. Kozłowska / Paruzel / Wiśniewski', 'index'),

(5, 'pamiec-archiwum', 'glowna',
 'Pamięć / Archiwum', 'Memory / Archive', 5,
 'Fotografia, ślad, dokumentacja i historia galerii.',
 'Photography, trace, documentation and the history of the gallery.',
 'Lewczyński / Archiwum ESTA / B. Kozłowska / Paruzel', 'index'),

(6, 'obraz-komunikat', 'glowna',
 'Obraz / Komunikat', 'Image / Communication', 6,
 'Malarstwo, tekst, ironia i znak w przestrzeni publicznej.',
 'Painting, text, irony and the sign in public space.',
 'Sobczyk / Twożywo', 'index'),

(7, 'wspolczesne-kontynuacje', 'wspolczesne_kontynuacje',
 'Współczesne kontynuacje', 'Contemporary Continuations', 7,
 'Ciało, obraz, pamięć, tożsamość.',
 'Body, image, memory, identity.',
 'Żychlińska / Dziedzic / Swoboda', 'index');
```

**Opisy długie** (sekcja 6 dokumentu konceptualnego) zostaną wstawione osobnym UPDATE po INSERT (dla czytelności SQL).

---

## 12. Seed `pojecia` — 45 rekordów, konkretne mapowanie

Wszystkie z `etap_wdrozenia='etap_1_sygnal'` i `meta_index='noindex'` (chyba że zaznaczono inaczej).

### Idea 1: Idea / Język (slug `idea-jezyk`) → 6 pojęć

| slug | nazwa | nazwa_en | status_publiczny |
|---|---|---|---|
| pojecie | pojęcie | concept | sygnal |
| paradoks | paradoks | paradox | sygnal |
| definicja | definicja | definition | sygnal |
| instrukcja | instrukcja | instruction | sygnal |
| system-znaczen | system znaczeń | system of meanings | sygnal |
| dokumentacja | dokumentacja | documentation | tag_publiczny |

### Idea 2: Słowo / Znak (slug `slowo-znak`) → 6 pojęć

| slug | nazwa | nazwa_en | status_publiczny |
|---|---|---|---|
| poezja-konkretna | poezja konkretna | concrete poetry | tag_publiczny |
| typografia | typografia | typography | sygnal |
| litera | litera | letter | sygnal |
| tekst | tekst | text | sygnal |
| komunikat | komunikat | message | sygnal |
| uklad-slowo | układ (Słowo/Znak) | arrangement (Word/Sign) | sygnal |

### Idea 3: Geometria / Struktura (slug `geometria-struktura`) → 6 pojęć

| slug | nazwa | nazwa_en | status_publiczny |
|---|---|---|---|
| uklad | układ | arrangement | sygnal |
| rytm | rytm | rhythm | sygnal |
| system | system | system | sygnal |
| powtorzenie | powtórzenie | repetition | sygnal |
| relief | relief | relief | sygnal |
| uklad-otwarty | układ otwarty | open arrangement | tag_publiczny |

**Konflikt slug „układ":** rozwiązany przez nadanie sufiksu `-slowo` dla wystąpienia w idei „Słowo / Znak". Główne pojęcie `uklad` przypisane do „Geometria / Struktura" (silniejsze zakorzenienie zgodnie z dokumentem).

### Idea 4: Światło / Przestrzeń (slug `swiatlo-przestrzen`) → 6 pojęć

| slug | nazwa | nazwa_en | status_publiczny |
|---|---|---|---|
| swiatlo | światło | light | sygnal |
| cien | cień | shadow | tag_publiczny |
| projekcja | projekcja | projection | sygnal |
| obiekt | obiekt | object | sygnal |
| miejsce | miejsce | place | sygnal |
| dzialanie | działanie | action | sygnal |

### Idea 5: Pamięć / Archiwum (slug `pamiec-archiwum`) → 6 pojęć

| slug | nazwa | nazwa_en | status_publiczny |
|---|---|---|---|
| fotografia | fotografia | photography | tag_publiczny |
| slad | ślad | trace | sygnal |
| dokument | dokument | document | sygnal |
| archiwum | archiwum | archive | tag_publiczny |
| czas | czas | time | sygnal |
| historia-galerii | historia galerii | gallery history | tag_publiczny |

### Idea 6: Obraz / Komunikat (slug `obraz-komunikat`) → 6 pojęć

| slug | nazwa | nazwa_en | status_publiczny |
|---|---|---|---|
| malarstwo | malarstwo | painting | sygnal |
| tekst-w-obrazie | tekst w obrazie | text in image | sygnal |
| ironia | ironia | irony | sygnal |
| miasto | miasto | city | sygnal |
| znak-publiczny | znak publiczny | public sign | sygnal |
| krytyka | krytyka | critique | sygnal |

### Idea 7: Współczesne kontynuacje (slug `wspolczesne-kontynuacje`) → 9 pojęć

| slug | nazwa | nazwa_en | status_publiczny |
|---|---|---|---|
| cialo | ciało | body | tag_publiczny |
| tozsamosc | tożsamość | identity | sygnal |
| relacja | relacja | relation | sygnal |
| natura | natura | nature | sygnal |
| nieludzkie | nieludzkie | non-human | tag_publiczny |
| duchowosc | duchowość | spirituality | sygnal |
| terytorium | terytorium | territory | sygnal |
| emocja | emocja | emotion | sygnal |
| granica | granica | boundary | sygnal |

**Razem: 6 + 6 + 6 + 6 + 6 + 6 + 9 = 45 pojęć.**

- 36 ze statusem `sygnal`
- 9 ze statusem `tag_publiczny` (dokumentacja, poezja-konkretna, uklad-otwarty, cien, fotografia, archiwum, historia-galerii, cialo, nieludzkie)

---

## 13. Strategia ON DELETE — przegląd

| Relacja | Strategia | Powód |
|---|---|---|
| `pojecia.idea_glowna_id` → idee | RESTRICT | Nie można skasować idei która ma pojęcia (bezpiecznik) |
| `artysci.idea_glowna_id` → idee | SET NULL | Skasowanie idei zostawia artystę bez powiązania (nie kasuje go) |
| `prace.idea_glowna_id` → idee | SET NULL | Analogicznie |
| `wystawy.idea_glowna_id` → idee | SET NULL | Analogicznie |
| `artysci_idee` → artysci/idee | CASCADE | M:N: skasowanie artysty lub idei kasuje powiązanie |
| `pojecia_artysci` → pojecia/artysci | CASCADE | M:N: skasowanie kasuje powiązanie |
| `pojecia_prace` → pojecia/prace | CASCADE | Analogicznie |
| `pojecia_wystawy` → pojecia/wystawy | CASCADE | Analogicznie |

---

## 14. Konkretna sekwencja migracji

```
BEGIN;

-- SEKCJA 0: Higieniczne usuwanie znanych obiektów
ALTER TABLE artysci DROP COLUMN IF EXISTS idee_glowne_txt;
ALTER TABLE artysci DROP COLUMN IF EXISTS idee_dodatkowe_txt;
ALTER TABLE prace   DROP COLUMN IF EXISTS idee_txt;
ALTER TABLE wystawy DROP COLUMN IF EXISTS idee_txt;
ALTER TABLE targi   DROP COLUMN IF EXISTS idee_txt;
ALTER TABLE oferty  DROP COLUMN IF EXISTS idee_txt;

DROP TABLE IF EXISTS idee_artysci CASCADE;
DROP TABLE IF EXISTS idee_prace CASCADE;
DROP TABLE IF EXISTS idee_teksty CASCADE;
DROP TABLE IF EXISTS kompendium_idee CASCADE;
DROP TABLE IF EXISTS idee_idee CASCADE;
DROP TABLE IF EXISTS idee CASCADE;

-- SEKCJA 0a': Pre-flight check (DO block)

-- SEKCJA 1: Brak backupu (świadomie)

-- SEKCJA 2: Nowe tabele + seed + nowe pola FK
CREATE TABLE idee (...);
CREATE TABLE pojecia (...);
CREATE TABLE artysci_idee (...);
CREATE TABLE pojecia_artysci (...);
CREATE TABLE pojecia_prace (...);
CREATE TABLE pojecia_wystawy (...);

ALTER TABLE artysci ADD COLUMN idea_glowna_id uuid REFERENCES idee(id) ON DELETE SET NULL;
ALTER TABLE prace   ADD COLUMN idea_glowna_id uuid REFERENCES idee(id) ON DELETE SET NULL;
ALTER TABLE wystawy ADD COLUMN idea_glowna_id uuid REFERENCES idee(id) ON DELETE SET NULL;

-- Indeksy + seed

-- SEKCJA 3: Weryfikacja (RAISE NOTICE)

COMMIT;
```

---

## 15. Co po migracji — konkretne dalsze kroki

1. **Panel CRM** (osobna sesja): multiselect idei w formularzach artysty/pracy/wystawy, edytor pojęć, sortowanie po idei
2. **Strona Next.js** (osobna sesja): strona `/idee/` z 7 planszami, podstrony `/idee/[slug]/`
3. **Ręczne przypisania** (Tadeusz w panelu po migracji): idea_glowna_id wszystkim artystom, pracom, wystawom; pojęcia tam gdzie pasują

---

## 16. Status

Dokument **zaakceptowany przez Tadeusza** (czerwiec 2026).

Migracja: `migrations/obszar2_idee_pojecia.sql`. Po commicie → uruchomienie w Supabase SQL Editor → weryfikacja → push.
