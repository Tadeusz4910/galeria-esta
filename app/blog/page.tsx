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
      pojecia:pojecia_artykuly(pojecie:pojecia(id, nazwa, slug))
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

  // Jedna jednolita lista — kolejność z sortowania zapytania (pokaz_na_home →
  // wyrozniony → priorytet → daty); parzystość indeksu steruje stroną zdjęcia.

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

        .blog-list {
          max-width: 1100px;
          margin: 0 auto;
          padding: 80px 32px 120px;
        }
        @media (min-width: 900px) {
          .blog-list { padding: 96px 64px 160px; }
        }

        .blog-row {
          display: grid;
          grid-template-columns: 1fr;
          gap: 24px;
          align-items: center;
          margin-bottom: 80px;
        }
        .blog-row:last-child { margin-bottom: 0; }
        @media (min-width: 768px) {
          .blog-row {
            grid-template-columns: 1fr 1fr;
            gap: 60px;
            margin-bottom: 100px;
          }
          /* parzyste (reverse): tekst LEWO, zdjęcie PRAWO */
          .blog-row.reverse .blog-row-img { order: 2; }
          .blog-row.reverse .blog-row-txt { order: 1; }
        }
        /* na mobile (1-kol) zdjęcie zawsze NAD tekstem — order naturalny z DOM */

        .blog-row-img {
          display: block;
          width: 100%;
          aspect-ratio: 4 / 3;
          background: #f0ebe2;
          position: relative;
          overflow: hidden;
        }
        .blog-row-img img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform .5s ease;
        }
        .blog-row:hover .blog-row-img img { transform: scale(1.03); }
        .blog-row-img .placeholder {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: ${C};
          font-style: italic;
          font-size: 32px;
          color: #b8a169;
          letter-spacing: 4px;
        }

        .blog-row-meta {
          font-family: ${I};
          font-size: 11px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #888;
          margin-bottom: 16px;
        }
        .blog-row-txt h2 {
          font-family: ${C};
          font-weight: 300;
          font-size: clamp(28px, 3vw, 42px);
          line-height: 1.15;
          color: #11110f;
          margin: 0 0 20px;
        }
        .blog-row-txt h2 a { text-decoration: none; color: inherit; }
        .blog-row-txt p {
          font-family: ${I};
          font-size: 16px;
          line-height: 1.7;
          color: #555;
          margin: 0 0 24px;
        }
        .blog-row-czytaj {
          display: inline-block;
          font-family: ${I};
          font-size: 12px;
          color: #11110f;
          text-decoration: none;
          border-bottom: 1px solid #11110f;
          padding-bottom: 2px;
        }
        .blog-row-pojecia {
          font-family: ${I};
          font-size: 12px;
          letter-spacing: 0.04em;
          color: #888;
          margin-bottom: 24px;
        }
        .blog-row-pojecia a {
          color: #888;
          text-decoration: none;
          border-bottom: 1px solid transparent;
          transition: color .15s, border-color .15s;
        }
        .blog-row-pojecia a:hover {
          color: #11110f;
          border-bottom-color: #11110f;
        }
        .blog-row-pojecia .sep { color: #ccc; margin: 0 6px; }
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

      {/* LISTA NAPRZEMIENNA — wszystkie notatki równe, 2-kol 50/50 @≥768px */}
      {!error && filtered.length > 0 && (
        <section className="blog-list" aria-label="Lista notatek">
          {filtered.map((a, i) => (
            <BlogRow key={a.id} artykul={a} reverse={i % 2 === 1} />
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

function BlogRow({
  artykul,
  reverse,
}: {
  artykul: DbArtykul
  reverse: boolean
}) {
  const dataPL = formatPolishDate(artykul.data_publikacji ?? artykul.created_at)
  const kategoria = artykul.kategoria ?? artykul.typ_artykulu
  const meta = [dataPL, kategoria ? kategoria.toUpperCase() : null]
    .filter(Boolean)
    .join(' · ')

  const pojecia = getPojecia(artykul).slice(0, 3)
  const tagiFallback = parseTagi(artykul.tagi).slice(0, 3)

  return (
    <article className={`blog-row${reverse ? ' reverse' : ''}`}>
      <Link
        href={`/blog/${artykul.slug}`}
        className="blog-row-img"
        aria-label={artykul.tytul ?? 'Notatka'}
      >
        {artykul.img_cover ? (
          <img
            src={artykul.img_cover}
            alt={artykul.img_alt ?? artykul.tytul ?? 'Galeria ESTA'}
          />
        ) : (
          <div className="placeholder">ESTA</div>
        )}
      </Link>

      <div className="blog-row-txt">
        {meta && <div className="blog-row-meta">{meta}</div>}
        <h2>
          <Link href={`/blog/${artykul.slug}`}>
            {artykul.tytul ?? 'Bez tytułu'}
          </Link>
        </h2>
        {artykul.opis_krotki && <p>{artykul.opis_krotki}</p>}

        {(pojecia.length > 0 || tagiFallback.length > 0) && (
          <div className="blog-row-pojecia">
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

        <Link href={`/blog/${artykul.slug}`} className="blog-row-czytaj">
          Czytaj dalej →
        </Link>
      </div>
    </article>
  )
}
