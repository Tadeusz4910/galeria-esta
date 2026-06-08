import Link from 'next/link'
import type { Metadata } from 'next'
import { supabase } from '@/lib/supabase'
import Nav from '@/components/Nav'
import WorkCard, { PracaForCard } from '@/components/WorkCard'
import { workSlug, artistSlug } from '@/lib/slug'

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

const IDEE_SLUGS = [
  'idea-jezyk',
  'slowo-znak',
  'geometria-struktura',
  'swiatlo-przestrzen',
  'pamiec-archiwum',
  'obraz-komunikat',
]

const POJECIA_PER_IDEA: Record<string, string[]> = {
  'idea-jezyk': ['pojęcie', 'paradoks', 'definicja'],
  'slowo-znak': ['poezja konkretna', 'typografia', 'znak'],
  'geometria-struktura': ['układ', 'rytm', 'system'],
  'swiatlo-przestrzen': ['światło', 'cień', 'projekcja'],
  'pamiec-archiwum': ['fotografia', 'archiwum', 'ślad'],
  'obraz-komunikat': ['malarstwo', 'ironia', 'tekst w obrazie'],
}

const WSPOLCZESNE_NAZWISKA = [
  'Brandt Natalia',
  'Żychlińska Agata',
  'Dziedzic Łukasz',
  'Swoboda Tom',
]

const FILTRY_GLOWNE = ['Artysta', 'Segment', 'Dziedzina', 'Cena', 'Dostępność']

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
  priorytet_kolekcja: number | null
  idea_glowna_id: string | null
  updated_at: string | null
  artysci: { nazwisko_i_imie: string | null; url_artysty: string | null } | null
  prace_segmenty: { segmenty: { id: string; nazwa: string } | null }[] | null
  pojecia_prace: { pojecia: { id: string; nazwa: string } | null }[] | null
}

type IdeaRow = { id: string; slug: string; nazwa: string | null }

type Praca = PracaForCard & {
  priorytet_kolekcja: number | null
  idea_glowna_id: string | null
  updated_at: string | null
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
    priorytet_kolekcja: row.priorytet_kolekcja,
    idea_glowna_id: row.idea_glowna_id,
    updated_at: row.updated_at,
  }
}

function getHeroImageUrl(praca: Praca): string | null {
  if (praca.id_pracy) {
    return `https://galeria-esta.pl/viewing-room/images/prace/${praca.id_pracy}.jpg`
  }
  return null
}

function getHeroWorkHref(praca: Praca): string {
  return `/praca/${workSlug({
    artysta_nazwa: praca.artysta_nazwa,
    tytul: praca.tytul,
    rok: praca.rok,
  })}`
}

