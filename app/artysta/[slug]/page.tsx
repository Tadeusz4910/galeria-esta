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

  const a = artysci?.[0]
  if (!a) notFound()

  // Idee artysty
  const { data: ideeArtysty } = await supabase
    .from('idee_artysci')
    .select('rola, kolejnosc, idee(nazwa, slug, opis_krotki)')
    .eq('artysta_id', a.id)
    .order('kolejnosc')

  // Wystawy artysty
  const { data: wystawyArtysty } = await supabase
    .from('wystawy_artysci')
    .select('opis_w_wystawie, wystawy(tytul, data_od, data_do, url_wystawy, img_plakat, opis_krotki)')
    .eq('artysta_id', a.id)

  // Prace artysty (publiczne)
  const { data: prace } = await supabase
    .from('prace')
    .select('id, tytul, rok, technika, wymiary_pracy, opis_krotki, tekst_kuratorski, widocznosc')
    .eq('artysta_id', a.id)
    .neq('widocznosc', 'archiwum')
    .neq('widocznosc', 'ukryty')
    .order('rok', { ascending: false })
    .limit(12)

  // Zdjecia prac (pierwsze zdjecie kazdej pracy)
  const praczeIds = prace?.map(p => p.id) || []
  const { data: zdjeciaPrac } = praczeIds.length > 0 ? await supabase
    .from('media')
    .select('praca_id, url, alt')
    .in('praca_id', praczeIds)
    .eq('typ', 'praca') : { data: [] }

  const C = '"Cormorant Garamond", Georgia, serif'
  const I = '"Instrument Sans", sans-serif'

  const fmtYear = (d: string | null) => d ? new Date(d).getFullYear() : ''

  const getZdjeciePracy = (pracaId: string) =>
    zdjeciaPrac?.find(z => z.praca_id === pracaId)

  const ideeGlowne = ideeArtysty?.filter(ia => ia.rola === 'glowna') || []
  const imie = a.nazwisko_i_imie?.trim() || ''

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
        .idea-tag{display:inline-block;padding:6px 14px;border:1px solid #ddd;font-family:"Instrument Sans",sans-serif;font-size:10px;letter-spacing:.16em;text-transform:uppercase;color:#666;transition:all .2s;}
        .idea-tag:hover{border-color:#111;color:#111;}
        .praca-card{border:1px solid #ebebeb;transition:border-color .2s;}
        .praca-card:hover{border-color:#111;}
        .wystawa-row{border-bottom:1px solid #ebebeb;padding:28px 0;transition:opacity .2s;}
        .wystawa-row:hover{opacity:.7;}
        .wystawa-row:first-child{border-top:1px solid #ebebeb;}
      `}</style>

      {/* NAV */}
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

      {/* HERO */}
      <section style={{ paddingTop:'54px',minHeight:'80vh',display:'grid',gridTemplateColumns:'1fr 1fr',borderBottom:'1px solid #ebebeb' }}>
        {/* Lewa – zdjecie lub placeholder */}
        <div style={{ background:'#f5f3ef',display:'flex',alignItems:'center',justifyContent:'center',minHeight:'600px',position:'relative',overflow:'hidden' }}>
          {a.zdjecie_artysty ? (
            <img src={a.zdjecie_artysty} alt={imie} style={{ width:'100%',height:'100%',objectFit:'cover',objectPosition:'top',position:'absolute',inset:0 }} />
          ) : (
            <div style={{ textAlign:'center',padding:'40px' }}>
              <p style={{ fontFamily:C,fontSize:'clamp(48px,6vw,96px)',fontWeight:300,color:'#ddd',lineHeight:1,letterSpacing:'.05em' }}>
                {imie.split(' ')[0]?.[0]}{imie.split(' ')[1]?.[0]}
              </p>
            </div>
          )}
          {/* Etykieta krag programu */}
          <div style={{ position:'absolute',bottom:'32px',left:'32px' }}>
            <span style={{ fontFamily:I,fontSize:'10px',letterSpacing:'.2em',textTransform:'uppercase',color:'#fff',background:'rgba(0,0,0,.5)',padding:'6px 12px' }}>
              {a.kreg_programu === 'rdzen' ? 'Rdzen programu' : a.kreg_programu === 'poszerzony' ? 'Program poszerzony' : 'Artysta galerii'}
            </span>
          </div>
        </div>

        {/* Prawa – dane */}
        <div style={{ padding:'80px 64px',display:'flex',flexDirection:'column',justifyContent:'center',borderLeft:'1px solid #ebebeb' }}>
          <a href="/artysci" style={{ fontFamily:I,fontSize:'10px',letterSpacing:'.16em',textTransform:'uppercase',color:'#999',marginBottom:'56px',display:'block' }}>
            &larr; Artysci
          </a>

          {a.haslo && (
            <p style={{ fontFamily:I,fontSize:'10px',letterSpacing:'.2em',textTransform:'uppercase',color:'#999',marginBottom:'20px' }}>
              {a.haslo}
            </p>
          )}

          <h1 style={{ fontFamily:C,fontSize:'clamp(36px,4vw,72px)',fontWeight:400,lineHeight:1.0,marginBottom:'40px',letterSpacing:'-.01em' }}>
            {imie}
          </h1>

          {a.rola_w_programie && (
            <p style={{ fontFamily:C,fontSize:'18px',fontWeight:300,color:'#555',lineHeight:1.7,marginBottom:'48px',maxWidth:'480px' }}>
              {a.rola_w_programie}
            </p>
          )}

          {/* Tagi idei */}
          {ideeGlowne.length > 0 && (
            <div style={{ display:'flex',flexWrap:'wrap',gap:'8px',marginBottom:'48px' }}>
              {ideeGlowne.map((ia: any, i: number) => (
                <a key={i} href={`/idee/${ia.idee?.slug}`} className="idea-tag">
                  {ia.idee?.nazwa}
                </a>
              ))}
            </div>
          )}

          <a href={`mailto:galeria@galeria-esta.pl?subject=Zapytanie o prace ${imie}`} className="arrow-link">
            &rarr; Zapytaj o prace artysty
          </a>
        </div>
      </section>

      {/* DLACZEGO WAZNY */}
      {a.dlaczego_wazny && (
        <section style={{ padding:'80px 40px',borderBottom:'1px solid #ebebeb',display:'grid',gridTemplateColumns:'200px 1fr',gap:'80px' }}>
          <div>
            <p style={{ fontFamily:I,fontSize:'10px',letterSpacing:'.2em',textTransform:'uppercase',color:'#999' }}>
              Znaczenie
            </p>
          </div>
          <div>
            <p style={{ fontFamily:C,fontSize:'clamp(18px,2vw,26px)',fontWeight:300,color:'#333',lineHeight:1.8,maxWidth:'720px' }}>
              {a.dlaczego_wazny}
            </p>
          </div>
        </section>
      )}

      {/* BIOGRAFIA */}
      {a.biografia && (
        <section style={{ padding:'80px 40px',borderBottom:'1px solid #ebebeb',display:'grid',gridTemplateColumns:'200px 1fr',gap:'80px' }}>
          <p style={{ fontFamily:I,fontSize:'10px',letterSpacing:'.2em',textTransform:'uppercase',color:'#999' }}>Biografia</p>
          <p style={{ fontFamily:C,fontSize:'17px',fontWeight:300,color:'#444',lineHeight:1.9,whiteSpace:'pre-line',maxWidth:'720px' }}>
            {a.biografia}
          </p>
        </section>
      )}

      {/* IDEE – mapa pojec */}
      {ideeGlowne.length > 0 && (
        <section style={{ padding:'80px 40px',borderBottom:'1px solid #ebebeb' }}>
          <div style={{ display:'grid',gridTemplateColumns:'200px 1fr',gap:'80px' }}>
            <p style={{ fontFamily:I,fontSize:'10px',letterSpacing:'.2em',textTransform:'uppercase',color:'#999' }}>Idee</p>
            <div>
              <p style={{ fontFamily:C,fontSize:'13px',fontWeight:400,letterSpacing:'.15em',textTransform:'uppercase',color:'#999',marginBottom:'40px' }}>
                Kluczowe pojecia twórczości
              </p>
              <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:'1px',background:'#ebebeb' }}>
                {ideeGlowne.map((ia: any, i: number) => (
                  <a key={i} href={`/idee/${ia.idee?.slug}`} style={{ background:'#fff',padding:'32px',display:'block',transition:'background .2s' }}
                    onMouseEnter={e => (e.currentTarget.style.background='#f9f9f7')}
                    onMouseLeave={e => (e.currentTarget.style.background='#fff')}>
                    <p style={{ fontFamily:C,fontSize:'22px',fontWeight:400,marginBottom:'12px' }}>
                      {ia.idee?.nazwa}
                    </p>
                    {ia.idee?.opis_krotki && (
                      <p style={{ fontFamily:I,fontSize:'12px',color:'#888',lineHeight:1.6,display:'-webkit-box',WebkitLineClamp:3,WebkitBoxOrient:'vertical',overflow:'hidden' }}>
                        {ia.idee.opis_krotki}
                      </p>
                    )}
                    <p style={{ fontFamily:I,fontSize:'10px',letterSpacing:'.14em',textTransform:'uppercase',color:'#bbb',marginTop:'16px' }}>
                      &rarr; Idea
                    </p>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* WYSTAWY */}
      {wystawyArtysty && wystawyArtysty.length > 0 && (
        <section style={{ padding:'80px 40px',borderBottom:'1px solid #ebebeb' }}>
          <div style={{ display:'grid',gridTemplateColumns:'200px 1fr',gap:'80px' }}>
            <p style={{ fontFamily:I,fontSize:'10px',letterSpacing:'.2em',textTransform:'uppercase',color:'#999' }}>Wystawy</p>
            <div>
              {wystawyArtysty.map((wa: any, i: number) => (
                <a key={i} href={`/wystawa/${wa.wystawy?.url_wystawy}`} className="wystawa-row" style={{ display:'grid',gridTemplateColumns:'1fr auto',gap:'24px',alignItems:'center' }}>
                  <div>
                    <p style={{ fontFamily:C,fontSize:'22px',fontWeight:400,marginBottom:'6px' }}>
                      {wa.wystawy?.tytul}
                    </p>
                    {wa.opis_w_wystawie && (
                      <p style={{ fontFamily:I,fontSize:'12px',color:'#888',lineHeight:1.5,maxWidth:'560px' }}>
                        {wa.opis_w_wystawie}
                      </p>
                    )}
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <p style={{ fontFamily:I,fontSize:'12px',color:'#999',whiteSpace:'nowrap' }}>
                      {fmtYear(wa.wystawy?.data_od)}
                      {wa.wystawy?.data_do && wa.wystawy?.data_od !== wa.wystawy?.data_do
                        ? ` \u2013 ${fmtYear(wa.wystawy?.data_do)}` : ''}
                    </p>
                    <p style={{ fontFamily:I,fontSize:'10px',letterSpacing:'.12em',textTransform:'uppercase',color:'#bbb',marginTop:'4px' }}>
                      &rarr; Wystawa
                    </p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* PRACE */}
      {prace && prace.length > 0 && (
        <section style={{ padding:'80px 40px',borderBottom:'1px solid #ebebeb' }}>
          <div style={{ display:'grid',gridTemplateColumns:'200px 1fr',gap:'80px' }}>
            <p style={{ fontFamily:I,fontSize:'10px',letterSpacing:'.2em',textTransform:'uppercase',color:'#999' }}>Prace</p>
            <div>
              <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))',gap:'2px',background:'#ebebeb' }}>
                {prace.map((p: any, i: number) => {
                  const zdj = getZdjeciePracy(p.id)
                  return (
                    <div key={i} className="praca-card" style={{ background:'#fff' }}>
                      <div className="img-wrap" style={{ aspectRatio:'4/3',background:'#f5f3ef' }}>
                        {zdj ? (
                          <img src={zdj.url} alt={zdj.alt||p.tytul||''} className="img-hover"
                            style={{ width:'100%',height:'100%',objectFit:'cover',display:'block' }} />
                        ) : (
                          <div style={{ width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center' }}>
                            <p style={{ fontFamily:C,fontSize:'12px',color:'#ccc',fontStyle:'italic' }}>Brak zdjecia</p>
                          </div>
                        )}
                      </div>
                      <div style={{ padding:'20px 24px' }}>
                        <p style={{ fontFamily:C,fontSize:'17px',fontWeight:400,marginBottom:'4px' }}>{p.tytul}</p>
                        <p style={{ fontFamily:I,fontSize:'11px',color:'#888' }}>
                          {p.rok}{p.technika ? ` · ${p.technika}` : ''}
                        </p>
                        {p.wymiary_pracy && (
                          <p style={{ fontFamily:I,fontSize:'11px',color:'#aaa',marginTop:'2px' }}>{p.wymiary_pracy}</p>
                        )}
                        {p.opis_krotki && (
                          <p style={{ fontFamily:C,fontSize:'14px',color:'#666',lineHeight:1.6,marginTop:'12px' }}>
                            {p.opis_krotki}
                          </p>
                        )}
                        <a href={`mailto:galeria@galeria-esta.pl?subject=Zapytanie o prace: ${p.tytul}`}
                          style={{ display:'inline-block',marginTop:'16px',fontFamily:I,fontSize:'10px',letterSpacing:'.14em',textTransform:'uppercase',color:'#666',borderBottom:'1px solid #ddd',paddingBottom:'2px' }}>
                          Zapytaj o prace
                        </a>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section style={{ padding:'80px 40px',background:'#111',display:'grid',gridTemplateColumns:'1fr 1fr',gap:'80px',alignItems:'center' }}>
        <div>
          <p style={{ fontFamily:I,fontSize:'10px',letterSpacing:'.2em',textTransform:'uppercase',color:'#555',marginBottom:'24px' }}>
            Galeria ESTA
          </p>
          <h2 style={{ fontFamily:C,fontSize:'clamp(28px,3vw,48px)',fontWeight:400,color:'#fff',lineHeight:1.1,marginBottom:'24px' }}>
            Zainteresowany pracami<br />{imie}?
          </h2>
          <p style={{ fontFamily:C,fontSize:'17px',fontWeight:300,color:'#888',lineHeight:1.7 }}>
            Skontaktuj sie z nami &mdash; przygotujemy indywidualn&acirc; oferte lub zaproszenie do Viewing Room.
          </p>
        </div>
        <div style={{ display:'flex',flexDirection:'column',gap:'16px',alignItems:'flex-start' }}>
          <a href={`mailto:galeria@galeria-esta.pl?subject=Zapytanie o prace ${imie}`}
            style={{ fontFamily:I,fontSize:'11px',letterSpacing:'.16em',textTransform:'uppercase',color:'#fff',border:'1px solid #444',padding:'16px 32px',transition:'border-color .2s' }}>
            &rarr; Zapytaj o prace artysty
          </a>
          <a href="/wystawy"
            style={{ fontFamily:I,fontSize:'11px',letterSpacing:'.16em',textTransform:'uppercase',color:'#666',padding:'16px 0' }}>
            &rarr; Zobacz wszystkie wystawy
          </a>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background:'#0a0a0a',padding:'64px 40px',display:'grid',gridTemplateColumns:'2fr 1fr 1fr 1fr',gap:'48px' }}>
        <div>
          <p style={{ fontFamily:C,fontSize:'18px',fontWeight:400,color:'#fff',letterSpacing:'.1em',marginBottom:'20px' }}>Galeria ESTA</p>
          <p style={{ fontFamily:I,fontSize:'12px',lineHeight:2,color:'#444' }}>ul. Raciborska 8, Gliwice<br/>Od 1998 roku<br/>galeria@galeria-esta.pl</p>
        </div>
        <div>
          <p style={{ fontFamily:I,fontSize:'10px',letterSpacing:'.18em',textTransform:'uppercase',color:'#333',marginBottom:'16px' }}>Menu</p>
          {['Artysci','Wystawy','Targi','Oferta','Viewing Room','O nas'].map(item => (
            <a key={item} href="#" style={{ display:'block',fontFamily:I,fontSize:'12px',color:'#444',lineHeight:2.2 }}>{item}</a>
          ))}
        </div>
        <div>
          <p style={{ fontFamily:I,fontSize:'10px',letterSpacing:'.18em',textTransform:'uppercase',color:'#333',marginBottom:'16px' }}>Godziny</p>
          <p style={{ fontFamily:I,fontSize:'12px',lineHeight:2,color:'#444' }}>Wt &mdash; Pt: 11:00 &mdash; 18:00<br/>Sob: 11:00 &mdash; 15:00<br/>Nd &mdash; Pn: zamkniete</p>
        </div>
        <div>
          <p style={{ fontFamily:I,fontSize:'10px',letterSpacing:'.18em',textTransform:'uppercase',color:'#333',marginBottom:'16px' }}>Social</p>
          <p style={{ fontFamily:I,fontSize:'12px',lineHeight:2.2,color:'#444' }}>Instagram<br/>Facebook</p>
        </div>
      </footer>
    </main>
  )
}
