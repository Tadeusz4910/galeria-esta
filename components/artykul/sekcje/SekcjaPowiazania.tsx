// components/artykul/sekcje/SekcjaPowiazania.tsx — T10 POWIĄZANIA
// "Odkrywaj dalej": pojęcia + artyści czytane z RELACJI M:N artykułu
// (pojecia_artykuly → pojecia, artykuly_artysci → artysci), NIE z JSONB `dane`.
// Server Component (async): Promise.all + embedded resources.
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import type { PowiazaniaDane } from '@/lib/types-artykul'

// "Nazwisko Imie" -> "Imie Nazwisko" (grupy i nazwy nie-2-wyrazowe bez zmian).
function flipImieNazwisko(raw: string | null): string {
  const n = (raw || '').trim().replace(/\s+/g, ' ')
  if (!n) return ''
  if (/^grupa\b/i.test(n)) return n
  const parts = n.split(' ')
  return parts.length === 2 ? `${parts[1]} ${parts[0]}` : n
}

export default async function SekcjaPowiazania({
  dane,
  artykulId,
}: {
  dane: PowiazaniaDane
  artykulId: string
}) {
  const [pojeciaRes, artysciRes, wystawyRes] = await Promise.all([
    supabase
      .from('pojecia_artykuly')
      .select('pojecie:pojecia(id, slug, nazwa)')
      .eq('artykuly_id', artykulId),
    supabase
      .from('artykuly_artysci')
      .select(
        'kolejnosc, opis_w_notatce, artysta:artysci(id, nazwisko_i_imie, url_artysty)'
      )
      .eq('artykul_id', artykulId)
      .order('kolejnosc', { ascending: true }),
    supabase
      .from('artykuly_wystawy')
      .select('kolejnosc, wystawa:wystawy(id, tytul, url_wystawy)')
      .eq('artykul_id', artykulId)
      .order('kolejnosc', { ascending: true }),
  ])

  const pojecia = ((pojeciaRes.data ?? []) as any[])
    .map((r) => r.pojecie)
    .filter(Boolean) as { id: string; slug: string; nazwa: string }[]

  const artysci = ((artysciRes.data ?? []) as any[])
    .filter((r) => r.artysta)
    .map((r) => ({
      id: r.artysta.id as string,
      nazwisko_i_imie: (r.artysta.nazwisko_i_imie ?? null) as string | null,
      url_artysty: (r.artysta.url_artysty ?? null) as string | null,
      opis: ((r.opis_w_notatce ?? '') as string).trim(),
    }))

  const wystawy = ((wystawyRes.data ?? []) as any[])
    .map((r) => r.wystawa)
    .filter(Boolean) as {
    id: string
    tytul: string | null
    url_wystawy: string | null
  }[]

  if (pojecia.length === 0 && artysci.length === 0 && wystawy.length === 0)
    return null

  return (
    <section className="t10-powiazania">
      <h2 className="t10-tytul">{dane?.tytul || 'Odkrywaj dalej'}</h2>

      <div className="t10-grid">
        {pojecia.length > 0 && (
          <div className="t10-kolumna">
            <h3>Pojęcia</h3>
            <ul>
              {pojecia.map((p) => (
                <li key={p.id}>
                  <Link href={`/kolekcja?tag=${encodeURIComponent(p.slug)}`}>
                    {p.nazwa}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        {artysci.length > 0 && (
          <div className="t10-kolumna">
            <h3>Artyści</h3>
            <ul>
              {artysci.map((a) => {
                const nazwa = flipImieNazwisko(a.nazwisko_i_imie)
                const opis = a.opis
                return (
                  <li key={a.id}>
                    {a.url_artysty ? (
                      <Link href={`/artysta/${a.url_artysty}`}>{nazwa}</Link>
                    ) : (
                      <span>{nazwa}</span>
                    )}
                    {opis && <span className="opis">{opis}</span>}
                  </li>
                )
              })}
            </ul>
          </div>
        )}

        {wystawy.length > 0 && (
          <div className="t10-kolumna">
            <h3>Wystawy</h3>
            <ul>
              {wystawy.map((w) => (
                <li key={w.id}>
                  {w.url_wystawy ? (
                    <Link href={`/wystawa/${w.url_wystawy}`}>{w.tytul}</Link>
                  ) : (
                    <span>{w.tytul}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  )
}
