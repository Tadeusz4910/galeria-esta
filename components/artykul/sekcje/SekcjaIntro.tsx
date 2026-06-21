// components/artykul/sekcje/SekcjaIntro.tsx — T02 INTRO
import type { IntroDane } from '@/lib/types-artykul'

export default function SekcjaIntro({ dane }: { dane: IntroDane }) {
  return (
    <section className="t02-intro">
      <div className="t02-intro-tekst">
        {(dane.akapity ?? []).map((akapit, i) => (
          <p key={i}>{akapit}</p>
        ))}
      </div>
      {dane.pojecia && <div className="t02-intro-pojecia">{dane.pojecia}</div>}
    </section>
  )
}
