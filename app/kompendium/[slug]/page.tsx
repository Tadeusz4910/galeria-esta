import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import Nav from '@/components/Nav'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default async function KompendiumStrona({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  const { data: rozdzialy } = await supabase
    .from('kompendium')
    .select('*')
    .eq('slug', slug)
    .eq('publiczne', true)
    .limit(1)

  const r = rozdzialy?.[0]
  if (!r) notFound()

  // Artysci powiazani z tym rozdzialem
  const { data: artysciRozdzialu } = await supabase
    .from('kompendium_artysci')
    .select('artysci(id, nazwisko_i_imie, url_artysty, haslo, zdjecie_artysty, kreg_programu)')
    .eq('kompendium_id', r.id)

  // Idee powiazane z tym rozdzialem
  const { data: ideeRozdzialu } = await supabase
    .from('kompendium_idee')
    .select('idee(nazwa, slug, opis_krotki)')
    .eq('kompendium_id', r.id)

  // Inne rozdzialy kompendium (nawigacja)
  const { data: pozostaleRozdzialy } = await supabase
    .from('kompendium')
    .select('tytul, slug, lead, kategoria')
    .eq('publiczne', true)
    .neq('slug', slug)
    .order('kolejnosc')
    .limit(6)

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
        .idea-tag{display:inline-block;padding:7px 16px;border:1px solid #ddd;font-family:"Instrument Sans",sans-serif;font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:#666;transition:all .2s;margin:3px;}
        .idea-tag:hover{background:#111;border-color:#111;color:#fff;}
        .artysta-karta{border:1px solid #ebebeb;display:block;background:#fff;transition:border-color .2s;}
        .artysta-karta:hover{border-color:#111;}
        .rozdz-row{padding:24px 0;border-bottom:1px solid #ebebeb;display:block;transition:opacity .2s;}
        .rozdz-row:hover{opacity:.65;}
        .rozdz-row:first-child{border-top:1px solid #ebebeb;}
        .tresc-kompendium p{font-family:"Cormorant Garamond",Georgia,serif;font-size:18px;font-weight:300;color:#333;line-height:1.9;margin-bottom:28px;}
        .tresc-kompendium h2{font-family:"Cormorant Garamond",Georgia,serif;font-size:28px;font-weight:400;color:#111;margin:48px 0 20px;}
        .tresc-kompendium h3{font-family:"Cormorant Garamond",Georgia,serif;font-size:22px;font-weight:400;color:#333;margin:36px 0 16px;}
        .tresc-kompendium blockquote{border-left:2px solid #e0dbd4;padding-left:28px;margin:36px 0;font-family:"Cormorant Garamond",Georgia,serif;font-size:20px;font-style:italic;color:#555;line-height:1.7;}
      `}</style>

      {/* NAV */}
      <Nav active="kompendium" />

      {/* HERO */}
      <section style={{ paddingTop:'54px',borderBottom:'1px solid #ebebeb' }}>
        <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',minHeight:'60vh' }}>
          {/* Lewa – duza typografia */}
          <div style={{ padding:'80px 64px',display:'flex',flexDirection:'column',justifyContent:'space-between',background:'#111',borderRight:'1px solid #222' }}>
            <a href="/kompendium" style={{ fontFamily:I,fontSize:'10px',letterSpacing:'.16em',textTransform:'uppercase',color:'#555' }}>
              &larr; Kompendium
            </a>
            <div>
              {r.kategoria && (
                <p style={{ fontFamily:I,fontSize:'10px',letterSpacing:'.2em',textTransform:'uppercase',color:'#555',marginBottom:'20px' }}>
                  {r.kategoria === 'historia' ? 'Historia i kontekst' :
                   r.kategoria === 'nurty' ? 'Nurty i kierunki' :
                   r.kategoria === 'pojecia' ? 'Pojęcia i idee' :
                   r.kategoria === 'kolekcjonerski' ? 'Przewodnik kolekcjonera' : r.kategoria}
                </p>
              )}
              <h1 style={{ fontFamily:C,fontSize:'clamp(32px,4vw,64px)',fontWeight:400,lineHeight:1.0,color:'#fff',letterSpacing:'-.01em' }}>
                {r.tytul}
              </h1>
            </div>
            <div style={{ display:'flex',flexWrap:'wrap',gap:'8px' }}>
              {ideeRozdzialu?.map((ki: any, i: number) => ki.idee && (
                <a key={i} href={`/idee/${ki.idee.slug}`}
                  style={{ padding:'5px 12px',border:'1px solid #333',fontFamily:I,fontSize:'10px',letterSpacing:'.12em',textTransform:'uppercase',color:'#666',transition:'all .2s' }}>
                  {ki.idee.nazwa}
                </a>
              ))}
            </div>
          </div>

          {/* Prawa – lead */}
          <div style={{ padding:'80px 64px',display:'flex',flexDirection:'column',justifyContent:'center' }}>
            {r.lead && (
              <p style={{ fontFamily:C,fontSize:'clamp(18px,2vw,26px)',fontWeight:300,color:'#333',lineHeight:1.8,maxWidth:'520px' }}>
                {r.lead}
              </p>
            )}
            {artysciRozdzialu && artysciRozdzialu.length > 0 && (
              <div style={{ marginTop:'48px' }}>
                <p style={{ fontFamily:I,fontSize:'10px',letterSpacing:'.18em',textTransform:'uppercase',color:'#bbb',marginBottom:'16px' }}>
                  Artysci w tym rozdziale
                </p>
                <div style={{ display:'flex',flexWrap:'wrap',gap:'8px' }}>
                  {artysciRozdzialu.map((ka: any, i: number) => ka.artysci && (
                    <a key={i} href={`/artysta/${ka.artysci.url_artysty}`}
                      style={{ fontFamily:C,fontSize:'16px',color:'#555',borderBottom:'1px solid #ebebeb',paddingBottom:'2px' }}>
                      {ka.artysci.nazwisko_i_imie?.trim()}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* TRESC GLOWNA */}
      {r.tresc ? (
        <section style={{ padding:'80px 40px',borderBottom:'1px solid #ebebeb',display:'grid',gridTemplateColumns:'200px 1fr',gap:'80px' }}>
          <div style={{ paddingTop:'4px' }}>
            <p style={{ fontFamily:I,fontSize:'10px',letterSpacing:'.2em',textTransform:'uppercase',color:'#bbb',marginBottom:'32px',position:'sticky',top:'72px' }}>
              Czytaj
            </p>
          </div>
          <div className="tresc-kompendium" style={{ maxWidth:'720px' }}
            dangerouslySetInnerHTML={{ __html: r.tresc }} />
        </section>
      ) : (
        /* Placeholder gdy tresc jeszcze nie wpisana */
        <section style={{ padding:'80px 40px',borderBottom:'1px solid #ebebeb',display:'grid',gridTemplateColumns:'200px 1fr',gap:'80px' }}>
          <p style={{ fontFamily:I,fontSize:'10px',letterSpacing:'.2em',textTransform:'uppercase',color:'#bbb' }}>Tekst</p>
          <div style={{ maxWidth:'720px' }}>
            <p style={{ fontFamily:C,fontSize:'18px',fontWeight:300,color:'#ccc',fontStyle:'italic',lineHeight:1.9 }}>
              Tekst tego rozdziału jest w przygotowaniu. Zapraszamy wkrótce.
            </p>
          </div>
        </section>
      )}

      {/* ARTYSCI */}
      {artysciRozdzialu && artysciRozdzialu.length > 0 && (
        <section style={{ padding:'80px 40px',borderBottom:'1px solid #ebebeb' }}>
          <div style={{ display:'grid',gridTemplateColumns:'200px 1fr',gap:'80px' }}>
            <div>
              <p style={{ fontFamily:I,fontSize:'10px',letterSpacing:'.2em',textTransform:'uppercase',color:'#999',marginBottom:'8px' }}>
                Artysci
              </p>
              <p style={{ fontFamily:C,fontSize:'14px',color:'#bbb',lineHeight:1.6 }}>
                Twórcy których dotyczy ten rozdział
              </p>
            </div>
            <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))',gap:'1px',background:'#ebebeb' }}>
              {artysciRozdzialu.map((ka: any, i: number) => {
                const a = ka.artysci
                if (!a) return null
                const imie = a.nazwisko_i_imie?.trim() || ''
                return (
                  <a key={i} href={`/artysta/${a.url_artysty}`} className="artysta-karta">
                    <div style={{ aspectRatio:'3/2',background:'#f5f3ef',overflow:'hidden' }}>
                      {a.zdjecie_artysty ? (
                        <img src={a.zdjecie_artysty} alt={imie}
                          style={{ width:'100%',height:'100%',objectFit:'cover',objectPosition:'top' }} />
                      ) : (
                        <div style={{ width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center' }}>
                          <p style={{ fontFamily:C,fontSize:'40px',fontWeight:300,color:'#ddd' }}>
                            {imie.split(' ')[0]?.[0]}{imie.split(' ')[1]?.[0]}
                          </p>
                        </div>
                      )}
                    </div>
                    <div style={{ padding:'18px 22px' }}>
                      <p style={{ fontFamily:C,fontSize:'19px',fontWeight:400,marginBottom:'5px' }}>{imie}</p>
                      {a.haslo && (
                        <p style={{ fontFamily:I,fontSize:'11px',color:'#888',lineHeight:1.5 }}>{a.haslo}</p>
                      )}
                      <p style={{ fontFamily:I,fontSize:'10px',letterSpacing:'.12em',textTransform:'uppercase',color:'#bbb',marginTop:'10px' }}>
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

      {/* IDEE POWIAZANE */}
      {ideeRozdzialu && ideeRozdzialu.length > 0 && (
        <section style={{ padding:'80px 40px',borderBottom:'1px solid #ebebeb' }}>
          <div style={{ display:'grid',gridTemplateColumns:'200px 1fr',gap:'80px',alignItems:'start' }}>
            <p style={{ fontFamily:I,fontSize:'10px',letterSpacing:'.2em',textTransform:'uppercase',color:'#999' }}>
              Pojecia
            </p>
            <div>
              <p style={{ fontFamily:C,fontSize:'17px',fontWeight:300,color:'#666',lineHeight:1.7,marginBottom:'28px',maxWidth:'560px' }}>
                Idee i pojęcia które ten rozdział rozwija i kontekstualizuje.
              </p>
              <div style={{ display:'flex',flexWrap:'wrap',gap:'0',background:'#ebebeb' }}>
                {ideeRozdzialu.map((ki: any, i: number) => {
                  const idea = ki.idee
                  if (!idea) return null
                  return (
                    <a key={i} href={`/idee/${idea.slug}`}
                      style={{ background:'#fff',padding:'24px 28px',display:'block',borderRight:'1px solid #ebebeb',borderBottom:'1px solid #ebebeb',minWidth:'200px',transition:'background .2s' }}>
                      <p style={{ fontFamily:C,fontSize:'20px',fontWeight:400,marginBottom:'8px' }}>{idea.nazwa}</p>
                      {idea.opis_krotki && (
                        <p style={{ fontFamily:I,fontSize:'11px',color:'#888',lineHeight:1.5,display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical',overflow:'hidden' }}>
                          {idea.opis_krotki}
                        </p>
                      )}
                    </a>
                  )
                })}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* INNE ROZDZIALY */}
      {pozostaleRozdzialy && pozostaleRozdzialy.length > 0 && (
        <section style={{ padding:'80px 40px',borderBottom:'1px solid #ebebeb' }}>
          <div style={{ display:'grid',gridTemplateColumns:'200px 1fr',gap:'80px' }}>
            <div>
              <p style={{ fontFamily:I,fontSize:'10px',letterSpacing:'.2em',textTransform:'uppercase',color:'#999',marginBottom:'8px' }}>
                Kompendium
              </p>
              <p style={{ fontFamily:C,fontSize:'14px',color:'#bbb',lineHeight:1.6 }}>
                Inne rozdziały
              </p>
            </div>
            <div>
              {pozostaleRozdzialy.map((roz: any, i: number) => (
                <a key={i} href={`/kompendium/${roz.slug}`} className="rozdz-row">
                  <div style={{ display:'grid',gridTemplateColumns:'1fr auto',gap:'24px',alignItems:'center' }}>
                    <div>
                      <p style={{ fontFamily:I,fontSize:'9px',letterSpacing:'.18em',textTransform:'uppercase',color:'#bbb',marginBottom:'6px' }}>
                        {roz.kategoria === 'historia' ? 'Historia' :
                         roz.kategoria === 'nurty' ? 'Nurty' :
                         roz.kategoria === 'pojecia' ? 'Pojecia' :
                         roz.kategoria === 'kolekcjonerski' ? 'Przewodnik' : ''}
                      </p>
                      <p style={{ fontFamily:C,fontSize:'20px',fontWeight:400,marginBottom:'6px' }}>{roz.tytul}</p>
                      {roz.lead && (
                        <p style={{ fontFamily:I,fontSize:'11px',color:'#888',lineHeight:1.5,maxWidth:'560px',display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical',overflow:'hidden' }}>
                          {roz.lead}
                        </p>
                      )}
                    </div>
                    <p style={{ fontFamily:I,fontSize:'10px',letterSpacing:'.12em',textTransform:'uppercase',color:'#bbb',whiteSpace:'nowrap' }}>
                      &rarr; Czytaj
                    </p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section style={{ padding:'80px 40px',background:'#f9f9f7' }}>
        <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:'80px',alignItems:'center' }}>
          <div>
            <p style={{ fontFamily:I,fontSize:'10px',letterSpacing:'.2em',textTransform:'uppercase',color:'#999',marginBottom:'24px' }}>
              Galeria ESTA
            </p>
            <h2 style={{ fontFamily:C,fontSize:'clamp(28px,3vw,48px)',fontWeight:400,lineHeight:1.1,marginBottom:'24px' }}>
              Poznaj program galerii<br />przez artystów i idee
            </h2>
            <p style={{ fontFamily:C,fontSize:'17px',fontWeight:300,color:'#666',lineHeight:1.7,maxWidth:'440px' }}>
              28 lat pracy z polską sztuką konceptualną, konkretną i neoawangardową. Zapraszamy do rozmowy o kolekcji i programie.
            </p>
          </div>
          <div style={{ display:'flex',flexDirection:'column',gap:'12px',alignItems:'flex-start' }}>
            <a href="/artysci"
              style={{ fontFamily:I,fontSize:'11px',letterSpacing:'.16em',textTransform:'uppercase',color:'#111',border:'1px solid #111',padding:'16px 32px' }}>
              &rarr; Artysci galerii
            </a>
            <a href="/idee"
              style={{ fontFamily:I,fontSize:'11px',letterSpacing:'.16em',textTransform:'uppercase',color:'#666',border:'1px solid #ddd',padding:'16px 32px' }}>
              &rarr; Mapa idei
            </a>
            <a href="mailto:galeria@galeria-esta.pl"
              style={{ fontFamily:I,fontSize:'11px',letterSpacing:'.16em',textTransform:'uppercase',color:'#999',padding:'16px 0' }}>
              &rarr; Napisz do nas
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
          {['Artysci','Wystawy','Idee','Kompendium','Viewing Room','O nas'].map(item => (
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
