// components/artykul/sekcje/SekcjaMoment.tsx — T07 MOMENT
// Duże zdjęcie 75% + cytat ("moment zatrzymania").
import type { MomentDane, MediaMap } from '@/lib/types-artykul'
import Obraz from './Obraz'

export default function SekcjaMoment({
  dane,
  media,
}: {
  dane: MomentDane
  media: MediaMap
}) {
  return (
    <section className="t07-moment">
      <div className="t07-img-wrap">
        <Obraz zdjecie={dane.zdjecie} media={media} wariant="pionowe" />
      </div>
      {dane.podpis && <p className="t07-podpis">{dane.podpis}</p>}

      <blockquote className="t07-cytat">{dane.cytat ?? ''}</blockquote>
      {dane.autor_cytatu && (
        <div className="t07-cytat-autor">{dane.autor_cytatu}</div>
      )}
    </section>
  )
}
