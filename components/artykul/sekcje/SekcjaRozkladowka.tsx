// components/artykul/sekcje/SekcjaRozkladowka.tsx — T08 ROZKŁADÓWKA
// Sekwencja foto(panorama)/tekst, powtarzana ("jak rozkładówka książki").
import type { RozkladowkaDane, MediaMap } from '@/lib/types-artykul'
import Obraz from './Obraz'

export default function SekcjaRozkladowka({
  dane,
  media,
}: {
  dane: RozkladowkaDane
  media: MediaMap
}) {
  return (
    <section className="t08-rozkladowka">
      {dane.tytul_sekcji && <h2 className="t08-tytul">{dane.tytul_sekcji}</h2>}

      {(dane.bloki ?? []).map((blok, i) => (
        <div className="t08-blok" key={i}>
          <Obraz
            zdjecie={blok.zdjecie}
            media={media}
            className="t08-blok-img"
            wariant="panorama"
          />
          <div className="t08-blok-tekst">
            {(blok.akapity ?? []).map((akapit, j) => (
              <p key={j}>{akapit}</p>
            ))}
          </div>
        </div>
      ))}

      {dane.pojecia && <div className="t08-pojecia">{dane.pojecia}</div>}
    </section>
  )
}
