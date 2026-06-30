import Link from 'next/link'
import type { Metadata } from 'next'
import { supabase } from '@/lib/supabase'
import NavInternational from '@/components/NavInternational'

export const revalidate = 60

const C = '"Cormorant Garamond", Georgia, serif'
const I = '"Instrument Sans", -apple-system, BlinkMacSystemFont, sans-serif'

export const metadata: Metadata = {
  title: 'Notes — International Program — Galeria ESTA',
  description:
    'Notes, discoveries and reflections — Central European conceptual, concrete and geometric art.',
  openGraph: {
    title: 'Notes — International Program — Galeria ESTA',
    description:
      'Notes, discoveries and reflections — Central European conceptual, concrete and geometric art.',
  },
  robots: 'index, follow',
}

type DbArtykul = {
  id: string
  slug: string
  tytul: string | null
  tytul_en: string | null
  opis_krotki: string | null
  lead_en: string | null
  img_cover: string | null
  img_alt: string | null
  kategoria: string | null
  typ_artykulu: string | null
  autor: string | null
  data_publikacji: string | null
  created_at: string
}

function formatEnDate(iso: string | null): string {
  if (!iso) return ''
  try {
    return new Date(iso).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  } catch {
    return ''
  }
}

// EN z fallbackiem na PL: tytuł = tytul_en || tytul; lead = lead_en || opis_krotki.
function enTitle(a: DbArtykul): string {
  return (a.tytul_en?.trim() || a.tytul?.trim() || 'Untitled') as string
}
function enLead(a: DbArtykul): string {
  return (a.lead_en?.trim() || a.opis_krotki?.trim() || '') as string
}

export default async function InternationalNotesPage() {
  const { data, error } = await supabase
    .from('artykuly')
    .select(
      `
      id, slug, tytul, tytul_en, opis_krotki, lead_en,
      img_cover, img_alt, kategoria, typ_artykulu, autor,
      data_publikacji, created_at
    `
    )
    .eq('int_publiczne', true)
    .eq('status_publiczny', 'opublikowany')
    .order('priorytet', { ascending: false, nullsFirst: false })
    .order('data_publikacji', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })

  const notes = (data ?? []) as unknown as DbArtykul[]

  return (
    <main style={{ background: '#fbfaf8', color: '#11110f', minHeight: '100vh' }}>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; }
        a { color: inherit; }

        .intl-hero {
          padding: 120px 32px 64px;
          max-width: 1100px;
          margin: 0 auto;
          border-bottom: 1px solid #e7e0d7;
        }
        @media (min-width: 900px) { .intl-hero { padding: 160px 64px 80px; } }

        .intl-list {
          max-width: 1100px;
          margin: 0 auto;
          padding: 80px 32px 120px;
        }
        @media (min-width: 900px) { .intl-list { padding: 96px 64px 160px; } }

        .intl-row {
          display: grid;
          grid-template-columns: 1fr;
          gap: 24px;
          align-items: center;
          margin-bottom: 80px;
        }
        .intl-row:last-child { margin-bottom: 0; }
        @media (min-width: 768px) {
          .intl-row { grid-template-columns: 1fr 1fr; gap: 60px; margin-bottom: 100px; }
          .intl-row.reverse .intl-row-img { order: 2; }
          .intl-row.reverse .intl-row-txt { order: 1; }
        }

        .intl-row-img {
          display: block;
          width: 100%;
          aspect-ratio: 4 / 3;
          background: #f0ebe2;
          position: relative;
          overflow: hidden;
        }
        .intl-row-img img {
          width: 100%; height: 100%;
          object-fit: cover;
          transition: transform .5s ease;
        }
        .intl-row:hover .intl-row-img img { transform: scale(1.03); }
        .intl-row-img .placeholder {
          position: absolute; inset: 0;
          display: flex; align-items: center; justify-content: center;
          font-family: ${C}; font-style: italic; font-size: 32px;
          color: #b8a169; letter-spacing: 4px;
        }
        .intl-row-meta {
          font-family: ${I}; font-size: 11px; letter-spacing: 0.18em;
          text-transform: uppercase; color: #888; margin-bottom: 16px;
        }
        .intl-row-txt h2 {
          font-family: ${C}; font-weight: 300;
          font-size: clamp(28px, 3vw, 42px); line-height: 1.15;
          color: #11110f; margin: 0 0 20px;
        }
        .intl-row-txt h2 a { text-decoration: none; color: inherit; }
        .intl-row-txt p {
          font-family: ${I}; font-size: 16px; line-height: 1.7;
          color: #555; margin: 0 0 24px;
        }
        .intl-row-czytaj {
          display: inline-block; font-family: ${I}; font-size: 12px;
          color: #11110f; text-decoration: none;
          border-bottom: 1px solid #11110f; padding-bottom: 2px;
        }
      `}</style>

      <NavInternational active="notatki" />

      {/* HERO */}
      <section className="intl-hero" aria-label="Notes — International Program">
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
          <Link href="/international">International Program</Link> · Notes
        </div>
        <h1
          style={{
            fontFamily: C,
            fontStyle: 'italic',
            fontWeight: 300,
            fontSize: 'clamp(44px, 7vw, 84px)',
            lineHeight: 1.0,
            letterSpacing: '-0.01em',
            margin: 0,
            marginBottom: '32px',
          }}
        >
          Notes
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
          Notes, discoveries and reflections on conceptual, concrete and
          geometric art from Central Europe.
        </p>
      </section>

      {/* ERROR */}
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
          Something went wrong while loading the notes. Please refresh.
        </div>
      )}

      {/* EMPTY */}
      {!error && notes.length === 0 && (
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
          No notes published in the International Program yet.
        </div>
      )}

      {/* LIST */}
      {notes.length > 0 && (
        <section className="intl-list" aria-label="International notes">
          {notes.map((a, i) => (
            <NoteRow key={a.id} artykul={a} reverse={i % 2 === 1} />
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
        Galeria ESTA · Gliwice · since 1998
      </footer>
    </main>
  )
}

function NoteRow({
  artykul,
  reverse,
}: {
  artykul: DbArtykul
  reverse: boolean
}) {
  const title = enTitle(artykul)
  const lead = enLead(artykul)
  const dataEn = formatEnDate(artykul.data_publikacji ?? artykul.created_at)
  const kategoria = artykul.kategoria ?? artykul.typ_artykulu
  const meta = [dataEn, kategoria ? kategoria.toUpperCase() : null]
    .filter(Boolean)
    .join(' · ')

  return (
    <article className={`intl-row${reverse ? ' reverse' : ''}`}>
      <Link
        href={`/international/notatki/${artykul.slug}`}
        className="intl-row-img"
        aria-label={title}
      >
        {artykul.img_cover ? (
          <img src={artykul.img_cover} alt={artykul.img_alt ?? title} />
        ) : (
          <div className="placeholder">ESTA</div>
        )}
      </Link>

      <div className="intl-row-txt">
        {meta && <div className="intl-row-meta">{meta}</div>}
        <h2>
          <Link href={`/international/notatki/${artykul.slug}`}>{title}</Link>
        </h2>
        {lead && <p>{lead}</p>}
        <Link
          href={`/international/notatki/${artykul.slug}`}
          className="intl-row-czytaj"
        >
          Read more →
        </Link>
      </div>
    </article>
  )
}
