// components/artykul/sekcje/SekcjaTekstMiedzy.tsx — T04 TEKST_MIĘDZY
// foto duże / tekst / para 2 foto — "oko widza odpoczywa".
import type { TekstMiedzyDane, MediaMap } from '@/lib/types-artykul'
import Obraz from './Obraz'

export default function SekcjaTekstMiedzy({
  dane,
  media,
}: {
  dane: TekstMiedzyDane
  media: MediaMap
}) {
  return (
    <section className="t04-tekst-miedzy">
      {dane.tytul_sekcji && (
        <h2 className="t04-tytul-sekcji">{dane.tytul_sekcji}</h2>
      )}

      {dane.zdjecie_duze && (
        <Obraz
          zdjecie={dane.zdjecie_duze}
          media={media}
          className="t04-zdjecie-duze"
          wariant="panorama"
        />
      )}
      {dane.podpis_duzy && <p className="t04-podpis-mini">{dane.podpis_duzy}</p>}

      <div className="t04-tekst">
        {(dane.akapity ?? []).map((akapit, i) => (
          <p key={i}>{akapit}</p>
        ))}
      </div>

      <div className="t04-para-zdjec">
        <Obraz zdjecie={dane.zdjecie_lewe} media={media} />
        <Obraz zdjecie={dane.zdjecie_prawe} media={media} />
      </div>
      {dane.podpis_para && <p className="t04-podpis-mini">{dane.podpis_para}</p>}

      {(dane.akapity_pod ?? []).length > 0 && (
        <div className="t04-tekst" style={{ marginTop: 'var(--o-podpis-tekst)' }}>
          {(dane.akapity_pod ?? []).map((akapit, i) => (
            <p key={i}>{akapit}</p>
          ))}
        </div>
      )}

      {dane.pojecia && <div className="t04-pojecia">{dane.pojecia}</div>}
    </section>
  )
}
