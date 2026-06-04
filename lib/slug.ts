const POLISH_CHARS: Record<string, string> = {
  ą: 'a', ć: 'c', ę: 'e', ł: 'l', ń: 'n',
  ó: 'o', ś: 's', ż: 'z', ź: 'z',
  Ą: 'a', Ć: 'c', Ę: 'e', Ł: 'l', Ń: 'n',
  Ó: 'o', Ś: 's', Ż: 'z', Ź: 'z',
}

function normalizePolish(text: string): string {
  return text.split('').map((c) => POLISH_CHARS[c] || c).join('')
}

// "Kozłowski Jarosław" → "jaroslaw-kozlowski"
// Konwencja ESTA: w bazie nazwisko pierwsze, w URL imię pierwsze.
export function artistSlug(nazwiskoIimie: string | null | undefined): string {
  if (!nazwiskoIimie) return ''
  const parts = nazwiskoIimie.trim().split(/\s+/)
  const reordered =
    parts.length >= 2 ? parts.slice(1).join(' ') + ' ' + parts[0] : nazwiskoIimie
  return normalizePolish(reordered)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// { artysta: "Bauer Josef", tytul: "A", rok: 1971 } → "josef-bauer-a-1971"
// Dług świadomy: może dawać duplikaty (dwie prace tego samego artysty
// o tym samym tytule i roku). W MVP akceptujemy — wybierzemy pierwszą.
export function workSlug(praca: {
  artysta_nazwa: string | null | undefined
  tytul: string | null | undefined
  rok?: number | string | null
}): string {
  const artistPart = artistSlug(praca.artysta_nazwa)
  const titlePart = praca.tytul
    ? normalizePolish(praca.tytul)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
    : ''
  const yearRaw = praca.rok ? String(praca.rok).replace(/[^0-9]/g, '') : ''
  const yearPart = yearRaw ? `-${yearRaw}` : ''
  return [artistPart, titlePart].filter(Boolean).join('-') + yearPart
}
