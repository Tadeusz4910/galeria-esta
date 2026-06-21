# ESTA-KOMPONENTY-NARRACYJNE

**Wersja:** 1.0  
**Data:** 12 czerwca 2026  
**Status:** Dokument decyzyjny — biblioteka komponentów dla notatek/artykułów Galerii ESTA

---

## CEL

Biblioteka 10 typów bloków narracyjnych do budowania wizualnych esejów (notatki, artykuły, refleksje) z trzech źródeł: podróże, wystawy, refleksje galeryjne.

Każda kolejna notatka (Bern, Zürich, Liste Basel, Art Basel, przyszłe Viewing Roomy) używa **kombinacji** tych samych bloków. Spójność wizualna ESTA = język wizualny galerii.

**Filozofia:** "obiekt wizualny zbudowany z tekstu i zdjęć", nie "artykuł ze zdjęciami". Zdjęcia narracyjnie wplecione w tekst, nie galeria pod tekstem.

---

## TOKENY DESIGNU

### Kolory

```
--tlo:         #fdfcfa    off-white, ciepły, jak papier
--tekst:       #1a1a1a    grafit, nie czarny
--tekst-jasny: #555       dla cytatów
--podpis:      #777       dla podpisów pod zdjęciami
--pojecia:     #999       dla łańcuchów pojęć
--linia:       #e8e4dd    separatory
--akcent:      #6b5b3a    przygaszone złoto (linki w POWIĄZANIA)
```

### Typografia

```
Display:  Cormorant Garamond (tytuły, cytaty)
Tekst:    Instrument Sans (treść, nawigacja)
```

**Hierarchia rozmiarów:**
- H1 (tytuł hero):     clamp(48px, 7vw, 92px) — Cormorant 400
- H2 (tytuł sekcji):   clamp(36px, 4vw, 48px) — Cormorant 400
- Tekst główny:        21px — Instrument Sans 400, line-height 1.75
- Cytat:               clamp(28px, 3vw, 38px) — Cormorant italic
- Podpis pod zdjęciem: 14px — Instrument Sans 300 italic, #777
- Łańcuch pojęć:       13px — Instrument Sans 300, letter-spacing 0.18em, uppercase, #999

### Oddechy

```
między akapitami:        24px
między zdjęciem-podpis:  12px
między podpisem-tekstem: 48px
między dużymi sekcjami:  140px (desktop) / 80px (mobile)
między zdjęciami w grupie: 24px
```

### Szerokości

```
Kolumna tekstu:    max 700px
Kolumna zdjęć:     max 1280px
Kolumna cytatu:    max 640px
Strona całość:     max 1440px
```

---

## BIBLIOTEKA 10 KOMPONENTÓW

### T01 — HERO

**Cel:** otwarcie notatki, najważniejsze zdjęcie, tytuł.

**Layout:**
- Pełna szerokość ekranu, wysokość 88vh (min 600px)
- Zdjęcie pełne, lekko przyciemnione (filter brightness 0.95)
- Tekst nałożony w lewym dolnym rogu

**Zawartość:**
- Nadtytuł (kategoria + data, np. "Notatki ESTA · czerwiec 2026")
- H1 tytuł notatki ("Konstrukcja i rytm")
- Podtytuł italic ("Notatki z Zentrum Paul Klee w Bernie")
- Podpis autora zdjęcia (prawy dolny róg)

**Mobile:**
- Wysokość 75vh, min 500px
- Padding 24px zamiast 48px

**Pola w bazie (JSONB `dane`):**
```json
{
  "nadtytul": "string",
  "tytul": "string",
  "podtytul": "string",
  "zdjecie_id": "uuid",
  "zdjecie_alt": "string",
  "autor_zdjecia": "string",
  "wysokosc_vh": 88
}
```

---

### T02 — INTRO

**Cel:** krótki wstęp 2-4 akapity, ustanawia kontekst i ton.

**Layout:**
- Wąska kolumna 700px, wycentrowana
- Tekst nieco większy niż standardowy (22px)
- Brak zdjęcia obok
- Linia pojęć pod tekstem (oddzielona 64px)

