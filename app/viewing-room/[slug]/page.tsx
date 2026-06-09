import Link from 'next/link'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { artistSlug, workSlug } from '@/lib/slug'
import Nav from '@/components/Nav'
import VRHero from '@/components/VRHero'
import VRSequence from '@/components/VRSequence'
import { PracaLite, VRBlock, getPracaImageUrl } from '@/lib/vrTypes'

export const revalidate = 60

const C = '"Cormorant Garamond", Georgia, serif'
const I = '"Instrument Sans", -apple-system, BlinkMacSystemFont, sans-serif'

type DbArtysta = {
  id: string
  nazwisko_i_imie: string
  url_artysty: string | null
}

type DbPraca = {
  id: string
  id_pracy: string | null
  tytul: string
  rok: number | null
  technika: string | null
  wymiary_pracy: string | null
  cena_oferowana: number | null
  artysta: DbArtysta | null
}

type DbPojecie = { id: string; nazwa: string; slug: string }

type DbVRRelated = {
  id: string
  slug: string
  tytul_pl: string | null
  podtytul_pl: string | null
  status_publiczny: string | null
  hero_url: string | null
}

type DbVR = {
  id: string
  slug: string
  tytul_pl: string | null
  podtytul_pl: string | null
  tekst_otwierajacy_pl: string | null
  typ_vr: string | null
  status_publiczny: string
  hero_url: string | null
  data_publikacji: string | null
  sekcje_jsonb: VRBlock[] | null
  praca_hero: DbPraca | null
  prace:
    | {
        kolejnosc: number | null
        kontekst_w_vr_pl: string | null
        pokaz_cene: boolean | null
        cena_w_vr: number | null
        praca: DbPraca | null
      }[]
    | null
  pojecia: { pojecie: DbPojecie | null }[] | null
  artysci:
    | {
        rola_w_vr: string | null
        artysta: DbArtysta | null
      }[]
    | null
  vr_powiazane: { vr: DbVRRelated | null }[] | null
}

function toPracaLite(p: DbPraca | null | undefined): PracaLite | null {
  if (!p) return null
  return {
    id: p.id,
    id_pracy: p.id_pracy,
    tytul: p.tytul,
    rok: p.rok,
    technika: p.technika,
    wymiary_pracy: p.wymiary_pracy,
    artysta_nazwa: p.artysta?.nazwisko_i_imie ?? null,
    artysta_url: p.artysta?.url_artysty ?? null,
  }
}

function formatPrice(value: number | null): string | null {
  if (typeof value !== 'number' || value <= 0) return null
  return value.toLocaleString('pl-PL', { maximumFractionDigits: 0 }) + ' PLN'
}

function getArtystaHref(a: DbArtysta | null | undefined): string | null {
  if (!a) return null
  if (a.url_artysty) return `/artysta/${a.url_artysty}`
  if (a.nazwisko_i_imie) {
    const s = artistSlug(a.nazwisko_i_imie)
    return s ? `/artysta/${s}` : null
  }
  return null
}

function getPracaHref(p: DbPraca | null): string | null {
  if (!p) return null
  const s = workSlug({
    artysta_nazwa: p.artysta?.nazwisko_i_imie ?? null,
    tytul: p.tytul,
    rok: p.rok,
  })
  return s ? `/praca/${s}` : null
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const { data } = await supabase
    .from('viewing_room')
    .select('tytul_pl, podtytul_pl, hero_url')
    .eq('slug', slug)
    .in('status_publiczny', ['aktywny', 'archiwalny'])
    .maybeSingle()

  if (!data) return { title: 'Viewing Room — Galeria ESTA' }

  return {
    title: `${data.tytul_pl ?? 'Viewing Room'} — Galeria ESTA`,
    description: data.podtytul_pl ?? undefined,
    openGraph: {
      title: data.tytul_pl ?? 'Viewing Room',
      description: data.podtytul_pl ?? undefined,
      images: data.hero_url ? [data.hero_url] : undefined,
    },
  }
}

