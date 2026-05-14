import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default async function ArtysciPage() {
  const { data: artysci } = await supabase
    .from('artysci')
    .select('nazwisko_i_imie, url_artysty, kraj, dziedzina, style, biografia, status_w_galerii')
    .in('status_w_galerii', ['aktywny', 'archiwum'])
    .order('nazwisko_i_imie')

  const aktywni = artysci?.filter(a => a.status_w_galerii === 'aktywny') || []
  const archiwum = artysci?.filter(a => a.status_w_galerii === 'archiwum') || []

  const C = '"Cormorant Garamond", Georgia, serif'
  const I = '"Instrument Sans", sans-serif'

  return (
    <main style={{ background: '#fff', color: '#111' }}>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0;}
        a{text-decoration:none;color:inherit;}
        .nav-link{font-family:"Instrument Sans",sans-serif;font-size:11px;letter-spacing:.12em;text-transform:uppercase;opacity:.5;transition:opacity .2s;}
        .nav-link:hover{opacity:1;}
        .artist-row{display:grid;grid-template-columns:1fr 1fr 1fr;gap:0;border-bottom:1px solid #ebebeb;padding:20px 0;transition:background .2s;}
        .artist-row:hover{background:#faf9f7;}
        .arrow-link{display:inline-flex;align-items:center;gap:8px;font-family:"Instrument Sans",sans-serif;font-size:11px;letter-spacing:.12em;text-transform:uppercase;opacity:.6;transition:opacity .2s;}
        .arrow-link:hover{opacity:1;}
      `}</style>

      {/* NAWIGACJA */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, padding: '0 40px', height: '54px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,.96)', borderBottom: '1px solid #ebebeb' }}>
        <a href="/" style={{ fontFamily: C, fontSize: '16px', fontWeight: 400, letterSpacing: '.2em', textTransform: 'uppercase' }}>Galeria ESTA</a>
        <div style={{ display: 'flex', gap: '28px' }}>
          {['Artysci', 'Wystawy', 'Targi', 'Publikacje', 'Artykuly', 'Filmy', 'Oferta', 'Viewing Room', 'O nas'].map(item => (
            <a key={item} href="#" className="nav-link" style={{ opacity: item === 'Artysci' ? 1 : undefined }}>{item}</a>
          ))}
        </div>
        <a href="#" className="nav-link" style={{ fontSize: '10px' }}>PL / EN</a>
      </nav>

      {/* NAGLOWEK */}
      <section style={{ paddingTop: '54px', padding: '120px 40px 64px', borderBottom: '1px solid #ebebeb' }}>
        <h1 style={{ fontFamily: C, fontSize: 'clamp(48px,6vw,88px)', fontWeight: 400, lineHeight: 1.0, color: '#111' }}>
          Artysci
        </h1>
        <p style={{ fontFamily: I, fontSize: '13px', color: '#888', marginTop: '16px' }}>
          {artysci?.length || 0} artystow
        </p>
      </section>

      {/* AKTYWNI ARTYSCI */}
      <section style={{ padding: '64px 40px' }}>
        <div style={{ borderBottom: '2px solid #111', paddingBottom: '12px', marginBottom: '0' }}>
          <p style={{ fontFamily: I, fontSize: '10px', letterSpacing: '.18em', textTransform: 'uppercase', color: '#999' }}>
            Aktywni &mdash; {aktywni.length}
          </p>
        </div>
        {aktywni.map((a, i) => (
          <a key={i} href={`/${a.url_artysty || '#'}`} className="artist-row" style={{ display: 'grid' }}>
            <p style={{ fontFamily: C, fontSize: '22px', fontWeight: 400, lineHeight: 1.2 }}>
              {a.nazwisko_i_imie}
            </p>
            <p style={{ fontFamily: I, fontSize: '12px', color: '#888', alignSelf: 'center' }}>
              {a.dziedzina || ''}
            </p>
            <p style={{ fontFamily: I, fontSize: '12px', color: '#bbb', alignSelf: 'center', textAlign: 'right' }}>
              {a.kraj || ''}
            </p>
          </a>
        ))}
      </section>

      {/* ARCHIWUM */}
      {archiwum.length > 0 && (
        <section style={{ padding: '0 40px 96px' }}>
          <div style={{ borderBottom: '1px solid #ebebeb', paddingBottom: '12px', marginBottom: '0' }}>
            <p style={{ fontFamily: I, fontSize: '10px', letterSpacing: '.18em', textTransform: 'uppercase', color: '#999' }}>
              Archiwum &mdash; {archiwum.length}
            </p>
          </div>
          {archiwum.map((a, i) => (
            <a key={i} href={`/${a.url_artysty || '#'}`} className="artist-row" style={{ display: 'grid' }}>
              <p style={{ fontFamily: C, fontSize: '22px', fontWeight: 400, lineHeight: 1.2, color: '#666' }}>
                {a.nazwisko_i_imie}
              </p>
              <p style={{ fontFamily: I, fontSize: '12px', color: '#bbb', alignSelf: 'center' }}>
                {a.dziedzina || ''}
              </p>
              <p style={{ fontFamily: I, fontSize: '12px', color: '#ddd', alignSelf: 'center', textAlign: 'right' }}>
                {a.kraj || ''}
              </p>
            </a>
          ))}
        </section>
      )}

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
