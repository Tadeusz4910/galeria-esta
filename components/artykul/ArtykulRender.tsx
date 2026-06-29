// components/artykul/ArtykulRender.tsx
// Master orchestrator notatki narracyjnej.
// - Zbiera wszystkie zdjecie_id z sekcji → JEDNO batch-query do `media`.
// - Mapuje typ_sekcji → komponent, renderuje wg kolejnosc.
// - Owija całość w <div className="esta-notatka"> (scope dla artykul.css).
// Server Component (async) — sam wykonuje fetch media.

import { supabase } from '@/lib/supabase'
import type {
  SekcjaArtykulu,
  ZdjecieRef,
  MediaMap,
} from '@/lib/types-artykul'
import './artykul.css'

import SekcjaHero from './sekcje/SekcjaHero'
import SekcjaIntro from './sekcje/SekcjaIntro'
import SekcjaSolo from './sekcje/SekcjaSolo'
import SekcjaTekstMiedzy from './sekcje/SekcjaTekstMiedzy'
import SekcjaPionoweObok from './sekcje/SekcjaPionoweObok'
import SekcjaTriptych from './sekcje/SekcjaTriptych'
import SekcjaMoment from './sekcje/SekcjaMoment'
import SekcjaRozkladowka from './sekcje/SekcjaRozkladowka'
import SekcjaOutro from './sekcje/SekcjaOutro'
import SekcjaPowiazania from './sekcje/SekcjaPowiazania'

/** Zbiera unikalne zdjecie_id ze wszystkich sekcji (do batch-fetcha media). */
function zbierzIds(sekcje: SekcjaArtykulu[]): string[] {
  const ids = new Set<string>()
  const dodaj = (z?: ZdjecieRef | null) => {
    if (z?.zdjecie_id) ids.add(z.zdjecie_id)
  }
  for (const s of sekcje) {
    switch (s.typ_sekcji) {
      case 't01_hero':
      case 't03_solo':
      case 't05_pionowe_obok':
      case 't07_moment':
        dodaj(s.dane.zdjecie)
        break
      case 't04_tekst_miedzy':
        dodaj(s.dane.zdjecie_duze)
        dodaj(s.dane.zdjecie_lewe)
        dodaj(s.dane.zdjecie_prawe)
        break
      case 't06_triptych':
        dodaj(s.dane.zdjecie_1)
        dodaj(s.dane.zdjecie_2)
        dodaj(s.dane.zdjecie_3)
        break
      case 't08_rozkladowka':
        s.dane.bloki?.forEach((b) => dodaj(b.zdjecie))
        break
      // t02_intro, t09_outro, t10_powiazania — bez zdjęć
    }
  }
  return [...ids]
}

/** Batch-fetch media → mapa id→{url,alt_pl}. Degraduje się do pustej mapy (placeholdery). */
async function pobierzMedia(ids: string[]): Promise<MediaMap> {
  if (ids.length === 0) return {}
  const mapa: MediaMap = {}
  try {
    const { data, error } = await supabase
      .from('media')
      .select('id, url, alt_pl')
      .in('id', ids)
    if (error) {
      console.error('[ArtykulRender] błąd pobierania media:', error.message)
      return mapa
    }
    for (const m of data ?? []) {
      mapa[m.id as string] = {
        url: (m.url as string | null) ?? null,
        alt_pl: (m.alt_pl as string | null) ?? null,
      }
    }
  } catch (e) {
    console.error('[ArtykulRender] wyjątek przy media:', e)
  }
  return mapa
}

function renderSekcja(s: SekcjaArtykulu, media: MediaMap, artykulId: string) {
  switch (s.typ_sekcji) {
    case 't01_hero':
      return <SekcjaHero dane={s.dane} media={media} />
    case 't02_intro':
      return <SekcjaIntro dane={s.dane} />
    case 't03_solo':
      return <SekcjaSolo dane={s.dane} media={media} />
    case 't04_tekst_miedzy':
      return <SekcjaTekstMiedzy dane={s.dane} media={media} />
    case 't05_pionowe_obok':
      return <SekcjaPionoweObok dane={s.dane} media={media} />
    case 't06_triptych':
      return <SekcjaTriptych dane={s.dane} media={media} />
    case 't07_moment':
      return <SekcjaMoment dane={s.dane} media={media} />
    case 't08_rozkladowka':
      return <SekcjaRozkladowka dane={s.dane} media={media} />
    case 't09_outro':
      return <SekcjaOutro dane={s.dane} />
    case 't10_powiazania':
      return <SekcjaPowiazania dane={s.dane} artykulId={artykulId} />
    default:
      return null
  }
}

export default async function ArtykulRender({
  sekcje,
  artykulId,
}: {
  sekcje: SekcjaArtykulu[]
  artykulId: string
}) {
  const uporzadkowane = [...sekcje].sort((a, b) => a.kolejnosc - b.kolejnosc)
  const media = await pobierzMedia(zbierzIds(uporzadkowane))

  return (
    <div className="esta-notatka">
      {uporzadkowane.map((s) => (
        <div key={s.id}>{renderSekcja(s, media, artykulId)}</div>
      ))}
    </div>
  )
}
