import Link from 'next/link'
import type { Metadata } from 'next'
import { supabase } from '@/lib/supabase'
import Nav from '@/components/Nav'
import VRHero from '@/components/VRHero'
import { PracaLite } from '@/lib/vrTypes'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'Viewing Room — Galeria ESTA',
  description:
    'Kuratorskie miniwystawy online z prac Kolekcji i Zasobów Galerii ESTA.',
  openGraph: {
    title: 'Viewing Room — Galeria ESTA',
    description:
      'Kuratorskie miniwystawy online z prac Kolekcji i Zasobów Galerii ESTA.',
  },
  robots: 'index, follow',
}

const C = '"Cormorant Garamond", Georgia, serif'
const I = '"Instrument Sans", -apple-system, BlinkMacSystemFont, sans-serif'

type DbPraceHero = {
  id: string
  id_pracy: string | null
  tytul: string
  rok: number | null
  artysta: { id: string; nazwisko_i_imie: string; url_artysty: string | null } | null
}

type DbPojecieRef = {
  pojecie: { id: string; nazwa: string; slug: string } | null
}

type DbVR = {
  id: string
  slug: string
  tytul_pl: string | null
  podtytul_pl: string | null
  typ_vr: string | null
  status_publiczny: string
  hero_url: string | null
  pokaz_na_home: boolean | null
  priorytet_vr: number | null
  data_publikacji: string | null
  praca_hero: DbPraceHero | null
  pojecia: DbPojecieRef[] | null
  prace_count: { count: number }[] | null
}

function toPracaLite(p: DbPraceHero | null | undefined): PracaLite | null {
  if (!p) return null
  return {
    id: p.id,
    id_pracy: p.id_pracy,
    tytul: p.tytul,
    rok: p.rok,
    technika: null,
    wymiary_pracy: null,
    artysta_nazwa: p.artysta?.nazwisko_i_imie ?? null,
    artysta_url: p.artysta?.url_artysty ?? null,
  }
}

function getPojecia(
  vr: DbVR
): { id: string; nazwa: string; slug: string }[] {
  return (vr.pojecia ?? [])
    .map((p) => p.pojecie)
    .filter((p): p is { id: string; nazwa: string; slug: string } => Boolean(p))
}

function getPraceCount(vr: DbVR): number {
  return vr.prace_count?.[0]?.count ?? 0
}

