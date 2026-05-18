import { createClient } from '@supabase/supabase-js'
import Nav from '@/components/Nav'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default async function IdeeStrona() {
  const { data: idee } = await supabase
    .from('idee')
    .select('nazwa, slug, opis_krotki, kategoria, kolejnosc')
    .eq('publiczne', true)
    .order('kolejnosc')

  const C = '"Cormorant Garamond", Georgia, serif'
  const I = '"Instrument Sans", sans-serif'

  const glowne = idee?.filter(i => i.kategoria === 'glowna') || []
  const rozszerzone = idee?.filter(i => i.kategoria === 'rozszerzona') || []

  return (
    <main style={{ background: '#fff', color: '#111' }}>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0;}
        a{text-decoration:none;color:inherit;}
        .idea-karta{background:#fff;padding:40px 36px;display:block;border:1px solid #ebebeb;transition:all .3s;}
        .idea-karta:hover{background:#111;border-color:#111;}
        .idea-karta:hover .idea-nazwa{color:#fff;}
        .idea-karta:hover .idea-opis{color:rgba(255,255,255,.6);}
        .idea-karta:hover .idea-arrow{color:rgba(255,255,255,.4);}
        .idea-nazwa{font-family:"Cormorant Garamond",Georgia,serif;font-size:26px;font-weight:400;color:#111;margin-bottom:12px;transition:color .3s;}
        .idea-opis{font-family:"Instrument Sans",sans-serif;font-size:11px;line-height:1.7;color:#888;transition:color .3s;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden;}
        .idea-arrow{font-family:"Instrument Sans",sans-serif;font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:#ccc;margin-top:20px;display:block;transition:color .3s;}
      `}</style>

      <Nav active="idee" />

      {/* HERO */}
      <section style={{ paddingTop:'54px',padding:'120px 40px 80px',borderBottom:'1px solid #ebebeb',display:'grid',gridTemplateColumns:'1fr 1fr',gap:'80px',alignItems:'end' }}>
        <div>
          <p style={{ fontFamily:I,fontSize:'10px',letterSpacing:'.2em',textTransform:'uppercase',color:'#999',marginBottom:'24px' }}>
            Galeria ESTA
          </p>
          <h1 style={{ fontFamily:C,fontSize:'clamp(48px,6vw,96px)',fontWeight:400,lineHeight:.95,letterSpacing:'-.02em' }}>
            Mapa<br />idei
          </h1>
        </div>
        <div style={{ paddingBottom:'8px' }}>
          <p style={{ fontFamily:C,fontSize:'clamp(16px,1.8vw,22px)',fontWeight:300,color:'#555',lineHeight:1.7,maxWidth:'480px' }}>
            Sztuka konceptualna, konkretna i neoawangardowa przez pojęcia które ją tworzą. Każda idea łączy artystów, prace i teksty w jedną sieć znaczeń.
          </p>
          <p style={{ fontFamily:I,fontSize:'11px',letterSpacing:'.14em',textTransform:'uppercase',color:'#bbb',marginTop:'32px' }}>
            {idee?.length || 0} pojęć · {glowne.length} głównych · {rozszerzone.length} rozszerzonych
          </p>
        </div>
      </section>

      {/* HASLO PRZEWODNIE */}
      <section style={{ padding:'64px 40px',borderBottom:'1px solid #ebebeb',background:'#f9f9f7' }}>
        <p style={{ fontFamily:C,fontSize:'clamp(20px,2.5vw,32px)',fontWeight:300,color:'#333',letterSpacing:'.08em',textAlign:'center',lineHeight:1.8 }}>
          Idea &nbsp;·&nbsp; Słowo &nbsp;·&nbsp; Obraz &nbsp;·&nbsp; Struktura &nbsp;·&nbsp; Światło &nbsp;·&nbsp; Pamięć &nbsp;·&nbsp; Proces
        </p>
      </section>

      {/* GLOWNE IDEE */}
      {glowne.length > 0 && (
        <section style={{ padding:'80px 40px',borderBottom:'1px solid #ebebeb' }}>
          <div style={{ display:'grid',gridTemplateColumns:'200px 1fr',gap:'80px' }}>
            <div>
              <p style={{ fontFamily:I,fontSize:'10px',letterSpacing:'.2em',textTransform:'uppercase',color:'#999',marginBottom:'8px' }}>
                Idee główne
              </p>
              <p style={{ fontFamily:C,fontSize:'14px',color:'#bbb',lineHeight:1.6 }}>
                Kluczowe pojęcia programu Galerii ESTA
              </p>
            </div>
            <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))',gap:'1px',background:'#ebebeb' }}>
              {glowne.map((idea, i) => (
                <a key={i} href={`/idee/${idea.slug}`} className="idea-karta">
                  <p className="idea-nazwa">{idea.nazwa}</p>
                  {idea.opis_krotki && (
                    <p className="idea-opis">{idea.opis_krotki}</p>
                  )}
                  <span className="idea-arrow">&rarr; Idea</span>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ROZSZERZONE IDEE */}
      {rozszerzone.length > 0 && (
        <section style={{ padding:'80px 40px',borderBottom:'1px solid #ebebeb' }}>
          <div style={{ display:'grid',gridTemplateColumns:'200px 1fr',gap:'80px' }}>
            <div>
              <p style={{ fontFamily:I,fontSize:'10px',letterSpacing:'.2em',textTransform:'uppercase',color:'#999',marginBottom:'8px' }}>
                Idee rozszerzone
              </p>
              <p style={{ fontFamily:C,fontSize:'14px',color:'#bbb',lineHeight:1.6 }}>
                Pojęcia poszerzające mapę programu
              </p>
            </div>
            <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))',gap:'1px',background:'#ebebeb' }}>
              {rozszerzone.map((idea, i) => (
                <a key={i} href={`/idee/${idea.slug}`} className="idea-karta">
                  <p className="idea-nazwa">{idea.nazwa}</p>
                  {idea.opis_krotki && (
                    <p className="idea-opis">{idea.opis_krotki}</p>
                  )}
                  <span className="idea-arrow">&rarr; Idea</span>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section style={{ padding:'80px 40px',display:'grid',gridTemplateColumns:'1fr 1fr',gap:'80px',alignItems:'center' }}>
        <div>
          <h2 style={{ fontFamily:C,fontSize:'clamp(28px,3vw,48px)',fontWeight:400,lineHeight:1.1,marginBottom:'24px' }}>
            Poznaj artystów<br />przez idee
          </h2>
          <p style={{ fontFamily:C,fontSize:'17px',fontWeight:300,color:'#666',lineHeight:1.7 }}>
            Każde pojęcie łączy się z artystami, pracami i tekstami. To mapa znaczeń programu Galerii ESTA.
          </p>
        </div>
        <div style={{ display:'flex',gap:'16px',flexWrap:'wrap' }}>
          <a href="/artysci" style={{ fontFamily:I,fontSize:'11px',letterSpacing:'.16em',textTransform:'uppercase',color:'#111',border:'1px solid #111',padding:'16px 32px' }}>
            &rarr; Artysci
          </a>
          <a href="/kolekcja" style={{ fontFamily:I,fontSize:'11px',letterSpacing:'.16em',textTransform:'uppercase',color:'#666',border:'1px solid #ddd',padding:'16px 32px' }}>
            &rarr; Kolekcja
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
