// components/ComingSoon.tsx
// Prosty, elegancki placeholder "Wkrotce" w estetyce White Cube.
// Mobile first. Uzywany przez strony bez gotowej tresci.

import Nav from '@/components/Nav'

export default function ComingSoon({
  title,
  active,
  subtitle = 'Wkrótce',
}: {
  title: string
  active?: string
  subtitle?: string
}) {
  const C = '"Cormorant Garamond", Georgia, serif'
  const I = '"Instrument Sans", sans-serif'

  return (
    <main style={{ background: '#fff', color: '#111', minHeight: '100vh' }}>
      <Nav active={active} />

      <section style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '54px 24px 24px',
      }}>
        <span style={{
          fontFamily: I, fontSize: '11px', letterSpacing: '.28em',
          textTransform: 'uppercase', color: '#999', marginBottom: '24px',
        }}>
          Galeria ESTA
        </span>

        <h1 style={{
          fontFamily: C, fontWeight: 300, lineHeight: 1.05,
          fontSize: 'clamp(48px, 14vw, 104px)',
          margin: 0, letterSpacing: '.01em',
        }}>
          {title}
        </h1>

        <p style={{
          fontFamily: I, fontSize: '13px', letterSpacing: '.22em',
          textTransform: 'uppercase', color: '#111',
          marginTop: '32px',
        }}>
          {subtitle}
        </p>

        <a href="/" style={{
          fontFamily: I, fontSize: '11px', letterSpacing: '.16em',
          textTransform: 'uppercase', color: '#111',
          border: '1px solid #111', padding: '15px 30px',
          textDecoration: 'none', marginTop: '48px',
        }}>
          Powrót na stronę główną
        </a>
      </section>
    </main>
  )
}
