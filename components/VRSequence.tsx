import { VRBlock, PracaLite } from '@/lib/vrTypes'
import VRBlockTekst from '@/components/VRBlockTekst'
import VRBlockCytat from '@/components/VRBlockCytat'
import VRBlockPraca from '@/components/VRBlockPraca'
import VRBlockDwiePrace from '@/components/VRBlockDwiePrace'
import VRBlockDetal from '@/components/VRBlockDetal'

interface Props {
  sekcje: VRBlock[] | null | undefined
  prace: Record<string, PracaLite>
}

// Renderer sekcje_jsonb. Dla nieznanych typow zwraca null (graceful — nic nie pokazuje).
// Spacing miedzy blokami: 96px standardowy, 72px @900px nizej.
export default function VRSequence({ sekcje, prace }: Props) {
  if (!sekcje || sekcje.length === 0) return null

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'clamp(64px, 8vw, 112px)',
        padding: '64px 0',
      }}
    >
      {sekcje.map((block) => {
        const node = renderBlock(block, prace)
        if (!node) return null
        return (
          <div key={block.id} data-vr-block={block.typ}>
            {node}
          </div>
        )
      })}
    </div>
  )
}

function renderBlock(
  block: VRBlock,
  prace: Record<string, PracaLite>
): React.ReactNode | null {
  switch (block.typ) {
    case 'tekst': {
      if (!block.tekst_pl) return null
      return <VRBlockTekst tekst={block.tekst_pl} />
    }
    case 'cytat': {
      if (!block.cytat_pl) return null
      return <VRBlockCytat cytat={block.cytat_pl} autor={block.autor} />
    }
    case 'praca': {
      if (!block.praca_id) return null
      const praca = prace[block.praca_id]
      if (!praca) return null
      return <VRBlockPraca praca={praca} kontekst={block.kontekst_pl} />
    }
    case 'dwie_prace': {
      if (!block.praca_id_a || !block.praca_id_b) return null
      const pracaA = prace[block.praca_id_a]
      const pracaB = prace[block.praca_id_b]
      if (!pracaA || !pracaB) return null
      return (
        <VRBlockDwiePrace
          praca_a={pracaA}
          praca_b={pracaB}
          kontekst={block.kontekst_pl}
        />
      )
    }
    case 'detal': {
      if (!block.praca_id) return null
      const praca = prace[block.praca_id]
      if (!praca) return null
      return (
        <VRBlockDetal
          praca={praca}
          opis={block.opis_pl}
          focus_area={block.focus_area}
        />
      )
    }
    default:
      // Nieznany typ — placeholder na blok rozszerzony w Etapie 4b.
      // Zwracamy null aby nie psuc layoutu na produkcji.
      return null
  }
}
