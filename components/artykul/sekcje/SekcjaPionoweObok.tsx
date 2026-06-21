// components/artykul/sekcje/SekcjaPionoweObok.tsx — T05 PIONOWE_OBOK
// Pionowe zdjęcie + tekst obok ("jak książka"). Zdjęcie po lewej (domyślnie) lub prawej.
import type { PionoweObokDane, MediaMap } from '@/lib/types-artykul'
import Obraz from './Obraz'

export default function SekcjaPionoweObok({
  dane,
  media,
}: {
  dane: PionoweObokDane
  media: MediaMap
}) {
  const fotoPrawo = dane.strona === 'right'

  const foto = (
    <Obraz zdjecie={dane.zdjecie} media={media} wariant="pionowe" />
  )
  const tekst = (
    <div className="t05-grid-tekst">
      {dane.tytul_sekcji && <h2>{dane.tytul_sekcji}</h2>}
      {(dane.akapity ?? []).map((akapit, i) => (
        <p key={i}>{akapit}</p>
      ))}
    </div>
  )

  return (
    <section className="t05-pionowe-obok">
      <div className={`t05-grid${fotoPrawo ? ' t05-foto-prawo' : ''}`}>
        {fotoPrawo ? (
          <>
            {tekst}
            {foto}
          </>
        ) : (
          <>
            {foto}
            {tekst}
          </>
        )}
      </div>
      {dane.podpis && <p className="t05-podpis">{dane.podpis}</p>}
      {dane.pojecia && <div className="t05-pojecia">{dane.pojecia}</div>}
    </section>
  )
}
