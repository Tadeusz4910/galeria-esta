import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { supabase } from '@/lib/supabase'
import { workSlug } from '@/lib/slug'
import { scoreSimilarity } from '@/lib/scoreSimilarity'
import Nav from '@/components/Nav'
import WorkGallery from '@/components/WorkGallery'
import WorkDetailSidebar, { PracaDetail } from '@/components/WorkDetailSidebar'
import RelatedWorks from '@/components/RelatedWorks'
import { PracaForCard } from '@/components/WorkCard'

export const revalidate = 60

const I = '"Instrument Sans", -apple-system, BlinkMacSystemFont, sans-serif'

type DbRow = {
  id: string
  id_pracy: string | null
  tytul: string
  rok: number | null
  rok_opis: string | null
  technika: string | null
  wymiary_pracy: string | null
  sygnatura: string | null
  wariant_edycja: string | null
  cena_oferowana: number | null
  alt_zdjecia: string | null
  opis_pracy: string | null
  proweniencja: string | null
  wystawy_historia: string | null
  literatura: string | null
  widocznosc: string | null
  idea_glowna_id: string | null
  updated_at: string | null
  artysci: {
    id: string | null
    nazwisko_i_imie: string | null
    url_artysty: string | null
  } | null
  idee: { id: string; nazwa: string } | null
  prace_segmenty: { segmenty: { id: string; nazwa: string } | null }[] | null
  prace_style: { style: { id: string; nazwa: string } | null }[] | null
  prace_dziedziny: {
    dziedziny: { id: string; nazwa: string } | null
  }[] | null
  pojecia_prace: { pojecia: { id: string; nazwa: string } | null }[] | null
}

const FULL_SELECT = `
  id, id_pracy, tytul, rok, rok_opis, technika, wymiary_pracy, sygnatura,
  wariant_edycja, cena_oferowana, alt_zdjecia, opis_pracy, proweniencja,
  wystawy_historia, literatura, widocznosc, idea_glowna_id, updated_at,
  artysci ( id, nazwisko_i_imie, url_artysty ),
  idee ( id, nazwa ),
  prace_segmenty ( segmenty ( id, nazwa ) ),
  prace_style ( style ( id, nazwa ) ),
  prace_dziedziny ( dziedziny ( id, nazwa ) ),
  pojecia_prace ( pojecia ( id, nazwa ) )
`

type EnrichedPraca = PracaDetail & {
  cena_oferowana: number | null
  __slug: string
}

function enrich(row: DbRow): EnrichedPraca {
  return {
    id: row.id,
    id_pracy: row.id_pracy,
    tytul: row.tytul,
    rok: row.rok,
    rok_opis: row.rok_opis,
    technika: row.technika,
    wymiary_pracy: row.wymiary_pracy,
    sygnatura: row.sygnatura,
    wariant_edycja: row.wariant_edycja,
    cena_oferowana: row.cena_oferowana,
    opis_pracy: row.opis_pracy,
    proweniencja: row.proweniencja,
    wystawy_historia: row.wystawy_historia,
    literatura: row.literatura,
    widocznosc: row.widocznosc,
    artysta_id: row.artysci?.id ?? null,
    artysta_nazwa: row.artysci?.nazwisko_i_imie ?? null,
    artysta_url: row.artysci?.url_artysty ?? null,
    idea: row.idee ?? null,
    segmenty:
      row.prace_segmenty
        ?.map((x) => x.segmenty)
        .filter((s): s is { id: string; nazwa: string } => Boolean(s)) ?? [],
    style:
      row.prace_style
        ?.map((x) => x.style)
        .filter((s): s is { id: string; nazwa: string } => Boolean(s)) ?? [],
    dziedziny:
      row.prace_dziedziny
        ?.map((x) => x.dziedziny)
        .filter((d): d is { id: string; nazwa: string } => Boolean(d)) ?? [],
    pojecia:
      row.pojecia_prace
        ?.map((x) => x.pojecia)
        .filter((p): p is { id: string; nazwa: string } => Boolean(p)) ?? [],
    __slug: workSlug({
      artysta_nazwa: row.artysci?.nazwisko_i_imie,
      tytul: row.tytul,
      rok: row.rok,
    }),
  }
}

function toCard(p: EnrichedPraca): PracaForCard {
  return {
    id: p.id,
    id_pracy: p.id_pracy,
    tytul: p.tytul,
    rok: p.rok,
    technika: p.technika,
    wymiary: p.wymiary_pracy,
    cena_oferowana: p.cena_oferowana,
    artysta_nazwa: p.artysta_nazwa,
    artysta_url: p.artysta_url,
    segmenty: p.segmenty,
    pojecia: p.pojecia,
  }
}

async function fetchAllPublicPrace(): Promise<EnrichedPraca[]> {
  const { data, error } = await supabase
    .from('prace')
    .select(FULL_SELECT)
    .in('widocznosc', ['kolekcja', 'archiwum'])
    .order('updated_at', { ascending: false })

  if (error || !data) return []
  return (data as unknown as DbRow[]).map(enrich)
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const prace = await fetchAllPublicPrace()
  const p = prace.find((x) => x.__slug === slug)
  if (!p) return { title: 'Praca nie znaleziona — Galeria ESTA' }

  const title = `${p.tytul}${p.rok ? `, ${p.rok}` : ''} — ${p.artysta_nazwa ?? ''} | Galeria ESTA`
  const description =
    p.opis_pracy?.slice(0, 160) ||
    `${p.artysta_nazwa ?? ''}, ${p.tytul}${p.rok ? `, ${p.rok}` : ''}. ${p.technika ?? ''}. Galeria ESTA — sztuka konceptualna, konkretna i geometryczna.`
  const ogImage = p.id_pracy
    ? `https://galeria-esta.pl/viewing-room/images/prace/${p.id_pracy}.jpg`
    : undefined

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: ogImage ? [ogImage] : undefined,
    },
    twitter: ogImage
      ? { card: 'summary_large_image', title, description, images: [ogImage] }
      : { card: 'summary', title, description },
    robots: 'index, follow',
  }
}

