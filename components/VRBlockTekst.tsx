const C = '"Cormorant Garamond", Georgia, serif'

interface Props {
  tekst: string
}

export default function VRBlockTekst({ tekst }: Props) {
  return (
    <div
      style={{
        fontFamily: C,
        fontSize: 'clamp(18px, 1.8vw, 22px)',
        lineHeight: 1.7,
        color: '#222',
        maxWidth: '720px',
        margin: '0 auto',
        padding: '0 32px',
        whiteSpace: 'pre-line',
      }}
    >
      {tekst}
    </div>
  )
}
