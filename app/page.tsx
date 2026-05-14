import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default async function Home() {
  const { data: wystawy } = await supabase
    .from('wystawy')
    .select('tytul, artysci_txt, data_od, data_do, url_wystawy, img_plakat')
    .eq('publiczna', true)
    .order('data_od', { ascending: false })
    .limit(3)

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

  return (
    <>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0;}
        body{background:#fff;font-family:Georgia,serif;}
        .nw{color:#fff;text-decoration:none;font-size:11px;letter-spacing:.13em;text-transform:uppercase;opacity:.7;transition:opacity .2s;}
        .nw:hover{opacity:1;}
        .nb{color:#111;text-decoration:none;font-size:11px;letter-spacing:.13em;text-transform:uppercase;opacity:.5;transition:opacity .2s;}
        .nb:hover{opacity:1;}
        .ch img{transition:transform .6s ease;}
        .ch:hover img{transform:scale(1.04);}
        .al{color:#111;text-decoration:none;font-size:13px;line-height:2.3;display:block;}
        .al:hover{opacity:.5;}
        .lbl{font-family:sans-serif;font-size:10px;letter-spacing:.2em;text-transform:uppercase;color:#999;}
      `}</style>

      <main>
        {/* NAW */}
        <nav style={{position:"fixed",top:0,left:0,right:0,zIndex:100,padding:"0 40px",height:"54px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <a href="/" style={{fontFamily:"Georgia,serif",fontSize:"15px",letterSpacing:".16em",color:"#fff",textDecoration:"none"}}>GALERIA ESTA</a>
          <div style={{display:"flex",gap:"24px"}}>
            {["Artysci","Wystawy","Targi","Publikacje","Artykuly","Filmy","Oferta","Viewing Room","O nas"].map(item => (
              <a key={item} href="#" className="nw">{item}</a>
            ))}
          </div>
          <a href="#" className="nw" style={{fontSize:"10px"}}>PL / EN</a>
        </nav>

        {/* HERO */}
        <section style={{position:"relative",height:"100vh",overflow:"hidden"}}>
          <img
            src={wystawy?.[0]?.img_plakat || "https://galeria-esta.pl/pliki/wystawy/plakat/185/ESTA_WGW2025_SM_FB_COVER_FP_1640x720.jpg"}
            alt="Aktualna wystawa"
            style={{width:"100%",height:"100%",objectFit:"cover",display:"block"}}
          />
          <div style={{position:"absolute",inset:0,background:"linear-gradient(to top,rgba(0,0,0,.75) 0%,rgba(0,0,0,.1) 50%,transparent 100%)"}} />
          <div style={{position:"absolute",bottom:0,left:0,right:0,padding:"48px 40px",display:"flex",justifyContent:"space-between",alignItems:"flex-end"}}>
            <div>
              <p className="lbl" style={{color:"rgba(255,255,255,.55)",marginBottom:"12px"}}>
                Aktualna wystawa &middot; {wystawy?.[0]?.data_od ? new Date(wystawy[0].data_od).toLocaleDateString('pl-PL', {day:'numeric',month:'long',year:'numeric'}) : ''}
              </p>
              <h1 style={{fontSize:"clamp(24px,3.5vw,46px)",fontWeight:400,color:"#fff",lineHeight:1.25,maxWidth:"600px"}}>
                {wystawy?.[0]?.artysci_txt || ''}<br />
                <em style={{opacity:.8,fontSize:".88em"}}>{wystawy?.[0]?.tytul || ''}</em>
              </h1>
            </div>
            <a href={`/wystawa/${wystawy?.[0]?.url_wystawy || ''}`} style={{display:"inline-block",padding:"11px 26px",border:"1px solid rgba(255,255,255,.45)",color:"#fff",fontFamily:"sans-serif",fontSize:"10px",letterSpacing:".18em",textTransform:"uppercase",textDecoration:"none",whiteSpace:"nowrap"}}>
              Zobacz wystawe
            </a>
          </div>
        </section>

        {/* WYSTAWY */}
        <section style={{padding:"72px 40px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:"36px"}}>
            <h2 style={{fontSize:"22px",fontWeight:400,color:"#111"}}>Wystawy</h2>
            <a href="/wystawy" className="nb">Archiwum wystaw &rarr;</a>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"28px"}}>
            {(wystawy || []).map((w, i) => (
              <a key={i} href={`/wystawa/${w.url_wystawy}`} className="ch" style={{cursor:"pointer",textDecoration:"none"}}>
                <div style={{overflow:"hidden",marginBottom:"14px"}}>
                  <img
                    src={w.img_plakat || "https://galeria-esta.pl/images/wystawa.png"}
                    alt={w.tytul || ''}
                    style={{width:"100%",height:"260px",objectFit:"cover",display:"block"}}
                  />
                </div>
                <p className="lbl" style={{marginBottom:"6px"}}>
                  {w.data_od ? new Date(w.data_od).toLocaleDateString('pl-PL',{day:'numeric',month:'long'}) : ''} &mdash; {w.data_do ? new Date(w.data_do).toLocaleDateString('pl-PL',{day:'numeric',month:'long',year:'numeric'}) : ''}
                </p>
                <p style={{fontSize:"16px",color:"#111",marginBottom:"3px"}}>{w.artysci_txt || ''}</p>
                <p style={{fontSize:"14px",fontStyle:"italic",color:"#666"}}>{w.tytul || ''}</p>
              </a>
            ))}
          </div>
        </section>

        <hr style={{border:"none",borderTop:"1px solid #e5e5e5",margin:"0 40px"}} />

        {/* TARGI */}
        <section style={{padding:"72px 40px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:"36px"}}>
            <h2 style={{fontSize:"22px",fontWeight:400,color:"#111"}}>Targi</h2>
            <a href="/targi" className="nb">Wszystkie targi &rarr;</a>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"28px"}}>
            {(targi || []).map((t, i) => (
              <a key={i} href={`/targ/${t.url_targu}`} className="ch" style={{cursor:"pointer",textDecoration:"none"}}>
                <div style={{overflow:"hidden",marginBottom:"14px"}}>
                  <img
                    src={t.img_cover || "https://galeria-esta.pl/images/wystawa.png"}
                    alt={t.nazwa || ''}
                    style={{width:"100%",height:"220px",objectFit:"cover",display:"block"}}
                  />
                </div>
                <p className="lbl" style={{marginBottom:"6px"}}>
                  {t.data_od ? new Date(t.data_od).toLocaleDateString('pl-PL',{day:'numeric',month:'long',year:'numeric'}) : ''}
                </p>
                <p style={{fontSize:"16px",color:"#111",marginBottom:"3px"}}>{t.nazwa || ''}</p>
                {t.artysci_txt && <p style={{fontSize:"13px",color:"#888",fontStyle:"italic"}}>{t.artysci_txt}</p>}
              </a>
            ))}
          </div>
        </section>

        <hr style={{border:"none",borderTop:"1px solid #e5e5e5",margin:"0 40px"}} />

        {/* ARTYSCI */}
        <section style={{padding:"72px 40px",background:"#faf9f7"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:"40px"}}>
            <h2 style={{fontSize:"22px",fontWeight:400,color:"#111"}}>Artysci</h2>
            <a href="/artysci" className="nb">Wszyscy artysci &rarr;</a>
          </div>
          <div style={{columns:"4",columnGap:"32px"}}>
            {(artysci || []).map(a => (
              <a key={a.url_artysty || a.nazwisko_i_imie} href={`/${a.url_artysty || '#'}`} className="al">
                {a.nazwisko_i_imie}
              </a>
            ))}
          </div>
        </section>

        {/* VIEWING ROOM */}
        <section style={{padding:"72px 40px",background:"#111",display:"grid",gridTemplateColumns:"1fr 1fr",gap:"80px",alignItems:"center"}}>
          <div>
            <p className="lbl" style={{color:"#555",marginBottom:"20px"}}>Nowa usluga</p>
            <h2 style={{fontSize:"clamp(28px,3vw,44px)",fontWeight:400,color:"#fff",lineHeight:1.2,marginBottom:"24px"}}>
              Viewing Room &mdash;<br />
              <em style={{color:"#888"}}>oferty indywidualne</em>
            </h2>
            <p style={{fontFamily:"sans-serif",fontSize:"13px",color:"#888",lineHeight:1.9,marginBottom:"36px",maxWidth:"420px"}}>
              Prywatne pokazy wyselekcjonowanych prac dla kolekcjonerow. Kazda oferta tworzona indywidualnie.
            </p>
            <a href="#" style={{display:"inline-block",padding:"12px 28px",border:"1px solid #444",color:"#fff",fontFamily:"sans-serif",fontSize:"10px",letterSpacing:".18em",textTransform:"uppercase",textDecoration:"none"}}>
              Zapytaj o oferte
            </a>
          </div>
          <div style={{background:"#1a1a1a",height:"360px",display:"flex",alignItems:"center",justifyContent:"center"}}>
            <p style={{fontFamily:"Georgia,serif",fontSize:"13px",fontStyle:"italic",color:"#444"}}>Viewing Room &mdash; wkrotce</p>
          </div>
        </section>

        {/* FOOTER */}
        <footer style={{background:"#0a0a0a",padding:"56px 40px",display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr",gap:"40px"}}>
          <div>
            <p style={{fontFamily:"Georgia,serif",fontSize:"17px",color:"#fff",marginBottom:"16px"}}>Galeria ESTA</p>
            <p style={{fontFamily:"sans-serif",fontSize:"12px",lineHeight:2,color:"#666"}}>
              Galeria Sztuki Wspolczesnej<br />
              ul. Raciborska 8, Gliwice<br />
              Od 1998 roku<br />
              galeria@galeria-esta.pl
            </p>
          </div>
          <div>
            <p className="lbl" style={{color:"#444",marginBottom:"16px"}}>Menu</p>
            {["Artysci","Wystawy","Targi","Oferta","Viewing Room","O nas"].map(item => (
              <a key={item} href="#" style={{display:"block",fontFamily:"sans-serif",fontSize:"12px",color:"#666",textDecoration:"none",lineHeight:2.2}}>{item}</a>
            ))}
          </div>
          <div>
            <p className="lbl" style={{color:"#444",marginBottom:"16px"}}>Godziny</p>
            <p style={{fontFamily:"sans-serif",fontSize:"12px",lineHeight:2,color:"#666"}}>
              Wt &mdash; Pt: 11:00 &mdash; 18:00<br />
              Sob: 11:00 &mdash; 15:00<br />
              Nd &mdash; Pn: zamkniete
            </p>
          </div>
          <div>
            <p className="lbl" style={{color:"#444",marginBottom:"16px"}}>Social</p>
            <p style={{fontFamily:"sans-serif",fontSize:"12px",lineHeight:2.2,color:"#666"}}>
              Instagram<br />Facebook
            </p>
          </div>
        </footer>
      </main>
    </>
  )
}
