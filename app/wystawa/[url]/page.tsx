import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default async function WystawaPage({ params }: { params: Promise<{ url: string }> }) {
  const { url } = await params
  const { data: wystawy } = await supabase
    .from('wystawy')
    .select('*')
    .eq('url_wystawy', url)
    .limit(1)

  const w = wystawy?.[0]
  if (!w) notFound()

  const { data: zdjecia } = await supabase
    .from('wystawy_zdjecia')
    .select('url, alt, opis, typ, cover')
    .eq('wystawa_id', w.id)
    .order('kolejnosc')

  const { data: artysciWystawy } = await supabase
    .from('wystawy_artysci')
    .select('opis_w_wystawie, artysci(nazwisko_i_imie, url_artysty, biografia)')
    .eq('wystawa_id', w.id)

  const { data: materialy } = await supabase
    .from('wystawy_materialy')
    .select('typ, tytul, url, opis, zrodlo, data_publikacji')
    .eq('wystawa_id', w.id)
    .order('kolejnosc')

  const fmtDate = (d: string | null) => d
    ? new Date(d).toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' })
    : ''

  const C = '"Cormorant Garamond", Georgia, serif'
  const I = '"Instrument Sans", sans-serif'

  const cover = zdjecia?.find(z => z.cover) || zdjecia?.[0]
  const pozostaleZdjecia = zdjecia?.filter(z => !z.cover) || []

  return (
    <main style={{ background: '#fff', color: '#111' }}>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0;}
        a{text-decoration:none;color:inherit;}
        .nav-link{font-family:"Instrument Sans",sans-serif;font-size:11px;letter-spacing:.12em;text-transform:uppercase;opacity:.5;transition:opacity .2s;}
        .nav-link:hover{opacity:1;}
        .arrow-link{display:inline-flex;align-items:center;gap:8px;font-family:"Instrument Sans",sans-serif;font-size:11px;letter-spacing:.12em;text-transform:uppercase;opacity:.6;transition:opacity .2s;}
        .arrow-link:hover{opacity:1;}
        .zdjecie-card:hover img{transform:scale(1.03);}
        .zdjecie-card img{transition:transform .6s ease;}
      `}</style>

      {/* NAWIGACJA */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, padding: '0 40px', height: '54px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,.96)', borderBottom: '1px solid #ebebeb' }}>
        <a href="/" style={{ fontFamily: C, fontSize: '16px', fontWeight: 400, letterSpacing: '.2em', textTransform: 'uppercase' }}>Galeria ESTA</a>
        <div style={{ display: 'flex', gap: '28px' }}>
          {['Artysci', 'Wystawy', 'Targi', 'Publikacje', 'Artykuly', 'Filmy', 'Oferta', 'Viewing Room', 'O nas'].map(item => (
            <a key={item} href={item === 'Wystawy' ? '/wystawy' : '#'} className="nav-link" style={{ opacity: item === 'Wystawy' ? 1 : undefined }}>{item}</a>
          ))}
        </div>
        <a href="#" className="nav-link" style={{ fontSize: '10px' }}>PL / EN</a>
      </nav>

      {/* HERO – zdjecie plakatowe */}
      {w.img_plakat && (
        <section style={{ paddingTop: '54px', height: '85vh', overflow: 'hidden' }}>
          <img src={w.img_plakat} alt={w.tytul || ''} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        </section>
      )}

      {/* NAGLOWEK – tekst lewo, dane prawo */}
      <section style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', borderTop: '1px solid #ebebeb', paddingTop: w.img_plakat ? '0' : '54px' }}>
        <div style={{ padding: '64px 48px 64px 40px', borderRight: '1px solid #ebebeb' }}>
          <a href="/wystawy" className="arrow-link" style={{ marginBottom: '40px', display: 'inline-flex' }}>&larr; Wystawy</a>
          <h1 style={{ fontFamily: C, fontSize: 'clamp(32px,4vw,60px)', fontWeight: 400, lineHeight: 1.05, marginBottom: '8px', marginTop: '24px' }}>
            {w.artysci_txt || ''}
          </h1>
          <p style={{ fontFamily: C, fontSize: 'clamp(18px,2vw,30px)', fontWeight: 300, fontStyle: 'italic', color: '#666', lineHeight: 1.3 }}>
            {w.tytul || ''}
          </p>
        </div>
        <div style={{ padding: '64px 40px 64px 48px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '16px' }}>
          <div>
            <p style={{ fontFamily: I, fontSize: '10px', letterSpacing: '.18em', textTransform: 'uppercase', color: '#999', marginBottom: '6px' }}>Daty</p>
            <p style={{ fontFamily: I, fontSize: '14px' }}>{fmtDate(w.data_od)} &ndash; {fmtDate(w.data_do)}</p>
          </div>
          {w.data_wernisazu && (
            <div>
              <p style={{ fontFamily: I, fontSize: '10px', letterSpacing: '.18em', textTransform: 'uppercase', color: '#999', marginBottom: '6px' }}>Wernisaz</p>
              <p style={{ fontFamily: I, fontSize: '14px' }}>
                {new Date(w.data_wernisazu).toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' })}
                {w.godzina_wernisazu ? `, godz. ${w.godzina_wernisazu}` : ''}
              </p>
            </div>
          )}
          <div>
            <p style={{ fontFamily: I, fontSize: '10px', letterSpacing: '.18em', textTransform: 'uppercase', color: '#999', marginBottom: '6px' }}>Miejsce</p>
            <p style={{ fontFamily: I, fontSize: '14px', fontWeight: 600 }}>{w.miejsce || 'Galeria ESTA'}</p>
            <p style={{ fontFamily: I, fontSize: '13px', color: '#888' }}>{w.miasto || 'Gliwice'}</p>
          </div>
          {w.kurator && (
            <div>
              <p style={{ fontFamily: I, fontSize: '10px', letterSpacing: '.18em', textTransform: 'uppercase', color: '#999', marginBottom: '6px' }}>Kurator</p>
              <p style={{ fontFamily: I, fontSize: '14px' }}>{w.kurator}</p>
            </div>
          )}
        </div>
      </section>

      {/* OPIS */}
      {(w.opis_pelny || w.opis_krotki) && (
        <section style={{ padding: '80px 40px', borderTop: '1px solid #ebebeb', display: 'grid', gridTemplateColumns: '200px 1fr', gap: '80px' }}>
          <div>
            <p style={{ fontFamily: I, fontSize: '10px', letterSpacing: '.18em', textTransform: 'uppercase', color: '#999' }}>O wystawie</p>
          </div>
          <div>
            {w.cytat && (
              <blockquote style={{ fontFamily: C, fontSize: '24px', fontWeight: 300, fontStyle: 'italic', color: '#333', lineHeight: 1.5, marginBottom: '40px', paddingLeft: '24px', borderLeft: '2px solid #e8e8e8' }}>
                &ldquo;{w.cytat}&rdquo;
                {w.cytat_autor && <footer style={{ fontFamily: I, fontSize: '12px', color: '#999', marginTop: '12px', fontStyle: 'normal' }}>&mdash; {w.cytat_autor}</footer>}
              </blockquote>
            )}
            <p style={{ fontFamily: I, fontSize: '14px', color: '#444', lineHeight: 1.9, whiteSpace: 'pre-line' }}>
              {w.opis_pelny || w.opis_krotki}
            </p>
            {w.opis_artysty && (
              <p style={{ fontFamily: I, fontSize: '14px', color: '#666', lineHeight: 1.9, marginTop: '32px', paddingTop: '32px', borderTop: '1px solid #ebebeb' }}>
                {w.opis_artysty}
              </p>
            )}
          </div>
        </section>
      )}

      {/* ARTYSCI */}
      {artysciWystawy && artysciWystawy.length > 0 && (
        <section style={{ padding: '80px 40px', borderTop: '1px solid #ebebeb' }}>
          <h2 style={{ fontFamily: C, fontSize: '28px', fontWeight: 400, marginBottom: '48px' }}>Artysci</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '40px' }}>
            {artysciWystawy.map((wa: any, i: number) => (
              <a key={i} href={`/${wa.artysci?.url_artysty || '#'}`} style={{ display: 'block' }}>
                <p style={{ fontFamily: C, fontSize: '22px', fontWeight: 400, marginBottom: '8px' }}>{wa.artysci?.nazwisko_i_imie}</p>
                {wa.opis_w_wystawie && (
                  <p style={{ fontFamily: I, fontSize: '13px', color: '#666', lineHeight: 1.7 }}>{wa.opis_w_wystawie}</p>
                )}
              </a>
            ))}
          </div>
        </section>
      )}

      {/* GALERIA ZDJEC */}
      {pozostaleZdjecia.length > 0 && (
        <section style={{ padding: '80px 40px', borderTop: '1px solid #ebebeb' }}>
          <h2 style={{ fontFamily: C, fontSize: '28px', fontWeight: 400, marginBottom: '48px' }}>Dokumentacja</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '2px', background: '#e8e8e8' }}>
            {pozostaleZdjecia.map((z, i) => (
              <div key={i} className="zdjecie-card" style={{ overflow: 'hidden', background: '#fff' }}>
                <img src={z.url} alt={z.alt || ''} style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover', display: 'block' }} />
                {z.opis && <p style={{ fontFamily: I, fontSize: '11px', color: '#888', padding: '12px 16px' }}>{z.opis}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* MATERIALY – katalogi, filmy, artykuly */}
      {materialy && materialy.length > 0 && (
        <section style={{ padding: '80px 40px', borderTop: '1px solid #ebebeb' }}>
          <h2 style={{ fontFamily: C, fontSize: '28px', fontWeight: 400, marginBottom: '48px' }}>Materialy</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0' }}>
            {materialy.map((m, i) => (
              <a key={i} href={m.url || '#'} style={{ display: 'block', padding: '24px 0', borderBottom: '1px solid #ebebeb', borderRight: i % 2 === 0 ? '1px solid #ebebeb' : 'none', paddingRight: i % 2 === 0 ? '40px' : '0', paddingLeft: i % 2 === 1 ? '40px' : '0' }}>
                <p style={{ fontFamily: I, fontSize: '10px', letterSpacing: '.16em', textTransform: 'uppercase', color: '#999', marginBottom: '8px' }}>{m.typ}</p>
                <p style={{ fontFamily: C, fontSize: '18px', fontWeight: 400, marginBottom: '4px' }}>{m.tytul}</p>
                {m.zrodlo && <p style={{ fontFamily: I, fontSize: '12px', color: '#888' }}>{m.zrodlo}</p>}
              </a>
            ))}
          </div>
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
