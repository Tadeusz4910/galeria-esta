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
    .limit(6)

  const { data: wystawyArtysty } = await supabase
    .from('wystawy_artysci')
    .select('wystawy(id, tytul, url_wystawy, data_od, data_do, img_plakat, miejsce, miasto)')
    .eq('artysta_id', artysta.id)
    .limit(4)

  const C = '"Cormorant Garamond", Georgia, serif'
  const I = '"Instrument Sans", sans-serif'

  return (
    <main style={{ background: '#fff', color: '#111' }}>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0;}
        a{text-decoration:none;color:inherit;}
        .nav-link{font-family:"Instrument Sans",sans-serif;font-size:11px;letter-spacing:.12em;text-transform:uppercase;opacity:.5;transition:opacity .2s;}
        .nav-link:hover{opacity:1;}
        .arrow-link{display:inline-flex;align-items:center;gap:8px;font-family:"Instrument Sans",sans-serif;font-size:11px;letter-spacing:.12em;text-transform:uppercase;opacity:.6;transition:opacity .2s;}
        .arrow-link:hover{opacity:1;}
        .img-wrap{overflow:hidden;}
        .img-hover{transition:transform .7s cubic-bezier(.25,.46,.45,.94);}
        .img-wrap:hover .img-hover{transform:scale(1.04);}
        .praca-card:hover{opacity:.85;}
        .wystawa-card:hover{opacity:.75;}
      `}</style>

      {/* NAWIGACJA */}
      <nav style={{ position:'fixed',top:0,left:0,right:0,zIndex:100,padding:'0 40px',height:'54px',display:'flex',alignItems:'center',justifyContent:'space-between',background:'rgba(255,255,255,.96)',borderBottom:'1px solid #ebebeb' }}>
        <a href="/" style={{ fontFamily:C,fontSize:'16px',fontWeight:400,letterSpacing:'.2em',textTransform:'uppercase' }}>Galeria ESTA</a>
        <div style={{ display:'flex',gap:'28px' }}>
          <a href="/artysci" className="nav-link" style={{ opacity:1 }}>Artysci</a>
          <a href="/wystawy" className="nav-link">Wystawy</a>
          <a href="/targi" className="nav-link">Targi</a>
          {['Publikacje','Artykuly','Filmy','Oferta','Viewing Room','O nas'].map(item => (
            <a key={item} href="#" className="nav-link">{item}</a>
          ))}
        </div>
        <a href="#" className="nav-link" style={{ fontSize:'10px' }}>PL / EN</a>
      </nav>

      {/* HERO – tekst lewo, praca artysty prawo */}
      <section style={{ paddingTop:'54px',display:'grid',gridTemplateColumns:'1fr 1fr',minHeight:'80vh',background:'#f8f8f6' }}>
        <div style={{ padding:'80px 56px',display:'flex',flexDirection:'column',justifyContent:'flex-end' }}>
          <a href="/artysci" style={{ fontFamily:I,fontSize:'10px',letterSpacing:'.16em',textTransform:'uppercase',color:'#999',marginBottom:'48px',display:'block' }}>
            &larr; Artysci
          </a>
          <h1 style={{ fontFamily:C,fontSize:'clamp(40px,5vw,80px)',fontWeight:400,lineHeight:1.0,marginBottom:'20px' }}>
            {artysta.nazwisko_i_imie}
          </h1>
          <div style={{ display:'flex',flexDirection:'column',gap:'4px' }}>
            {artysta.rok_urodzenia && (
              <p style={{ fontFamily:I,fontSize:'13px',color:'#888' }}>
                ur. {artysta.rok_urodzenia}{artysta.rok_smierci ? ` — ${artysta.rok_smierci}` : ''}
              </p>
            )}
            {artysta.miasto && (
              <p style={{ fontFamily:I,fontSize:'13px',color:'#888' }}>{artysta.miasto}{artysta.kraj ? `, ${artysta.kraj}` : ''}</p>
            )}
            {artysta.dziedzina && (
              <p style={{ fontFamily:I,fontSize:'13px',color:'#bbb',marginTop:'4px' }}>{artysta.dziedzina}</p>
            )}
          </div>
        </div>
        <div style={{ background:'#e8e4de',overflow:'hidden',display:'flex',alignItems:'center',justifyContent:'center',minHeight:'480px' }}>
          <p style={{ fontFamily:C,fontSize:'13px',fontStyle:'italic',color:'#bbb' }}>Praca artysty</p>
        </div>
      </section>

      {/* BIOGRAFIA */}
      {artysta.biografia && (
        <section style={{ padding:'80px 40px',borderTop:'1px solid #ebebeb',display:'grid',gridTemplateColumns:'200px 1fr',gap:'80px' }}>
          <div>
            <p style={{ fontFamily:C,fontSize:'13px',fontWeight:400,letterSpacing:'.2em',textTransform:'uppercase',color:'#999',marginBottom:'24px' }}>Biografia</p>
            <a href="#" className="arrow-link">&darr; Pelna biografia</a>
          </div>
          <div>
            <p style={{ fontFamily:C,fontSize:'clamp(16px,2vw,22px)',fontWeight:300,color:'#333',lineHeight:1.7,maxWidth:'680px' }}>
              {artysta.biografia.substring(0, 400)}{artysta.biografia.length > 400 ? '...' : ''}
            </p>
          </div>
        </section>
      )}

      {/* PRACE */}
      {prace && prace.length > 0 && (
        <section style={{ padding:'80px 40px',borderTop:'1px solid #ebebeb' }}>
          <div style={{ display:'grid',gridTemplateColumns:'200px 1fr',gap:'80px',alignItems:'start' }}>
            <div>
              <h2 style={{ fontFamily:C,fontSize:'28px',fontWeight:400,marginBottom:'16px' }}>Prace</h2>
              <a href="#" className="arrow-link">Wszystkie prace</a>
            </div>
            <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:'48px' }}>
              {prace.slice(0,4).map((p, i) => (
                <a key={i} href="#" className="praca-card" style={{ display:'block',transition:'opacity .2s' }}>
                  <div className="img-wrap" style={{ background:'#f0ece5',marginBottom:'16px',display:'flex',alignItems:'center',justifyContent:'center',aspectRatio:'4/3' }}>
                    <p style={{ fontFamily:C,fontSize:'12px',fontStyle:'italic',color:'#bbb' }}>Zdjecie pracy</p>
                  </div>
                  <p style={{ fontFamily:C,fontSize:'17px',fontWeight:400,marginBottom:'4px',textDecoration:'underline',textDecorationColor:'rgba(0,0,0,.3)' }}>{p.tytul}</p>
                  <p style={{ fontFamily:C,fontSize:'15px',fontWeight:300,color:'#888' }}>{p.rok}</p>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* WYSTAWY */}
      {wystawyArtysty && wystawyArtysty.length > 0 && (
        <section style={{ padding:'80px 40px',borderTop:'1px solid #ebebeb',background:'#faf9f7' }}>
          <div style={{ display:'flex',justifyContent:'space-between',alignItems:'baseline',marginBottom:'48px' }}>
            <h2 style={{ fontFamily:C,fontSize:'28px',fontWeight:400 }}>Wystawy w Galerii ESTA</h2>
            <a href="/wystawy" className="arrow-link">Wszystkie wystawy</a>
          </div>
          <div style={{ display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'24px' }}>
            {wystawyArtysty.map((wa: any, i: number) => (
              <a key={i} href={`/wystawa/${wa.wystawy?.url_wystawy}`} className="wystawa-card" style={{ display:'block',transition:'opacity .2s' }}>
                <div className="img-wrap" style={{ marginBottom:'16px',background:'#e8e4de' }}>
                  {wa.wystawy?.img_plakat
                    ? <img src={wa.wystawy.img_plakat} alt={wa.wystawy.tytul||''} className="img-hover" style={{ width:'100%',aspectRatio:'4/3',objectFit:'cover',display:'block' }} />
                    : <div style={{ aspectRatio:'4/3',background:'#e0ddd8' }} />
                  }
                </div>
                <p style={{ fontFamily:I,fontSize:'9px',fontWeight:600,letterSpacing:'.18em',textTransform:'uppercase',color:'#999',marginBottom:'8px' }}>
                  Wystawa galerii
                </p>
                <p style={{ fontFamily:C,fontSize:'16px',fontWeight:400,marginBottom:'4px',lineHeight:1.3 }}>
                  {wa.wystawy?.tytul}
                </p>
                <p style={{ fontFamily:C,fontSize:'13px',fontWeight:300,color:'#888' }}>
                  {wa.wystawy?.data_od ? new Date(wa.wystawy.data_od).toLocaleDateString('pl-PL',{day:'numeric',month:'long'}) : ''}
                  {wa.wystawy?.data_do ? ` — ${new Date(wa.wystawy.data_do).toLocaleDateString('pl-PL',{day:'numeric',month:'long',year:'numeric'})}` : ''}
                </p>
                {wa.wystawy?.miasto && (
                  <p style={{ fontFamily:I,fontSize:'11px',color:'#bbb',marginTop:'4px',fontWeight:600 }}>{wa.wystawy.miejsce||''}{wa.wystawy.miasto ? `, ${wa.wystawy.miasto}` : ''}</p>
                )}
              </a>
            ))}
          </div>
        </section>
      )}

      {/* KONTAKT */}
      <section style={{ padding:'80px 40px',borderTop:'1px solid #ebebeb',display:'grid',gridTemplateColumns:'200px 1fr',gap:'80px',alignItems:'center' }}>
        <div>
          <p style={{ fontFamily:C,fontSize:'13px',fontWeight:400,letterSpacing:'.2em',textTransform:'uppercase',color:'#999',marginBottom:'16px' }}>Kontakt</p>
          <p style={{ fontFamily:C,fontSize:'16px',fontWeight:300,color:'#555',lineHeight:1.7 }}>
            Zapytaj o prace<br/>tego artysty
          </p>
        </div>
        <div>
          <a href="mailto:galeria@galeria-esta.pl" className="arrow-link" style={{ fontSize:'14px' }}>
            &rarr; galeria@galeria-esta.pl
          </a>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background:'#111',padding:'64px 40px',display:'grid',gridTemplateColumns:'2fr 1fr 1fr 1fr',gap:'48px' }}>
        <div>
          <p style={{ fontFamily:C,fontSize:'18px',fontWeight:400,color:'#fff',letterSpacing:'.1em',marginBottom:'20px' }}>Galeria ESTA</p>
          <p style={{ fontFamily:I,fontSize:'12px',lineHeight:2,color:'#555' }}>ul. Raciborska 8, Gliwice<br/>Od 1998 roku<br/>galeria@galeria-esta.pl</p>
        </div>
        <div>
          <p style={{ fontFamily:I,fontSize:'10px',letterSpacing:'.18em',textTransform:'uppercase',color:'#333',marginBottom:'16px' }}>Menu</p>
          {['Artysci','Wystawy','Targi','Oferta','Viewing Room','O nas'].map(item => (
            <a key={item} href="#" style={{ display:'block',fontFamily:I,fontSize:'12px',color:'#555',lineHeight:2.2 }}>{item}</a>
          ))}
        </div>
        <div>
          <p style={{ fontFamily:I,fontSize:'10px',letterSpacing:'.18em',textTransform:'uppercase',color:'#333',marginBottom:'16px' }}>Godziny</p>
          <p style={{ fontFamily:I,fontSize:'12px',lineHeight:2,color:'#555' }}>Wt — Pt: 11:00 — 18:00<br/>Sob: 11:00 — 15:00<br/>Nd — Pn: zamkniete</p>
        </div>
        <div>
          <p style={{ fontFamily:I,fontSize:'10px',letterSpacing:'.18em',textTransform:'uppercase',color:'#333',marginBottom:'16px' }}>Social</p>
          <p style={{ fontFamily:I,fontSize:'12px',lineHeight:2.2,color:'#555' }}>Instagram<br/>Facebook</p>
        </div>
      </footer>
    </main>
  )
}
