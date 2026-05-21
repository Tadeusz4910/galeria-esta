import { createClient } from '@supabase/supabase-js'
import Nav from '@/components/Nav'

export const revalidate = 0

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default async function WystawyPage() {
  const { data: wystawy } = await supabase
    .from('wystawy')
    .select('tytul, artysci_txt, data_od, data_do, url_wystawy, img_plakat, opis_krotki, miejsce')
    .not('tytul', 'is', null)
    .order('data_od', { ascending: false })

  const now = new Date()
  const aktualne = wystawy?.filter(w => new Date(w.data_do) >= now) || []
  const archiwum = wystawy?.filter(w => new Date(w.data_do) < now) || []

  const byYear: Record<number, typeof archiwum> = {}
  archiwum.forEach(w => {
    const year = w.data_od ? new Date(w.data_od).getFullYear() : 0
    if (!byYear[year]) byYear[year] = []
    byYear[year]!.push(w)
  })
  const years = Object.keys(byYear).map(Number).sort((a, b) => b - a)

  const C = '"Cormorant Garamond", Georgia, serif'
  const I = '"Instrument Sans", sans-serif'

  return (
    <main style={{ background: '#fff', color: '#111' }}>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0;}
        a{text-decoration:none;color:inherit;}
        .card-img{transition:transform .8s cubic-bezier(.25,.46,.45,.94);}
        .card-hover:hover .card-img{transform:scale(1.03);}
      `}</style>

      {/* NAWIGACJA */}
      <Nav active="wystawy" />

      {/* NAGLOWEK */}
      <section style={{ paddingTop: '120px', padding: '120px 40px 64px', borderBottom: '1px solid #ebebeb' }}>
        <h1 style={{ fontFamily: C, fontSize: 'clamp(48px,6vw,88px)', fontWeight: 400, lineHeight: 1.0 }}>Wystawy</h1>
        <p style={{ fontFamily: I, fontSize: '13px', color: '#888', marginTop: '16px' }}>{wystawy?.length || 0} wystaw</p>
      </section>

      {/* AKTUALNE */}
      {aktualne.length > 0 && (
        <section style={{ padding: '64px 40px' }}>
          <div style={{ borderBottom: '2px solid #111', paddingBottom: '12px', marginBottom: '48px' }}>
            <p style={{ fontFamily: I, fontSize: '10px', letterSpacing: '.18em', textTransform: 'uppercase', color: '#999' }}>Aktualne</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '64px 48px' }}>
            {aktualne.map((w, i) => (
              <a key={i} href={`/wystawa/${w.url_wystawy}`} className="card-hover" style={{ display: 'block' }}>
                <div style={{ overflow: 'hidden', marginBottom: '20px' }}>
                  <img src={w.img_plakat || ''} alt={w.tytul || ''} className="card-img" style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover', display: 'block' }} />
                </div>
                <p style={{ fontFamily: I, fontSize: '10px', letterSpacing: '.16em', textTransform: 'uppercase', color: '#999', marginBottom: '8px' }}>
                  {w.data_od ? new Date(w.data_od).toLocaleDateString('pl-PL', { day: 'numeric', month: 'long' }) : ''} &ndash; {w.data_do ? new Date(w.data_do).toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' }) : ''}
                </p>
                <p style={{ fontFamily: C, fontSize: '22px', fontWeight: 400, marginBottom: '4px' }}>{w.artysci_txt}</p>
                <p style={{ fontFamily: C, fontSize: '17px', fontWeight: 300, fontStyle: 'italic', color: '#666' }}>{w.tytul}</p>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* ARCHIWUM wg lat */}
      {years.map(year => (
        <section key={year} style={{ padding: '0 40px 64px', borderTop: '1px solid #ebebeb' }}>
          <div style={{ padding: '32px 0 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <h2 style={{ fontFamily: C, fontSize: '36px', fontWeight: 400, color: '#ccc' }}>{year}</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '40px' }}>
            {byYear[year]!.map((w, i) => (
              <a key={i} href={`/wystawa/${w.url_wystawy}`} className="card-hover" style={{ display: 'block' }}>
                <div style={{ overflow: 'hidden', marginBottom: '16px' }}>
                  <img src={w.img_plakat || ''} alt={w.tytul || ''} className="card-img" style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover', display: 'block' }} />
                </div>
                <p style={{ fontFamily: I, fontSize: '10px', letterSpacing: '.16em', textTransform: 'uppercase', color: '#999', marginBottom: '6px' }}>
                  {w.data_od ? new Date(w.data_od).toLocaleDateString('pl-PL', { day: 'numeric', month: 'long' }) : ''} &ndash; {w.data_do ? new Date(w.data_do).toLocaleDateString('pl-PL', { day: 'numeric', month: 'long' }) : ''}
                </p>
                <p style={{ fontFamily: C, fontSize: '18px', fontWeight: 400, marginBottom: '3px' }}>{w.artysci_txt}</p>
                <p style={{ fontFamily: C, fontSize: '15px', fontWeight: 300, fontStyle: 'italic', color: '#666' }}>{w.tytul}</p>
              </a>
            ))}
          </div>
        </section>
      ))}

      {/* FOOTER */}
      <footer style={{ background: '#111', padding: '64px 40px', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '48px' }}>
        <div>
          <p style={{ fontFamily: C, fontSize: '18px', fontWeight: 400, color: '#fff', letterSpacing: '.1em', marginBottom: '20px' }}>Galeria ESTA</p>
          <p style={{ fontFamily: I, fontSize: '12px', lineHeight: 2, color: '#555' }}>ul. Raciborska 8, Gliwice<br />Od 1998 roku<br />galeria@galeria-esta.pl</p>
        </div>
        <div>
          <p style={{ fontFamily: I, fontSize: '10px', letterSpacing: '.18em', textTransform: 'uppercase', color: '#333', marginBottom: '16px' }}>Menu</p>
          {['Artysci', 'Wystawy', 'Targi', 'Oferta', 'Viewing Room', 'O nas'].map(item => (
            <a key={item} href="#" style={{ display: 'block', fontFamily: I, fontSize: '12px', color: '#555', lineHeight: 2.2 }}>{item}</a>
          ))}
        </div>
        <div>
          <p style={{ fontFamily: I, fontSize: '10px', letterSpacing: '.18em', textTransform: 'uppercase', color: '#333', marginBottom: '16px' }}>Godziny</p>
          <p style={{ fontFamily: I, fontSize: '12px', lineHeight: 2, color: '#555' }}>Wt — Pt: 11:00 — 18:00<br />Sob: 11:00 — 15:00<br />Nd — Pn: zamkniete</p>
        </div>
        <div>
          <p style={{ fontFamily: I, fontSize: '10px', letterSpacing: '.18em', textTransform: 'uppercase', color: '#333', marginBottom: '16px' }}>Social</p>
          <p style={{ fontFamily: I, fontSize: '12px', lineHeight: 2.2, color: '#555' }}>Instagram<br />Facebook</p>
        </div>
      </footer>
    </main>
  )
}
