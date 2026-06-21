// components/artykul/sekcje/SekcjaHero.tsx — T01 HERO
import type { HeroDane, MediaMap } from '@/lib/types-artykul'
import Obraz from './Obraz'

export default function SekcjaHero({
  dane,
  media,
}: {
  dane: HeroDane
  media: MediaMap
}) {
  return (
    <section
      className="t01-hero"
      style={dane.wysokosc_vh ? { height: `${dane.wysokosc_vh}vh` } : undefined}
    >
      <Obraz
        zdjecie={dane.zdjecie}
        media={media}
        className="t01-hero-img"
        altFallback={dane.tytul}
      />
      <div className="t01-hero-tekst">
        {dane.nadtytul && <span className="t01-hero-nadtytul">{dane.nadtytul}</span>}
        <h1 className="t01-hero-tytul">{dane.tytul ?? ''}</h1>
        {dane.podtytul && <p className="t01-hero-podtytul">{dane.podtytul}</p>}
      </div>
      {dane.autor_zdjecia && (
        <div className="t01-hero-podpis">{dane.autor_zdjecia}</div>
      )}
    </section>
  )
}
