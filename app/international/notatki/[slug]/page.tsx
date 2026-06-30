import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import NavInternational from '@/components/NavInternational'
import ArtykulRender from '@/components/artykul/ArtykulRender'
import type { SekcjaArtykulu } from '@/lib/types-artykul'

export const revalidate = 60

const I = '"Instrument Sans", -apple-system, BlinkMacSystemFont, sans-serif'

type DbArtykul = {
  id: string
  slug: string
  tytul: string | null
  tytul_en: string | null
  opis_krotki: string | null
  lead_en: string | null
  img_cover: string | null
  data_publikacji: string | null
  created_at: string
  status_publiczny: string
  int_publiczne: boolean | null
  kategoria: string | null
  typ_artykulu: string | null
  autor: string | null
  czas_czytania_min: number | null
  sekcje:
    | { id: string; kolejnosc: number; typ_sekcji: string; dane: unknown }[]
    | null
}

// EN z fallbackiem na PL.
function enTitle(a: { tytul_en: string | null; tytul: string | null }): string {
  return a.tytul_en?.trim() || a.tytul?.trim() || 'Note'
}
function enLead(a: {
  lead_en: string | null
  opis_krotki: string | null
}): string {
  return a.lead_en?.trim() || a.opis_krotki?.trim() || ''
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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const { data } = await supabase
    .from('artykuly')
    .select('tytul, tytul_en, opis_krotki, lead_en, img_cover')
    .eq('slug', slug)
    .eq('int_publiczne', true)
    .eq('status_publiczny', 'opublikowany')
    .maybeSingle()

  if (!data) return { title: 'Note — Galeria ESTA' }

  const title = enTitle(data as any)
  const desc = enLead(data as any) || undefined
  const cover = (data as any).img_cover as string | null

  return {
    title: `${title} — International Program — Galeria ESTA`,
    description: desc,
    openGraph: {
      title,
      description: desc,
      images: cover ? [cover] : undefined,
    },
  }
}

export default async function InternationalNotePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const { data, error } = await supabase
    .from('artykuly')
    .select(
      `
      id, slug, tytul, tytul_en, opis_krotki, lead_en, img_cover,
      data_publikacji, created_at, status_publiczny, int_publiczne,
      kategoria, typ_artykulu, autor, czas_czytania_min,
      sekcje:artykuly_sekcje(id, kolejnosc, typ_sekcji, dane)
    `
    )
    .eq('slug', slug)
    .eq('int_publiczne', true)
    .eq('status_publiczny', 'opublikowany')
    .maybeSingle()

  // notFound, gdy brak rekordu LUB nie jest oznaczony do International.
  if (error || !data) notFound()

  const artykul = data as unknown as DbArtykul

  const sekcje = ((artykul.sekcje ?? []) as unknown as SekcjaArtykulu[])
    .slice()
    .sort((a, b) => a.kolejnosc - b.kolejnosc)

  const dataEn = formatEnDate(artykul.data_publikacji ?? artykul.created_at)
  const kategoria = artykul.kategoria ?? artykul.typ_artykulu
  const meta = [
    dataEn,
    kategoria,
    artykul.autor,
    artykul.czas_czytania_min
      ? `${artykul.czas_czytania_min} min read`
      : null,
  ]
    .filter(Boolean)
    .join(' · ')

  return (
    <main style={{ background: '#fdfcfa', color: '#1a1a1a', minHeight: '100vh' }}>
      <NavInternational active="notatki" />

      {/* Sekcje T01–T10 (treść z JSONB; warstwa _en obejmuje na razie metadane/tytuł).
          ArtykulRender reużyty 1:1 z blogiem. */}
      <ArtykulRender sekcje={sekcje} artykulId={artykul.id} />

      <footer
        style={{
          padding: '64px 32px 80px',
          borderTop: '1px solid #e8e4dd',
          fontFamily: I,
          fontSize: '13px',
          letterSpacing: '0.05em',
          color: '#777',
          textAlign: 'center',
        }}
      >
        {meta && (
          <div style={{ marginBottom: '12px' }}>
            ESTA Notes · International · {meta}
          </div>
        )}
        Galeria ESTA · Gliwice · since 1998
      </footer>
    </main>
  )
}
