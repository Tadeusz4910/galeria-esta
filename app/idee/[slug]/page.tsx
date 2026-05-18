import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default async function IdeaStrona({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  const { data: idee } = await supabase
    .from('idee')
    .select('*')
    .eq('slug', slug)
    .eq('publiczne', true)
    .limit(1)

  const idea = idee?.[0]
  if (!idea) notFound()

  // Artysci powiazani z ta idea
  const { data: artysciIdei } = await supabase
    .from('idee_artysci')
    .select('rola, kolejnosc, artysci(id, nazwisko_i_imie, url_artysty, haslo, rola_w_programie, zdjecie_artysty, kreg_programu)')
    .eq('idea_id', idea.id)
    .order('kolejnosc')

  // Powiazane idee (Zobacz takze)
  const { data: powiazaneIdee } = await supabase
    .from('idee_idee')
    .select('powiazana_idea_id, idee!idee_idee_powiazana_idea_id_fkey(nazwa, slug, opis_krotki)')
    .eq('idea_id', idea.id)
    .limit(8)

  // Powiazane rozdzialy kompendium
  const { data: kompendiumIdei } = await supabase
    .from('kompendium_idee')
    .select('kompendium(tytul, slug, lead)')
    .eq('idea_id', idea.id)

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
        .artysta-karta{border:1px solid #ebebeb;display:block;transition:border-color .2s;}
        .artysta-karta:hover{border-color:#111;}
        .idea-tag{display:inline-block;padding:8px 16px;border:1px solid #ddd;font-family:"Instrument Sans",sans-serif;font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:#666;transition:all .2s;}
        .idea-tag:hover{background:#111;border-color:#111;color:#fff;}
        .kompendium-row{padding:28px 0;border-bottom:1px solid #ebebeb;display:block;transition:opacity .2s;}
        .kompendium-row:hover{opacity:.7;}
        .kompendium-row:first-child{border-top:1px solid #ebebeb;}
      `}</style>

      {/* NAV */}
      <nav style={{ position:'fixed',top:0,left:0,right:0,zIndex:100,padding:'0 40px',height:'54px',display:'flex',alignItems:'center',justifyContent:'space-between',background:'rgba(255,255,255,.96)',borderBottom:'1px solid #ebebeb' }}>
        <a href="/" style={{ fontFamily:C,fontSize:'16px',fontWeight:400,letterSpacing:'.2em',textTransform:'uppercase' }}>Galeria ESTA</a>
        <div style={{ display:'flex',gap:'28px' }}>
          <a href="/artysci" className="nav-link">Artysci</a>
          <a href="/wystawy" className="nav-link">Wystawy</a>
          <a href="/idee" className="nav-link" style={{ opacity:1 }}>Idee</a>
          {['Kolekcja','Kompendium','Viewing Room','O nas'].map(item => (
            <a key={item} href="#" className="nav-link">{item}</a>
          ))}
        </div>
        <a href="#" className="nav-link" style={{ fontSize:'10px' }}>PL / EN</a>
      </nav>

      {/* HERO */}
      <section style={{ paddingTop:'54px',minHeight:'60vh',display:'grid',gridTemplateColumns:'1fr 1fr',borderBottom:'1px solid #ebebeb' }}>
        {/* Lewa – duza typografia */}
        <div style={{ padding:'80px 64px',display:'flex',flexDirection:'column',justifyContent:'space-between',background:'#f9f9f7',borderRight:'1px solid #ebebeb' }}>
          <a href="/idee" style={{ fontFamily:I,fontSize:'10px',letterSpacing:'.16em',textTransform:'uppercase',color:'#999' }}>
            &larr; Mapa idei
          </a>
          <div>
            <p style={{ fontFamily:I,fontSize:'10px',letterSpacing:'.2em',textTransform:'uppercase',color:'#bbb',marginBottom:'24px' }}>
              {idea.kategoria === 'glowna' ? 'Idea główna' : 'Idea rozszerzona'}
            </p>
            <h1 style={{ fontFamily:C,fontSize:'clamp(56px,7vw,120px)',fontWeight:400,lineHeight:.9,letterSpacing:'-.02em',color:'#111' }}>
              {idea.nazwa}
            </h1>
          </div>
          <div style={{ display:'flex',gap:'24px' }}>
            {artysciIdei && artysciIdei.length > 0 && (
              <p style={{ fontFamily:I,fontSize:'11px',color:'#aaa' }}>
                {artysciIdei.length} {artysciIdei.length === 1 ? 'artysta' : 'artystów'}
              </p>
            )}
          </div>
        </div>

        {/* Prawa – definicja */}
        <div style={{ padding:'80px 64px',display:'flex',flexDirection:'column',justifyContent:'center' }}>
          {idea.opis_krotki && (
            <p style={{ fontFamily:C,fontSize:'clamp(18px,2vw,26px)',fontWeight:300,color:'#333',lineHeight:1.7,marginBottom:'48px' }}>
              {idea.opis_krotki}
            </p>
          )}
          {idea.opis_dlugi && (
            <p style={{ fontFamily:C,fontSize:'17px',fontWeight:300,color:'#666',lineHeight:1.9,whiteSpace:'pre-line' }}>
              {idea.opis_dlugi}
            </p>
          )}
        </div>
      </section>

      {/* ARTYSCI */}
      {artysciIdei && artysciIdei.length > 0 && (
        <section style={{ padding:'80px 40px',borderBottom:'1px solid #ebebeb' }}>
          <div style={{ display:'grid',gridTemplateColumns:'200px 1fr',gap:'80px' }}>
            <div>
              <p style={{ fontFamily:I,fontSize:'10px',letterSpacing:'.2em',textTransform:'uppercase',color:'#999',marginBottom:'8px' }}>
                Artysci
              </p>
              <p style={{ fontFamily:C,fontSize:'14px',color:'#bbb',lineHeight:1.6 }}>
                Twórcy dla których ta idea jest kluczowa
              </p>
            </div>
            <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))',gap:'1px',background:'#ebebeb' }}>
              {artysciIdei.map((ia: any, i: number) => {
                const a = ia.artysci
                if (!a) return null
                const imie = a.nazwisko_i_imie?.trim() || ''
                return (
                  <a key={i} href={`/artysta/${a.url_artysty}`} className="artysta-karta" style={{ background:'#fff',display:'block' }}>
                    {/* Zdjecie lub inicjaly */}
                    <div style={{ aspectRatio:'3/2',background:'#f5f3ef',overflow:'hidden',position:'relative' }}>
                      {a.zdjecie_artysty ? (
                        <img src={a.zdjecie_artysty} alt={imie}
                          style={{ width:'100%',height:'100%',objectFit:'cover',objectPosition:'top' }} />
                      ) : (
                        <div style={{ width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center' }}>
                          <p style={{ fontFamily:C,fontSize:'48px',fontWeight:300,color:'#ddd' }}>
                            {imie.split(' ')[0]?.[0]}{imie.split(' ')[1]?.[0]}
                          </p>
                        </div>
                      )}
                      {ia.rola === 'glowna' && (
                        <span style={{ position:'absolute',top:'12px',left:'12px',fontFamily:I,fontSize:'9px',letterSpacing:'.16em',textTransform:'uppercase',background:'#111',color:'#fff',padding:'4px 8px' }}>
                          Glowna
                        </span>
                      )}
                    </div>
                    <div style={{ padding:'20px 24px' }}>
                      <p style={{ fontFamily:C,fontSize:'20px',fontWeight:400,marginBottom:'6px' }}>{imie}</p>
                      {a.haslo && (
                        <p style={{ fontFamily:I,fontSize:'11px',color:'#888',lineHeight:1.5 }}>{a.haslo}</p>
                      )}
                      <p style={{ fontFamily:I,fontSize:'10px',letterSpacing:'.12em',textTransform:'uppercase',color:'#bbb',marginTop:'12px' }}>
                        &rarr; Profil artysty
                      </p>
                    </div>
                  </a>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* KOMPENDIUM */}
      {kompendiumIdei && kompendiumIdei.length > 0 && (
        <section style={{ padding:'80px 40px',borderBottom:'1px solid #ebebeb' }}>
          <div style={{ display:'grid',gridTemplateColumns:'200px 1fr',gap:'80px' }}>
            <div>
              <p style={{ fontFamily:I,fontSize:'10px',letterSpacing:'.2em',textTransform:'uppercase',color:'#999',marginBottom:'8px' }}>
                Kompendium
              </p>
              <p style={{ fontFamily:C,fontSize:'14px',color:'#bbb',lineHeight:1.6 }}>
                Rozdzialy wiedzy powiazane z ta idea
              </p>
            </div>
            <div>
              {kompendiumIdei.map((ki: any, i: number) => {
                const k = ki.kompendium
                if (!k) return null
                return (
                  <a key={i} href={`/kompendium/${k.slug}`} className="kompendium-row">
                    <p style={{ fontFamily:C,fontSize:'22px',fontWeight:400,marginBottom:'8px' }}>{k.tytul}</p>
                    {k.lead && (
                      <p style={{ fontFamily:I,fontSize:'12px',color:'#888',lineHeight:1.6,maxWidth:'640px' }}>{k.lead}</p>
                    )}
                    <p style={{ fontFamily:I,fontSize:'10px',letterSpacing:'.12em',textTransform:'uppercase',color:'#bbb',marginTop:'12px' }}>
                      &rarr; Czytaj
                    </p>
                  </a>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* ZOBACZ TAKZE – powiazane idee */}
      {powiazaneIdee && powiazaneIdee.length > 0 && (
        <section style={{ padding:'80px 40px',borderBottom:'1px solid #ebebeb' }}>
          <div style={{ display:'grid',gridTemplateColumns:'200px 1fr',gap:'80px' }}>
            <p style={{ fontFamily:I,fontSize:'10px',letterSpacing:'.2em',textTransform:'uppercase',color:'#999' }}>
              Zobacz takze
            </p>
            <div style={{ display:'flex',flexWrap:'wrap',gap:'8px' }}>
              {powiazaneIdee.map((pi: any, i: number) => {
                const powiazana = pi.idee
                if (!powiazana) return null
                return (
                  <a key={i} href={`/idee/${powiazana.slug}`} className="idea-tag">
                    {powiazana.nazwa}
                  </a>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section style={{ padding:'80px 40px',background:'#f9f9f7',borderBottom:'1px solid #ebebeb' }}>
        <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:'80px',alignItems:'center' }}>
          <div>
            <p style={{ fontFamily:I,fontSize:'10px',letterSpacing:'.2em',textTransform:'uppercase',color:'#999',marginBottom:'24px' }}>Galeria ESTA</p>
            <h2 style={{ fontFamily:C,fontSize:'clamp(28px,3vw,48px)',fontWeight:400,lineHeight:1.1,marginBottom:'24px' }}>
              Zainteresowany pracami<br />z tego obszaru?
            </h2>
            <p style={{ fontFamily:C,fontSize:'17px',fontWeight:300,color:'#666',lineHeight:1.7 }}>
              Przygotujemy indywidualną ofertę prac związanych z pojęciem {idea.nazwa.toLowerCase()}.
            </p>
          </div>
          <div style={{ display:'flex',flexDirection:'column',gap:'16px',alignItems:'flex-start' }}>
            <a href={`mailto:galeria@galeria-esta.pl?subject=Zapytanie o prace – ${idea.nazwa}`}
              style={{ fontFamily:I,fontSize:'11px',letterSpacing:'.16em',textTransform:'uppercase',color:'#111',border:'1px solid #111',padding:'16px 32px' }}>
              &rarr; Zapytaj o prace
            </a>
            <a href="/idee" style={{ fontFamily:I,fontSize:'11px',letterSpacing:'.16em',textTransform:'uppercase',color:'#999',padding:'16px 0' }}>
              &rarr; Mapa idei
            </a>
            <a href="/artysci" style={{ fontFamily:I,fontSize:'11px',letterSpacing:'.16em',textTransform:'uppercase',color:'#999',padding:'16px 0' }}>
              &rarr; Wszyscy artysci
            </a>
          </div>
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
          {['Artysci','Wystawy','Idee','Kolekcja','Viewing Room','O nas'].map(item => (
            <a key={item} href="#" style={{ display:'block',fontFamily:I,fontSize:'12px',color:'#555',lineHeight:2.2 }}>{item}</a>
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