export default async function PracaPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const prace = await fetchAllPublicPrace()
  const current = prace.find((x) => x.__slug === slug)
  if (!current) notFound()

  const otherFromArtist = prace
    .filter((p) => p.artysta_id === current.artysta_id && p.id !== current.id)
    .slice(0, 12)

  const excludeIds = new Set<string>([
    current.id,
    ...otherFromArtist.map((p) => p.id),
  ])
  const similar = prace
    .filter((p) => !excludeIds.has(p.id))
    .map((p) => ({
      praca: p,
      score: scoreSimilarity(
        {
          id: current.id,
          artysta_id: current.artysta_id,
          cena_oferowana: current.cena_oferowana,
          segmenty: current.segmenty,
          style: current.style,
          dziedziny: current.dziedziny,
          pojecia: current.pojecia,
          idea_glowna_id: current.idea?.id ?? null,
        },
        {
          id: p.id,
          artysta_id: p.artysta_id,
          cena_oferowana: p.cena_oferowana,
          segmenty: p.segmenty,
          style: p.style,
          dziedziny: p.dziedziny,
          pojecia: p.pojecia,
          idea_glowna_id: p.idea?.id ?? null,
        }
      ),
    }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 12)
    .map((x) => x.praca)

  // Breadcrumb (D24): widocznosc decyduje kontekst
  const kontekst =
    current.widocznosc === 'archiwum'
      ? { nazwa: 'VIEWING ROOM', url: '/viewing-room' as const }
      : { nazwa: 'KOLEKCJA', url: '/kolekcja' as const }

  const altText = `${current.artysta_nazwa ?? ''}, ${current.tytul}${current.rok ? `, ${current.rok}` : ''}`

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
        .praca-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 48px;
          padding: 0 24px;
          max-width: 1280px;
          margin: 0 auto;
        }
        @media (min-width: 900px) {
          .praca-grid {
            grid-template-columns: minmax(0, 7fr) minmax(0, 3fr);
            gap: 72px;
            padding: 0 48px;
          }
        }
        .praca-sidebar {
          align-self: start;
        }
        @media (min-width: 900px) {
          .praca-sidebar {
            position: sticky;
            top: 40px;
            max-height: calc(100vh - 60px);
            overflow-y: auto;
          }
        }
        .praca-related-wrap {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 24px;
        }
        @media (min-width: 900px) {
          .praca-related-wrap {
            padding: 0 48px;
          }
        }
      `}</style>

      <Nav active={current.widocznosc === 'archiwum' ? 'viewing-room' : 'kolekcja'} />

      {/* Breadcrumb */}
      <nav
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '40px 24px 32px',
          fontFamily: I,
          fontSize: '11px',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: '#888',
        }}
      >
        <Link href="/" style={{ color: 'inherit', textDecoration: 'none' }}>
          Galeria ESTA
        </Link>
        <span style={{ margin: '0 8px', color: '#bbb' }}>/</span>
        <Link href={kontekst.url} style={{ color: 'inherit', textDecoration: 'none' }}>
          {kontekst.nazwa}
        </Link>
        <span style={{ margin: '0 8px', color: '#bbb' }}>/</span>
        <span style={{ color: '#11110f' }}>
          {current.artysta_nazwa ? `${current.artysta_nazwa} — ` : ''}
          {current.tytul}
          {current.rok ? `, ${current.rok}` : ''}
        </span>
      </nav>

      {/* Layout 70/30 */}
      <div className="praca-grid">
        <div>
          {current.id_pracy ? (
            <WorkGallery idPracy={current.id_pracy} altText={altText || current.tytul} />
          ) : (
            <div
              style={{
                width: '100%',
                aspectRatio: '4 / 3',
                backgroundColor: '#fbfaf8',
                border: '1px solid #f0ebe2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: '"Cormorant Garamond", Georgia, serif',
                fontSize: '48px',
                color: '#cfc6ba',
                letterSpacing: '0.1em',
              }}
            >
              ESTA
            </div>
          )}
        </div>

        <aside className="praca-sidebar">
          <WorkDetailSidebar praca={current} showPrice={true} />
        </aside>
      </div>

      {/* Pełny opis pracy — pod galerią, max 720px */}
      {current.opis_pracy && (
        <section
          style={{
            maxWidth: '720px',
            margin: '96px auto 0',
            padding: '0 24px',
            fontFamily: I,
            fontSize: '17px',
            lineHeight: 1.7,
            color: '#333',
            whiteSpace: 'pre-line',
          }}
        >
          {current.opis_pracy}
        </section>
      )}

      <div className="praca-related-wrap">
        {otherFromArtist.length > 0 && (
          <RelatedWorks
            title="Inne prace artysty"
            prace={otherFromArtist.map(toCard)}
            kontekst={current.widocznosc === 'archiwum' ? 'viewing-room' : 'kolekcja'}
          />
        )}

        {similar.length > 0 && (
          <RelatedWorks
            title="Podobne prace"
            prace={similar.map(toCard)}
            kontekst={current.widocznosc === 'archiwum' ? 'viewing-room' : 'kolekcja'}
          />
        )}
      </div>

      <footer
        style={{
          marginTop: '120px',
          padding: '64px 24px',
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
