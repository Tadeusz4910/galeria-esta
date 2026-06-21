// components/artykul/sekcje/SekcjaSolo.tsx — T03 SOLO
import type { SoloDane, MediaMap } from '@/lib/types-artykul'
import Obraz from './Obraz'

export default function SekcjaSolo({
  dane,
  media,
}: {
  dane: SoloDane
  media: MediaMap
}) {
  return (
    <section className="t03-solo">
      <Obraz zdjecie={dane.zdjecie} media={media} className="t03-solo-img" />
      {dane.podpis && <p className="t03-solo-podpis">{dane.podpis}</p>}
    </section>
  )
}
