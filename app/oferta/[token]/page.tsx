import { supabase } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

// Oferty indywidualne sa prywatne - nie cache'ujemy, nie indeksujemy.
export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Private View — Galeria ESTA',
    robots: {
      index: false,
      follow: false,
      googleBot: { index: false, follow: false }
    }
  }
}

// Pola PL bez sufiksu (konwencja bazy): tytul, wstep, tekst_kuratorski.
// Pola EN/DE z sufiksem _en/_de.
// jezyk_oferty: pl | en | de | pl_en | en_de | pl_en_de - preferencja PL > EN > DE.
type Oferta = {
  id: string
  token: string
  numer_oferty: string
  data_wyslania: string | null
  tytul: string | null
  tytul_en: string | null
  tytul_de: string | null
  wstep: string | null
  wstep_en: string | null
  wstep_de: string | null
  tekst_kuratorski: string | null
  tekst_kuratorski_en: string | null
  tekst_kuratorski_de: string | null
  jezyk_oferty: string | null
  hero_url: string | null
  hero_focalpoint_x: number | null
  hero_focalpoint_y: number | null
  accent_color: string | null
}

export default async function OfertaPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params

  const { data } = await supabase
    .from('oferty')
    .select('id, token, numer_oferty, data_wyslania, tytul, tytul_en, tytul_de, wstep, wstep_en, wstep_de, tekst_kuratorski, tekst_kuratorski_en, tekst_kuratorski_de, jezyk_oferty, hero_url, hero_focalpoint_x, hero_focalpoint_y, accent_color')
    .eq('token', token)
    .limit(1)

  const o = (data?.[0] as Oferta | undefined)
  if (!o) notFound()

  // Wybor jezyka: pl > en > de. Sprawdzamy pole jezyk_oferty (moze byc kombinacja).
  const j = (o.jezyk_oferty || 'pl').toLowerCase()
  const lang: 'pl' | 'en' | 'de' =
    j.includes('pl') ? 'pl' :
    j.includes('en') ? 'en' :
    'de'

  // Fallback chain: gdy preferowany jezyk pusty, bierzemy nastepny z dostepnych.
  const pick = (pl: string | null, en: string | null, de: string | null): string => {
    if (lang === 'pl') return (pl || en || de || '').trim()
    if (lang === 'en') return (en || pl || de || '').trim()
    return (de || en || pl || '').trim()
  }

  const tytul = pick(o.tytul, o.tytul_en, o.tytul_de)
  const wstep = pick(o.wstep, o.wstep_en, o.wstep_de)
  const tekstKur = pick(o.tekst_kuratorski, o.tekst_kuratorski_en, o.tekst_kuratorski_de)

  const C = '"Cormorant Garamond", Georgia, serif'
  const I = '"Instrument Sans", -apple-system, BlinkMacSystemFont, sans-serif'
  const accent = o.accent_color && /^#[0-9a-fA-F]{6}$/.test(o.accent_color) ? o.accent_color : '#11110f'

  // Data wyslania: krotki format polski dla lang=pl, ISO dla en/de.
  const fmtDate = (d: string | null): string => {
    if (!d) return ''
    const date = new Date(d)
    if (lang === 'pl') {
      const m = ['stycznia', 'lutego', 'marca', 'kwietnia', 'maja', 'czerwca', 'lipca', 'sierpnia', 'wrzesnia', 'pazdziernika', 'listopada', 'grudnia']
      return `${date.getDate()} ${m[date.getMonth()]} ${date.getFullYear()}`
    }
    return date.toISOString().slice(0, 10)
  }

  // Etykiety lokalizacyjne.
  const L = {
    eyebrow: lang === 'pl' ? 'Private View' : lang === 'en' ? 'Private View' : 'Private View',
    back: lang === 'pl' ? '← Powrót do galerii' : lang === 'de' ? '← Zurück zur Galerie' : '← Back to gallery',
    selectedWorks: lang === 'de' ? 'Ausgewählte Arbeiten' : lang === 'en' ? 'Selected Works' : 'Wybór prac',
    inProgress: lang === 'pl' ? 'Lista prac w ofercie — w trakcie budowy (Task B3).' :
                lang === 'de' ? 'Werkliste — in Vorbereitung (Task B3).' :
                'List of works — under construction (Task B3).',
    courtesy: 'Courtesy of Galeria ESTA. Copyright © the Artists.',
    nr: lang === 'de' ? 'Nr.' : 'Nr',
  }

  return (
    <main style={{ background: '#fbfaf8', color: '#11110f', minHeight: '100vh' }}>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0;}
        a{text-decoration:none;color:inherit;}
        .wrap{max-width:1180px;margin:0 auto;padding:0 40px;}
        .header-row{display:flex;align-items:center;justify-content:space-between;padding:32px 0;border-bottom:1px solid #e5ded4;}
        .logo{font-family:${C};font-size:22px;font-weight:400;letter-spacing:.08em;}
        .logo em{font-style:italic;color:#7a6e60;font-weight:400;}
        .nav-back{font-family:${I};font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:#888;transition:color .2s;}
        .nav-back:hover{color:#11110f;}
        .hero{padding:96px 0 0;}
        .eyebrow{font-family:${I};font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:#555;margin-bottom:28px;}
        .title{font-family:${C};font-size:clamp(42px,6vw,82px);font-weight:400;line-height:1;letter-spacing:-.01em;margin-bottom:36px;color:#11110f;}
        .wstep{font-family:${I};font-size:17px;font-weight:300;line-height:1.65;color:#333;max-width:720px;margin-bottom:36px;white-space:pre-line;}
        .meta{font-family:${I};font-size:12px;color:#888;letter-spacing:.04em;}
        .tk{font-family:${C};font-style:italic;font-weight:400;font-size:clamp(18px,2vw,24px);line-height:1.6;color:#444;max-width:760px;margin-top:64px;border-left:2px solid ${accent};padding-left:24px;white-space:pre-line;}
        .prace-placeholder{margin-top:96px;padding:60px 0;border-top:1px solid #e5ded4;}
        .ph-eyebrow{font-family:${I};font-size:10px;letter-spacing:.22em;text-transform:uppercase;color:#aaa;margin-bottom:16px;}
        .ph-text{font-family:${C};font-style:italic;font-size:18px;color:#888;}
        .footer-area{margin-top:160px;padding:48px 0 64px;border-top:1px solid #e5ded4;font-family:${I};font-size:12px;color:#777;line-height:1.8;}
        .footer-area .courtesy{margin-bottom:12px;color:#555;}
        @media (max-width:640px){
          .wrap{padding:0 20px;}
          .hero{padding:46px 0 0;}
          .header-row{padding:20px 0;}
          .title{font-size:clamp(32px,10vw,48px);margin-bottom:28px;}
          .wstep{font-size:15px;}
          .tk{margin-top:46px;font-size:17px;}
          .prace-placeholder{margin-top:64px;padding:40px 0;}
          .footer-area{margin-top:96px;}
        }
      `}</style>

      {/* HEADER - minimalny, bez pelnej nawigacji galerii (oferta prywatna) */}
      <header className="wrap">
        <div className="header-row">
          <a href="/" className="logo">Galeria <em>ESTA</em></a>
          <a href="/" className="nav-back">{L.back}</a>
        </div>
      </header>

      {/* PRESENTATION HEADER */}
      <section className="wrap hero">
        <p className="eyebrow">{L.eyebrow}</p>
        <h1 className="title">{tytul || 'Oferta indywidualna'}</h1>
        {wstep && <div className="wstep">{wstep}</div>}
        <p className="meta">
          {L.nr} {o.numer_oferty}
          {o.data_wyslania ? ` · ${fmtDate(o.data_wyslania)}` : ''}
        </p>
        {tekstKur && <p className="tk">{tekstKur}</p>}
      </section>

      {/* PLACEHOLDER listy prac - implementacja w Task B3 */}
      <section className="wrap prace-placeholder">
        <p className="ph-eyebrow">{L.selectedWorks}</p>
        <p className="ph-text">{L.inProgress}</p>
      </section>

      {/* FOOTER - dyskretny */}
      <footer className="wrap footer-area">
        <p className="courtesy">{L.courtesy}</p>
        <p>ul. Raciborska 8, 44-100 Gliwice · galeria@galeria-esta.pl</p>
      </footer>
    </main>
  )
}
