import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default async function ArtystaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const { data: artysci } = await supabase
    .from('artysci')
    .select('*')
    .eq('url_artysty', slug)
    .limit(1)

  const artysta = artysci?.[0]
  if (!artysta) notFound()

  const { data: prace } = await supabase
    .from('prace')
    .select('id, tytul, rok, technika, wymiary_pracy, url_pracy, widocznosc')
    .eq('artysta_id', artysta.id)
    .in('widocznosc', ['glowny_nurt', 'kolekcja'])
    .order('rok', { ascending: false })
    .limit(12)

  const { data: wystawy } = await supabase
    .from('wystawy_artysci')
    .select('wystawa_id, wystawy(tytul, url_wystawy, data_od, data_do)')
    .eq('artysta_id', artysta.id)
    .limit(20)

  const C = '"Cormorant Garamond", Georgia, serif'
  const I = '"Instrument Sans", sans-serif'

  return (
    <main style={{ background: '#fff', color: '#111' }}>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0;}
        a{text-decoration:none;color:inherit;}
        .nav-link{font-family:"Instrument Sans",sans-serif;font-size:11px;letter-spacing:.12em;text-transform:uppercase;opacity:.5;transition:opacity .2s;}
        .nav-link:hover{opacity:1;}
        .praca-card:hover img{transform:scale(1.04);}
        .praca-card img{transition:transform .6s ease;}
        .arrow-link{display:inline-flex;align-items:center;gap:8px;font-family:"Instrument Sans",sans-serif;font-size:11px;letter-spacing:.12em;text-transform:uppercase;opacity:.6;transition:opacity .2s;}
        .arrow-link:hover{opacity:1;}
      `}</style>

      {/* NAWIGACJA */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, padding: '0 40px', height: '54px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,.96)', borderBottom: '1px solid #ebebeb' }}>
        <a href="/" style={{ fontFamily: C, fontSize: '16px', fontWeight: 400, letterSpacing: '.2em', textTransform: 'uppercase' }}>Galeria ESTA</a>
        <div style={{ display: 'flex', gap: '28px' }}>
          {['Artysci', 'Wystawy', 'Targi', 'Publikacje', 'Artykuly', 'Filmy', 'Oferta', 'Viewing Room', 'O nas'].map(item => (
            <a key={item} href={item === 'Artysci' ? '/artysci' : '#'} className="nav-link">{item}</a>
          ))}
        </div>
        <a href="#" className="nav-link" style={{ fontSize: '10px' }}>PL / EN</a>
      </nav>

      {/* NAGLOWEK ARTYSTY */}
      <section style={{ paddingTop: '54px', display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: '50vh', borderBottom: '1px solid #ebebeb' }}>
        <div style={{ padding: '80px 40px 64px', borderRight: '1px solid #ebebeb', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
          <a href="/artysci" style={{ fontFamily: I, fontSize: '10px', letterSpacing: '.16em', textTransform: 'uppercase', color: '#999', marginBottom: '48px', display: 'block' }}>
            &larr; Artysci
          </a>
          <h1 style={{ fontFamily: C, fontSize: 'clamp(36px,5vw,72px)', fontWeight: 400, lineHeight: 1.0, color: '#111', marginBottom: '16px' }}>
            {artysta.nazwisko_i_imie}
          </h1>
          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
            {artysta.rok_urodzenia && (
              <p style={{ fontFamily: I, fontSize: '12px', color: '#888' }}>
                {artysta.rok_urodzenia}{artysta.rok_smierci ? ` — ${artysta.rok_smierci}` : ''}
              </p>
            )}
            {artysta.kraj && <p style={{ fontFamily: I, fontSize: '12px', color: '#888' }}>{artysta.kraj}</p>}
            {artysta.dziedzina && <p style={{ fontFamily: I, fontSize: '12px', color: '#888' }}>{artysta.dziedzina}</p>}
          </div>
        </div>
        <div style={{ padding: '80px 40px 64px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
          {artysta.biografia && (
            <p style={{ fontFamily: I, fontSize: '14px', color: '#444', lineHeight: 1.9, maxWidth: '520px' }}>
              {artysta.biografia.substring(0, 400)}{artysta.biografia.length > 400 ? '...' : ''}
            </p>
          )}
        </div>
      </section>

      {/* PRACE */}
      {prace && prace.length > 0 && (
        <section style={{ padding: '80px 40px', borderBottom: '1px solid #ebebeb' }}>
          <h2 style={{ fontFamily: C, fontSize: '28px', fontWeight: 400, marginBottom: '48px' }}>Prace</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '40px' }}>
            {prace.map((p, i) => (
              <div key={i} className="praca-card">
                <div style={{ background: '#f0ece5', aspectRatio: '4/3', marginBottom: '16px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <p style={{ fontFamily: C, fontSize: '12px', fontStyle: 'italic', color: '#aaa' }}>Zdjecie</p>
                </div>
                <p style={{ fontFamily: C, fontSize: '17px', fontWeight: 400, marginBottom: '4px' }}>{p.tytul}</p>
                <p style={{ fontFamily: I, fontSize: '11px', color: '#999' }}>{p.rok}{p.technika ? `, ${p.technika}` : ''}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* WYSTAWY */}
      {wystawy && wystawy.length > 0 && (
        <section style={{ padding: '80px 40px', borderBottom: '1px solid #ebebeb' }}>
          <h2 style={{ fontFamily: C, fontSize: '28px', fontWeight: 400, marginBottom: '48px' }}>Wystawy w Galerii ESTA</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0' }}>
            {wystawy.map((w: any, i: number) => (
              <a key={i} href={`/wystawa/${w.wystawy?.url_wystawy}`} style={{ display: 'grid', gridTemplateColumns: '1fr auto', padding: '20px 0', borderBottom: '1px solid #ebebeb', transition: 'background .2s' }}>
                <p style={{ fontFamily: C, fontSize: '20px', fontWeight: 400 }}>{w.wystawy?.tytul}</p>
                <p style={{ fontFamily: I, fontSize: '11px', color: '#999', alignSelf: 'center' }}>
                  {w.wystawy?.data_od ? new Date(w.wystawy.data_od).toLocaleDateString('pl-PL', { year: 'numeric' }) : ''}
                </p>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* BIOGRAFIA PELNA */}
      {artysta.biografia && artysta.biografia.length > 400 && (
        <section style={{ padding: '80px 40px', borderBottom: '1px solid #ebebeb', display: 'grid', gridTemplateColumns: '200px 1fr', gap: '80px' }}>
          <h2 style={{ fontFamily: C, fontSize: '28px', fontWeight: 400 }}>Biografia</h2>
          <p style={{ fontFamily: I, fontSize: '14px', color: '#444', lineHeight: 1.9 }}>{artysta.biografia}</p>
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