export default async function KolekcjaPage({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string }>
}) {
  const params = await searchParams
  const aktywnyTag = params.tag?.trim().toLowerCase() || null

  const [praceResult, ideeResult] = await Promise.all([
    supabase
      .from('prace')
      .select(
        `
        id, id_pracy, tytul, rok, rok_opis, technika, wymiary_pracy,
        cena_oferowana, alt_zdjecia, priorytet_kolekcja, idea_glowna_id,
        updated_at,
        artysci ( nazwisko_i_imie, url_artysty ),
        prace_segmenty ( segmenty ( id, nazwa ) ),
        pojecia_prace ( pojecia ( id, nazwa ) )
      `
      )
      .eq('widocznosc', 'kolekcja'),
    supabase.from('idee').select('id, slug, nazwa').in('slug', IDEE_SLUGS),
  ])

  const error = praceResult.error
  const rows = (praceResult.data ?? []) as unknown as DbRow[]
  const wszystkiePrace = rows.map(mapRowToPraca)
  const idee = (ideeResult.data ?? []) as unknown as IdeaRow[]

  // Hero: praca z najwyzszym priorytet_kolekcja (fallback: pierwsza z listy)
  const heroPraca =
    [...wszystkiePrace].sort(
      (a, b) =>
        (b.priorytet_kolekcja ?? -1) - (a.priorytet_kolekcja ?? -1)
    )[0] ?? null

  // Wybrane prace: updated_at desc, filtrowane po tagu in-memory
  const praceUpdated = [...wszystkiePrace].sort((a, b) => {
    const ta = a.updated_at ? new Date(a.updated_at).getTime() : 0
    const tb = b.updated_at ? new Date(b.updated_at).getTime() : 0
    return tb - ta
  })

  const praceFiltered = aktywnyTag
    ? praceUpdated.filter((p) =>
        p.pojecia?.some((poj) => poj.nazwa.toLowerCase() === aktywnyTag)
      )
    : praceUpdated

  // Watki programu: grupowanie po idea_glowna_id, top 3 per
  type Watek = { slug: string; prace: Praca[]; pojecia: string[] }
  const watki: Watek[] = IDEE_SLUGS.flatMap((slug) => {
    const idea = idee.find((i) => i.slug === slug)
    if (!idea) return []
    const prace = wszystkiePrace
      .filter((p) => p.idea_glowna_id === idea.id)
      .sort(
        (a, b) =>
          (b.priorytet_kolekcja ?? -1) - (a.priorytet_kolekcja ?? -1)
      )
      .slice(0, 3)
    if (prace.length === 0) return []
    return [{ slug, prace, pojecia: POJECIA_PER_IDEA[slug] ?? [] }]
  })

  // Wspolczesne kontynuacje: 4 hardcoded nazwiska, kazde po jednej pracy z kolekcji
  const wspolczesne: Praca[] = WSPOLCZESNE_NAZWISKA.flatMap((nazwisko) => {
    const found = wszystkiePrace.find((p) => p.artysta_nazwa === nazwisko)
    return found ? [found] : []
  })

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

        .kolekcja-hero {
          display: grid;
          grid-template-columns: 1fr;
          gap: 48px;
          padding: 120px 32px 80px;
          max-width: 1280px;
          margin: 0 auto;
          border-bottom: 1px solid #e7e0d7;
        }
        @media (min-width: 900px) {
          .kolekcja-hero {
            grid-template-columns: 1fr 1fr;
            gap: 80px;
            padding: 140px 64px 100px;
            align-items: center;
          }
        }

        .hero-image-wrap {
          width: 100%;
          aspect-ratio: 4 / 4.85;
          background: #f0ebe2;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }
        .hero-image-wrap img {
          max-width: 100%;
          max-height: 100%;
          width: auto;
          height: auto;
          object-fit: contain;
        }
        .hero-placeholder {
          font-family: ${C};
          font-style: italic;
          font-size: 28px;
          letter-spacing: 0.18em;
          color: #b8aa92;
        }

        .kolekcja-filters {
          padding: 32px;
          max-width: 1280px;
          margin: 0 auto;
          border-bottom: 1px solid #e7e0d7;
        }
        @media (min-width: 900px) {
          .kolekcja-filters { padding: 36px 64px 32px; }
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
          color: #ccc;
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
        .discover-pojecia {
          font-size: 13px;
          color: #888;
        }
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
          color: #ccc;
          margin: 0 6px;
        }

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

        .watki-section { padding-top: 40px; }
        .watek-block {
          padding: 64px 0;
          border-bottom: 1px solid #f0ebe2;
        }
        .watek-block:last-of-type { border-bottom: none; }
        .watek-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 40px;
          padding: 0 32px;
          max-width: 1280px;
          margin: 0 auto;
        }
        @media (min-width: 900px) {
          .watek-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 48px;
            padding: 0 64px;
          }
        }
        .watek-pojecia {
          margin: 32px auto 0;
          padding: 0 32px;
          max-width: 1280px;
          font-family: ${I};
          font-size: 11px;
          letter-spacing: 0.08em;
          color: #888;
          text-align: center;
        }
        @media (min-width: 900px) {
          .watek-pojecia { padding: 0 64px; }
        }

        .wspolczesne-section { padding: 120px 0 80px; }
        .wspolczesne-intro {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 32px 56px;
        }
        @media (min-width: 900px) {
          .wspolczesne-intro { padding: 0 64px 56px; }
        }
        .wspolczesne-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 40px;
          padding: 0 32px;
          max-width: 1280px;
          margin: 0 auto;
        }
        @media (min-width: 700px) {
          .wspolczesne-grid { grid-template-columns: 1fr 1fr; }
        }
        @media (min-width: 1100px) {
          .wspolczesne-grid {
            grid-template-columns: repeat(4, 1fr);
            gap: 48px;
            padding: 0 64px;
          }
        }

        .lat-section {
          padding: 128px 32px;
          text-align: center;
        }
        .lat-numbers {
          font-family: ${C};
          font-style: italic;
          font-weight: 300;
          font-size: clamp(18px, 2.1vw, 22px);
          line-height: 2.4;
          color: #333;
          margin-bottom: 64px;
        }
        .lat-numbers > div { margin-bottom: 4px; }
      `}</style>

      <Nav active="kolekcja" />

      {/* 1. HERO */}
      <section className="kolekcja-hero" aria-label="Kolekcja — wprowadzenie">
        {/* Lewa: praca */}
        <div>
          {heroPraca ? (
            <Link
              href={getHeroWorkHref(heroPraca)}
              style={{ textDecoration: 'none', display: 'block' }}
            >
              <div className="hero-image-wrap">
                {getHeroImageUrl(heroPraca) ? (
                  <img
                    src={getHeroImageUrl(heroPraca) as string}
                    alt={heroPraca.alt_zdjecia ?? heroPraca.tytul}
                  />
                ) : (
                  <span className="hero-placeholder">ESTA</span>
                )}
              </div>
              <div style={{ marginTop: '20px' }}>
                {heroPraca.artysta_nazwa && (
                  <div
                    style={{
                      fontFamily: I,
                      fontSize: '11px',
                      letterSpacing: '0.14em',
                      textTransform: 'uppercase',
                      color: '#555',
                      marginBottom: '6px',
                    }}
                  >
                    {heroPraca.artysta_nazwa}
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
                  {heroPraca.tytul}
                  {heroPraca.rok ? `, ${heroPraca.rok}` : ''}
                </div>
              </div>
            </Link>
          ) : (
            <div className="hero-image-wrap">
              <span className="hero-placeholder">ESTA</span>
            </div>
          )}
        </div>

        {/* Prawa: tekst */}
        <div>
          <h1
            style={{
              fontFamily: C,
              fontWeight: 300,
              fontSize: 'clamp(40px, 5.5vw, 64px)',
              lineHeight: 1.05,
              letterSpacing: '-0.01em',
              margin: 0,
              marginBottom: '32px',
            }}
          >
            Kolekcja Galerii ESTA
          </h1>

          <p
            style={{
              fontFamily: I,
              fontSize: '17px',
              lineHeight: 1.6,
              color: '#444',
              maxWidth: '520px',
              margin: 0,
              marginBottom: '40px',
            }}
          >
            Conceptual art, geometry, image and archive. Polish neo-avant-garde
            and its contemporary continuations.
          </p>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              alignItems: 'flex-start',
            }}
          >
            <a
              href="#wybrane-prace"
              style={{
                fontFamily: I,
                fontSize: '12px',
                color: '#11110f',
                textDecoration: 'none',
                borderBottom: '1px solid #11110f',
                paddingBottom: '2px',
              }}
            >
              Przeglądaj prace →
            </a>
            <a
              href="#watki-programu"
              style={{
                fontFamily: I,
                fontSize: '12px',
                color: '#11110f',
                textDecoration: 'none',
                borderBottom: '1px solid #11110f',
                paddingBottom: '2px',
              }}
            >
              Zobacz program →
            </a>
          </div>
        </div>
      </section>

      {/* 2. FILTRY DWA POZIOMY */}
      <section className="kolekcja-filters" aria-label="Filtry">
        {/* Pierwszy poziom — statyczny placeholder, interaktywnosc w pozniejszym etapie */}
        <div className="filters-main">
          {FILTRY_GLOWNE.map((label, i) => (
            <span key={label}>
              <span>{label}</span>
              {i < FILTRY_GLOWNE.length - 1 && (
                <span className="sep" aria-hidden="true">·</span>
              )}
            </span>
          ))}
        </div>

        {/* Drugi poziom — klikalne pojecia → /kolekcja?tag= */}
        <div className="filters-discover">
          <span className="discover-label">Odkrywaj przez</span>
          <span className="discover-pojecia">
            {POJECIA_DISCOVER.map((pojecie, i) => (
              <span key={pojecie}>
                <Link
                  href={`/kolekcja?tag=${encodeURIComponent(pojecie)}`}
                >
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

      {/* 3. WYBRANE PRACE */}
      <section id="wybrane-prace" style={{ paddingTop: '80px' }}>
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
              href="/kolekcja"
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

      {/* 4. WATKI PROGRAMU (bez naglowka — idee podprogowo) */}
      {watki.length > 0 && (
        <section id="watki-programu" className="watki-section">
          {watki.map((watek) => (
            <div key={watek.slug} className="watek-block">
              <div className="watek-grid">
                {watek.prace.map((praca) => (
                  <WorkCard
                    key={praca.id}
                    praca={praca}
                    kontekst="kolekcja"
                    showPrice={false}
                    showSegment={false}
                    maxTags={0}
                    tagLinkBase="/kolekcja"
                  />
                ))}
              </div>
              {watek.pojecia.length > 0 && (
                <div className="watek-pojecia">
                  {watek.pojecia.join(' · ')}
                </div>
              )}
            </div>
          ))}
        </section>
      )}

      {/* 5. WSPOLCZESNE KONTYNUACJE */}
      {wspolczesne.length > 0 && (
        <section
          className="wspolczesne-section"
          aria-label="Współczesne kontynuacje"
        >
          <div className="wspolczesne-intro">
            <h2
              style={{
                fontFamily: C,
                fontWeight: 300,
                fontSize: 'clamp(28px, 3vw, 36px)',
                lineHeight: 1.15,
                color: '#11110f',
                margin: 0,
                marginBottom: '20px',
              }}
            >
              Współczesne kontynuacje
            </h2>
            <p
              style={{
                fontFamily: I,
                fontSize: '16px',
                lineHeight: 1.6,
                color: '#444',
                maxWidth: '640px',
                margin: 0,
              }}
            >
              Język galerii nie jest zamkniętym archiwum, lecz żywym programem
              rozwijanym przez średnie i młodsze pokolenie artystów.
            </p>
          </div>
          <div className="wspolczesne-grid">
            {wspolczesne.map((praca) => (
              <WorkCard
                key={praca.id}
                praca={praca}
                kontekst="kolekcja"
                showPrice={false}
                showSegment={false}
                maxTags={2}
                tagLinkBase="/kolekcja"
              />
            ))}
          </div>
        </section>
      )}

      {/* 6. 28 LAT GALERII ESTA */}
      <section className="lat-section" aria-label="28 lat Galerii ESTA">
        <h2
          style={{
            fontFamily: C,
            fontWeight: 300,
            fontSize: 'clamp(28px, 3vw, 36px)',
            lineHeight: 1.15,
            color: '#11110f',
            margin: 0,
            marginBottom: '56px',
          }}
        >
          28 lat Galerii ESTA
        </h2>
        <div className="lat-numbers">
          <div>1998 — pierwsza wystawa</div>
          <div>28 lat działalności</div>
          <div>setki wystaw indywidualnych i zbiorowych</div>
          <div>udział w międzynarodowych targach sztuki</div>
          <div>ponad 400 prac w obecnej Kolekcji i Zasobach</div>
        </div>
        <p
          style={{
            fontFamily: I,
            fontSize: '14px',
            lineHeight: 1.7,
            color: '#555',
            maxWidth: '600px',
            margin: '0 auto',
          }}
        >
          Galeria ESTA od 1998 roku konsekwentnie buduje program wokół polskiej
          i środkowoeuropejskiej sztuki konceptualnej i neoawangardowej — od
          jej historycznego rdzenia po współczesne kontynuacje.
        </p>
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
