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
    .select('url, alt, opis, typ, cover, kolejnosc')
    .eq('wystawa_id', w.id)
    .order('kolejnosc')

  const { data: artysciWystawy } = await supabase
    .from('wystawy_artysci')
    .select('opis_w_wystawie, artysci(nazwisko_i_imie, url_artysty, biografia, dziedzina)')
    .eq('wystawa_id', w.id)

  const { data: materialy } = await supabase
    .from('wystawy_materialy')
    .select('typ, tytul, url, opis, zrodlo')
    .eq('wystawa_id', w.id)

  const C = '"Cormorant Garamond", Georgia, serif'
  const I = '"Instrument Sans", sans-serif'

  const fmtDate = (d: string | null) => d
    ? new Date(d).toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' })
    : ''

  const coverZdjecie = zdjecia?.find(z => z.cover) || zdjecia?.[0]
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
        .img-wrap{overflow:hidden;}
        .img-hover{transition:transform .7s cubic-bezier(.25,.46,.45,.94);}
        .img-wrap:hover .img-hover{transform:scale(1.04);}
        .artysta-link{transition:opacity .2s;}
        .artysta-link:hover{opacity:.6;}
      `}</style>

      <nav style={{ position:'fixed',top:0,left:0,right:0,zIndex:100,padding:'0 40px',height:'54px',display:'flex',alignItems:'center',justifyContent:'space-between',background:'rgba(255,255,255,.96)',borderBottom:'1px solid #ebebeb' }}>
        <a href="/" style={{ fontFamily:C,fontSize:'16px',fontWeight:400,letterSpacing:'.2em',textTransform:'uppercase' }}>Galeria ESTA</a>
        <div style={{ display:'flex',gap:'28px' }}>
          <a href="/artysci" className="nav-link">Artysci</a>
          <a href="/wystawy" className="nav-link" style={{ opacity:1 }}>Wystawy</a>
          <a href="/targi" className="nav-link">Targi</a>
          {['Publikacje','Artykuly','Filmy','Oferta','Viewing Room','O nas'].map(item => (
            <a key={item} href="#" className="nav-link">{item}</a>
          ))}
        </div>
        <a href="#" className="nav-link" style={{ fontSize:'10px' }}>PL / EN</a>
      </nav>

      {/* HERO */}
      <section style={{ paddingTop:'54px',position:'relative',height:'100vh',overflow:'hidden',background:'#111' }}>
        {w.img_plakat && (
          <img src={w.img_plakat} alt={w.tytul||''} style={{ width:'100%',height:'100%',objectFit:'cover',display:'block',opacity:.8 }} />
        )}
        <div style={{ position:'absolute',inset:0,background:'linear-gradient(to bottom,rgba(0,0,0,.3) 0%,rgba(0,0,0,.1) 40%,rgba(0,0,0,.6) 100%)' }} />
        <div style={{ position:'absolute',inset:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',textAlign:'center',padding:'0 40px' }}>
          <h1 style={{ fontFamily:C,fontSize:'clamp(40px,6vw,88px)',fontWeight:400,color:'#fff',lineHeight:1.0,marginBottom:'12px' }}>
            {w.artysci_txt||''}
          </h1>
          <p style={{ fontFamily:C,fontSize:'clamp(20px,3vw,40px)',fontWeight:300,fontStyle:'italic',color:'rgba(255,255,255,.8)',marginBottom:'20px' }}>
            {w.tytul||''}
          </p>
          <p style={{ fontFamily:C,fontSize:'clamp(14px,1.5vw,20px)',fontWeight:300,color:'rgba(255,255,255,.6)' }}>
            {fmtDate(w.data_od)} &ndash; {fmtDate(w.data_do)}
          </p>
        </div>
      </section>

      {/* SEKCJA GLOWNA – zdjecie lewo, tekst prawo */}
      <section style={{ display:'grid',gridTemplateColumns:'3fr 2fr',minHeight:'80vh',borderTop:'1px solid #ebebeb' }}>
        <div className="img-wrap">
          {coverZdjecie?.url
            ? <img src={coverZdjecie.url} alt={coverZdjecie.alt||''} className="img-hover" style={{ width:'100%',height:'100%',objectFit:'cover',display:'block' }} />
            : w.img_plakat
              ? <img src={w.img_plakat} alt={w.tytul||''} className="img-hover" style={{ width:'100%',height:'100%',objectFit:'cover',display:'block' }} />
              : <div style={{ width:'100%',height:'100%',background:'#f0ece5',minHeight:'500px' }} />
          }
        </div>
        <div style={{ padding:'72px 48px',display:'flex',flexDirection:'column',justifyContent:'center',borderLeft:'1px solid #ebebeb' }}>
          <a href="/wystawy" style={{ fontFamily:I,fontSize:'10px',letterSpacing:'.16em',textTransform:'uppercase',color:'#999',marginBottom:'48px',display:'block' }}>
            &larr; Wystawy
          </a>
          <p style={{ fontFamily:C,fontSize:'13px',fontWeight:400,letterSpacing:'.2em',textTransform:'uppercase',color:'#111',marginBottom:'24px' }}>
            Wystawa galerii
          </p>
          <h2 style={{ fontFamily:C,fontSize:'clamp(28px,3vw,48px)',fontWeight:400,lineHeight:1.05,marginBottom:'8px' }}>
            {w.artysci_txt||''}
          </h2>
          <p style={{ fontFamily:C,fontSize:'clamp(16px,1.8vw,26px)',fontWeight:300,fontStyle:'italic',color:'#666',marginBottom:'32px',lineHeight:1.3 }}>
            {w.tytul||''}
          </p>
          <p style={{ fontFamily:C,fontSize:'16px',fontWeight:400,marginBottom:'4px' }}>
            {fmtDate(w.data_od)} &ndash; {fmtDate(w.data_do)}
          </p>
          <p style={{ fontFamily:C,fontSize:'16px',fontWeight:400,marginBottom:'32px' }}>
            {w.miejsce||'Galeria ESTA, Gliwice'}
          </p>
          {w.opis_krotki && (
            <p style={{ fontFamily:C,fontSize:'16px',fontWeight:300,color:'#444',lineHeight:1.7,marginBottom:'40px' }}>
              {w.opis_krotki}
            </p>
          )}
          <a href="mailto:galeria@galeria-esta.pl" className="arrow-link">&rarr; Zapytaj o wystawe</a>
        </div>
      </section>

      {/* OPIS PELNY */}
      {w.opis_pelny && (
        <section style={{ padding:'80px 40px',borderTop:'1px solid #ebebeb',display:'grid',gridTemplateColumns:'200px 1fr',gap:'80px' }}>
          <p style={{ fontFamily:C,fontSize:'13px',fontWeight:400,letterSpacing:'.2em',textTransform:'uppercase',color:'#999' }}>O wystawie</p>
          <div>
            {w.cytat && (
              <blockquote style={{ fontFamily:C,fontSize:'clamp(18px,2.5vw,28px)',fontWeight:300,fontStyle:'italic',color:'#333',lineHeight:1.5,marginBottom:'40px',paddingLeft:'28px',borderLeft:'2px solid #e8e8e8' }}>
                &ldquo;{w.cytat}&rdquo;
                {w.cytat_autor && <footer style={{ fontFamily:I,fontSize:'12px',color:'#999',marginTop:'12px',fontStyle:'normal' }}>&mdash; {w.cytat_autor}</footer>}
              </blockquote>
            )}
            <p style={{ fontFamily:C,fontSize:'17px',fontWeight:300,color:'#444',lineHeight:1.8,whiteSpace:'pre-line' }}>
              {w.opis_pelny}
            </p>
          </div>
        </section>
      )}

      {/* GALERIA ZDJEC */}
      {pozostaleZdjecia.length > 0 && (
        <section style={{ padding:'80px 40px',borderTop:'1px solid #ebebeb' }}>
          <h2 style={{ fontFamily:C,fontSize:'28px',fontWeight:400,marginBottom:'48px' }}>Widoki ekspozycji</h2>
          <div style={{ display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'2px',background:'#e8e8e8' }}>
            {pozostaleZdjecia.map((z, i) => (
              <div key={i} className="img-wrap" style={{ background:'#fff' }}>
                <img src={z.url} alt={z.alt||''} className="img-hover" style={{ width:'100%',aspectRatio:'4/3',objectFit:'cover',display:'block' }} />
                {z.opis && <p style={{ fontFamily:I,fontSize:'11px',color:'#888',padding:'10px 16px' }}>{z.opis}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* MATERIALY */}
      {materialy && materialy.length > 0 && (
        <section style={{ padding:'80px 40px',borderTop:'1px solid #ebebeb' }}>
          <h2 style={{ fontFamily:C,fontSize:'28px',fontWeight:400,marginBottom:'48px' }}>Materialy</h2>
          <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0' }}>
            {materialy.map((m: any, i: number) => (
              <a key={i} href={m.url||'#'} style={{ display:'block',padding:'24px 0',borderBottom:'1px solid #ebebeb',paddingRight:i%2===0?'40px':'0',paddingLeft:i%2===1?'40px':'0',borderRight:i%2===0?'1px solid #ebebeb':'none' }}>
                <p style={{ fontFamily:I,fontSize:'10px',letterSpacing:'.16em',textTransform:'uppercase',color:'#999',marginBottom:'8px' }}>{m.typ}</p>
                <p style={{ fontFamily:C,fontSize:'18px',fontWeight:400,marginBottom:'4px' }}>{m.tytul}</p>
                {m.zrodlo && <p style={{ fontFamily:I,fontSize:'12px',color:'#888' }}>{m.zrodlo}</p>}
              </a>
            ))}
          </div>
        </section>
      )}

      {/* ZAPROSZENIE DO ARTYSTY */}
      {artysciWystawy && artysciWystawy.map((wa: any, i: number) => (
        <section key={i} style={{ borderTop:'1px solid #ebebeb',display:'grid',gridTemplateColumns:'1fr 1fr',minHeight:'60vh' }}>
          <div style={{ background:'#f8f8f6',overflow:'hidden',display:'flex',alignItems:'center',justifyContent:'center',minHeight:'400px' }}>
            <p style={{ fontFamily:C,fontSize:'13px',fontStyle:'italic',color:'#ccc' }}>Zdjecie artysty</p>
          </div>
          <a href={`/artysta/${wa.artysci?.url_artysty||'#'}`} className="artysta-link" style={{ display:'flex',flexDirection:'column',justifyContent:'center',padding:'72px 56px',borderLeft:'1px solid #ebebeb' }}>
            <p style={{ fontFamily:C,fontSize:'13px',fontWeight:400,letterSpacing:'.2em',textTransform:'uppercase',color:'#999',marginBottom:'32px' }}>
              Artysta
            </p>
            <h2 style={{ fontFamily:C,fontSize:'clamp(32px,4vw,60px)',fontWeight:400,lineHeight:1.0,marginBottom:'32px' }}>
              {wa.artysci?.nazwisko_i_imie||''}
            </h2>
            {wa.opis_w_wystawie && (
              <p style={{ fontFamily:C,fontSize:'16px',fontWeight:300,color:'#666',lineHeight:1.7,marginBottom:'40px',maxWidth:'420px' }}>
                {wa.opis_w_wystawie}
              </p>
            )}
            <span className="arrow-link">&rarr; Strona artysty</span>
          </a>
        </section>
      ))}

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
