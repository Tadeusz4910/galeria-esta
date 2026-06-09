const C = '"Cormorant Garamond", Georgia, serif'
const I = '"Instrument Sans", -apple-system, BlinkMacSystemFont, sans-serif'

interface Props {
  cytat: string
  autor?: string | null
}

export default function VRBlockCytat({ cytat, autor }: Props) {
  return (
    <blockquote
      style={{
        margin: '0 auto',
        padding: '0 32px',
        maxWidth: '720px',
      }}
    >
      <p
        style={{
          fontFamily: C,
          fontStyle: 'italic',
          fontWeight: 300,
          fontSize: 'clamp(22px, 2.4vw, 30px)',
          lineHeight: 1.4,
          color: '#11110f',
          margin: 0,
          marginBottom: autor ? '20px' : 0,
          textAlign: 'center',
        }}
      >
        „{cytat}"
      </p>
      {autor && (
        <footer
          style={{
            fontFamily: I,
            fontSize: '12px',
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: '#888',
            textAlign: 'center',
          }}
        >
          — {autor}
        </footer>
      )}
    </blockquote>
  )
}
