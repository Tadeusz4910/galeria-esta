import Link from 'next/link'
import WorkImage from '@/components/WorkImage'

export interface PracaForCard {
  id: string
  id_pracy?: string | null
  tytul: string
  rok?: number | string | null
  technika?: string | null
  wymiary?: string | null
  cena_oferowana?: number | null
  alt_zdjecia?: string | null
  artysta_nazwa?: string | null
  artysta_url?: string | null
  zdjecie_url_supabase?: string | null
  segmenty?: { id: string; nazwa: string }[]
  pojecia?: { id: string; nazwa: string }[]
}

export type WorkCardKontekst = 'kolekcja' | 'viewing-room' | 'oferta'

interface WorkCardProps {
  praca: PracaForCard
  kontekst: WorkCardKontekst
  showPrice?: boolean
  showSegment?: boolean
  maxTags?: number
  tagLinkBase?: string
}

const C = '"Cormorant Garamond", Georgia, serif'
const I = '"Instrument Sans", -apple-system, BlinkMacSystemFont, sans-serif'

// Konwencja ESTA: w bazie "Kozłowski Jarosław", w URL "jaroslaw-kozlowski".
// Pierwsze słowo to nazwisko, reszta to imię — odwracamy + normalizujemy.
function artistSlug(nazwiskoIimie: string | null | undefined): string {
  if (!nazwiskoIimie) return ''
  const parts = nazwiskoIimie.trim().split(/\s+/)
  const reordered =
    parts.length >= 2 ? parts.slice(1).join(' ') + ' ' + parts[0] : nazwiskoIimie
  return reordered
    .toLowerCase()
    .replace(/ą/g, 'a')
    .replace(/ć/g, 'c')
    .replace(/ę/g, 'e')
    .replace(/ł/g, 'l')
    .replace(/ń/g, 'n')
    .replace(/ó/g, 'o')
    .replace(/ś/g, 's')
    .replace(/ż/g, 'z')
    .replace(/ź/g, 'z')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// 3-poziomowy fallback dla zdjęć:
// L1: Supabase Storage (przyszłość — pole zdjecie_url_supabase)
// L2: TheCamels CDN starej strony (działa DZISIAJ dla wszystkich kolekcja-prac)
// L3: null → placeholder ESTA w <WorkImage>
function getImageUrl(praca: PracaForCard): string | null {
  if (praca.zdjecie_url_supabase) return praca.zdjecie_url_supabase
  if (praca.id_pracy) {
    return `https://galeria-esta.pl/viewing-room/images/prace/${praca.id_pracy}.jpg`
  }
  return null
}

// Slug artysty: priorytetowo url_artysty z bazy, fallback do generatora z nazwiska.
function getArtistHref(praca: PracaForCard): string | null {
  if (praca.artysta_url) return `/artysta/${praca.artysta_url}`
  if (praca.artysta_nazwa) {
    const s = artistSlug(praca.artysta_nazwa)
    return s ? `/artysta/${s}` : null
  }
  return null
}

function formatPrice(value: number): string {
  return value.toLocaleString('pl-PL', { maximumFractionDigits: 0 }) + ' PLN'
}

function buildAlt(praca: PracaForCard): string {
  if (praca.alt_zdjecia) return praca.alt_zdjecia
  const parts = [
    praca.artysta_nazwa,
    praca.tytul,
    praca.rok ? String(praca.rok) : null,
  ].filter(Boolean)
  return parts.join(', ') || 'Galeria ESTA'
}

export default function WorkCard({
  praca,
  showPrice = false,
  showSegment = true,
  maxTags = 3,
  tagLinkBase = '/kolekcja',
}: WorkCardProps) {
  const imageUrl = getImageUrl(praca)
  const artistHref = getArtistHref(praca)
  const altText = buildAlt(praca)
  const workHref = `/praca/${praca.id}`
  const showCena =
    showPrice && typeof praca.cena_oferowana === 'number' && praca.cena_oferowana > 0
  const segmentToShow =
    showSegment && praca.segmenty && praca.segmenty.length > 0
      ? praca.segmenty[0].nazwa
      : null
  const tagsToShow = praca.pojecia && praca.pojecia.length > 0
    ? praca.pojecia.slice(0, maxTags)
    : []

  return (
    <article
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '18px',
      }}
    >
      {/* Zdjęcie pracy 4:3, klikalne do /praca/[id] */}
      <Link
        href={workHref}
        style={{
          display: 'block',
          textDecoration: 'none',
          color: 'inherit',
        }}
      >
        <WorkImage src={imageUrl} alt={altText} idPracy={praca.id_pracy ?? undefined} />
      </Link>

      {/* Blok tekstowy */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {/* Nazwa artysty — CAPS, link jeśli mamy slug */}
        {praca.artysta_nazwa &&
          (artistHref ? (
            <Link
              href={artistHref}
              style={{
                fontFamily: I,
                fontSize: '11px',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: '#555',
                textDecoration: 'none',
                transition: 'color 0.2s',
              }}
            >
              {praca.artysta_nazwa}
            </Link>
          ) : (
            <span
              style={{
                fontFamily: I,
                fontSize: '11px',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: '#888',
              }}
            >
              {praca.artysta_nazwa}
            </span>
          ))}

        {/* Tytuł + rok — italic Cormorant, link do /praca/[id] */}
        <Link
          href={workHref}
          style={{
            fontFamily: C,
            fontStyle: 'italic',
            fontSize: '22px',
            fontWeight: 400,
            lineHeight: 1.18,
            color: '#11110f',
            textDecoration: 'none',
          }}
        >
          {praca.tytul}
          {praca.rok ? `, ${praca.rok}` : ''}
        </Link>

        {/* Technika + wymiary */}
        {(praca.technika || praca.wymiary) && (
          <div
            style={{
              fontFamily: I,
              fontSize: '13px',
              lineHeight: 1.5,
              color: '#666',
            }}
          >
            {praca.technika && <div>{praca.technika}</div>}
            {praca.wymiary && <div>{praca.wymiary}</div>}
          </div>
        )}

        {/* Tagi pojęć — klikalne do /kolekcja?tag=… (max N) */}
        {tagsToShow.length > 0 && (
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '6px',
              marginTop: '4px',
            }}
          >
            {tagsToShow.map((p) => (
              <Link
                key={p.id}
                href={`${tagLinkBase}?tag=${encodeURIComponent(p.nazwa.toLowerCase())}`}
                style={{
                  fontFamily: I,
                  fontSize: '11px',
                  padding: '4px 10px',
                  backgroundColor: '#f4f1ec',
                  color: '#555',
                  textDecoration: 'none',
                  letterSpacing: '0.02em',
                  transition: 'background-color 0.2s',
                }}
              >
                {p.nazwa}
              </Link>
            ))}
          </div>
        )}

        {/* Segment — dyskretny podpis */}
        {segmentToShow && (
          <div
            style={{
              fontFamily: I,
              fontSize: '11px',
              letterSpacing: '0.04em',
              color: '#888',
              marginTop: '2px',
            }}
          >
            {segmentToShow}
          </div>
        )}

        {/* Cena / link akcji */}
        <div style={{ marginTop: '8px' }}>
          {showCena ? (
            <span
              style={{
                fontFamily: I,
                fontSize: '12px',
                color: '#222',
              }}
            >
              {formatPrice(praca.cena_oferowana as number)}
            </span>
          ) : (
            <Link
              href={workHref}
              style={{
                fontFamily: I,
                fontSize: '12px',
                color: '#222',
                textDecoration: 'none',
                borderBottom: '1px solid #222',
                paddingBottom: '1px',
              }}
            >
              Zobacz pracę →
            </Link>
          )}
        </div>
      </div>
    </article>
  )
}
