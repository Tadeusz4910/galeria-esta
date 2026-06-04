export interface PracaDoSimilarity {
  id: string
  artysta_id?: string | null
  cena_oferowana?: number | null
  segmenty?: { id: string }[]
  style?: { id: string }[]
  dziedziny?: { id: string }[]
  pojecia?: { id: string }[]
  idea_glowna_id?: string | null
}

// Z praca.php starej strony, rozszerzone o warstwę kuratorską (idee + pojęcia).
// Wagi: segmenty dominują (klient-oriented), idea kuratorska wzmacnia,
// styl/dziedzina uzupełniają, pojęcia delikatnie, cena jako kotwica budżetowa.
export function scoreSimilarity(
  current: PracaDoSimilarity,
  candidate: PracaDoSimilarity
): number {
  let score = 0

  // Segmenty +30 za każdy wspólny — fundament klasyfikacji
  const currentSegs = (current.segmenty || []).map((s) => s.id)
  const candidateSegs = (candidate.segmenty || []).map((s) => s.id)
  candidateSegs.forEach((s) => {
    if (currentSegs.includes(s)) score += 30
  })

  // Idea główna +25 — kuratorskie podobieństwo
  if (
    current.idea_glowna_id &&
    current.idea_glowna_id === candidate.idea_glowna_id
  ) {
    score += 25
  }

  // Styl +15 za każdy wspólny
  const currentStyles = (current.style || []).map((s) => s.id)
  const candidateStyles = (candidate.style || []).map((s) => s.id)
  candidateStyles.forEach((s) => {
    if (currentStyles.includes(s)) score += 15
  })

  // Dziedziny +10 za każdą wspólną
  const currentFields = (current.dziedziny || []).map((d) => d.id)
  const candidateFields = (candidate.dziedziny || []).map((d) => d.id)
  candidateFields.forEach((d) => {
    if (currentFields.includes(d)) score += 10
  })

  // Pojęcia +5 × n (max 3 wspólne = +15)
  const currentPojecia = (current.pojecia || []).map((p) => p.id)
  const candidatePojecia = (candidate.pojecia || []).map((p) => p.id)
  let pojeciaMatches = 0
  candidatePojecia.forEach((p) => {
    if (currentPojecia.includes(p) && pojeciaMatches < 3) {
      score += 5
      pojeciaMatches++
    }
  })

  // Cena w ±25% +10 — kotwica budżetowa kolekcjonera
  if (current.cena_oferowana && candidate.cena_oferowana) {
    const diff = Math.abs(current.cena_oferowana - candidate.cena_oferowana)
    if (diff <= current.cena_oferowana * 0.25) {
      score += 10
    }
  }

  return score
}
