import Link from 'next/link'
import { workSlug } from '@/lib/slug'
import { PracaLite, getPracaImageUrl } from '@/lib/vrTypes'

const C = '"Cormorant Garamond", Georgia, serif'
const I = '"Instrument Sans", -apple-system, BlinkMacSystemFont, sans-serif'

interface Props {
  praca_a: PracaLite
  praca_b: PracaLite
  kontekst?: string | null
}

function PracaCell({ praca }: { praca: PracaLite }) {
  const imageUrl = getPracaImageUrl(praca)
  const slug = workSlug({
    artysta_nazwa: praca.artysta_nazwa,
    tytul: praca.tytul,
    rok: praca.rok,
  })
  const href = slug ? `/praca/${slug}` : null

  const imageEl = (
    <div
      style={{
        width: '100%',
        aspectRatio: '4 / 4.85',
        background: '#f0ebe2',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={praca.tytul}
          style={{
            maxWidth: '100%',
            maxHeight: '100%',
            objectFit: 'contain',
          }}
        />
      ) : (
        <span
          style={{
            fontFamily: C,
            fontStyle: 'italic',
            fontSize: '22px',
            letterSpacing: '0.18em',
            color: '#b8aa92',
          }}
        >
          ESTA
        </span>
      )}
    </div>
  )

  return (
    <figure style={{ margin: 0 }}>
      {href ? (
        <Link href={href} style={{ textDecoration: 'none', display: 'block' }}>
          {imageEl}
        </Link>
      ) : (
        imageEl
      )}
      <figcaption style={{ marginTop: '18px', textAlign: 'center' }}>
        {praca.artysta_nazwa && (
          <div
            style={{
              fontFamily: I,
              fontSize: '10px',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: '#888',
              marginBottom: '6px',
            }}
          >
            {praca.artysta_nazwa}
          </div>
        )}
        <div
          style={{
            fontFamily: C,
            fontStyle: 'italic',
            fontSize: '16px',
            color: '#222',
          }}
        >
          {praca.tytul}
          {praca.rok ? `, ${praca.rok}` : ''}
        </div>
      </figcaption>
    </figure>
  )
}

export default function VRBlockDwiePrace({
  praca_a,
  praca_b,
  kontekst,
}: Props) {
  return (
    <div
      style={{
        margin: '0 auto',
        maxWidth: '1100px',
        padding: '0 32px',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '48px',
          alignItems: 'start',
        }}
        className="vr-dwie-prace-grid"
      >
        <PracaCell praca={praca_a} />
        <PracaCell praca={praca_b} />
      </div>

      {kontekst && (
        <div
          style={{
            fontFamily: C,
            fontStyle: 'italic',
            fontSize: '17px',
            lineHeight: 1.6,
            color: '#555',
            marginTop: '32px',
            textAlign: 'center',
            maxWidth: '660px',
            marginLeft: 'auto',
            marginRight: 'auto',
          }}
        >
          {kontekst}
        </div>
      )}

      <style>{`
        @media (max-width: 700px) {
          .vr-dwie-prace-grid {
            grid-template-columns: 1fr !important;
            gap: 40px !important;
          }
        }
      `}</style>
    </div>
  )
}
