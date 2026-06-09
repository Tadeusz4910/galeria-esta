export interface PracaLite {
  id: string
  id_pracy: string | null
  tytul: string
  rok: number | null
  technika: string | null
  wymiary_pracy: string | null
  artysta_nazwa: string | null
  artysta_url: string | null
}

// Blok sekcji_jsonb w viewing_room. Typ string dispatcher w VRSequence.
// Pola opcjonalne — kazdy typ uzywa wlasnego podzbioru.
export interface VRBlock {
  id: string
  typ: string
  tekst_pl?: string
  cytat_pl?: string
  autor?: string
  praca_id?: string
  praca_id_a?: string
  praca_id_b?: string
  kontekst_pl?: string
  opis_pl?: string
  focus_area?: string
}

export function getPracaImageUrl(p: PracaLite | null | undefined): string | null {
  if (!p?.id_pracy) return null
  return `https://galeria-esta.pl/viewing-room/images/prace/${p.id_pracy}.jpg`
}