export default async function ViewingRoomListaPage() {
  const { data, error } = await supabase
    .from('viewing_room')
    .select(
      `
      id, slug, tytul_pl, podtytul_pl, typ_vr, status_publiczny,
      hero_url, pokaz_na_home, priorytet_vr, data_publikacji,
      praca_hero:prace!viewing_room_praca_hero_id_fkey(
        id, id_pracy, tytul, rok,
        artysta:artysci(id, nazwisko_i_imie, url_artysty)
      ),
      pojecia:viewing_room_pojecia(pojecie:pojecia(id, nazwa, slug)),
      prace_count:viewing_room_prace(count)
    `
    )
    .eq('status_publiczny', 'aktywny')
    .order('pokaz_na_home', { ascending: false })
    .order('priorytet_vr', { ascending: false })
    .order('data_publikacji', { ascending: false, nullsFirst: false })

  const all = (data ?? []) as unknown as DbVR[]
  const hero = all[0] ?? null
  const rest = hero ? all.slice(1) : []

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

        .vr-grid {
          display: grid;
          grid-template-columns: 1fr;
          column-gap: 48px;
          row-gap: 72px;
          padding: 0 32px 120px;
          max-width: 1280px;
          margin: 0 auto;
        }
        @media (min-width: 700px) {
          .vr-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (min-width: 1100px) {
          .vr-grid {
            grid-template-columns: repeat(3, 1fr);
            column-gap: 56px;
            padding: 0 64px 160px;
          }
        }

        .vr-card-img {
          width: 100%;
          aspect-ratio: 4 / 3;
          background: #f0ebe2;
          overflow: hidden;
          margin-bottom: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .vr-card-img img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform .5s ease;
        }
        .vr-card:hover .vr-card-img img { transform: scale(1.03); }
        .vr-placeholder {
          font-family: ${C};
          font-style: italic;
          font-size: 22px;
          letter-spacing: 0.18em;
          color: #b8aa92;
        }

        .vr-pojecia a {
          color: #888;
          text-decoration: none;
          border-bottom: 1px solid transparent;
          transition: color .15s, border-color .15s;
        }
        .vr-pojecia a:hover {
          color: #11110f;
          border-bottom-color: #11110f;
        }
        .vr-pojecia .sep { color: #ccc; margin: 0 6px; }
      `}</style>

      <Nav active="viewing-room" />

      {error && (
        <div
          style={{
            fontFamily: I,
            fontSize: '14px',
            color: '#a00',
            textAlign: 'center',
            padding: '120px 32px',
          }}
        >
          Wystąpił błąd podczas wczytywania Viewing Roomów.
        </div>
      )}

      {!error && all.length === 0 && (
        <>
          <div style={{ paddingTop: '54px' }} />
          <div
            style={{
              fontFamily: I,
              fontSize: '11px',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: '#888',
              textAlign: 'center',
              marginTop: '96px',
            }}
          >
            Viewing Room
          </div>
          <h1
            style={{
              fontFamily: C,
              fontStyle: 'italic',
              fontWeight: 300,
              fontSize: 'clamp(48px, 7vw, 96px)',
              lineHeight: 1.0,
              color: '#11110f',
              margin: 0,
              marginTop: '24px',
              textAlign: 'center',
            }}
          >
            Viewing Room
          </h1>
          <p
            style={{
              fontFamily: C,
              fontStyle: 'italic',
              fontSize: '22px',
              color: '#666',
              textAlign: 'center',
              padding: '48px 32px 160px',
              maxWidth: '640px',
              margin: '0 auto',
              lineHeight: 1.5,
            }}
          >
            Pierwsze Viewing Roomy publikujemy w czerwcu 2026.
          </p>
        </>
      )}

      {/* HERO — najmocniejszy VR */}
      {hero && (
        <>
          <VRHero
            tytul={hero.tytul_pl}
            podtytul={hero.podtytul_pl}
            hero_url={hero.hero_url}
            praca_hero={toPracaLite(hero.praca_hero)}
            data_publikacji={hero.data_publikacji}
            typ_vr={hero.typ_vr}
            badge="Viewing Room aktualny"
          />

          <div
            style={{
              maxWidth: '720px',
              margin: '0 auto',
              padding: '64px 32px 32px',
              textAlign: 'center',
            }}
          >
            <Link
              href={`/viewing-room/${hero.slug}`}
              style={{
                display: 'inline-block',
                fontFamily: I,
                fontSize: '12px',
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                color: '#11110f',
                textDecoration: 'none',
                border: '1px solid #11110f',
                padding: '16px 36px',
                transition: 'background .2s, color .2s',
              }}
            >
              Wejdź do Viewing Roomu →
            </Link>
          </div>
        </>
      )}

      {/* Wprowadzenie definicyjne */}
      {all.length > 0 && (
        <section
          style={{
            maxWidth: '720px',
            margin: '0 auto',
            padding: '96px 32px 64px',
            textAlign: 'center',
            borderTop: '1px solid #f0ebe2',
          }}
        >
          <p
            style={{
              fontFamily: C,
              fontStyle: 'italic',
              fontSize: 'clamp(18px, 1.8vw, 22px)',
              lineHeight: 1.6,
              color: '#555',
              margin: 0,
            }}
          >
            Kuratorskie miniwystawy z prac Kolekcji i Zasobów. Galeria ESTA
            zestawia, interpretuje, odkrywa relacje.
          </p>
        </section>
      )}

      {/* GRID kart pozostałych VR */}
      {rest.length > 0 && (
        <section className="vr-grid" aria-label="Aktywne Viewing Roomy">
          {rest.map((vr) => {
            const pojecia = getPojecia(vr).slice(0, 4)
            const praceCount = getPraceCount(vr)
            const heroPraca = toPracaLite(vr.praca_hero)
            const heroImg =
              vr.hero_url ||
              (heroPraca?.id_pracy
                ? `https://galeria-esta.pl/viewing-room/images/prace/${heroPraca.id_pracy}.jpg`
                : null)

            return (
              <article key={vr.id} className="vr-card">
                <Link
                  href={`/viewing-room/${vr.slug}`}
                  style={{
                    textDecoration: 'none',
                    color: 'inherit',
                    display: 'block',
                  }}
                >
                  <div className="vr-card-img">
                    {heroImg ? (
                      <img
                        src={heroImg}
                        alt={vr.tytul_pl ?? 'Viewing Room'}
                      />
                    ) : (
                      <span className="vr-placeholder">VR</span>
                    )}
                  </div>
                </Link>

                <h3
                  style={{
                    fontFamily: C,
                    fontWeight: 400,
                    fontSize: 'clamp(22px, 2vw, 28px)',
                    lineHeight: 1.2,
                    color: '#11110f',
                    margin: 0,
                    marginBottom: '10px',
                  }}
                >
                  <Link
                    href={`/viewing-room/${vr.slug}`}
                    style={{ textDecoration: 'none', color: 'inherit' }}
                  >
                    {vr.tytul_pl ?? 'Bez tytułu'}
                  </Link>
                </h3>

                {vr.podtytul_pl && (
                  <p
                    style={{
                      fontFamily: I,
                      fontStyle: 'italic',
                      fontSize: '14px',
                      lineHeight: 1.5,
                      color: '#555',
                      margin: 0,
                      marginBottom: '16px',
                    }}
                  >
                    {vr.podtytul_pl}
                  </p>
                )}

                {pojecia.length > 0 && (
                  <div
                    className="vr-pojecia"
                    style={{
                      fontFamily: I,
                      fontSize: '11px',
                      letterSpacing: '0.04em',
                      color: '#888',
                      marginBottom: '16px',
                    }}
                  >
                    {pojecia.map((p, i) => (
                      <span key={p.id}>
                        <Link
                          href={`/kolekcja?tag=${encodeURIComponent(p.slug)}`}
                        >
                          {p.nazwa}
                        </Link>
                        {i < pojecia.length - 1 && (
                          <span className="sep" aria-hidden="true">·</span>
                        )}
                      </span>
                    ))}
                  </div>
                )}

                <div
                  style={{
                    fontFamily: I,
                    fontSize: '11px',
                    letterSpacing: '0.16em',
                    textTransform: 'uppercase',
                    color: '#999',
                  }}
                >
                  {praceCount > 0
                    ? `${praceCount} ${praceCount === 1 ? 'praca' : 'prac'}`
                    : 'W przygotowaniu'}
                </div>
              </article>
            )
          })}
        </section>
      )}

      {/* "Co to jest Viewing Room" */}
      {all.length > 0 && (
        <section
          style={{
            background: '#f7f3eb',
            padding: '96px 32px',
            textAlign: 'center',
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
            Co to jest Viewing Room
          </div>
          <p
            style={{
              fontFamily: C,
              fontStyle: 'italic',
              fontSize: 'clamp(20px, 2vw, 26px)',
              lineHeight: 1.5,
              color: '#11110f',
              margin: 0,
              maxWidth: '760px',
              marginLeft: 'auto',
              marginRight: 'auto',
            }}
          >
            Viewing Room to kuratorska prezentacja online — miniwystawa łącząca
            prace z Kolekcji i Zasobów Galerii ESTA. Nie jest katalogiem ani
            ofertą. Jest interpretacją.
          </p>
        </section>
      )}

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
