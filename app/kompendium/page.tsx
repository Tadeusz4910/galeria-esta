import { createClient } from '@supabase/supabase-js'
import Nav from '@/components/Nav'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default async function KompendiumStrona() {
  const { data: rozdzialy } = await supabase
    .from('kompendium')
    .select('tytul, slug, lead, kategoria, kolejnosc, wyroznienie')
    .eq('publiczne', true)
    .order('kolejnosc')

  const C = '"Cormorant Garamond", Georgia, serif'
  const I = '"Instrument Sans", sans-serif'

  const historia = rozdzialy?.filter(r => r.kategoria === 'historia') || []
  const nurty = rozdzialy?.filter(r => r.kategoria === 'nurty') || []
  const pojecia = rozdzialy?.filter(r => r.kategoria === 'pojecia') || []
  const kolekcjonerski = rozdzialy?.filter(r => r.kategoria === 'kolekcjonerski') || []

  const renderGrupa = (tytu: string, lista: any[]) => lista.length === 0 ? null : (
    <div style={{ display:'grid',gridTemplateColumns:'200px 1fr',gap:'80px',padding:'64px 40px',borderBottom:'1px solid #ebebeb' }}>
      <div style={{ paddingTop:'4px' }}>
        <p style={{ fontFamily:I,fontSize:'10px',letterSpacing:'.2em',textTransform:'uppercase',color:'#999' }}>{tytu}</p>
      </div>
      <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))',gap:'1px',background:'#ebebeb' }}>
        {lista.map((r: any, i: number) => (
          <a key={i} href={`/kompendium/${r.slug}`}
            style={{ background: r.wyroznienie ? '#111' : '#fff', padding:'36px 32px',display:'block',transition:'background .25s' }}
            className={r.wyroznienie ? 'rozdz-karta-dark' : 'rozdz-karta'}>
            <p style={{ fontFamily:C,fontSize:'24px',fontWeight:400,marginBottom:'14px',lineHeight:1.1,
              color: r.wyroznienie ? '#fff' : '#111' }}>
              {r.tytul}
            </p>
            {r.lead && (
              <p style={{ fontFamily:I,fontSize:'11px',lineHeight:1.7,
                color: r.wyroznienie ? 'rgba(255,255,255,.5)' : '#888',
                display:'-webkit-box',WebkitLineClamp:3,WebkitBoxOrient:'vertical',overflow:'hidden' }}>
                {r.lead}
              </p>
            )}
            <p style={{ fontFamily:I,fontSize:'10px',letterSpacing:'.14em',textTransform:'uppercase',
              color: r.wyroznienie ? 'rgba(255,255,255,.3)' : '#bbb',marginTop:'20px' }}>
              &rarr; Czytaj
            </p>
          </a>
        ))}
      </div>
    </div>
  )

  return (
    <main style={{ background:'#fff', color:'#111' }}>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0;}
        a{text-decoration:none;color:inherit;}
        .nav-link{font-family:"Instrument Sans",sans-serif;font-size:11px;letter-spacing:.12em;text-transform:uppercase;opacity:.5;transition:opacity .2s;}
        .nav-link:hover{opacity:1;}
        .rozdz-karta:hover{background:#f9f9f7 !important;}
        .rozdz-karta-dark:hover{background:#1a1a18 !important;}
      `}</style>

      <Nav active="kompendium" />

      {/* HERO */}
      <section style={{ paddingTop:'54px',padding:'120px 40px 80px',borderBottom:'1px solid #ebebeb',display:'grid',gridTemplateColumns:'1fr 1fr',gap:'80px',alignItems:'end' }}>
        <div>
          <p style={{ fontFamily:I,fontSize:'10px',letterSpacing:'.2em',textTransform:'uppercase',color:'#999',marginBottom:'24px' }}>
            Galeria ESTA
          </p>
          <h1 style={{ fontFamily:C,fontSize:'clamp(48px,6vw,96px)',fontWeight:400,lineHeight:.95,letterSpacing:'-.02em' }}>
            Kompen<br />dium
          </h1>
        </div>
        <div style={{ paddingBottom:'8px' }}>
          <p style={{ fontFamily:C,fontSize:'clamp(16px,1.8vw,22px)',fontWeight:300,color:'#555',lineHeight:1.8,maxWidth:'480px',marginBottom:'32px' }}>
            Baza wiedzy o polskiej sztuce konceptualnej, konkretnej i neoawangardowej. Pisana z perspektywy 28 lat pracy z artystami i dziełami które tę historię współtworzyły.
          </p>
          <p style={{ fontFamily:I,fontSize:'11px',letterSpacing:'.14em',textTransform:'uppercase',color:'#bbb' }}>
            {rozdzialy?.length || 0} rozdziałów &nbsp;·&nbsp; PL / EN
          </p>
        </div>
      </section>

      {/* HASLO */}
      <section style={{ padding:'48px 40px',borderBottom:'1px solid #ebebeb',background:'#f9f9f7' }}>
        <p style={{ fontFamily:C,fontSize:'clamp(18px,2vw,28px)',fontWeight:300,color:'#444',lineHeight:1.8,maxWidth:'800px' }}>
          Sztuka konceptualna nie potrzebuje tłumaczenia — potrzebuje kontekstu. Kompendium Galerii ESTA to próba pokazania tej sztuki tak, jak widzimy ją od środka: przez idee, artystów i relacje między nimi.
        </p>
      </section>

      {/* GRUPY ROZDZIALOW */}
      {renderGrupa('Historia i kontekst', historia)}
      {renderGrupa('Nurty i kierunki', nurty)}
      {renderGrupa('Pojecia i idee', pojecia)}
      {renderGrupa('Przewodnik kolekcjonera', kolekcjonerski)}

      {/* CTA */}
      <section style={{ padding:'80px 40px',display:'grid',gridTemplateColumns:'1fr 1fr',gap:'80px',alignItems:'center' }}>
        <div>
          <h2 style={{ fontFamily:C,fontSize:'clamp(28px,3vw,48px)',fontWeight:400,lineHeight:1.1,marginBottom:'24px' }}>
            Mapa idei
          </h2>
          <p style={{ fontFamily:C,fontSize:'17px',fontWeight:300,color:'#666',lineHeight:1.7 }}>
            Kompendium uzupełnia Mapa idei &mdash; 35 pojęć które organizują program galerii i łączą artystów, prace i teksty w jedną sieć znaczeń.
          </p>
        </div>
        <div style={{ display:'flex',gap:'12px',flexWrap:'wrap' }}>
          <a href="/idee"
            style={{ fontFamily:I,fontSize:'11px',letterSpacing:'.16em',textTransform:'uppercase',color:'#111',border:'1px solid #111',padding:'16px 32px' }}>
            &rarr; Mapa idei
          </a>
          <a href="/artysci"
            style={{ fontFamily:I,fontSize:'11px',letterSpacing:'.16em',textTransform:'uppercase',color:'#666',border:'1px solid #ddd',padding:'16px 32px' }}>
            &rarr; Artysci
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
