import Link from 'next/link'
import { workSlug } from '@/lib/slug'
import { PracaLite, getPracaImageUrl } from '@/lib/vrTypes'

const C = '"Cormorant Garamond", Georgia, serif'
const I = '"Instrument Sans", -apple-system, BlinkMacSystemFont, sans-serif'

interface Props {
  praca: PracaLite
  kontekst?: string | null
}

export default function VRBlockPraca({ praca, kontekst }: Props) {
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
            fontSize: '28px',
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
    <figure
      style={{
        margin: '0 auto',
        maxWidth: '960px',
        padding: '0 32px',
      }}
    >
      {href ? (
        <Link href={href} style={{ textDecoration: 'none', display: 'block' }}>
          {imageEl}
        </Link>
      ) : (
        imageEl
      )}

      <figcaption
        style={{
          marginTop: '24px',
          textAlign: 'center',
          maxWidth: '600px',
          marginLeft: 'auto',
          marginRight: 'auto',
        }}
      >
        {praca.artysta_nazwa && (
          <div
            style={{
              fontFamily: I,
              fontSize: '11px',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: '#888',
              marginBottom: '8px',
            }}
          >
            {praca.artysta_nazwa}
          </div>
        )}

        <div
          style={{
            fontFamily: C,
            fontStyle: 'italic',
            fontSize: '20px',
            color: '#11110f',
            marginBottom: praca.technika || praca.wymiary_pracy ? '8px' : 0,
          }}
        >
          {praca.tytul}
          {praca.rok ? `, ${praca.rok}` : ''}
        </div>

        {(praca.technika || praca.wymiary_pracy) && (
          <div
            style={{
              fontFamily: I,
              fontSize: '13px',
              color: '#777',
              lineHeight: 1.5,
            }}
          >
            {[praca.technika, praca.wymiary_pracy].filter(Boolean).join(' · ')}
          </div>
        )}

        {kontekst && (
          <div
            style={{
              fontFamily: C,
              fontStyle: 'italic',
              fontSize: '17px',
              lineHeight: 1.6,
              color: '#555',
              marginTop: '24px',
              maxWidth: '560px',
              marginLeft: 'auto',
              marginRight: 'auto',
            }}
          >
            {kontekst}
          </div>
        )}
      </figcaption>
    </figure>
  )
}
