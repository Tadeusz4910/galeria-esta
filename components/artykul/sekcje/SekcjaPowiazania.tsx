// components/artykul/sekcje/SekcjaPowiazania.tsx — T10 POWIĄZANIA
// "Odkrywaj dalej": kolumny Pojęcia | Artyści (linki przez ideę, nie reklama).
import Link from 'next/link'
import type { PowiazaniaDane } from '@/lib/types-artykul'

export default function SekcjaPowiazania({ dane }: { dane: PowiazaniaDane }) {
  const pojecia = dane.pojecia ?? []
  const artysci = dane.artysci ?? []

  if (pojecia.length === 0 && artysci.length === 0) return null

  return (
    <section className="t10-powiazania">
      <h2 className="t10-tytul">{dane.tytul || 'Odkrywaj dalej'}</h2>

      <div className="t10-grid">
        {pojecia.length > 0 && (
          <div className="t10-kolumna">
            <h3>Pojęcia</h3>
            <ul>
              {pojecia.map((p, i) => (
                <li key={i}>
                  {p.url ? (
                    <Link href={p.url}>{p.etykieta}</Link>
                  ) : (
                    <span>{p.etykieta}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {artysci.length > 0 && (
          <div className="t10-kolumna">
            <h3>Artyści</h3>
            <ul>
              {artysci.map((a, i) => (
                <li key={i}>
                  {a.url ? (
                    <Link href={a.url}>{a.imie_nazwisko}</Link>
                  ) : (
                    <span>{a.imie_nazwisko}</span>
                  )}
                  {a.opis && <span className="opis">{a.opis}</span>}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  )
}
