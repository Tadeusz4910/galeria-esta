import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default async function Home() {
  const { data: wystawy } = await supabase
    .from('wystawy')
    .select('tytul, artysci_txt, data_od, data_do, url_wystawy, img_plakat')
    .not('tytul', 'is', null)
    .order('data_od', { ascending: false })
    .limit(4)

  const { data: targi } = await supabase
    .from('targi')
    .select('nazwa, artysci_txt, data_od, data_do, url_targu, img_cover')
    .eq('publiczne', true)
    .order('data_od', { ascending: false })
    .limit(3)

  const { data: artysci } = await supabase
    .from('artysci')
    .select('nazwisko_i_imie, url_artysty')
    .eq('status_w_galerii', 'aktywny')
    .order('nazwisko_i_imie')

  const hero = wystawy?.[0]
  const pozostale = wystawy?.slice(1) || []

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400;1,500&family=Instrument+Sans:wght@400;500;600&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        body{background:#fff;color:#111;font-family:'Instrument Sans',sans-serif;}
        a{text-decoration:none;color:inherit;}
        .nav-link{font-family:'Instrument Sans',sans-serif;font-size:11px;letter-spacing:.12em;text-transform:uppercase;opacity:.5;transition:opacity .2s;}
        .nav-link:hover{opacity:1;}
        .nav-link-white{font-family:'Instrument Sans',sans-serif;color:#fff;font-size:11px;letter-spacing:.12em;text-transform:uppercase;opacity:.65;transition:opacity .2s;}
        .nav-link-white:hover{opacity:1;}
        .card-hover:hover .card-img{transform:scale(1.03);}
        .card-img{transition:transform .8s cubic-bezier(.25,.46,.45,.94);}
        .artist-link{font-family:'Cormorant+Garamond',Georgia,serif;display:block;font-size:16px;font-weight:400;line-height:2.4;border-bottom:1px solid #ebebeb;}
        .artist-link:hover{opacity:.4;}
      `}</style>

      <main style={{background:'#fff'}}>

        {/* NAWIGACJA */}
        <nav style={{position:'fixed',top:0,left:0,right:0,zIndex:100,padding:'0 40px',height:'54px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <a href="/" style={{fontFamily:'"Cormorant Garamond",Georgia,serif',fontSize:'16px',fontWeight:400,letterSpacing:'.2em',textTransform:'uppercase',color:'#fff'}}>
            Galeria ESTA
          </a>
          <div style={{display:'flex',gap:'28px'}}>
            {['Artysci','Wystawy','Targi','Publikacje','Artykuly','Filmy','Oferta','Viewing Room','O nas'].map(item => (
              <a key={item} href="#" className="nav-link-white">{item}</a>
            ))}
          </div>
          <a href="#" className="nav-link-white" style={{fontSize:'10px'}}>PL / EN</a>
        </nav>

        {/* HERO */}
        <section style={{position:'relative',height:'100vh',overflow:'hidden',background:'#000'}}>
          {hero?.img_plakat && (
            <img
              src={hero.img_plakat}
              alt={hero.tytul || ''}
              style={{width:'100%',height:'100%',objectFit:'cover',display:'block',opacity:.85}}
            />
          )}
          <div style={{position:'absolute',inset:0,background:'linear-gradient(to top,rgba(0,0,0,.82) 0%,rgba(0,0,0,.18) 45%,transparent 100%)'}} />
          <div style={{position:'absolute',bottom:0,left:0,right:0,padding:'56px 40px'}}>
            <p style={{fontFamily:'"Instrument Sans",sans-serif',fontSize:'10px',letterSpacing:'.22em',textTransform:'uppercase',color:'rgba(255,255,255,.45)',marginBottom:'18px'}}>
              Aktualna wystawa
            </p>
            <p style={{fontFamily:'"Cormorant Garamond",Georgia,serif',fontSize:'clamp(40px,5.5vw,80px)',fontWeight:400,color:'#fff',lineHeight:1.0,marginBottom:'10px',letterSpacing:'-.01em'}}>
              {hero?.artysci_txt || ''}
            </p>
            <p style={{fontFamily:'"Cormorant Garamond",Georgia,serif',fontSize:'clamp(22px,3vw,44px)',fontWeight:300,fontStyle:'italic',color:'rgba(255,255,255,.65)',marginBottom:'36px'}}>
              {hero?.tytul || ''}
            </p>
            <a href={`/wystawa/${hero?.url_wystawy || ''}`} style={{display:'inline-block',padding:'12px 32px',border:'1px solid rgba(255,255,255,.35)',color:'#fff',fontFamily:'"Instrument Sans",sans-serif',fontSize:'10px',letterSpacing:'.18em',textTransform:'uppercase'}}>
              Wiecej
            </a>
          </div>
        </section>

        {/* WYSTAWY */}
        <section style={{padding:'96px 40px 80px'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'baseline',marginBottom:'48px',borderBottom:'1px solid #e8e8e8',paddingBottom:'14px'}}>
            <h2 style={{fontFamily:'"Cormorant Garamond",Georgia,serif',fontSize:'20px',fontWeight:400,letterSpacing:'.06em'}}>Wystawy</h2>
            <a href="/wystawy" className="nav-link">Wszystkie wystawy</a>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'2px',background:'#e8e8e8'}}>
            {pozostale.map((w, i) => (
              <a key={i} href={`/wystawa/${w.url_wystawy}`} className="card-hover" style={{display:'block',background:'#fff',overflow:'hidden'}}>
                <div style={{overflow:'hidden',aspectRatio:'4/3'}}>
                  <img
                    src={w.img_plakat || ''}
                    alt={w.tytul || ''}
                    className="card-img"
                    style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}}
                  />
                </div>
                <div style={{padding:'20px 24px 28px'}}>
                  <p style={{fontFamily:'"Instrument Sans",sans-serif',fontSize:'10px',letterSpacing:'.18em',textTransform:'uppercase',color:'#999',marginBottom:'8px'}}>
                    {w.data_od ? new Date(w.data_od).toLocaleDateString('pl-PL',{day:'numeric',month:'long',year:'numeric'}) : ''}
                  </p>
                  <p style={{fontFamily:'"Cormorant Garamond",Georgia,serif',fontSize:'18px',fontWeight:400,color:'#111',marginBottom:'4px',lineHeight:1.3}}>{w.artysci_txt}</p>
                  <p style={{fontFamily:'"Cormorant Garamond",Georgia,serif',fontSize:'15px',fontWeight:300,fontStyle:'italic',color:'#666',lineHeight:1.4}}>{w.tytul}</p>
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* ARTYSCI */}
        <section style={{padding:'0 40px 96px',display:'grid',gridTemplateColumns:'1fr 2fr',gap:'80px',alignItems:'start'}}>
          <div style={{borderTop:'1px solid #e8e8e8',paddingTop:'14px'}}>
            <h2 style={{fontFamily:'"Cormorant Garamond",Georgia,serif',fontSize:'20px',fontWeight:400,letterSpacing:'.06em'}}>Artysci</h2>
          </div>
          <div style={{borderTop:'1px solid #e8e8e8',paddingTop:'0'}}>
            <div style={{columns:'2',columnGap:'40px'}}>
              {(artysci || []).map(a => (
                <a key={a.url_artysty || a.nazwisko_i_imie} href={`/${a.url_artysty || '#'}`} className="artist-link">
                  {a.nazwisko_i_imie}
                </a>
              ))}
            </div>
            <div style={{marginTop:'28px'}}>
              <a href="/artysci" className="nav-link">Wszyscy artysci</a>
            </div>
          </div>
        </section>

        {/* TARGI */}
        <section style={{padding:'80px 40px',background:'#f8f8f6'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'baseline',marginBottom:'48px',borderBottom:'1px solid #ddd',paddingBottom:'14px'}}>
            <h2 style={{fontFamily:'"Cormorant Garamond",Georgia,serif',fontSize:'20px',fontWeight:400,letterSpacing:'.06em'}}>Targi</h2>
            <a href="/targi" className="nav-link">Wszystkie targi</a>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'40px'}}>
            {(targi || []).map((t, i) => (
              <a key={i} href={`/targ/${t.url_targu}`} className="card-hover" style={{display:'block'}}>
                <div style={{overflow:'hidden',aspectRatio:'3/2',marginBottom:'16px',background:'#e8e8e8'}}>
                  {t.img_cover && (
                    <img
                      src={t.img_cover}
                      alt={t.nazwa || ''}
                      className="card-img"
                      style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}}
                    />
                  )}
                </div>
                <p style={{fontFamily:'"Instrument Sans",sans-serif',fontSize:'10px',letterSpacing:'.18em',textTransform:'uppercase',color:'#999',marginBottom:'6px'}}>
                  {t.data_od ? new Date(t.data_od).toLocaleDateString('pl-PL',{day:'numeric',month:'long',year:'numeric'}) : ''}
                </p>
                <p style={{fontFamily:'"Cormorant Garamond",Georgia,serif',fontSize:'18px',fontWeight:400,color:'#111',marginBottom:'4px'}}>{t.nazwa}</p>
                {t.artysci_txt && <p style={{fontFamily:'"Instrument Sans",sans-serif',fontSize:'12px',color:'#888'}}>{t.artysci_txt}</p>}
              </a>
            ))}
          </div>
        </section>

        {/* VIEWING ROOM */}
        <section style={{background:'#111',padding:'96px 40px',display:'grid',gridTemplateColumns:'1fr 1fr',gap:'96px',alignItems:'center'}}>
          <div>
            <p style={{fontFamily:'"Instrument Sans",sans-serif',fontSize:'10px',letterSpacing:'.2em',textTransform:'uppercase',color:'#555',marginBottom:'24px'}}>Oferty indywidualne</p>
            <h2 style={{fontFamily:'"Cormorant Garamond",Georgia,serif',fontSize:'clamp(36px,4.5vw,64px)',fontWeight:400,color:'#fff',lineHeight:1.05,marginBottom:'28px'}}>
              Viewing<br/>
              <em style={{color:'#666',fontWeight:300}}>Room</em>
            </h2>
            <p style={{fontFamily:'"Instrument Sans",sans-serif',fontSize:'13px',color:'#777',lineHeight:1.9,marginBottom:'40px',maxWidth:'380px'}}>
              Prywatne pokazy wyselekcjonowanych prac. Kazda oferta tworzona indywidualnie dla kolekcjonera.
            </p>
            <a href="#" style={{display:'inline-block',padding:'13px 32px',border:'1px solid #333',color:'#fff',fontFamily:'"Instrument Sans",sans-serif',fontSize:'10px',letterSpacing:'.18em',textTransform:'uppercase'}}>
              Zapytaj o oferte
            </a>
          </div>
          <div style={{background:'#1a1a1a',aspectRatio:'4/3',display:'flex',alignItems:'center',justifyContent:'center'}}>
            <p style={{fontFamily:'"Cormorant Garamond",Georgia,serif',fontSize:'13px',fontStyle:'italic',color:'#333'}}>Viewing Room — wkrotce</p>
          </div>
        </section>

        {/* FOOTER */}
        <footer style={{background:'#0a0a0a',padding:'64px 40px',display:'grid',gridTemplateColumns:'2fr 1fr 1fr 1fr',gap:'48px',borderTop:'1px solid #1a1a1a'}}>
          <div>
            <p style={{fontFamily:'"Cormorant Garamond",Georgia,serif',fontSize:'18px',fontWeight:400,color:'#fff',letterSpacing:'.1em',marginBottom:'20px'}}>Galeria ESTA</p>
            <p style={{fontFamily:'"Instrument Sans",sans-serif',fontSize:'12px',lineHeight:2,color:'#555'}}>
              ul. Raciborska 8<br/>
              Gliwice, Polska<br/>
              Od 1998 roku<br/>
              galeria@galeria-esta.pl
            </p>
          </div>
          <div>
            <p style={{fontFamily:'"Instrument Sans",sans-serif',fontSize:'10px',letterSpacing:'.18em',textTransform:'uppercase',color:'#333',marginBottom:'16px'}}>Menu</p>
            {['Artysci','Wystawy','Targi','Oferta','Viewing Room','O nas'].map(item => (
              <a key={item} href="#" style={{display:'block',fontFamily:'"Instrument Sans",sans-serif',fontSize:'12px',color:'#555',lineHeight:2.2}}>{item}</a>
            ))}
          </div>
          <div>
            <p style={{fontFamily:'"Instrument Sans",sans-serif',fontSize:'10px',letterSpacing:'.18em',textTransform:'uppercase',color:'#333',marginBottom:'16px'}}>Godziny</p>
            <p style={{fontFamily:'"Instrument Sans",sans-serif',fontSize:'12px',lineHeight:2,color:'#555'}}>
              Wt — Pt: 11:00 — 18:00<br/>
              Sob: 11:00 — 15:00<br/>
              Nd — Pn: zamkniete
            </p>
          </div>
          <div>
            <p style={{fontFamily:'"Instrument Sans",sans-serif',fontSize:'10px',letterSpacing:'.18em',textTransform:'uppercase',color:'#333',marginBottom:'16px'}}>Social</p>
            <p style={{fontFamily:'"Instrument Sans",sans-serif',fontSize:'12px',lineHeight:2.2,color:'#555'}}>
              Instagram<br/>Facebook
            </p>
          </div>
        </footer>

      </main>
    </>
  )
}
