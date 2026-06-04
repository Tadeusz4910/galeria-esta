import Link from 'next/link'
import type { Metadata } from 'next'
import { supabase } from '@/lib/supabase'
import Nav from '@/components/Nav'
import WorkCard, { PracaForCard } from '@/components/WorkCard'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'Kolekcja — Galeria ESTA',
  description:
    'Wybrane prace z kolekcji Galerii ESTA — polska sztuka konceptualna, geometria, prace na papierze.',
  openGraph: {
    title: 'Kolekcja — Galeria ESTA',
    description:
      'Wybrane prace z kolekcji Galerii ESTA — polska sztuka konceptualna, geometria, prace na papierze.',
  },
  robots: 'index, follow',
}

const C = '"Cormorant Garamond", Georgia, serif'
const I = '"Instrument Sans", -apple-system, BlinkMacSystemFont, sans-serif'

type DbRow = {
  id: string
  id_pracy: string | null
  tytul: string
  rok: number | null
  rok_opis: string | null
  technika: string | null
  wymiary_pracy: string | null
  cena_oferowana: number | null
  alt_zdjecia: string | null
  artysci: { nazwisko_i_imie: string | null; url_artysty: string | null } | null
  prace_segmenty: { segmenty: { id: string; nazwa: string } | null }[] | null
  pojecia_prace: { pojecia: { id: string; nazwa: string } | null }[] | null
}

function mapRowToCard(row: DbRow): PracaForCard {
  return {
    id: row.id,
    id_pracy: row.id_pracy,
    tytul: row.tytul,
    rok: row.rok,
    technika: row.technika,
    wymiary: row.wymiary_pracy,
    cena_oferowana: row.cena_oferowana,
    alt_zdjecia: row.alt_zdjecia,
    artysta_nazwa: row.artysci?.nazwisko_i_imie ?? null,
    artysta_url: row.artysci?.url_artysty ?? null,
    segmenty:
      row.prace_segmenty
        ?.map((ps) => ps.segmenty)
        .filter((s): s is { id: string; nazwa: string } => Boolean(s)) ?? [],
    pojecia:
      row.pojecia_prace
        ?.map((pp) => pp.pojecia)
        .filter((p): p is { id: string; nazwa: string } => Boolean(p)) ?? [],
  }
}

export default async function KolekcjaPage({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string }>
}) {
  const params = await searchParams
  const aktywnyTag = params.tag?.trim().toLowerCase() || null

  const { data, error } = await supabase
    .from('prace')
    .select(
      `
      id, id_pracy, tytul, rok, rok_opis, technika, wymiary_pracy,
      cena_oferowana, alt_zdjecia, updated_at,
      artysci ( nazwisko_i_imie, url_artysty ),
      prace_segmenty ( segmenty ( id, nazwa ) ),
      pojecia_prace ( pojecia ( id, nazwa ) )
    `
    )
    .eq('widocznosc', 'kolekcja')
    .order('updated_at', { ascending: false })

  const rows = (data ?? []) as unknown as DbRow[]
  const wszystkiePrace = rows.map(mapRowToCard)

  const praceFiltered = aktywnyTag
    ? wszystkiePrace.filter((p) =>
        p.pojecia?.some((poj) => poj.nazwa.toLowerCase() === aktywnyTag)
      )
    : wszystkiePrace

  return (
    <main
      style={{
        background: '#fbfaf8',
        color: '#11110f',
        minHeight: '100vh',
      }}
    >
      <style>{`
        *, *::before, *::after { box-sizing: border-box; }
        a { color: inherit; }
        .kolekcja-grid {
          display: grid;
          grid-template-columns: 1fr;
          column-gap: 64px;
          row-gap: 54px;
          padding: 0 32px 120px;
          max-width: 1280px;
          margin: 0 auto;
        }
        @media (min-width: 900px) {
          .kolekcja-grid {
            grid-template-columns: 1fr 1fr;
            row-gap: 88px;
            padding: 0 64px 160px;
          }
        }
      `}</style>

      <Nav active="kolekcja" />

      {/* Hero kolekcji */}
      <section
        style={{
          padding: '120px 32px 80px',
          maxWidth: '1280px',
          margin: '0 auto',
          borderBottom: '1px solid #e7e0d7',
        }}
      >
        <div
          style={{
            fontFamily: I,
            fontSize: '11px',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: '#888',
            marginBottom: '24px',
          }}
        >
          {aktywnyTag ? `Kolekcja · Pojęcie: ${aktywnyTag}` : 'Kolekcja'}
        </div>

        <h1
          style={{
            fontFamily: C,
            fontWeight: 300,
            fontSize: 'clamp(48px, 6vw, 96px)',
            lineHeight: 1.0,
            letterSpacing: '-0.01em',
            margin: 0,
            marginBottom: '32px',
          }}
        >
          Kolekcja
        </h1>

        <p
          style={{
            fontFamily: I,
            fontSize: '17px',
            lineHeight: 1.6,
            color: '#444',
            maxWidth: '720px',
            margin: 0,
          }}
        >
          Wybrane prace prezentowane jako program galerii — polska sztuka
          konceptualna, geometria i sztuka konkretna, w dialogu z artystami
          Europy Środkowej.
        </p>

        {aktywnyTag && (
          <div style={{ marginTop: '32px' }}>
            <Link
              href="/kolekcja"
              style={{
                fontFamily: I,
                fontSize: '12px',
                color: '#222',
                textDecoration: 'none',
                borderBottom: '1px solid #222',
                paddingBottom: '1px',
              }}
            >
              ← Wszystkie prace
            </Link>
          </div>
        )}
      </section>

      {/* Grid prac */}
      <section style={{ paddingTop: '80px' }}>
        {error ? (
          <div
            style={{
              fontFamily: I,
              fontSize: '14px',
              color: '#a00',
              textAlign: 'center',
              padding: '64px 32px',
            }}
          >
            Wystąpił błąd podczas wczytywania prac. Spróbuj odświeżyć stronę.
          </div>
        ) : praceFiltered.length === 0 ? (
          <div
            style={{
              fontFamily: I,
              fontSize: '14px',
              color: '#666',
              textAlign: 'center',
              padding: '64px 32px',
            }}
          >
            {aktywnyTag
              ? `Brak prac z pojęciem „${aktywnyTag}" w kolekcji.`
              : 'Brak prac do wyświetlenia w kolekcji.'}
          </div>
        ) : (
          <div className="kolekcja-grid">
            {praceFiltered.map((praca) => (
              <WorkCard
                key={praca.id}
                praca={praca}
                kontekst="kolekcja"
                showPrice={false}
                showSegment={true}
                maxTags={3}
                tagLinkBase="/kolekcja"
              />
            ))}
          </div>
        )}
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
        Galeria ESTA · Gliwice · od 1998
      </footer>
    </main>
  )
}
