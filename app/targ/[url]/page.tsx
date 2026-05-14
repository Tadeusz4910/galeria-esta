import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default async function TargPage({ params }: { params: Promise<{ url: string }> }) {
  const { url } = await params
  const { data: targi } = await supabase
    .from('targi')
    .select('*')
    .eq('url_targu', url)
    .limit(1)

  const t = targi?.[0]
  if (!t) notFound()

  const { data: zdjecia } = await supabase
    .from('targi_zdjecia')
    .select('url, alt, opis, cover')
    .eq('targ_id', t.id)
    .order('kolejnosc')

  const C = '"Cormorant Garamond", Georgia, serif'
  const I = '"Instrument Sans", sans-serif'

  const fmtDate = (d: string | null) => d
    ? new Date(d).toLocaleDateString('pl-PL', { day:'numeric', month:'long', year:'numeric' })
    : ''

  return (
    <main style={{ background:'#fff',color:'#111' }}>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0;}
        a{text-decoration:none;color:inherit;}
        .nav-link{font-family:"Instrument Sans",sans-serif;font-size:11px;letter-spacing:.12em;text-transform:uppercase;opacity:.5;transition:opacity .2s;}
        .nav-link:hover{opacity:1;}
        .card-img{transition:transform .6s ease;}
        .card-hover:hover .card-img{transform:scale(1.03);}
      `}</style>

      <nav style={{ position:'fixed',top:0,left:0,right:0,zIndex:100,padding:'0 40px',height:'54px',display:'flex',alignItems:'center',justifyContent:'space-between',background:'rgba(255,255,255,.96)',borderBottom:'1px solid #ebebeb' }}>
        <a href="/" style={{ fontFamily:C,fontSize:'16px',fontWeight:400,letterSpacing:'.2em',textTransform:'uppercase' }}>Galeria ESTA</a>
        <div style={{ display:'flex',gap:'28px' }}>
          <a href="/artysci" className="nav-link">Artysci</a>
          <a href="/wystawy" className="nav-link">Wystawy</a>
          <a href="/targi" className="nav-link" style={{ opacity:1 }}>Targi</a>
          {['Publikacje','Artykuly','Filmy','Oferta','Viewing Room','O nas'].map(item => (
            <a key={item} href="#" className="nav-link">{item}</a>
          ))}
        </div>
        <a href="#" className="nav-link" style={{ fontSize:'10px' }}>PL / EN</a>
      </nav>

      {t.img_cover && (
        <section style={{ paddingTop:'54px',height:'70vh',overflow:'hidden' }}>
          <img src={t.img_cover} alt={t.nazwa||''} style={{ width:'100%',height:'100%',objectFit:'cover',display:'block' }} />
        </section>
      )}

      <section style={{ display:'grid',gridTemplateColumns:'2fr 3fr',borderTop:'1px solid #ebebeb',paddingTop:t.img_cover?'0':'54px' }}>
        <div style={{ padding:'64px 48px 64px 40px',borderRight:'1px solid #ebebeb' }}>
          <a href="/targi" style={{ fontFamily:I,fontSize:'10px',letterSpacing:'.16em',textTransform:'uppercase',color:'#999',marginBottom:'48px',display:'block' }}>&larr; Targi</a>
          <h1 style={{ fontFamily:C,fontSize:'clamp(28px,3.5vw,52px)',fontWeight:400,lineHeight:1.05,marginBottom:'16px',marginTop:'24px' }}>{t.nazwa}</h1>
          {t.artysci_txt && <p style={{ fontFamily:C,fontSize:'clamp(16px,1.8vw,24px)',fontWeight:300,fontStyle:'italic',color:'#666' }}>{t.artysci_txt}</p>}
        </div>
        <div style={{ padding:'64px 40px 64px 48px',display:'flex',flexDirection:'column',justifyContent:'center',gap:'16px' }}>
          <div>
            <p style={{ fontFamily:I,fontSize:'10px',letterSpacing:'.18em',textTransform:'uppercase',color:'#999',marginBottom:'6px' }}>Daty</p>
            <p style={{ fontFamily:C,fontSize:'16px',fontWeight:400 }}>{fmtDate(t.data_od)} &ndash; {fmtDate(t.data_do)}</p>
          </div>
          {t.miasto && (
            <div>
              <p style={{ fontFamily:I,fontSize:'10px',letterSpacing:'.18em',textTransform:'uppercase',color:'#999',marginBottom:'6px' }}>Miasto</p>
              <p style={{ fontFamily:C,fontSize:'16px',fontWeight:400 }}>{t.miasto}</p>
            </div>
          )}
          {t.numer_stoiska && (
            <div>
              <p style={{ fontFamily:I,fontSize:'10px',letterSpacing:'.18em',textTransform:'uppercase',color:'#999',marginBottom:'6px' }}>Stoisko</p>
              <p style={{ fontFamily:C,fontSize:'16px',fontWeight:400 }}>{t.numer_stoiska}</p>
            </div>
          )}
        </div>
      </section>

      {t.opis && (
        <section style={{ padding:'80px 40px',borderTop:'1px solid #ebebeb',display:'grid',gridTemplateColumns:'200px 1fr',gap:'80px' }}>
          <p style={{ fontFamily:I,fontSize:'10px',letterSpacing:'.18em',textTransform:'uppercase',color:'#999' }}>O targach</p>
          <p style={{ fontFamily:C,fontSize:'17px',fontWeight:300,color:'#444',lineHeight:1.7 }}>{t.opis}</p>
        </section>
      )}

      {zdjecia && zdjecia.length > 0 && (
        <section style={{ padding:'80px 40px',borderTop:'1px solid #ebebeb' }}>
          <h2 style={{ fontFamily:C,fontSize:'28px',fontWeight:400,marginBottom:'48px' }}>Dokumentacja</h2>
          <div style={{ display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'2px',background:'#e8e8e8' }}>
            {zdjecia.map((z, i) => (
              <div key={i} style={{ overflow:'hidden',background:'#fff' }}>
                <img src={z.url} alt={z.alt||''} className="card-img" style={{ width:'100%',aspectRatio:'4/3',objectFit:'cover',display:'block' }} />
              </div>
            ))}
          </div>
        </section>
      )}

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