**Zawartość:**
- 2-4 krótkie akapity
- Opcjonalna linia pojęć ("rytm · powtórzenie · układ · relacja")

**Pola w bazie:**
```json
{
  "akapity": ["string", "string", "string"],
  "pojecia": "rytm · powtórzenie · układ"
}
```

---

### T03 — SOLO

**Cel:** prezentacja jednego ważnego zdjęcia z podpisem.

**Layout:**
- Zdjęcie max 1280px, wycentrowane
- Podpis 14px italic, #777, 12px pod zdjęciem
- 140px oddechu przed i po

**Zawartość:**
- Jedno zdjęcie
- Podpis (1-2 zdania, kuratorska refleksja)

**Pola w bazie:**
```json
{
  "zdjecie_id": "uuid",
  "podpis": "string"
}
```

---

### T04 — TEKST_MIĘDZY

**Cel:** sekcja z rytmem foto / tekst / 2 foto. Kluczowa kompozycja: "oko widza odpoczywa".

**Layout:**
```
       [tytuł sekcji - kolumna tekstu]
[──── duże zdjęcie 1280px ────]
       [podpis 14px]
       [tekst 700px]
[─ foto 50% ─][─ foto 50% ─]    24px gap
       [pojęcia]
```

**Mobile:** para zdjęć przechodzi do pionowego stosu.

**Zawartość:**
- Tytuł sekcji (H2 Cormorant)
- Duże zdjęcie wprowadzające
- Podpis pod nim
- Akapit/y tekstu (2-3)
- Para zdjęć obok siebie
- Linia pojęć na końcu

**Pola w bazie:**
```json
{
  "tytul_sekcji": "string",
  "zdjecie_duze_id": "uuid",
  "podpis_duzy": "string",
  "akapity": ["string"],
  "zdjecie_lewe_id": "uuid",
  "zdjecie_prawe_id": "uuid",
  "pojecia": "string"
}
```

---

### T05 — PIONOWE_OBOK

**Cel:** "wygląda jak książka" — pionowe zdjęcie + tekst obok.

**Layout:**
```
[─ foto 45% ─][─── tekst 55% ───]
              gap 64px
```

- Pionowe zdjęcie (aspect 3/4) po lewej
- Tekst po prawej, lekko obniżony (padding-top 24px)
- H2 tytuł sekcji + 3-4 akapity

**Mobile:** stos pionowy, foto najpierw.

**Zawartość:**
- Tytuł sekcji
- 3-4 akapity tekstu
- Podpis pod całością
- Linia pojęć

**Pola w bazie:**
```json
{
  "tytul_sekcji": "string",
  "zdjecie_id": "uuid",
  "strona": "left" | "right",
  "proporcja_zdjecia": 45,
  "akapity": ["string"],
  "podpis": "string",
  "pojecia": "string"
}
```

---

### T06 — TRIPTYCH

**Cel:** 3 zdjęcia w rzędzie pokazujące różne aspekty jednego tematu (np. szczegóły konstrukcji).

**Layout:**
```
       [tytuł sekcji]
[foto 33%][foto 33%][foto 33%]    24px gap
       [podpis]
       [tekst 700px]
```

Wszystkie 3 zdjęcia aspect 3/4 (pionowe).

**Mobile:** kolumna pionowa.

**Zawartość:**
- Tytuł sekcji
- 3 zdjęcia
- Wspólny podpis (jedno zdanie)
- Tekst pod zdjęciami (komentarz)
- Pojęcia

**Pola w bazie:**
```json
{
  "tytul_sekcji": "string",
  "zdjecie_1_id": "uuid",
  "zdjecie_2_id": "uuid",
  "zdjecie_3_id": "uuid",
  "podpis": "string",
  "akapity": ["string"],
  "pojecia": "string"
}
```

---

### T07 — MOMENT

**Cel:** "moment zatrzymania" — duże centralne zdjęcie + cytat.

**Layout:**
- Zdjęcie max 75% szerokości, wycentrowane
- Podpis pod zdjęciem (12px)
- Cytat: 80px niżej, max 640px, Cormorant italic, wycentrowany

