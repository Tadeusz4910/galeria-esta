import Link from 'next/link'
import type { Metadata } from 'next'
import { supabase } from '@/lib/supabase'
import Nav from '@/components/Nav'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'Notatki galerii — Galeria ESTA',
  description:
    'Notatki, odkrycia, refleksje z 28 lat pracy Galerii ESTA. Zapis spotkań z artystami, wystawami i ideami.',
  openGraph: {
    title: 'Notatki galerii — Galeria ESTA',
    description:
      'Notatki, odkrycia, refleksje z 28 lat pracy Galerii ESTA.',
  },
  robots: 'index, follow',
}

const C = '"Cormorant Garamond", Georgia, serif'
const I = '"Instrument Sans", -apple-system, BlinkMacSystemFont, sans-serif'

type DbArtysta = {
  id: string
  nazwisko_i_imie: string
  url_artysty: string | null
}

type DbPojecie = {
  id: string
  nazwa: string
  slug: string
}

type DbArtykul = {
  id: string
  slug: string
  tytul: string | null
  opis_krotki: string | null
  img_cover: string | null
  img_alt: string | null
  pokaz_na_home: boolean | null
  wyrozniony: boolean | null
  priorytet: number | null
  typ_artykulu: string | null
  kategoria: string | null
  autor: string | null
  tagi: string | null
  data_publikacji: string | null
  created_at: string
  artysta: DbArtysta | null
  pojecia: { pojecie: DbPojecie | null }[] | null
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

function getPojecia(a: DbArtykul): DbPojecie[] {
  return (a.pojecia ?? [])
    .map((p) => p.pojecie)
    .filter((p): p is DbPojecie => Boolean(p))
}

function parseTagi(tagi: string | null): string[] {
  if (!tagi) return []
  return tagi
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean)
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string }>
}) {
  const params = await searchParams
  const aktywnyTag = params.tag?.trim().toLowerCase() || null

  const { data, error } = await supabase
    .from('artykuly')
    .select(
      `
      id, slug, tytul, opis_krotki, img_cover, img_alt,
      pokaz_na_home, wyrozniony, priorytet, typ_artykulu,
      kategoria, autor, tagi, data_publikacji, created_at,
      artysta:artysci!artykuly_artysta_id_fkey(id, nazwisko_i_imie, url_artysty),
      pojecia:artykuly_pojecia(pojecie:pojecia(id, nazwa, slug))
    `
    )
    .eq('status_publiczny', 'opublikowany')
    .order('pokaz_na_home', { ascending: false })
    .order('wyrozniony', { ascending: false })
    .order('priorytet', { ascending: false, nullsFirst: false })
    .order('data_publikacji', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })

  const all = (data ?? []) as unknown as DbArtykul[]

  const filtered = aktywnyTag
    ? all.filter((a) => {
        const fromPojecia = getPojecia(a).some(
          (p) =>
            p.slug.toLowerCase() === aktywnyTag ||
            p.nazwa.toLowerCase() === aktywnyTag
        )
        const fromTagi = parseTagi(a.tagi).some(
          (t) => t.toLowerCase() === aktywnyTag
        )
        return fromPojecia || fromTagi
      })
    : all

  const featured =
    filtered.find((a) => a.pokaz_na_home === true) ?? null
  const rest = featured
    ? filtered.filter((a) => a.id !== featured.id)
    : filtered

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

        .blog-hero {
          padding: 120px 32px 80px;
          max-width: 1200px;
          margin: 0 auto;
          border-bottom: 1px solid #e7e0d7;
        }
        @media (min-width: 900px) {
          .blog-hero { padding: 140px 64px 100px; }
        }

        .blog-featured {
          display: grid;
          grid-template-columns: 1fr;
          gap: 32px;
          padding: 80px 32px;
          max-width: 1280px;
          margin: 0 auto;
          border-bottom: 1px solid #f0ebe2;
        }
        @media (min-width: 900px) {
          .blog-featured {
            grid-template-columns: 6fr 4fr;
            gap: 64px;
            padding: 96px 64px;
            align-items: center;
          }
        }
        .blog-featured-img {
          width: 100%;
          aspect-ratio: 16 / 10;
          background: #f0ebe2;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .blog-featured-img img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .blog-placeholder {
          font-family: ${C};
          font-style: italic;
          font-size: 26px;
          letter-spacing: 0.18em;
          color: #b8aa92;
        }

        .blog-grid {
          display: grid;
          grid-template-columns: 1fr;
          column-gap: 48px;
          row-gap: 64px;
          padding: 80px 32px 120px;
          max-width: 1280px;
          margin: 0 auto;
        }
        @media (min-width: 700px) {
          .blog-grid {
            grid-template-columns: repeat(2, 1fr);
            row-gap: 72px;
          }
        }
        @media (min-width: 1100px) {
          .blog-grid {
            column-gap: 56px;
            padding: 96px 64px 160px;
          }
        }

        .blog-card-img {
          width: 100%;
          aspect-ratio: 4 / 3;
          background: #f0ebe2;
          overflow: hidden;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .blog-card-img img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform .5s ease;
        }
        .blog-card:hover .blog-card-img img {
          transform: scale(1.03);
        }

        .blog-pojecia a {
          color: #888;
          text-decoration: none;
          border-bottom: 1px solid transparent;
          transition: color .15s, border-color .15s;
        }
        .blog-pojecia a:hover {
          color: #11110f;
          border-bottom-color: #11110f;
        }
        .blog-pojecia .sep {
          color: #ccc;
          margin: 0 6px;
        }
      `}</style>

      <Nav active="blog" />

      {/* HERO */}
      <section className="blog-hero" aria-label="Notatki galerii — wprowadzenie">
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
          Notatki galerii
        </div>

        <h1
          style={{
            fontFamily: C,
            fontStyle: 'italic',
            fontWeight: 300,
            fontSize: 'clamp(48px, 7vw, 88px)',
            lineHeight: 1.0,
            letterSpacing: '-0.01em',
            margin: 0,
            marginBottom: '36px',
            color: '#11110f',
          }}
        >
          Notatki galerii
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
          Notatki, odkrycia, refleksje z 28 lat pracy Galerii ESTA.
          Zapis spotkań z artystami, wystawami i ideami.
        </p>

        {aktywnyTag && (
          <div
            style={{
              marginTop: '36px',
              fontFamily: I,
              fontSize: '12px',
              color: '#555',
            }}
          >
            Filtr: pojęcie „{aktywnyTag}" ·{' '}
            <Link
              href="/blog"
              style={{
                color: '#222',
                borderBottom: '1px solid #222',
                textDecoration: 'none',
              }}
            >
              wyczyść
            </Link>
          </div>
        )}
      </section>

      {/* ERROR STATE */}
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
          Wystąpił błąd podczas wczytywania artykułów. Spróbuj odświeżyć stronę.
        </div>
      )}

      {/* EMPTY STATE */}
      {!error && filtered.length === 0 && (
        <div
          style={{
            fontFamily: C,
            fontStyle: 'italic',
            fontSize: '22px',
            color: '#666',
            textAlign: 'center',
            padding: '160px 32px',
            maxWidth: '640px',
            margin: '0 auto',
            lineHeight: 1.5,
          }}
        >
          {aktywnyTag
            ? `Brak notatek z pojęciem „${aktywnyTag}".`
            : 'Pierwsza notatka pojawi się wkrótce. Galeria ESTA dokumentuje swoje spotkania z artystami, wystawami i ideami.'}
        </div>
      )}

      {/* WYROZNIONY ARTYKUL (60/40 @900px+) */}
      {featured && (
        <section className="blog-featured" aria-label="Wyróżniona notatka">
          <Link
            href={`/blog/${featured.slug}`}
            style={{ textDecoration: 'none', display: 'block' }}
          >
            <div className="blog-featured-img">
              {featured.img_cover ? (
                <img
                  src={featured.img_cover}
                  alt={featured.img_alt ?? featured.tytul ?? 'Galeria ESTA'}
                />
              ) : (
                <span className="blog-placeholder">ESTA</span>
              )}
            </div>
          </Link>

          <div>
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
              {[
                formatPolishDate(
                  featured.data_publikacji ?? featured.created_at
                ),
                featured.kategoria ?? featured.typ_artykulu,
              ]
                .filter(Boolean)
                .join(' · ')}
            </div>

            <h2
              style={{
                fontFamily: C,
                fontWeight: 300,
                fontSize: 'clamp(32px, 3.5vw, 44px)',
                lineHeight: 1.15,
                color: '#11110f',
                margin: 0,
                marginBottom: '20px',
              }}
            >
              <Link
                href={`/blog/${featured.slug}`}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                {featured.tytul ?? 'Bez tytułu'}
              </Link>
            </h2>

            {featured.opis_krotki && (
              <p
                style={{
                  fontFamily: I,
                  fontSize: '16px',
                  lineHeight: 1.7,
                  color: '#555',
                  margin: 0,
                  marginBottom: '24px',
                }}
              >
                {featured.opis_krotki}
              </p>
            )}

            <FeaturedPojecia artykul={featured} />

            <Link
              href={`/blog/${featured.slug}`}
              style={{
                display: 'inline-block',
                marginTop: '28px',
                fontFamily: I,
                fontSize: '12px',
                color: '#11110f',
                textDecoration: 'none',
                borderBottom: '1px solid #11110f',
                paddingBottom: '2px',
              }}
            >
              Czytaj dalej →
            </Link>
          </div>
        </section>
      )}

      {/* GRID LISTA (pozostałe) */}
      {rest.length > 0 && (
        <section
          className="blog-grid"
          aria-label="Lista notatek chronologicznie"
        >
          {rest.map((a) => (
            <BlogCard key={a.id} artykul={a} />
          ))}
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

function FeaturedPojecia({ artykul }: { artykul: DbArtykul }) {
  const pojecia = getPojecia(artykul).slice(0, 4)
  const tagiFallback = parseTagi(artykul.tagi).slice(0, 4)
  if (pojecia.length === 0 && tagiFallback.length === 0) return null

  return (
    <div
      className="blog-pojecia"
      style={{
        fontFamily: I,
        fontSize: '12px',
        letterSpacing: '0.04em',
        color: '#888',
      }}
    >
      {pojecia.length > 0
        ? pojecia.map((p, i) => (
            <span key={p.id}>
              <Link href={`/blog?tag=${encodeURIComponent(p.slug)}`}>
                {p.nazwa}
              </Link>
              {i < pojecia.length - 1 && (
                <span className="sep" aria-hidden="true">·</span>
              )}
            </span>
          ))
        : tagiFallback.map((t, i) => (
            <span key={t}>
              <Link href={`/blog?tag=${encodeURIComponent(t.toLowerCase())}`}>
                {t}
              </Link>
              {i < tagiFallback.length - 1 && (
                <span className="sep" aria-hidden="true">·</span>
              )}
            </span>
          ))}
    </div>
  )
}

function BlogCard({ artykul }: { artykul: DbArtykul }) {
  const pojecia = getPojecia(artykul).slice(0, 3)
  const tagiFallback = parseTagi(artykul.tagi).slice(0, 3)
  const dataRaw = artykul.data_publikacji ?? artykul.created_at
  const dataPL = formatPolishDate(dataRaw)
  const kategoria = artykul.kategoria ?? artykul.typ_artykulu

  return (
    <article
      className="blog-card"
      style={{ display: 'flex', flexDirection: 'column' }}
    >
      <Link
        href={`/blog/${artykul.slug}`}
        style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
      >
        <div className="blog-card-img">
          {artykul.img_cover ? (
            <img
              src={artykul.img_cover}
              alt={artykul.img_alt ?? artykul.tytul ?? 'Galeria ESTA'}
            />
          ) : (
            <span className="blog-placeholder">ESTA</span>
          )}
        </div>
      </Link>

      <div
        style={{
          fontFamily: I,
          fontSize: '11px',
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: '#888',
          marginBottom: '12px',
        }}
      >
        {[dataPL, kategoria].filter(Boolean).join(' · ')}
      </div>

      <h3
        style={{
          fontFamily: C,
          fontWeight: 400,
          fontSize: 'clamp(22px, 2vw, 28px)',
          lineHeight: 1.2,
          color: '#11110f',
          margin: 0,
          marginBottom: '14px',
        }}
      >
        <Link
          href={`/blog/${artykul.slug}`}
          style={{ textDecoration: 'none', color: 'inherit' }}
        >
          {artykul.tytul ?? 'Bez tytułu'}
        </Link>
      </h3>

      {artykul.opis_krotki && (
        <p
          style={{
            fontFamily: I,
            fontSize: '14px',
            lineHeight: 1.6,
            color: '#555',
            margin: 0,
            marginBottom: '20px',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {artykul.opis_krotki}
        </p>
      )}

      {(pojecia.length > 0 || tagiFallback.length > 0) && (
        <div
          className="blog-pojecia"
          style={{
            fontFamily: I,
            fontSize: '11px',
            letterSpacing: '0.04em',
            color: '#888',
          }}
        >
          {pojecia.length > 0
            ? pojecia.map((p, i) => (
                <span key={p.id}>
                  <Link href={`/blog?tag=${encodeURIComponent(p.slug)}`}>
                    {p.nazwa}
                  </Link>
                  {i < pojecia.length - 1 && (
                    <span className="sep" aria-hidden="true">·</span>
                  )}
                </span>
              ))
            : tagiFallback.map((t, i) => (
                <span key={t}>
                  <Link
                    href={`/blog?tag=${encodeURIComponent(t.toLowerCase())}`}
                  >
                    {t}
                  </Link>
                  {i < tagiFallback.length - 1 && (
                    <span className="sep" aria-hidden="true">·</span>
                  )}
                </span>
              ))}
        </div>
      )}
    </article>
  )
}
