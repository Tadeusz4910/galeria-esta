import Link from 'next/link'
import type { Metadata } from 'next'
import Nav from '@/components/Nav'

export const revalidate = 60

const C = '"Cormorant Garamond", Georgia, serif'
const I = '"Instrument Sans", -apple-system, BlinkMacSystemFont, sans-serif'

export const metadata: Metadata = {
  title: 'International Program — Galeria ESTA',
  description:
    'Central European Conceptual, Concrete & Geometric Art — the international program of Galeria ESTA.',
  openGraph: {
    title: 'International Program — Galeria ESTA',
    description: 'Central European Conceptual, Concrete & Geometric Art.',
  },
}

export default function InternationalPage() {
  return (
    <main style={{ background: '#fbfaf8', color: '#11110f', minHeight: '100vh' }}>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; }
        a { color: inherit; }

        .intl-hero {
          padding: 140px 32px 72px;
          max-width: 1100px;
          margin: 0 auto;
        }
        @media (min-width: 900px) {
          .intl-hero { padding: 180px 64px 96px; }
        }

        .intl-teaser {
          max-width: 1100px;
          margin: 0 auto;
          padding: 0 32px 140px;
        }
        @media (min-width: 900px) {
          .intl-teaser { padding: 0 64px 160px; }
        }
        .intl-note-link {
          display: block;
          border-top: 1px solid #e7e0d7;
          padding: 48px 0 0;
          transition: opacity .2s;
        }
        .intl-note-link:hover { opacity: .6; }
      `}</style>

      <Nav />

      {/* HERO — tytuł działu po angielsku (statement dopiszemy później) */}
      <section className="intl-hero">
        <div
          style={{
            fontFamily: I,
            fontSize: '11px',
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: '#888',
            marginBottom: '28px',
          }}
        >
          Galeria ESTA · International Program
        </div>

        <h1
          style={{
            fontFamily: C,
            fontWeight: 300,
            fontSize: 'clamp(38px, 6vw, 82px)',
            lineHeight: 1.06,
            letterSpacing: '-0.01em',
            margin: 0,
            maxWidth: '1000px',
          }}
        >
          International Program — Central European Conceptual, Concrete &amp;
          Geometric Art
        </h1>
        {/* TODO: program statement (EN) */}
      </section>

      {/* TEASER — Notes */}
      <section className="intl-teaser">
        <Link href="/international/notatki" className="intl-note-link">
          <div
            style={{
              fontFamily: I,
              fontSize: '11px',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: '#888',
              marginBottom: '16px',
            }}
          >
            Notes
          </div>
          <div
            style={{
              fontFamily: C,
              fontStyle: 'italic',
              fontWeight: 300,
              fontSize: 'clamp(24px, 3vw, 40px)',
              lineHeight: 1.25,
              color: '#11110f',
              maxWidth: '760px',
            }}
          >
            Notes from the gallery — travels, exhibitions and reflections on
            conceptual, concrete and geometric art.
          </div>
          <span
            style={{
              display: 'inline-block',
              marginTop: '24px',
              fontFamily: I,
              fontSize: '12px',
              color: '#11110f',
              borderBottom: '1px solid #11110f',
              paddingBottom: '2px',
            }}
          >
            Read the notes →
          </span>
        </Link>
      </section>

      <footer
        style={{
          padding: '64px 32px',
          borderTop: '1px solid #e7e0d7',
          fontFamily: I,
          fontSize: '11px',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: '#888',
          textAlign: 'center',
        }}
      >
        Galeria ESTA · Gliwice · since 1998
      </footer>
    </main>
  )
}