**Zawartość:**
- Pojedyncze mocne zdjęcie
- Podpis 1 zdanie
- Cytat 1-2 zdania (kluczowa myśl notatki)
- Opcjonalnie autor cytatu pod (małymi capitals)

**Pola w bazie:**
```json
{
  "zdjecie_id": "uuid",
  "podpis": "string",
  "cytat": "string",
  "autor_cytatu": "string | null"
}
```

---

### T08 — ROZKŁADÓWKA

**Cel:** "jak rozkładówka książki" — sekwencja foto/tekst/foto/tekst.

**Layout:**
- Tytuł sekcji
- Powtarzające się bloki: zdjęcie panorama + tekst poniżej
- Bloki oddzielone 80px

**Zawartość:**
- Tytuł sekcji
- 2-4 bloki (zdjęcie + 1-2 akapity)
- Pojęcia na końcu

**Pola w bazie:**
```json
{
  "tytul_sekcji": "string",
  "bloki": [
    {
      "zdjecie_id": "uuid",
      "akapity": ["string"]
    }
  ],
  "pojecia": "string"
}
```

---

### T09 — OUTRO

**Cel:** zakończenie, refleksja, lekkie wyciszenie.

**Layout:**
- Linia separator 60px nad
- Wąska kolumna 700px tekstu
- Pierwszy akapit italic 28px Cormorant (jak otwarcie)
- Reszta normalna 22px Instrument Sans

**Zawartość:**
- 3-5 akapitów refleksji
- Bez zdjęć (lub jedno spokojne)

**Pola w bazie:**
```json
{
  "akapity": ["string"]
}
```

---

### T10 — POWIĄZANIA

**Cel:** "Odkrywaj dalej" — przejście z notatki do kolekcji przez ideę, nie reklamę.

