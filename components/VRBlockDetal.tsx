import { PracaLite, getPracaImageUrl } from '@/lib/vrTypes'

const C = '"Cormorant Garamond", Georgia, serif'
const I = '"Instrument Sans", -apple-system, BlinkMacSystemFont, sans-serif'

interface Props {
  praca: PracaLite
  opis?: string | null
  focus_area?: string | null
}

// focus_area mapping to CSS object-position. Values from sekcje_jsonb:
//   "centrum" | "top-left" | "top-right" | "bottom-left" | "bottom-right"
//   | "top" | "bottom" | "left" | "right" — fallback "center center"
function focusToObjectPosition(focus: string | null | undefined): string {
  switch (focus) {
    case 'top-left':
      return 'top left'
    case 'top-right':
      return 'top right'
    case 'bottom-left':
      return 'bottom left'
    case 'bottom-right':
      return 'bottom right'
    case 'top':
      return 'top center'
    case 'bottom':
      return 'bottom center'
    case 'left':
      return 'left center'
    case 'right':
      return 'right center'
    case 'centrum':
    default:
      return 'center center'
  }
}

export default function VRBlockDetal({ praca, opis, focus_area }: Props) {
  const imageUrl = getPracaImageUrl(praca)
  const objectPosition = focusToObjectPosition(focus_area)

  return (
    <figure
      style={{
        margin: '0 auto',
        maxWidth: '960px',
        padding: '0 32px',
      }}
    >
      <div
        style={{
          width: '100%',
          aspectRatio: '16 / 10',
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
            alt={`${praca.tytul} — detal`}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition,
              transform: 'scale(1.6)',
              transformOrigin: objectPosition,
            }}
          />
        ) : (
          <span
            style={{
              fontFamily: C,
              fontStyle: 'italic',
              fontSize: '24px',
              letterSpacing: '0.18em',
              color: '#b8aa92',
            }}
          >
            DETAL
          </span>
        )}
      </div>

      <figcaption
        style={{
          marginTop: '20px',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            fontFamily: I,
            fontSize: '11px',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: '#888',
            marginBottom: '6px',
          }}
        >
          Detal {praca.artysta_nazwa && `· ${praca.artysta_nazwa}`}
        </div>
        <div
          style={{
            fontFamily: C,
            fontStyle: 'italic',
            fontSize: '17px',
            color: '#222',
          }}
        >
          {praca.tytul}
          {praca.rok ? `, ${praca.rok}` : ''}
        </div>

        {opis && (
          <div
            style={{
              fontFamily: C,
              fontStyle: 'italic',
              fontSize: '16px',
              lineHeight: 1.6,
              color: '#555',
              marginTop: '20px',
              maxWidth: '560px',
              marginLeft: 'auto',
              marginRight: 'auto',
            }}
          >
            {opis}
          </div>
        )}
      </figcaption>
    </figure>
  )
}
