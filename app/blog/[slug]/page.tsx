import Link from 'next/link'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Nav from '@/components/Nav'
import { workSlug, artistSlug } from '@/lib/slug'

export const revalidate = 60

const C = '"Cormorant Garamond", Georgia, serif'
const I = '"Instrument Sans", -apple-system, BlinkMacSystemFont, sans-serif'

type DbIdea = { id: string; nazwa: string | null; slug: string }
type DbPojecie = { id: string; nazwa: string; slug: string }

type DbArtysta = {
  id: string
  nazwisko_i_imie: string
  url_artysty: string | null
  idea_glowna?: DbIdea | null
}

type DbPraca = {
  id: string
  id_pracy: string | null
  tytul: string
  rok: number | null
  technika: string | null
  wymiary_pracy: string | null
  artysta?: DbArtysta | null
}

type DbWystawa = {
  id: string
  tytul: string | null
  url_wystawy: string | null
  data_od: string | null
  data_do: string | null
}

type DbVR = {
  id: string
  slug: string
  tytul_pl: string | null
  podtytul_pl: string | null
  status_publiczny: string | null
}

type DbZdjecie = {
  id: string
  url: string | null
  alt: string | null
  podpis: string | null
  kolejnosc: number | null
}

type DbArtykul = {
  id: string
  slug: string
  tytul: string | null
  tresc: string | null
  opis_krotki: string | null
  img_cover: string | null
  img_alt: string | null
  data_publikacji: string | null
  created_at: string
  status_publiczny: string
  kategoria: string | null
  autor: string | null
  typ_artykulu: string | null
  tagi: string | null
  czas_czytania_min: number | null
  artysta: DbArtysta | null
  wystawa: DbWystawa | null
  praca: DbPraca | null
  viewing_room: DbVR | null
  zdjecia: DbZdjecie[] | null
  pojecia: { pojecie: DbPojecie | null }[] | null
  artysci_powiazani:
    | { rola: string | null; kolejnosc: number | null; artysta: DbArtysta | null }[]
    | null
  prace_powiazane:
    | { kontekst: string | null; kolejnosc: number | null; praca: DbPraca | null }[]
    | null
  vr_powiazane: { vr: DbVR | null }[] | null
}

