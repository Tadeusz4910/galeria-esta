// components/artykul/sekcje/Obraz.tsx
// Helper DRY dla sekcji narracyjnych: rozwiązuje ZdjecieRef → <img> albo placeholder.
// Server Component — dane (mapa media) dostaje przez propsy, nie fetchuje.
//
// Logika źródła (wg ustaleń):
//   1. media[zdjecie_id].url            (jeśli zdjecie_id wskazuje istniejący rekord media)
//   2. zdjecie_url_fallback             (bezpośredni URL, np. seed)
//   3. brak obu → placeholder           (subtelny gradient + ikona ramki, bez napisów)
//   alt = zdjecie_alt_override || media.alt_pl || altFallback || ''

import type { ZdjecieRef, MediaMap } from '@/lib/types-artykul'

interface ObrazProps {
  zdjecie?: ZdjecieRef | null
  media: MediaMap
  /** Klasa nakładana na <img> (i na placeholder, dla zgodnego layoutu). Pomiń w gridach. */
  className?: string
  /** Wariant proporcji placeholdera, gdy brak zdjęcia. */
  wariant?: 'pionowe' | 'panorama' | 'kwadrat'
  /** Alt awaryjny, gdy brak nadpisania i brak alt_pl w media. */
  altFallback?: string
}

function rozwiazUrl(z: ZdjecieRef | null | undefined, media: MediaMap): string | null {
  if (!z) return null
  // `|| null` traktuje pusty string jako brak URL (→ placeholder, nie <img src="">).
  if (z.zdjecie_id && media[z.zdjecie_id]?.url) return media[z.zdjecie_id].url || null
  return z.zdjecie_url_fallback || null
}

function rozwiazAlt(
  z: ZdjecieRef | null | undefined,
  media: MediaMap,
  altFallback?: string
): string {
  if (z?.zdjecie_alt_override) return z.zdjecie_alt_override
  if (z?.zdjecie_id && media[z.zdjecie_id]?.alt_pl) return media[z.zdjecie_id].alt_pl as string
  return altFallback ?? ''
}

export default function Obraz({
  zdjecie,
  media,
  className,
  wariant,
  altFallback,
}: ObrazProps) {
  const url = rozwiazUrl(zdjecie, media)
  const alt = rozwiazAlt(zdjecie, media, altFallback)

  if (url) {
    // eslint-disable-next-line @next/next/no-img-element -- spójność z resztą strony (inline <img>)
    return <img className={className} src={url} alt={alt} />
  }

  const cls = ['placeholder-img', wariant, className].filter(Boolean).join(' ')
  return (
    <div className={cls} role="img" aria-label={alt || undefined}>
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect
          x="3"
          y="4"
          width="18"
          height="16"
          rx="1.5"
          stroke="currentColor"
          strokeWidth="1.2"
        />
        <circle cx="8.5" cy="9" r="1.6" stroke="currentColor" strokeWidth="1.2" />
        <path
          d="M4 17l5-5 4 4 3-3 4 4"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  )
}
