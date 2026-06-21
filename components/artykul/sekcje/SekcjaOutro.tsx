// components/artykul/sekcje/SekcjaOutro.tsx — T09 OUTRO
// Zakończenie: kreska separator + wąska kolumna; 1. akapit italic (z CSS).
import type { OutroDane } from '@/lib/types-artykul'

export default function SekcjaOutro({ dane }: { dane: OutroDane }) {
  return (
    <section className="t09-outro">
      <div className="t09-outro-tekst">
        {(dane.akapity ?? []).map((akapit, i) => (
          <p key={i}>{akapit}</p>
        ))}
      </div>
    </section>
  )
}
