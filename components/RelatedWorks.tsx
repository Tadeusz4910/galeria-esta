import WorkCard, { PracaForCard } from '@/components/WorkCard'

interface RelatedWorksProps {
  title: string
  prace: PracaForCard[]
  /** Kontekst który warunkuje generowane tag-linki w karcie. */
  kontekst?: 'kolekcja' | 'viewing-room' | 'oferta'
}

const I = '"Instrument Sans", -apple-system, BlinkMacSystemFont, sans-serif'

export default function RelatedWorks({
  title,
  prace,
  kontekst = 'kolekcja',
}: RelatedWorksProps) {
  if (!prace || prace.length === 0) return null

  return (
    <section
      style={{
        marginTop: '120px',
        borderTop: '1px solid #e7e0d7',
        paddingTop: '64px',
      }}
    >
      <h2
        style={{
          fontFamily: I,
          fontSize: '11px',
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
          color: '#777',
          margin: 0,
          marginBottom: '48px',
        }}
      >
        {title}
      </h2>

      <div className="related-grid">
        {prace.slice(0, 12).map((praca) => (
          <WorkCard
            key={praca.id}
            praca={praca}
            kontekst={kontekst}
            showPrice={false}
            showSegment={false}
            maxTags={0}
            tagLinkBase="/kolekcja"
          />
        ))}
      </div>

      <style>{`
        .related-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          column-gap: 24px;
          row-gap: 48px;
        }
        @media (min-width: 700px) {
          .related-grid {
            grid-template-columns: repeat(3, 1fr);
            column-gap: 32px;
            row-gap: 56px;
          }
        }
        @media (min-width: 1000px) {
          .related-grid {
            grid-template-columns: repeat(4, 1fr);
            column-gap: 32px;
            row-gap: 64px;
          }
        }
      `}</style>
    </section>
  )
}
