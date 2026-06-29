// lib/types-artykul.ts
// Typy dla biblioteki komponentów narracyjnych "Notatek ESTA".
// Struktura JSONB kolumny `dane` w tabeli `artykuly_sekcje` (10 typów bloków T01–T10).
// Źródło: docs/ESTA-KOMPONENTY-NARRACYJNE.md + docs/bern-mockup.html

/** Identyfikator typu bloku — zgodny z CHECK constraint w `artykuly_sekcje.typ_sekcji`. */
export type TypSekcji =
  | 't01_hero'
  | 't02_intro'
  | 't03_solo'
  | 't04_tekst_miedzy'
  | 't05_pionowe_obok'
  | 't06_triptych'
  | 't07_moment'
  | 't08_rozkladowka'
  | 't09_outro'
  | 't10_powiazania'

/**
 * Referencja do zdjęcia w sekcji. Model "id + fallback":
 * - `zdjecie_id`            → uuid z tabeli `media` (rozwiązywane batch-em w ArtykulRender),
 * - `zdjecie_url_fallback`  → bezpośredni URL (gdy brak wpisu w media, np. seed Bern),
 * - `zdjecie_alt_override`  → alt nadpisujący `media.alt_pl`.
 * Gdy `zdjecie_id` i `zdjecie_url_fallback` są null → komponent renderuje placeholder.
 */
export interface ZdjecieRef {
  zdjecie_id: string | null
  zdjecie_url_fallback: string | null
  zdjecie_alt_override: string | null
}

// ─── DANE 10 TYPÓW BLOKÓW ──────────────────────────────────────────────

/** T01 HERO — otwarcie notatki: tło pełnoekranowe + tytuł nałożony. */
export interface HeroDane {
  nadtytul?: string | null
  tytul: string
  podtytul?: string | null
  zdjecie: ZdjecieRef
  autor_zdjecia?: string | null
  wysokosc_vh?: number | null
}

/** T02 INTRO — wąska kolumna, 2–4 akapity + opcjonalna linia pojęć. */
export interface IntroDane {
  akapity: string[]
  pojecia?: string | null
}

/** T03 SOLO — jedno duże zdjęcie + podpis. */
export interface SoloDane {
  zdjecie: ZdjecieRef
  podpis?: string | null
}

/** T04 TEKST_MIĘDZY — tytuł / duże foto / tekst / para 2 foto / pojęcia. */
export interface TekstMiedzyDane {
  tytul_sekcji?: string | null
  /** Duże zdjęcie wprowadzające — opcjonalne (sekcja kontekstowa może go nie mieć). */
  zdjecie_duze?: ZdjecieRef | null
  podpis_duzy?: string | null
  akapity: string[]
  zdjecie_lewe: ZdjecieRef
  zdjecie_prawe: ZdjecieRef
  podpis_para?: string | null
  /** Opcjonalne akapity pod parą zdjęć (ten sam styl co `akapity`). */
  akapity_pod?: string[]
  pojecia?: string | null
}

/** T05 PIONOWE_OBOK — pionowe zdjęcie 45% + tekst 55% obok ("jak książka"). */
export interface PionoweObokDane {
  tytul_sekcji?: string | null
  zdjecie: ZdjecieRef
  /** Strona, po której stoi zdjęcie (domyślnie 'left'). */
  strona?: 'left' | 'right' | null
  akapity: string[]
  podpis?: string | null
  pojecia?: string | null
}

/** T06 TRIPTYCH — 3 zdjęcia w rzędzie + wspólny podpis + tekst. */
export interface TriptychDane {
  tytul_sekcji?: string | null
  /** 3 osobne pola zdjęć (33/33/33), aspect 3/4 — zgodnie z zapisem panelu CRM. */
  zdjecie_1?: ZdjecieRef | null
  zdjecie_2?: ZdjecieRef | null
  zdjecie_3?: ZdjecieRef | null
  podpis?: string | null
  akapity: string[]
  pojecia?: string | null
}

/** T07 MOMENT — duże zdjęcie 75% + cytat ("moment zatrzymania"). */
export interface MomentDane {
  zdjecie: ZdjecieRef
  podpis?: string | null
  cytat: string
  autor_cytatu?: string | null
}

/** Pojedynczy blok rozkładówki: zdjęcie panorama + akapity pod nim. */
export interface RozkladowkaBlok {
  zdjecie: ZdjecieRef
  akapity: string[]
}

/** T08 ROZKŁADÓWKA — sekwencja foto/tekst/foto/tekst. */
export interface RozkladowkaDane {
  tytul_sekcji?: string | null
  bloki: RozkladowkaBlok[]
  pojecia?: string | null
}

/** T09 OUTRO — zakończenie, wąska kolumna, 1. akapit italic. */
export interface OutroDane {
  akapity: string[]
}

/** Pozycja w bloku POWIĄZANIA — pojęcie (link do strony pojęcia/idei). */
export interface PowiazaniePojecie {
  etykieta: string
  url: string
}

/** Pozycja w bloku POWIĄZANIA — artysta (link + opis powiązań). */
export interface PowiazanieArtysta {
  imie_nazwisko: string
  url: string
  opis?: string | null
}

/** T10 POWIĄZANIA — "Odkrywaj dalej": kolumny Pojęcia | Artyści. */
export interface PowiazaniaDane {
  tytul?: string | null
  pojecia: PowiazaniePojecie[]
  artysci: PowiazanieArtysta[]
}

// ─── UNION SEKCJI (wiersz tabeli `artykuly_sekcje`) ────────────────────

/** Wspólne pola wiersza tabeli (poza dyskryminatorem i `dane`). */
interface SekcjaWiersz {
  id: string
  kolejnosc: number
}

/**
 * Dyskryminowany union pojedynczej sekcji artykułu.
 * Dyskryminator: `typ_sekcji`; payload: `dane`.
 */
export type SekcjaArtykulu =
  | (SekcjaWiersz & { typ_sekcji: 't01_hero'; dane: HeroDane })
  | (SekcjaWiersz & { typ_sekcji: 't02_intro'; dane: IntroDane })
  | (SekcjaWiersz & { typ_sekcji: 't03_solo'; dane: SoloDane })
  | (SekcjaWiersz & { typ_sekcji: 't04_tekst_miedzy'; dane: TekstMiedzyDane })
  | (SekcjaWiersz & { typ_sekcji: 't05_pionowe_obok'; dane: PionoweObokDane })
  | (SekcjaWiersz & { typ_sekcji: 't06_triptych'; dane: TriptychDane })
  | (SekcjaWiersz & { typ_sekcji: 't07_moment'; dane: MomentDane })
  | (SekcjaWiersz & { typ_sekcji: 't08_rozkladowka'; dane: RozkladowkaDane })
  | (SekcjaWiersz & { typ_sekcji: 't09_outro'; dane: OutroDane })
  | (SekcjaWiersz & { typ_sekcji: 't10_powiazania'; dane: PowiazaniaDane })

// ─── ROZWIĄZYWANIE ZDJĘĆ (batch z tabeli `media`) ──────────────────────

/** Pojedynczy rozwiązany rekord media (tylko bezpieczne, publiczne kolumny). */
export interface MediaRekord {
  url: string | null
  alt_pl: string | null
}

/** Mapa `zdjecie_id` → rekord media, budowana raz w ArtykulRender. */
export type MediaMap = Record<string, MediaRekord>
