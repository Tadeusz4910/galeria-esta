import { createClient } from '@supabase/supabase-js'
import Nav from '@/components/Nav'
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
    .select('url, alt, opis, cover, kolejnosc')
    .eq('targ_id', t.id)
    .order('kolejnosc')

  const C = '"Cormorant Garamond", Georgia, serif'
  const I = '"Instrument Sans", sans-serif'

  const fmtDate = (d: string | null) => d
    ? new Date(d).toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' })
    : ''

  const coverZdjecie = zdjecia?.find(z => z.cover) || zdjecia?.[0]
  const pozostaleZdjecia = zdjecia?.filter((_, i) => i > 0) || []

  return (
    <main style={{ background: '#fff', color: '#111' }}>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0;}
        a{text-decoration:none;color:inherit;}
        .arrow-link{display:inline-flex;align-items:center;gap:8px;font-family:"Instrument Sans",sans-serif;font-size:11px;letter-spacing:.12em;text-transform:uppercase;opacity:.6;transition:opacity .2s;}
        .arrow-link:hover{opacity:1;}
        .img-hover{transition:transform .6s ease;}
        .img-wrap:hover .img-hover{transform:scale(1.03);}
      `}</style>

      <Nav active="targi" />

      <section style={{ paddingTop:'54px',position:'relative',height:'100vh',overflow:'hidden',background:'#111' }}>
        {(t.img_cover || coverZdjecie?.url) && (
          <img src={t.img_cover || coverZdjecie?.url} alt={t.nazwa || ''} style={{ width:'100%',height:'100%',objectFit:'cover',display:'block',opacity:.85 }} />
        )}
        <div style={{ position:'absolute',inset:0,background:'linear-gradient(to top,rgba(0,0,0,.75) 0%,rgba(0,0,0,.1) 50%,transparent 100%)' }} />
        <div style={{ position:'absolute',bottom:0,left:0,right:0,padding:'56px 40px' }}>
          <p style={{ fontFamily:C,fontSize:'13px',fontWeight:400,letterSpacing:'.2em',textTransform:'uppercase',color:'rgba(255,255,255,.6)',marginBottom:'16px' }}>Targi sztuki</p>
          <h1 style={{ fontFamily:C,fontSize:'clamp(36px,5vw,72px)',fontWeight:400,color:'#fff',lineHeight:1.0,marginBottom:'12px' }}>{t.nazwa}</h1>
          <p style={{ fontFamily:C,fontSize:'clamp(16px,2vw,24px)',fontWeight:300,color:'rgba(255,255,255,.7)' }}>
            {fmtDate(t.data_od)} &ndash; {fmtDate(t.data_do)}
          </p>
        </div>
      </section>

      <section style={{ display:'grid',gridTemplateColumns:'1fr 2fr',gap:'0',borderTop:'1px solid #ebebeb' }}>
        <div style={{ padding:'64px 40px',borderRight:'1px solid #ebebeb' }}>
          <a href="/targi" style={{ fontFamily:I,fontSize:'10px',letterSpacing:'.16em',textTransform:'uppercase',color:'#999',marginBottom:'48px',display:'block' }}>&larr; Targi</a>
          <div style={{ marginTop:'32px' }}>
            <p style={{ fontFamily:I,fontSize:'10px',letterSpacing:'.18em',textTransform:'uppercase',color:'#999',marginBottom:'8px' }}>Daty</p>
            <p style={{ fontFamily:C,fontSize:'16px',fontWeight:400,marginBottom:'32px' }}>{fmtDate(t.data_od)}<br/>{fmtDate(t.data_do)}</p>
          </div>
          {t.miasto && (
            <div>
              <p style={{ fontFamily:I,fontSize:'10px',letterSpacing:'.18em',textTransform:'uppercase',color:'#999',marginBottom:'8px' }}>Miejsce</p>
              <p style={{ fontFamily:C,fontSize:'16px',fontWeight:400,marginBottom:'4px' }}>{t.organizator || ''}</p>
              <p style={{ fontFamily:C,fontSize:'16px',fontWeight:300,color:'#666' }}>{t.miasto}</p>
            </div>
          )}
          {t.numer_stoiska && (
            <div style={{ marginTop:'32px' }}>
              <p style={{ fontFamily:I,fontSize:'10px',letterSpacing:'.18em',textTransform:'uppercase',color:'#999',marginBottom:'8px' }}>Stoisko</p>
              <p style={{ fontFamily:C,fontSize:'16px',fontWeight:400 }}>{t.numer_stoiska}</p>
            </div>
          )}
        </div>
        <div style={{ padding:'64px 48px' }}>
          {t.artysci_txt && (
            <p style={{ fontFamily:C,fontSize:'clamp(20px,2.5vw,32px)',fontWeight:400,marginBottom:'32px',lineHeight:1.2 }}>{t.artysci_txt}</p>
          )}
          {t.opis && (
            <p style={{ fontFamily:C,fontSize:'17px',fontWeight:300,color:'#444',lineHeight:1.7,maxWidth:'640px' }}>{t.opis}</p>
          )}
        </div>
      </section>

      {pozostaleZdjecia.length > 0 && (
        <section style={{ padding:'80px 40px',borderTop:'1px solid #ebebeb' }}>
          <h2 style={{ fontFamily:C,fontSize:'28px',fontWeight:400,marginBottom:'48px' }}>Dokumentacja</h2>
          <div style={{ display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'2px',background:'#e8e8e8' }}>
            {pozostaleZdjecia.map((z, i) => (
              <div key={i} className="img-wrap" style={{ overflow:'hidden',background:'#fff' }}>
                <img src={z.url} alt={z.alt || ''} className="img-hover" style={{ width:'100%',aspectRatio:'4/3',objectFit:'cover',display:'block' }} />
                {z.opis && <p style={{ fontFamily:I,fontSize:'11px',color:'#888',padding:'10px 16px' }}>{z.opis}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      <section style={{ padding:'80px 40px',borderTop:'1px solid #ebebeb',background:'#faf9f7',display:'grid',gridTemplateColumns:'1fr 1fr',gap:'96px',alignItems:'center' }}>
        <div>
          <p style={{ fontFamily:C,fontSize:'13px',fontWeight:400,letterSpacing:'.2em',textTransform:'uppercase',color:'#999',marginBottom:'24px' }}>Zapytaj o prace</p>
          <h2 style={{ fontFamily:C,fontSize:'clamp(28px,3vw,44px)',fontWeight:400,lineHeight:1.1,marginBottom:'24px' }}>Zainteresowany<br/>pracami z tych targow?</h2>
          <p style={{ fontFamily:C,fontSize:'16px',fontWeight:300,color:'#555',lineHeight:1.7,marginBottom:'40px' }}>Skontaktuj sie z nami – chetnie opowiemy o prezentowanych pracach i artystach.</p>
          <a href="mailto:galeria@galeria-esta.pl" className="arrow-link">&rarr; galeria@galeria-esta.pl</a>
        </div>
        <div style={{ borderLeft:'1px solid #ebebeb',paddingLeft:'48px' }}>
          <p style={{ fontFamily:C,fontSize:'16px',fontWeight:400,marginBottom:'8px' }}>Galeria ESTA</p>
          <p style={{ fontFamily:C,fontSize:'16px',fontWeight:300,color:'#666',lineHeight:1.8 }}>ul. Raciborska 8<br/>Gliwice<br/>galeria@galeria-esta.pl</p>
        </div>
      </section>

      <footer style={{ background:'#111',padding:'64px 40px',display:'grid',gridTemplateColumns:'2fr 1fr 1fr 1fr',gap:'48px' }}>
        <div>
          <p style={{ fontFamily:C,fontSize:'18px',fontWeight:400,color:'#fff',letterSpacing:'.1em',marginBottom:'20px' }}>Galeria ESTA</p>
          <p style={{ fontFamily:I,fontSize:'12px',lineHeight:2,color:'#555' }}>ul. Raciborska 8, Gliwice<br/>Od 1998 roku<br/>galeria@galeria-esta.pl</p>
        </div>
        <div>
          <p style={{ fontFamily:I,fontSize:'10px',letterSpacing:'.18em',textTransform:'uppercase',color:'#333',marginBottom:'16px' }}>Menu</p>
          {['Artysci','Wystawy','Targi','Idee','Kolekcja','Kompendium','Viewing Room','O nas'].map(item => (
            <a key={item} href={item === 'Artysci' ? '/artysci' : item === 'Wystawy' ? '/wystawy' : item === 'Targi' ? '/targi' : item === 'Idee' ? '/idee' : item === 'Kompendium' ? '/kompendium' : '#'} style={{ display:'block',fontFamily:I,fontSize:'12px',color:'#555',lineHeight:2.2 }}>{item}</a>
          ))}
        </div>
        <div>
          <p style={{ fontFamily:I,fontSize:'10px',letterSpacing:'.18em',textTransform:'uppercase',color:'#333',marginBottom:'16px' }}>Godziny</p>
          <p style={{ fontFamily:I,fontSize:'12px',lineHeight:2,color:'#555' }}>Wt &mdash; Pt: 11:00 &mdash; 18:00<br/>Sob: 11:00 &mdash; 15:00<br/>Nd &mdash; Pn: zamkniete</p>
        </div>
        <div>
          <p style={{ fontFamily:I,fontSize:'10px',letterSpacing:'.18em',textTransform:'uppercase',color:'#333',marginBottom:'16px' }}>Social</p>
          <p style={{ fontFamily:I,fontSize:'12px',lineHeight:2.2,color:'#555' }}>Instagram<br/>Facebook</p>
        </div>
      </footer>
    </main>
  )
}
