// components/artykul/sekcje/SekcjaTriptych.tsx — T06 TRIPTYCH
// 3 zdjęcia w rzędzie (33/33/33) + wspólny podpis + tekst pod.
import type { TriptychDane, MediaMap } from '@/lib/types-artykul'
import Obraz from './Obraz'

export default function SekcjaTriptych({
  dane,
  media,
}: {
  dane: TriptychDane
  media: MediaMap
}) {
  return (
    <section className="t06-triptych">
      {dane.tytul_sekcji && <h2 className="t06-tytul">{dane.tytul_sekcji}</h2>}

      <div className="t06-grid">
        {[dane.zdjecie_1, dane.zdjecie_2, dane.zdjecie_3]
          .filter((z): z is NonNullable<typeof z> => Boolean(z))
          .map((zdjecie, i) => (
            <Obraz key={i} zdjecie={zdjecie} media={media} wariant="pionowe" />
          ))}
      </div>
      {dane.podpis && <p className="t06-podpis">{dane.podpis}</p>}

      <div className="t06-tekst">
        {(dane.akapity ?? []).map((akapit, i) => (
          <p key={i}>{akapit}</p>
        ))}
      </div>

      {dane.pojecia && <div className="t06-pojecia">{dane.pojecia}</div>}
    </section>
  )
}