function formatPolishDate(iso: string | null): string {
  if (!iso) return ''
  try {
    return new Date(iso).toLocaleDateString('pl-PL', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  } catch {
    return ''
  }
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

function getPracaHref(p: DbPraca | null | undefined): string | null {
  if (!p) return null
  const s = workSlug({
    artysta_nazwa: p.artysta?.nazwisko_i_imie ?? null,
    tytul: p.tytul,
    rok: p.rok,
  })
  return s ? `/praca/${s}` : null
}

function getWystawaHref(w: DbWystawa | null): string | null {
  if (!w?.url_wystawy) return null
  return `/wystawa/${w.url_wystawy}`
}

function getVRHref(vr: DbVR | null | undefined): string | null {
  if (!vr?.slug) return null
  return `/viewing-room/${vr.slug}`
}

function getPracaImageUrl(p: DbPraca | null | undefined): string | null {
  if (!p?.id_pracy) return null
  return `https://galeria-esta.pl/viewing-room/images/prace/${p.id_pracy}.jpg`
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const { data } = await supabase
    .from('artykuly')
    .select('tytul, opis_krotki, img_cover')
    .eq('slug', slug)
    .in('status_publiczny', ['opublikowany', 'archiwalny'])
    .maybeSingle()

  if (!data) return { title: 'Notatka — Galeria ESTA' }

  return {
    title: `${data.tytul ?? 'Notatka'} — Galeria ESTA`,
    description: data.opis_krotki ?? undefined,
    openGraph: {
      title: data.tytul ?? 'Notatka',
      description: data.opis_krotki ?? undefined,
      images: data.img_cover ? [data.img_cover] : undefined,
    },
  }
}

export default async function BlogDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const { data, error } = await supabase
    .from('artykuly')
    .select(
      `
      *,
      artysta:artysci!artykuly_artysta_id_fkey(id, nazwisko_i_imie, url_artysty, idea_glowna:idee(id, nazwa, slug)),
      wystawa:wystawy!artykuly_wystawa_id_fkey(id, tytul, url_wystawy, data_od, data_do),
      praca:prace!artykuly_praca_id_fkey(id, id_pracy, tytul, rok, technika, wymiary_pracy, artysta:artysci(id, nazwisko_i_imie, url_artysty)),
      viewing_room!artykuly_viewing_room_id_fkey(id, slug, tytul_pl, podtytul_pl, status_publiczny),
      zdjecia:artykuly_zdjecia(id, url, alt, podpis, kolejnosc),
      pojecia:pojecia_artykuly(pojecie:pojecia(id, nazwa, slug)),
      artysci_powiazani:artykuly_artysci(rola, kolejnosc, artysta:artysci(id, nazwisko_i_imie, url_artysty)),
      prace_powiazane:artykuly_prace(kontekst, kolejnosc, praca:prace(id, id_pracy, tytul, rok, artysta:artysci(id, nazwisko_i_imie, url_artysty))),
      vr_powiazane:artykuly_viewing_room(vr:viewing_room(id, slug, tytul_pl, podtytul_pl, status_publiczny))
    `
    )
    .eq('slug', slug)
    .in('status_publiczny', ['opublikowany', 'archiwalny'])
    .maybeSingle()

  if (error || !data) notFound()

  const artykul = data as unknown as DbArtykul

  const zdjecia = (artykul.zdjecia ?? [])
    .filter((z) => Boolean(z.url))
    .sort((a, b) => (a.kolejnosc ?? 0) - (b.kolejnosc ?? 0))

  const pojecia = (artykul.pojecia ?? [])
    .map((p) => p.pojecie)
    .filter((p): p is DbPojecie => Boolean(p))

  const artysciPowiazani = (artykul.artysci_powiazani ?? [])
    .filter((x) => Boolean(x.artysta))
    .sort((a, b) => (a.kolejnosc ?? 0) - (b.kolejnosc ?? 0))

  const pracePowiazane = (artykul.prace_powiazane ?? [])
    .filter((x) => Boolean(x.praca))
    .sort((a, b) => (a.kolejnosc ?? 0) - (b.kolejnosc ?? 0))

  const vrPowiazane = (artykul.vr_powiazane ?? [])
    .map((x) => x.vr)
    .filter((vr): vr is DbVR => Boolean(vr))

  const dataPL = formatPolishDate(
    artykul.data_publikacji ?? artykul.created_at
  )
  const kategoria = artykul.kategoria ?? artykul.typ_artykulu

  const hasPowiazania =
    Boolean(artykul.artysta) ||
    artysciPowiazani.length > 0 ||
    Boolean(artykul.praca) ||
    pracePowiazane.length > 0 ||
    Boolean(artykul.wystawa) ||
    Boolean(artykul.viewing_room) ||
    vrPowiazane.length > 0

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

        .blog-detail-hero {
          width: 100%;
          aspect-ratio: 16 / 9;
          background: #f0ebe2;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-top: 54px;
        }
        .blog-detail-hero img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .blog-detail-hero-placeholder {
          font-family: ${C};
          font-style: italic;
          font-size: 32px;
          letter-spacing: 0.18em;
          color: #b8aa92;
        }

        .blog-detail-article {
          max-width: 760px;
          margin: 0 auto;
          padding: 80px 32px;
        }
        @media (min-width: 900px) {
          .blog-detail-article { padding: 120px 32px; }
        }

        .blog-detail-meta {
          font-family: ${I};
          font-size: 12px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #888;
          text-align: center;
          margin-bottom: 28px;
        }

        .blog-detail-title {
          font-family: ${C};
          font-style: italic;
          font-weight: 300;
          font-size: clamp(40px, 6vw, 72px);
          line-height: 1.05;
          letter-spacing: -0.01em;
          color: #11110f;
          margin: 0 0 36px;
          text-align: center;
        }

        .blog-detail-opis {
          font-family: ${C};
          font-style: italic;
          font-size: clamp(18px, 1.8vw, 22px);
          line-height: 1.5;
          color: #555;
          max-width: 660px;
          margin: 0 auto 56px;
          text-align: center;
          padding-bottom: 36px;
          border-bottom: 1px solid #e7e0d7;
        }

        .blog-detail-tresc {
          font-family: ${C};
          font-size: 18px;
          line-height: 1.75;
          color: #222;
          max-width: 720px;
          margin: 0 auto;
        }
        .blog-detail-tresc p { margin: 0 0 1.4em; }
        .blog-detail-tresc h2 {
          font-family: ${C};
          font-weight: 400;
          font-size: 28px;
          line-height: 1.2;
          margin: 1.6em 0 0.6em;
          color: #11110f;
        }
        .blog-detail-tresc h3 {
          font-family: ${C};
          font-weight: 400;
          font-style: italic;
          font-size: 22px;
          margin: 1.4em 0 0.5em;
          color: #222;
        }
        .blog-detail-tresc blockquote {
          font-style: italic;
          color: #555;
          border-left: 2px solid #c8b899;
          padding: 4px 0 4px 24px;
          margin: 1.4em 0;
        }
        .blog-detail-tresc a {
          color: #11110f;
          border-bottom: 1px solid #888;
        }
        .blog-detail-tresc a:hover { border-color: #11110f; }
        .blog-detail-tresc img {
          max-width: 100%;
          height: auto;
          margin: 1.4em auto;
          display: block;
        }

        .blog-detail-zdjecia {
          display: grid;
          grid-template-columns: 1fr;
          gap: 40px;
          margin: 72px auto 0;
          max-width: 1000px;
        }
        @media (min-width: 700px) {
          .blog-detail-zdjecia { grid-template-columns: 1fr 1fr; gap: 48px; }
        }
        .blog-detail-zdjecie-img {
          width: 100%;
          background: #f0ebe2;
          overflow: hidden;
        }
        .blog-detail-zdjecie-img img {
          display: block;
          width: 100%;
          height: auto;
        }
        .blog-detail-zdjecie-podpis {
          font-family: ${I};
          font-size: 12px;
          line-height: 1.5;
          color: #777;
          margin-top: 10px;
        }

        .blog-detail-pojecia {
          margin: 64px auto 0;
          max-width: 720px;
          padding: 28px 0 0;
          border-top: 1px solid #e7e0d7;
          font-family: ${I};
          font-size: 13px;
          color: #888;
          text-align: center;
        }
        .blog-detail-pojecia-label {
          display: block;
          font-size: 11px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          margin-bottom: 14px;
        }
        .blog-detail-pojecia a {
          color: #555;
          text-decoration: none;
          border-bottom: 1px solid transparent;
          transition: color .15s, border-color .15s;
        }
        .blog-detail-pojecia a:hover {
          color: #11110f;
          border-bottom-color: #11110f;
        }
        .blog-detail-pojecia .sep { color: #ccc; margin: 0 8px; }

        .blog-detail-powiazania {
          max-width: 760px;
          margin: 0 auto;
          padding: 80px 32px 120px;
        }
        .pw-section { margin-bottom: 48px; }
        .pw-section:last-child { margin-bottom: 0; }
        .pw-label {
          font-family: ${I};
          font-size: 11px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #888;
          margin-bottom: 12px;
        }
        .pw-content {
          font-family: ${C};
          font-style: italic;
          font-size: 22px;
          color: #11110f;
          line-height: 1.4;
        }
        .pw-content a {
          color: inherit;
          text-decoration: none;
          border-bottom: 1px solid transparent;
          transition: color .15s, border-color .15s;
        }
        .pw-content a:hover {
          color: #11110f;
          border-bottom-color: #11110f;
        }
        .pw-line-program {
          margin-top: 8px;
          font-family: ${I};
          font-size: 13px;
          color: #777;
        }
        .pw-line-program a {
          color: #555;
          text-decoration: none;
          border-bottom: 1px solid transparent;
          transition: color .15s, border-color .15s;
        }
        .pw-line-program a:hover {
          color: #11110f;
          border-bottom-color: #11110f;
        }
        .pw-praca-card {
          margin-top: 12px;
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
        }
        @media (min-width: 700px) {
          .pw-praca-card { grid-template-columns: 200px 1fr; }
        }
        .pw-praca-img {
          width: 100%;
          aspect-ratio: 4 / 4.85;
          background: #f0ebe2;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .pw-praca-img img {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
        }
        .pw-praca-placeholder {
          font-family: ${C};
          font-style: italic;
          font-size: 14px;
          letter-spacing: 0.18em;
          color: #b8aa92;
        }
        .pw-list {
          font-family: ${I};
          font-size: 15px;
          line-height: 1.8;
          color: #444;
        }
        .pw-list a {
          color: #11110f;
          text-decoration: none;
          border-bottom: 1px solid transparent;
          transition: border-color .15s;
        }
        .pw-list a:hover { border-bottom-color: #11110f; }
        .pw-list .sep { color: #ccc; margin: 0 8px; }
      `}</style>

      <Nav active="blog" />

      {/* HERO COVER */}
      {artykul.img_cover && (
        <div className="blog-detail-hero">
          <img
            src={artykul.img_cover}
            alt={artykul.img_alt ?? artykul.tytul ?? 'Galeria ESTA'}
          />
        </div>
      )}

      {/* ARTYKUŁ — metadane + tytuł + opis + treść + zdjęcia + pojęcia */}
      <article className="blog-detail-article">
        {/* Metadane centrowane */}
        <div className="blog-detail-meta">
          {[
            dataPL,
            kategoria,
            artykul.autor,
            artykul.czas_czytania_min
              ? `${artykul.czas_czytania_min} min czytania`
              : null,
          ]
            .filter(Boolean)
            .join(' · ')}
        </div>

        {/* Tytuł */}
        <h1 className="blog-detail-title">{artykul.tytul ?? 'Bez tytułu'}</h1>

        {/* Opis krótki */}
        {artykul.opis_krotki && (
          <p className="blog-detail-opis">{artykul.opis_krotki}</p>
        )}

        {/* Treść (HTML) */}
        {artykul.tresc && (
          <div
            className="blog-detail-tresc"
            dangerouslySetInnerHTML={{ __html: artykul.tresc }}
          />
        )}

        {/* Galeria zdjęć */}
        {zdjecia.length > 0 && (
          <div className="blog-detail-zdjecia">
            {zdjecia.map((z) => (
              <figure key={z.id} style={{ margin: 0 }}>
                <div className="blog-detail-zdjecie-img">
                  <img
                    src={z.url ?? ''}
                    alt={z.alt ?? artykul.tytul ?? 'Galeria ESTA'}
                  />
                </div>
                {z.podpis && (
                  <figcaption className="blog-detail-zdjecie-podpis">
                    {z.podpis}
                  </figcaption>
                )}
              </figure>
            ))}
          </div>
        )}

        {/* Pojęcia klikalne */}
        {pojecia.length > 0 && (
          <div className="blog-detail-pojecia">
            <span className="blog-detail-pojecia-label">Pojęcia obecne</span>
            {pojecia.map((p, i) => (
              <span key={p.id}>
                <Link href={`/blog?tag=${encodeURIComponent(p.slug)}`}>
                  {p.nazwa}
                </Link>
                {i < pojecia.length - 1 && (
                  <span className="sep" aria-hidden="true">·</span>
                )}
              </span>
            ))}
          </div>
        )}
      </article>

      {/* POWIĄZANIA */}
      {hasPowiazania && (
        <section
          className="blog-detail-powiazania"
          aria-label="Powiązania"
          style={{ borderTop: '1px solid #e7e0d7' }}
        >
          {/* a) Artysta główny + linia programowa */}
          {artykul.artysta && (
            <div className="pw-section">
              <div className="pw-label">Artysta</div>
              <div className="pw-content">
                {getArtystaHref(artykul.artysta) ? (
                  <Link href={getArtystaHref(artykul.artysta) as string}>
                    {artykul.artysta.nazwisko_i_imie}
                  </Link>
                ) : (
                  artykul.artysta.nazwisko_i_imie
                )}
              </div>
              {artykul.artysta.idea_glowna?.nazwa && (
                <div className="pw-line-program">
                  <Link
                    href={`/idee/${artykul.artysta.idea_glowna.slug}`}
                    style={{ fontStyle: 'italic' }}
                  >
                    {artykul.artysta.idea_glowna.nazwa}
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* b) Artyści powiązani (M:N) */}
          {artysciPowiazani.length > 0 && (
            <div className="pw-section">
              <div className="pw-label">Artyści wspomniani</div>
              <div className="pw-list">
                {artysciPowiazani.map((row, i) => {
                  const a = row.artysta
                  if (!a) return null
                  const href = getArtystaHref(a)
                  return (
                    <span key={a.id}>
                      {href ? (
                        <Link href={href}>{a.nazwisko_i_imie}</Link>
                      ) : (
                        a.nazwisko_i_imie
                      )}
                      {row.rola && (
                        <span style={{ color: '#888', fontSize: '13px' }}>
                          {' '}
                          ({row.rola})
                        </span>
                      )}
                      {i < artysciPowiazani.length - 1 && (
                        <span className="sep" aria-hidden="true">·</span>
                      )}
                    </span>
                  )
                })}
              </div>
            </div>
          )}

          {/* c) Praca główna (uproszczona karta) */}
          {artykul.praca && (
            <div className="pw-section">
              <div className="pw-label">Praca</div>
              <div className="pw-praca-card">
                <div className="pw-praca-img">
                  {getPracaImageUrl(artykul.praca) ? (
                    <img
                      src={getPracaImageUrl(artykul.praca) as string}
                      alt={artykul.praca.tytul ?? 'Praca'}
                    />
                  ) : (
                    <span className="pw-praca-placeholder">ESTA</span>
                  )}
                </div>
                <div>
                  <div className="pw-content">
                    {getPracaHref(artykul.praca) ? (
                      <Link href={getPracaHref(artykul.praca) as string}>
                        <span style={{ fontStyle: 'italic' }}>
                          {artykul.praca.tytul}
                        </span>
                        {artykul.praca.rok ? `, ${artykul.praca.rok}` : ''}
                      </Link>
                    ) : (
                      <>
                        <span style={{ fontStyle: 'italic' }}>
                          {artykul.praca.tytul}
                        </span>
                        {artykul.praca.rok ? `, ${artykul.praca.rok}` : ''}
                      </>
                    )}
                  </div>
                  {artykul.praca.artysta && (
                    <div className="pw-line-program">
                      {getArtystaHref(artykul.praca.artysta) ? (
                        <Link href={getArtystaHref(artykul.praca.artysta) as string}>
                          {artykul.praca.artysta.nazwisko_i_imie}
                        </Link>
                      ) : (
                        artykul.praca.artysta.nazwisko_i_imie
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* d) Prace wspomniane (M:N) */}
          {pracePowiazane.length > 0 && (
            <div className="pw-section">
              <div className="pw-label">Prace wspomniane</div>
              <div className="pw-list">
                {pracePowiazane.map((row, i) => {
                  const p = row.praca
                  if (!p) return null
                  const href = getPracaHref(p)
                  const artystaNazwa = p.artysta?.nazwisko_i_imie ?? ''
                  return (
                    <span key={p.id}>
                      {href ? (
                        <Link href={href}>
                          {artystaNazwa && `${artystaNazwa} — `}
                          <span style={{ fontStyle: 'italic' }}>{p.tytul}</span>
                          {p.rok ? `, ${p.rok}` : ''}
                        </Link>
                      ) : (
                        <>
                          {artystaNazwa && `${artystaNazwa} — `}
                          <span style={{ fontStyle: 'italic' }}>{p.tytul}</span>
                          {p.rok ? `, ${p.rok}` : ''}
                        </>
                      )}
                      {i < pracePowiazane.length - 1 && (
                        <span className="sep" aria-hidden="true">·</span>
                      )}
                    </span>
                  )
                })}
              </div>
            </div>
          )}

          {/* e) Wystawa */}
          {artykul.wystawa && (
            <div className="pw-section">
              <div className="pw-label">W kontekście wystawy</div>
              <div className="pw-content">
                {getWystawaHref(artykul.wystawa) ? (
                  <Link href={getWystawaHref(artykul.wystawa) as string}>
                    {artykul.wystawa.tytul}
                  </Link>
                ) : (
                  artykul.wystawa.tytul
                )}
              </div>
              {(artykul.wystawa.data_od || artykul.wystawa.data_do) && (
                <div className="pw-line-program">
                  {[
                    formatPolishDate(artykul.wystawa.data_od),
                    formatPolishDate(artykul.wystawa.data_do),
                  ]
                    .filter(Boolean)
                    .join(' – ')}
                </div>
              )}
            </div>
          )}

          {/* f) Viewing Room główny (FK) */}
          {artykul.viewing_room && (
            <div className="pw-section">
              <div className="pw-label">Viewing Room rozwijający temat</div>
              <div className="pw-content">
                {getVRHref(artykul.viewing_room) ? (
                  <Link href={getVRHref(artykul.viewing_room) as string}>
                    {artykul.viewing_room.tytul_pl}
                  </Link>
                ) : (
                  artykul.viewing_room.tytul_pl
                )}
              </div>
              {artykul.viewing_room.podtytul_pl && (
                <div className="pw-line-program">
                  {artykul.viewing_room.podtytul_pl}
                </div>
              )}
            </div>
          )}

          {/* g) VR powiązane (M:N) */}
          {vrPowiazane.length > 0 && (
            <div className="pw-section">
              <div className="pw-label">Powiązane Viewing Roomy</div>
              <div className="pw-list">
                {vrPowiazane.map((vr, i) => {
                  const href = getVRHref(vr)
                  return (
                    <span key={vr.id}>
                      {href ? (
                        <Link href={href}>{vr.tytul_pl}</Link>
                      ) : (
                        vr.tytul_pl
                      )}
                      {i < vrPowiazane.length - 1 && (
                        <span className="sep" aria-hidden="true">·</span>
                      )}
                    </span>
                  )
                })}
              </div>
            </div>
          )}
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
