import Link from 'next/link'
import { workSlug } from '@/lib/slug'
import { PracaLite, getPracaImageUrl } from '@/lib/vrTypes'

const C = '"Cormorant Garamond", Georgia, serif'
const I = '"Instrument Sans", -apple-system, BlinkMacSystemFont, sans-serif'

interface Props {
  tytul: string | null
  podtytul?: string | null
  hero_url?: string | null
  praca_hero?: PracaLite | null
  data_publikacji?: string | null
  typ_vr?: string | null
  badge?: string | null
}

function formatPolishDate(iso: string | null | undefined): string {
  if (!iso) return ''
  try {
    return new Date(iso).toLocaleDateString('pl-PL', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  } catch {
    return ''
  }
}

export default function VRHero({
  tytul,
  podtytul,
  hero_url,
  praca_hero,
  data_publikacji,
  typ_vr,
  badge,
}: Props) {
  // Hierarchia obrazu: dedykowany hero_url > pierwsza praca_hero > placeholder
  const fromPraca = praca_hero ? getPracaImageUrl(praca_hero) : null
  const imageUrl = hero_url || fromPraca
  const altText = praca_hero?.tytul ?? tytul ?? 'Galeria ESTA'

  const pracaSlug = praca_hero
    ? workSlug({
        artysta_nazwa: praca_hero.artysta_nazwa,
        tytul: praca_hero.tytul,
        rok: praca_hero.rok,
      })
    : null
  const pracaHref = pracaSlug ? `/praca/${pracaSlug}` : null

  const metaLine = [
    formatPolishDate(data_publikacji),
    typ_vr,
  ]
    .filter(Boolean)
    .join(' · ')

  return (
    <section
      style={{
        paddingTop: '54px',
        background: '#fbfaf8',
        borderBottom: '1px solid #e7e0d7',
      }}
      aria-label="Viewing Room — hero"
    >
      <div
        style={{
          width: '100%',
          aspectRatio: '16 / 9',
          background: '#f0ebe2',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        {imageUrl ? (
          pracaHref ? (
            <Link
              href={pracaHref}
              style={{ display: 'block', width: '100%', height: '100%' }}
            >
              <img
                src={imageUrl}
                alt={altText}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
            </Link>
          ) : (
            <img
              src={imageUrl}
              alt={altText}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          )
        ) : (
          <span
            style={{
              fontFamily: C,
              fontStyle: 'italic',
              fontSize: '40px',
              letterSpacing: '0.18em',
              color: '#b8aa92',
            }}
          >
            VIEWING ROOM
          </span>
        )}
      </div>

      <div
        style={{
          maxWidth: '960px',
          margin: '0 auto',
          padding: '64px 32px 80px',
          textAlign: 'center',
        }}
      >
        {badge && (
          <div
            style={{
              fontFamily: I,
              fontSize: '11px',
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: '#888',
              marginBottom: '24px',
            }}
          >
            {badge}
          </div>
        )}

        <h1
          style={{
            fontFamily: C,
            fontStyle: 'italic',
            fontWeight: 300,
            fontSize: 'clamp(48px, 7vw, 96px)',
            lineHeight: 1.05,
            letterSpacing: '-0.01em',
            color: '#11110f',
            margin: 0,
            marginBottom: podtytul ? '20px' : '32px',
          }}
        >
          {tytul ?? 'Viewing Room'}
        </h1>

        {podtytul && (
          <p
            style={{
              fontFamily: I,
              fontStyle: 'italic',
              fontSize: 'clamp(16px, 1.6vw, 20px)',
              lineHeight: 1.5,
              color: '#555',
              margin: 0,
              marginBottom: '36px',
              maxWidth: '720px',
              marginLeft: 'auto',
              marginRight: 'auto',
            }}
          >
            {podtytul}
          </p>
        )}

        {metaLine && (
          <div
            style={{
              fontFamily: I,
              fontSize: '11px',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: '#888',
            }}
          >
            {metaLine}
          </div>
        )}
      </div>
    </section>
  )
}