export default async function VRDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const { data, error } = await supabase
    .from('viewing_room')
    .select(
      `
      *,
      praca_hero:prace!viewing_room_praca_hero_id_fkey(
        id, id_pracy, tytul, rok, technika, wymiary_pracy, cena_oferowana,
        artysta:artysci(id, nazwisko_i_imie, url_artysty)
      ),
      prace:viewing_room_prace(
        kolejnosc, kontekst_w_vr_pl, pokaz_cene, cena_w_vr,
        praca:prace(
          id, id_pracy, tytul, rok, technika, wymiary_pracy, cena_oferowana,
          artysta:artysci(id, nazwisko_i_imie, url_artysty)
        )
      ),
      pojecia:viewing_room_pojecia(pojecie:pojecia(id, nazwa, slug)),
      artysci:viewing_room_artysci(
        rola_w_vr,
        artysta:artysci(id, nazwisko_i_imie, url_artysty)
      ),
      vr_powiazane:viewing_room_powiazane!viewing_room_powiazane_vr_id_fkey(
        vr:viewing_room!viewing_room_powiazane_powiazany_vr_id_fkey(id, slug, tytul_pl, podtytul_pl, status_publiczny, hero_url)
      )
    `
    )
    .eq('slug', slug)
    .in('status_publiczny', ['aktywny', 'archiwalny'])
    .maybeSingle()

  if (error || !data) notFound()

  const vr = data as unknown as DbVR

  const praceSorted = (vr.prace ?? [])
    .filter((p) => Boolean(p.praca))
    .sort((a, b) => (a.kolejnosc ?? 0) - (b.kolejnosc ?? 0))

  // Mapa praca_id -> PracaLite dla VRSequence
  const praceMap: Record<string, PracaLite> = {}
  praceSorted.forEach((row) => {
    const lite = toPracaLite(row.praca)
    if (lite) praceMap[lite.id] = lite
  })
  // Dolacz praca_hero do mapy zeby sekcje_jsonb mogla na nia wskazac
  const heroLite = toPracaLite(vr.praca_hero)
  if (heroLite) praceMap[heroLite.id] = heroLite

  const pojecia = (vr.pojecia ?? [])
    .map((p) => p.pojecie)
    .filter((p): p is DbPojecie => Boolean(p))

  const artysciVR = (vr.artysci ?? []).filter((x) => Boolean(x.artysta))

  const vrPowiazane = (vr.vr_powiazane ?? [])
    .map((x) => x.vr)
    .filter((v): v is DbVRRelated => Boolean(v))

  const badge =
    vr.status_publiczny === 'archiwalny'
      ? 'Viewing Room — archiwalny'
      : 'Viewing Room aktualny'

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

        .vrd-intro {
          max-width: 720px;
          margin: 0 auto;
          padding: 80px 32px;
          font-family: ${C};
          font-size: clamp(20px, 2vw, 24px);
          line-height: 1.7;
          color: #11110f;
          text-align: center;
          white-space: pre-line;
        }

        .vrd-prace-section {
          padding: 96px 32px;
          background: #fbfaf8;
          border-top: 1px solid #f0ebe2;
        }
        .vrd-prace-section-title {
          font-family: ${I};
          font-size: 11px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #888;
          text-align: center;
          margin-bottom: 56px;
        }
        .vrd-prace-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 80px;
          max-width: 1200px;
          margin: 0 auto;
        }
        @media (min-width: 900px) {
          .vrd-prace-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 96px;
          }
        }

        .vrd-praca-img {
          width: 100%;
          aspect-ratio: 4 / 4.85;
          background: #f0ebe2;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .vrd-praca-img img {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
        }
        .vrd-placeholder {
          font-family: ${C};
          font-style: italic;
          font-size: 24px;
          letter-spacing: 0.18em;
          color: #b8aa92;
        }

        .vrd-artysci-list a {
          color: #11110f;
          text-decoration: none;
          border-bottom: 1px solid transparent;
          transition: border-color .15s;
        }
        .vrd-artysci-list a:hover { border-bottom-color: #11110f; }

        .vrd-vr-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 48px;
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 32px;
        }
        @media (min-width: 700px) {
          .vrd-vr-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (min-width: 1100px) {
          .vrd-vr-grid {
            grid-template-columns: repeat(3, 1fr);
            padding: 0 64px;
          }
        }
        .vrd-vr-card-img {
          width: 100%;
          aspect-ratio: 4 / 3;
          background: #f0ebe2;
          overflow: hidden;
          margin-bottom: 16px;
        }
        .vrd-vr-card-img img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      `}</style>

      <Nav active="viewing-room" />

      {/* 1. VRHero */}
      <VRHero
        tytul={vr.tytul_pl}
        podtytul={vr.podtytul_pl}
        hero_url={vr.hero_url}
        praca_hero={heroLite}
        data_publikacji={vr.data_publikacji}
        typ_vr={vr.typ_vr}
        badge={badge}
      />

      {/* 2. Wprowadzenie */}
      {vr.tekst_otwierajacy_pl && (
        <section className="vrd-intro" aria-label="Wprowadzenie">
          {vr.tekst_otwierajacy_pl}
        </section>
      )}

      {/* 3. Sekwencja sekcje_jsonb */}
      {vr.sekcje_jsonb && vr.sekcje_jsonb.length > 0 && (
        <section aria-label="Sekwencja kuratorska">
          <VRSequence sekcje={vr.sekcje_jsonb} prace={praceMap} />
        </section>
      )}

      {/* 4. Prace w tym Viewing Roomie */}
      {praceSorted.length > 0 && (
        <section className="vrd-prace-section" aria-label="Prace w Viewing Roomie">
          <div className="vrd-prace-section-title">Prace w Viewing Roomie</div>
          <div className="vrd-prace-grid">
            {praceSorted.map((row) => {
              const p = row.praca
              if (!p) return null
              const pracaHref = getPracaHref(p)
              const artystaHref = getArtystaHref(p.artysta)
              const imgUrl = getPracaImageUrl(toPracaLite(p))
              const cena =
                row.pokaz_cene === true
                  ? formatPrice(row.cena_w_vr ?? p.cena_oferowana)
                  : null

              return (
                <article
                  key={p.id}
                  style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
                >
                  {pracaHref ? (
                    <Link
                      href={pracaHref}
                      style={{ textDecoration: 'none', display: 'block' }}
                    >
                      <div className="vrd-praca-img">
                        {imgUrl ? (
                          <img src={imgUrl} alt={p.tytul} />
                        ) : (
                          <span className="vrd-placeholder">ESTA</span>
                        )}
                      </div>
                    </Link>
                  ) : (
                    <div className="vrd-praca-img">
                      {imgUrl ? (
                        <img src={imgUrl} alt={p.tytul} />
                      ) : (
                        <span className="vrd-placeholder">ESTA</span>
                      )}
                    </div>
                  )}

                  <div>
                    {p.artysta && (
                      <div
                        style={{
                          fontFamily: I,
                          fontSize: '11px',
                          letterSpacing: '0.16em',
                          textTransform: 'uppercase',
                          color: '#555',
                          marginBottom: '8px',
                        }}
                      >
                        {artystaHref ? (
                          <Link href={artystaHref} style={{ color: '#555' }}>
                            {p.artysta.nazwisko_i_imie}
                          </Link>
                        ) : (
                          p.artysta.nazwisko_i_imie
                        )}
                      </div>
                    )}

                    <div
                      style={{
                        fontFamily: C,
                        fontStyle: 'italic',
                        fontSize: '22px',
                        lineHeight: 1.25,
                        color: '#11110f',
                      }}
                    >
                      {pracaHref ? (
                        <Link
                          href={pracaHref}
                          style={{ color: 'inherit', textDecoration: 'none' }}
                        >
                          {p.tytul}
                          {p.rok ? `, ${p.rok}` : ''}
                        </Link>
                      ) : (
                        <>
                          {p.tytul}
                          {p.rok ? `, ${p.rok}` : ''}
                        </>
                      )}
                    </div>

                    {(p.technika || p.wymiary_pracy) && (
                      <div
                        style={{
                          fontFamily: I,
                          fontSize: '13px',
                          color: '#777',
                          marginTop: '8px',
                          lineHeight: 1.5,
                        }}
                      >
                        {[p.technika, p.wymiary_pracy].filter(Boolean).join(' · ')}
                      </div>
                    )}

                    {cena && (
                      <div
                        style={{
                          fontFamily: I,
                          fontSize: '13px',
                          color: '#222',
                          marginTop: '8px',
                        }}
                      >
                        {cena}
                      </div>
                    )}

                    {row.kontekst_w_vr_pl && (
                      <div
                        style={{
                          fontFamily: C,
                          fontStyle: 'italic',
                          fontSize: '16px',
                          lineHeight: 1.6,
                          color: '#555',
                          marginTop: '16px',
                        }}
                      >
                        {row.kontekst_w_vr_pl}
                      </div>
                    )}

                    <a
                      href={`mailto:galeria@galeria-esta.pl?subject=${encodeURIComponent(
                        `Zapytanie o pracę: ${p.tytul}${
                          p.rok ? `, ${p.rok}` : ''
                        } (Viewing Room: ${vr.tytul_pl ?? ''})`
                      )}`}
                      style={{
                        display: 'inline-block',
                        marginTop: '20px',
                        fontFamily: I,
                        fontSize: '11px',
                        letterSpacing: '0.14em',
                        textTransform: 'uppercase',
                        color: '#11110f',
                        textDecoration: 'none',
                        borderBottom: '1px solid #11110f',
                        paddingBottom: '2px',
                      }}
                    >
                      Zapytaj o pracę →
                    </a>
                  </div>
                </article>
              )
            })}
          </div>
        </section>
      )}

      {/* 5a. Spotkanie artystów (jeśli viewing_room_artysci ma dane) */}
      {artysciVR.length > 0 && (
        <section
          style={{
            padding: '96px 32px',
            borderTop: '1px solid #f0ebe2',
            background: '#fbfaf8',
            maxWidth: '960px',
            margin: '0 auto',
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
              textAlign: 'center',
            }}
          >
            W tym Viewing Roomie spotykają się
          </div>
          <ul
            className="vrd-artysci-list"
            style={{
              listStyle: 'none',
              padding: 0,
              margin: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
              textAlign: 'center',
              fontFamily: C,
            }}
          >
            {artysciVR.map((row, idx) => {
              const a = row.artysta
              if (!a) return null
              const href = getArtystaHref(a)
              return (
                <li key={`${a.id}-${idx}`}>
                  <span
                    style={{
                      fontStyle: 'italic',
                      fontSize: 'clamp(20px, 1.8vw, 24px)',
                      color: '#11110f',
                    }}
                  >
                    {href ? (
                      <Link href={href}>{a.nazwisko_i_imie}</Link>
                    ) : (
                      a.nazwisko_i_imie
                    )}
                  </span>
                  {row.rola_w_vr && (
                    <span
                      style={{
                        fontFamily: I,
                        fontSize: '12px',
                        letterSpacing: '0.16em',
                        textTransform: 'uppercase',
                        color: '#888',
                        marginLeft: '12px',
                      }}
                    >
                      {row.rola_w_vr}
                    </span>
                  )}
                </li>
              )
            })}
          </ul>
        </section>
      )}

      {/* 6. Powiązane Viewing Roomy */}
      {vrPowiazane.length > 0 && (
        <section
          style={{
            padding: '96px 0',
            borderTop: '1px solid #f0ebe2',
            background: '#fbfaf8',
          }}
        >
          <div
            style={{
              fontFamily: I,
              fontSize: '11px',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: '#888',
              textAlign: 'center',
              marginBottom: '48px',
            }}
          >
            Powiązane Viewing Roomy
          </div>
          <div className="vrd-vr-grid">
            {vrPowiazane.map((rvr) => (
              <article key={rvr.id}>
                <Link
                  href={`/viewing-room/${rvr.slug}`}
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <div className="vrd-vr-card-img">
                    {rvr.hero_url ? (
                      <img src={rvr.hero_url} alt={rvr.tytul_pl ?? 'VR'} />
                    ) : (
                      <div
                        style={{
                          width: '100%',
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <span className="vrd-placeholder">VR</span>
                      </div>
                    )}
                  </div>
                  <h3
                    style={{
                      fontFamily: C,
                      fontWeight: 400,
                      fontSize: '22px',
                      lineHeight: 1.2,
                      color: '#11110f',
                      margin: 0,
                      marginBottom: '8px',
                    }}
                  >
                    {rvr.tytul_pl ?? 'Bez tytułu'}
                  </h3>
                  {rvr.podtytul_pl && (
                    <p
                      style={{
                        fontFamily: I,
                        fontStyle: 'italic',
                        fontSize: '13px',
                        color: '#555',
                        margin: 0,
                      }}
                    >
                      {rvr.podtytul_pl}
                    </p>
                  )}
                </Link>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* 7. CTA "Zapytaj o prace" */}
      <section
        style={{
          padding: '96px 32px',
          textAlign: 'center',
          background: '#f7f3eb',
        }}
      >
        <p
          style={{
            fontFamily: C,
            fontStyle: 'italic',
            fontSize: 'clamp(20px, 2vw, 26px)',
            color: '#11110f',
            margin: 0,
            marginBottom: '36px',
            maxWidth: '640px',
            marginLeft: 'auto',
            marginRight: 'auto',
            lineHeight: 1.5,
          }}
        >
          Zainteresowany pracami z tego Viewing Roomu?
        </p>
        <a
          href={`mailto:galeria@galeria-esta.pl?subject=${encodeURIComponent(
            `Zapytanie o Viewing Room: ${vr.tytul_pl ?? vr.slug}`
          )}`}
          style={{
            display: 'inline-block',
            fontFamily: I,
            fontSize: '12px',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: '#11110f',
            textDecoration: 'none',
            border: '1px solid #11110f',
            padding: '16px 36px',
          }}
        >
          Zapytaj o prace →
        </a>

        {/* Pokaż pojęcia podprogowo, w stopce sekcji */}
        {pojecia.length > 0 && (
          <div
            style={{
              marginTop: '64px',
              fontFamily: I,
              fontSize: '11px',
              letterSpacing: '0.04em',
              color: '#888',
            }}
          >
            {pojecia.map((p, i) => (
              <span key={p.id}>
                <Link
                  href={`/kolekcja?tag=${encodeURIComponent(p.slug)}`}
                  style={{
                    color: '#555',
                    textDecoration: 'none',
                    borderBottom: '1px solid transparent',
                  }}
                >
                  {p.nazwa}
                </Link>
                {i < pojecia.length - 1 && (
                  <span style={{ color: '#ccc', margin: '0 8px' }}>·</span>
                )}
              </span>
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
