import Link from 'next/link'
import type { Metadata } from 'next'
import { supabase } from '@/lib/supabase'
import Nav from '@/components/Nav'
import WorkCard, { PracaForCard } from '@/components/WorkCard'
import { artistSlug } from '@/lib/slug'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'Zasoby — Galeria ESTA',
  description:
    'Biblioteka 28 lat działalności Galerii ESTA — prace, artyści i archiwalne ślady do odkrywania.',
  openGraph: {
    title: 'Zasoby — Galeria ESTA',
    description:
      'Biblioteka 28 lat działalności Galerii ESTA — prace, artyści i archiwalne ślady do odkrywania.',
  },
  robots: 'index, follow',
}

const C = '"Cormorant Garamond", Georgia, serif'
const I = '"Instrument Sans", -apple-system, BlinkMacSystemFont, sans-serif'

const FILTRY_GLOWNE_ZASOBY = ['Artysta', 'Dziedzina', 'Dekada', 'Cena', 'Status']

const POJECIA_DISCOVER = [
  'język',
  'paradoks',
  'znak',
  'słowo',
  'układ',
  'system',
  'światło',
  'cień',
  'ślad',
  'pamięć',
  'obraz',
  'komunikat',
  'ciało',
  'granica',
]

const OBSZARY_TEMATYCZNE = [
  { label: 'Geometria i system', href: '/zasoby?obszar=geometria-system' },
  { label: 'Fotografia i pamięć', href: '/zasoby?obszar=fotografia-pamiec' },
  { label: 'Obiekt i przestrzeń', href: '/zasoby?obszar=obiekt-przestrzen' },
  { label: 'Obraz i znak', href: '/zasoby?obszar=obraz-znak' },
  { label: 'Prace na papierze', href: '/zasoby?obszar=prace-na-papierze' },
  {
    label: 'Archiwalia i dokumenty',
    href: '/zasoby?obszar=archiwalia-dokumenty',
  },
]

const VR_RELACJE = [
  'Bauer + Dróżdż',
  'Molnar + Gołkowska',
  'Winiarski + Gostomski',
  'Berdyszak + Chwałczyk',
  'Pamuła + Brandt',
]

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
  priorytet_zasoby: number | null
  artysci: { nazwisko_i_imie: string | null; url_artysty: string | null } | null
  prace_segmenty: { segmenty: { id: string; nazwa: string } | null }[] | null
  pojecia_prace: { pojecia: { id: string; nazwa: string } | null }[] | null
}

type ArtystaRow = {
  id: string
  nazwisko_i_imie: string
  url_artysty: string | null
  pojecia_artysci:
    | { pojecia: { id: string; slug: string; nazwa: string } | null }[]
    | null
}

type ArtystaZasobow = {
  id: string
  nazwisko_i_imie: string
  url_artysty: string | null
  pojecia: { id: string; slug: string; nazwa: string }[]
}

type Praca = PracaForCard & {
  priorytet_zasoby: number | null
}

function mapRowToPraca(row: DbRow): Praca {
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
    priorytet_zasoby: row.priorytet_zasoby,
  }
}

function getArtystaHref(naz: string | null, url: string | null): string | null {
  if (url) return `/artysta/${url}`
  if (naz) {
    const s = artistSlug(naz)
    return s ? `/artysta/${s}` : null
  }
  return null
}

const sectionH2Style: React.CSSProperties = {
  fontFamily: C,
  fontWeight: 300,
  fontSize: 'clamp(28px, 3vw, 36px)',
  lineHeight: 1.15,
  color: '#11110f',
  margin: 0,
  marginBottom: '32px',
}