**Layout:**
- Linia separator nad
- Tytuł H2 wycentrowany
- 2 kolumny: Pojęcia | Artyści
- Każda kolumna z nagłówkiem (letter-spacing, uppercase, #999)
- Linki Cormorant 22px z hover underline (akcent #6b5b3a)
- Artyści mają mały opis pod (pojęcia związane)

**Zawartość:**
- Tytuł "Odkrywaj dalej"
- Lewa: 5-8 pojęć (linki do stron pojęć)
- Prawa: 3-5 artystów (linki do stron artystów) + opis powiązań

**Pola w bazie:**
```json
{
  "tytul": "Odkrywaj dalej",
  "pojecia": [
    { "etykieta": "string", "target_id": "uuid", "url": "/pojecie/slug" }
  ],
  "artysci": [
    { 
      "imie_nazwisko": "string",
      "target_id": "uuid",
      "url": "/artysta/slug",
      "opis": "string"
    }
  ]
}
```

---

## ZASADY KOMPOZYCJI NOTATKI

### Kolejność typowa

Większość notatek pójdzie schematem:

```
1. T01 HERO              [zawsze pierwsze]
2. T02 INTRO             [zawsze drugie]
3-N. Sekcje tematyczne   [T03-T08 w dowolnej kombinacji]
  └─ rytm narracyjny:
     T03 → T04 → T05 → T06 → T07 → T08
     można pomijać, powtarzać, mieszać
N-2. T09 OUTRO           [przedostatnie]
N-1. T10 POWIĄZANIA      [zawsze ostatnie]
```

### Reguły rytmu

1. **Po dużym zdjęciu — tekst.** Nie 2 zdjęcia z rzędu w sąsiednich sekcjach.
2. **Po T07 (moment + cytat) — oddech.** Następna sekcja niech będzie tekstowa lub spokojna.
3. **T05 i T06 — kontrast.** Nie obok siebie (oba są wizualnie intensywne).
4. **Pojęcia na końcu każdej sekcji opcjonalne.** Działają jako "kotwice" dla T10 POWIĄZANIA.

### Długość notatki

- **Krótka:** 5-7 bloków (~5 min czytania)
- **Średnia:** 8-11 bloków (~10 min)
- **Długa:** 12-15 bloków (~15 min)

Notatka Bern: 10 bloków = średnia długość.

---

## RESPONSYWNOŚĆ

### Breakpoint główny: 768px

**Poniżej 768px (mobile):**
- T04: para zdjęć → kolumna pionowa
- T05: pionowe + tekst → stos pionowy (foto najpierw)
- T06: triptych → kolumna 1
- T07: zdjęcie 75% → 100%
- T10: 2 kolumny → 1 kolumna
- Wszystkie sekcje: padding 24px zamiast 48px
- Tekst: 18px zamiast 21px

### Kluczowe — zachowanie hierarchii

Nawet na mobile:
- Tytuły zachowują charakter (clamp() skaluje płynnie)
- Oddechy proporcjonalnie mniejsze (--o-sekcja: 80px zamiast 140px)
- Cytaty zachowują italic Cormorant

---

## INTEGRACJA Z PANELEM CRM

### Tabela `artykuly_sekcje`

```sql
CREATE TABLE artykuly_sekcje (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  artykul_id uuid NOT NULL REFERENCES artykuly(id) ON DELETE CASCADE,
  kolejnosc integer NOT NULL,
  typ_sekcji text NOT NULL CHECK (typ_sekcji IN (
    't01_hero', 't02_intro', 't03_solo', 't04_tekst_miedzy',
    't05_pionowe_obok', 't06_triptych', 't07_moment',
    't08_rozkladowka', 't09_outro', 't10_powiazania'
  )),
  dane jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  zmodyfikowane timestamptz DEFAULT now()
);

CREATE INDEX idx_artykuly_sekcje_artykul ON artykuly_sekcje(artykul_id, kolejnosc);
```

### Builder w panelu

Widok edycji artykułu z drag & drop sekcji:
- Lista sekcji w kolejności (przeciągaj żeby zmienić)
- Każda sekcja = akordeon z polami specyficznymi dla typu
- "+ Dodaj sekcję" — dropdown z 10 typami
- "Sklonuj artykuł jako szablon" — nowa kopia z tymi samymi sekcjami

---

## PLAN IMPLEMENTACJI

### Sesja A — Mockup statyczny (TERAZ)

✓ Ten dokument  
✓ Plik `bern-mockup.html` (~600 linii, 1 plik, otwiera się w przeglądarce)  
✓ Wszystkie 10 typów bloków pokazanych z prawdziwymi tekstami Bern  
✓ Placeholdery zdjęć (szare prostokąty z opisami "strona 11 PDF")  

**Wynik:** zatwierdzenie wizualne projektu

### Sesja B — Frontend Next.js

- 10 komponentów React (`<SekcjaHero>`, `<SekcjaIntro>`, ...)
- Master `<ArtykulRender>` składający sekcje
- Strona `/artykul/[slug]` używająca infrastruktury
- Tabela `artykuly_sekcje` w bazie (migracja SQL)
- Pierwszy artykuł Bern: dane wstawione ręcznie do bazy (seed SQL)

**Wynik:** notatka Bern LIVE na stronie galerii

### Sesja C — Panel CRM Builder

- Widok edycji artykułu w panelu z 5 tabami: METADANE / SEKCJE / POWIĄZANIA / SEO / PODGLĄD
- Builder sekcji w tabie SEKCJE (drag & drop, edycja pól)
- Picker zdjęć z biblioteki media
- "Sklonuj jako szablon" działa

**Wynik:** Tadeusz edytuje przez panel, klika PUBLIKUJ, widzi live

### Sesja D — Test Zürich

- Tadeusz robi notatkę Zürich używając gotowej infrastruktury
- Mierzymy czas (cel: <60 min od pomysłu do publikacji)
- Iteracje na podstawie realnego użycia

---

## ZAKOŃCZENIE

10 komponentów narracyjnych + 10 plików tokenów designu = język wizualny Galerii ESTA.

Buduje się raz, dobrze. Każda kolejna notatka czerpie z tego samego źródła.

Notatka Bern (Centrum Paul Klee) staje się jednocześnie:
- Pierwszą publikacją tego typu w nowej platformie ESTA
- Wzorcem dla wszystkich kolejnych notatek
- Testem systemu w realu

---

**Dokument zatwierdzony 12 czerwca 2026 przez Tadeusza Stapowicza.**