export default async function ZasobyPage({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string; obszar?: string }>
}) {
  const params = await searchParams
  const aktywnyTag = params.tag?.trim().toLowerCase() || null
  // params.obszar — placeholder, brak logiki filtrowania w MVP (Etap 3).

  const [praceResult, artysciResult] = await Promise.all([
    supabase
      .from('prace')
      .select(
        `
        id, id_pracy, tytul, rok, rok_opis, technika, wymiary_pracy,
        cena_oferowana, alt_zdjecia, priorytet_zasoby,
        artysci ( nazwisko_i_imie, url_artysty ),
        prace_segmenty ( segmenty ( id, nazwa ) ),
        pojecia_prace ( pojecia ( id, nazwa ) )
      `
      )
      .eq('widocznosc', 'zasoby'),
    supabase
      .from('artysci')
      .select(
        `
        id, nazwisko_i_imie, url_artysty,
        pojecia_artysci ( pojecia ( id, slug, nazwa ) )
      `
      )
      .eq('status_programowy', 'zasoby')
      .order('nazwisko_i_imie'),
  ])

  const error = praceResult.error
  const rows = (praceResult.data ?? []) as unknown as DbRow[]
  const wszystkiePrace = rows.map(mapRowToPraca)

  // Sortowanie: priorytet_zasoby DESC NULLS LAST, artysta ASC, rok DESC
  const praceSorted = [...wszystkiePrace].sort((a, b) => {
    const pA = a.priorytet_zasoby ?? Number.NEGATIVE_INFINITY
    const pB = b.priorytet_zasoby ?? Number.NEGATIVE_INFINITY
    if (pA !== pB) return pB - pA
    const nA = a.artysta_nazwa ?? ''
    const nB = b.artysta_nazwa ?? ''
    if (nA !== nB) return nA.localeCompare(nB, 'pl')
    return (Number(b.rok) || 0) - (Number(a.rok) || 0)
  })

  // Filter by tag in-memory (analog do /kolekcja)
  const praceFiltered = aktywnyTag
    ? praceSorted.filter((p) =>
        p.pojecia?.some((poj) => poj.nazwa.toLowerCase() === aktywnyTag)
      )
    : praceSorted

  // Artysci w Zasobach — splaszczenie joinow do plaskiej tablicy pojec
  const artysciRows = (artysciResult.data ?? []) as unknown as ArtystaRow[]
  const artysciZasobow: ArtystaZasobow[] = artysciRows.map((a) => ({
    id: a.id,
    nazwisko_i_imie: a.nazwisko_i_imie,
    url_artysty: a.url_artysty,
    pojecia:
      a.pojecia_artysci
        ?.map((pa) => pa.pojecia)
        .filter((p): p is { id: string; slug: string; nazwa: string } => Boolean(p)) ?? [],
  }))

  return (
    <main
      style={{
        background: '#faf6f0',
        color: '#11110f',
        minHeight: '100vh',
      }}
    >
      <style>{`
        *, *::before, *::after { box-sizing: border-box; }
        a { color: inherit; }

        .zasoby-hero {
          padding: 128px 32px 96px;
          max-width: 1280px;
          margin: 0 auto;
          border-bottom: 1px solid #ebe3d2;
        }
        @media (min-width: 900px) {
          .zasoby-hero {
            padding: 160px 64px 120px;
          }
        }

        .zasoby-section-intro {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 32px;
        }
        @media (min-width: 900px) {
          .zasoby-section-intro { padding: 0 64px; }
        }

        .zasoby-artysci-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 32px;
          padding: 0 32px;
          max-width: 1280px;
          margin: 0 auto;
        }
        @media (min-width: 700px) {
          .zasoby-artysci-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (min-width: 1100px) {
          .zasoby-artysci-grid {
            grid-template-columns: repeat(3, 1fr);
            padding: 0 64px;
            gap: 40px;
          }
        }
        .zasoby-artysta-cell { padding: 4px 0; }
        .zasoby-artysta-name {
          font-family: ${I};
          font-size: 14px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #222;
          text-decoration: none;
          border-bottom: 1px solid transparent;
          transition: color .15s, border-color .15s;
        }
        .zasoby-artysta-name:hover {
          color: #11110f;
          border-bottom-color: #11110f;
        }
        .zasoby-artysta-pojecia {
          margin-top: 8px;
          font-family: ${I};
          font-size: 11px;
          letter-spacing: 0.04em;
          color: #888;
        }

        .zasoby-obszary-list {
          display: flex;
          flex-direction: column;
          gap: 14px;
          padding: 0 32px;
          max-width: 1280px;
          margin: 0 auto;
          list-style: none;
        }
        @media (min-width: 700px) {
          .zasoby-obszary-list {
            flex-direction: row;
            flex-wrap: wrap;
            gap: 32px 48px;
          }
        }
        @media (min-width: 900px) {
          .zasoby-obszary-list { padding: 0 64px; }
        }
        .zasoby-obszary-list a {
          font-family: ${C};
          font-style: italic;
          font-size: clamp(20px, 2vw, 24px);
          color: #444;
          text-decoration: none;
          border-bottom: 1px solid transparent;
          transition: color .15s, border-color .15s;
        }
        .zasoby-obszary-list a:hover {
          color: #11110f;
          border-bottom-color: #11110f;
        }

        .zasoby-vr-intro {
          font-family: ${C};
          font-style: italic;
          font-size: 16px;
          color: #555;
          line-height: 1.6;
          margin: 0 0 36px;
          max-width: 700px;
        }
        .zasoby-vr-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
          font-family: ${C};
          font-style: italic;
          font-size: clamp(17px, 1.8vw, 20px);
          color: #555;
          padding: 0 32px;
          max-width: 1280px;
          margin: 0 auto;
        }
        @media (min-width: 900px) {
          .zasoby-vr-list { padding: 0 64px; }
        }

        .zasoby-filters {
          padding: 32px;
          max-width: 1280px;
          margin: 0 auto;
          border-top: 1px solid #ebe3d2;
          border-bottom: 1px solid #ebe3d2;
        }
        @media (min-width: 900px) {
          .zasoby-filters { padding: 36px 64px 32px; }
        }
        .filters-main {
          font-family: ${I};
          font-size: 12px;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: #444;
          line-height: 1.7;
        }
        @media (min-width: 900px) {
          .filters-main { font-size: 13px; }
        }
        .filters-main .sep {
          color: #d6cab2;
          margin: 0 12px;
        }
        @media (min-width: 900px) {
          .filters-main .sep { margin: 0 16px; }
        }

        .filters-discover {
          margin-top: 22px;
          font-family: ${I};
          line-height: 1.9;
        }
        .discover-label {
          font-size: 11px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #888;
          margin-right: 14px;
        }
        .discover-pojecia { font-size: 13px; color: #888; }
        .discover-pojecia a {
          color: #555;
          text-decoration: none;
          border-bottom: 1px solid transparent;
          transition: color .15s, border-color .15s;
        }
        .discover-pojecia a:hover {
          color: #11110f;
          border-bottom-color: #11110f;
        }
        .discover-pojecia .sep {
          color: #d6cab2;
          margin: 0 6px;
        }

        .zasoby-grid {
          display: grid;
          grid-template-columns: 1fr;
          column-gap: 48px;
          row-gap: 64px;
          padding: 0 32px 120px;
          max-width: 1280px;
          margin: 0 auto;
        }
        @media (min-width: 700px) {
          .zasoby-grid {
            grid-template-columns: repeat(2, 1fr);
            row-gap: 72px;
          }
        }
        @media (min-width: 1100px) {
          .zasoby-grid {
            grid-template-columns: repeat(3, 1fr);
            column-gap: 56px;
            padding: 0 64px 160px;
          }
        }
      `}</style>

      <Nav active="zasoby" />

      {/* 1. HERO */}
      <section className="zasoby-hero" aria-label="Zasoby — wprowadzenie">
        <h1
          style={{
            fontFamily: C,
            fontStyle: 'italic',
            fontWeight: 300,
            fontSize: 'clamp(48px, 7vw, 96px)',
            lineHeight: 1.0,
            letterSpacing: '-0.02em',
            margin: 0,
            marginBottom: '40px',
            color: '#11110f',
          }}
        >
          Zasoby
        </h1>

        <p
          style={{
            fontFamily: C,
            fontStyle: 'italic',
            fontWeight: 400,
            fontSize: 'clamp(20px, 2.2vw, 26px)',
            lineHeight: 1.4,
            color: '#444',
            margin: 0,
            marginBottom: '32px',
            maxWidth: '780px',
          }}
        >
          Prace, artyści i archiwalne ślady z 28 lat działalności Galerii ESTA.
        </p>

        <p
          style={{
            fontFamily: I,
            fontSize: '16px',
            lineHeight: 1.7,
            color: '#555',
            margin: 0,
            marginBottom: '48px',
            maxWidth: '780px',
          }}
        >
          Zasoby Galerii ESTA to obszar odkryć, kontekstów i relacji, które
          mogą uzupełniać aktualny program Kolekcji oraz budować nowe
          prezentacje w Viewing Room.
        </p>

        <a
          href="#prace-zasoby"
          style={{
            fontFamily: I,
            fontSize: '12px',
            color: '#11110f',
            textDecoration: 'none',
            borderBottom: '1px solid #11110f',
            paddingBottom: '2px',
          }}
        >
          Przeglądaj zasoby →
        </a>
      </section>

      {/* 2. ARTYŚCI W ZASOBACH */}
      {artysciZasobow.length > 0 && (
        <section
          style={{ padding: '120px 0 80px' }}
          aria-label="Artyści w Zasobach"
        >
          <div className="zasoby-section-intro">
            <h2 style={sectionH2Style}>Artyści w Zasobach</h2>
          </div>
          <div className="zasoby-artysci-grid">
            {artysciZasobow.map((a) => {
              const href = getArtystaHref(a.nazwisko_i_imie, a.url_artysty)
              const pojeciaTop = a.pojecia.slice(0, 3)
              return (
                <div key={a.id} className="zasoby-artysta-cell">
                  {href ? (
                    <Link href={href} className="zasoby-artysta-name">
                      {a.nazwisko_i_imie}
                    </Link>
                  ) : (
                    <span
                      style={{
                        fontFamily: I,
                        fontSize: '14px',
                        letterSpacing: '0.14em',
                        textTransform: 'uppercase',
                        color: '#555',
                      }}
                    >
                      {a.nazwisko_i_imie}
                    </span>
                  )}
                  {pojeciaTop.length > 0 && (
                    <div className="zasoby-artysta-pojecia">
                      {pojeciaTop.map((p) => p.nazwa).join(' · ')}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* 3. ODKRYWAJ PRZEZ OBSZARY (NIE nazwy idei — subtelne wejścia) */}
      <section style={{ padding: '80px 0' }} aria-label="Odkrywaj przez obszary">
        <div className="zasoby-section-intro">
          <h2 style={sectionH2Style}>Odkrywaj przez obszary</h2>
        </div>
        <ul className="zasoby-obszary-list">
          {OBSZARY_TEMATYCZNE.map((o) => (
            <li key={o.href}>
              <Link href={o.href}>{o.label}</Link>
            </li>
          ))}
        </ul>
      </section>

      {/* 4. Z ZASOBÓW DO VIEWING ROOM */}
      <section
        style={{ padding: '80px 0 120px' }}
        aria-label="Z Zasobów do Viewing Room"
      >
        <div className="zasoby-section-intro">
          <h2 style={sectionH2Style}>Z Zasobów do Viewing Room</h2>
          <p className="zasoby-vr-intro">
            Wybrane prace z Zasobów pojawiają się w Viewing Roomach, gdzie
            tworzą nowe relacje z artystami Kolekcji.
          </p>
        </div>
        <div className="zasoby-vr-list">
          {VR_RELACJE.map((r) => (
            <div key={r}>{r}</div>
          ))}
        </div>
      </section>

      {/* 5. FILTRY (POZIOM 1 placeholder + POZIOM 2 klikalne tagi) */}
      <section className="zasoby-filters" aria-label="Filtry zasobów">
        <div className="filters-main">
          {FILTRY_GLOWNE_ZASOBY.map((label, i) => (
            <span key={label}>
              <span>{label}</span>
              {i < FILTRY_GLOWNE_ZASOBY.length - 1 && (
                <span className="sep" aria-hidden="true">·</span>
              )}
            </span>
          ))}
        </div>

        <div className="filters-discover">
          <span className="discover-label">Odkrywaj przez</span>
          <span className="discover-pojecia">
            {POJECIA_DISCOVER.map((pojecie, i) => (
              <span key={pojecie}>
                <Link href={`/zasoby?tag=${encodeURIComponent(pojecie)}`}>
                  {pojecie}
                </Link>
                {i < POJECIA_DISCOVER.length - 1 && (
                  <span className="sep" aria-hidden="true">·</span>
                )}
              </span>
            ))}
          </span>
        </div>
      </section>

      {/* 6. GRID 3-KOLUMNOWY PRAC */}
      <section id="prace-zasoby" style={{ paddingTop: '80px' }}>
        {aktywnyTag && (
          <div
            style={{
              fontFamily: I,
              fontSize: '12px',
              color: '#555',
              textAlign: 'center',
              marginBottom: '40px',
            }}
          >
            Filtr: pojęcie „{aktywnyTag}" ·{' '}
            <Link
              href="/zasoby"
              style={{
                color: '#222',
                borderBottom: '1px solid #222',
                textDecoration: 'none',
                paddingBottom: '1px',
              }}
            >
              wyczyść
            </Link>
          </div>
        )}

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
              ? `Brak prac z pojęciem „${aktywnyTag}" w Zasobach.`
              : 'Brak prac do wyświetlenia w Zasobach.'}
          </div>
        ) : (
          <div className="zasoby-grid">
            {praceFiltered.map((praca) => (
              <WorkCard
                key={praca.id}
                praca={praca}
                kontekst="zasoby"
                showPrice={false}
                showSegment={false}
                maxTags={3}
                tagLinkBase="/zasoby"
              />
            ))}
          </div>
        )}
      </section>

      <footer
        style={{
          padding: '64px 32px',
          borderTop: '1px solid #ebe3d2',
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
