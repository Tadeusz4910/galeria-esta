import { createClient } from '@supabase/supabase-js'
import Nav from '@/components/Nav'

export const revalidate = 0

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default async function TargiPage() {
  const { data: targi } = await supabase
    .from('targi')
    .select('nazwa, artysci_txt, data_od, data_do, url_targu, img_cover, opis, miasto')
    .eq('publiczne', true)
    .order('data_od', { ascending: false })

  const C = '"Cormorant Garamond", Georgia, serif'
  const I = '"Instrument Sans", sans-serif'

  const byYear: Record<number, typeof targi> = {}
  ;(targi || []).forEach(t => {
    const year = t.data_od ? new Date(t.data_od).getFullYear() : 0
    if (!byYear[year]) byYear[year] = []
    byYear[year]!.push(t)
  })
  const years = Object.keys(byYear).map(Number).sort((a, b) => b - a)

  return (
    <main style={{ background: '#fff', color: '#111' }}>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0;}
        a{text-decoration:none;color:inherit;}
        .card-img{transition:transform .8s cubic-bezier(.25,.46,.45,.94);}
        .card-hover:hover .card-img{transform:scale(1.03);}
      `}</style>

      <Nav active="targi" />

      <section style={{ paddingTop:'120px',padding:'120px 40px 64px',borderBottom:'1px solid #ebebeb' }}>
        <h1 style={{ fontFamily:C,fontSize:'clamp(48px,6vw,88px)',fontWeight:400,lineHeight:1 }}>Targi</h1>
        <p style={{ fontFamily:I,fontSize:'13px',color:'#888',marginTop:'16px' }}>{targi?.length || 0} targow</p>
      </section>

      {years.map(year => (
        <section key={year} style={{ padding:'0 40px 64px',borderTop:'1px solid #ebebeb' }}>
          <div style={{ padding:'32px 0 32px' }}>
            <h2 style={{ fontFamily:C,fontSize:'36px',fontWeight:400,color:'#ccc' }}>{year}</h2>
          </div>
          <div style={{ display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'40px' }}>
            {byYear[year]!.map((t, i) => (
              <a key={i} href={`/targ/${t.url_targu}`} className="card-hover" style={{ display:'block' }}>
                <div style={{ overflow:'hidden',marginBottom:'16px',background:'#f0ece5' }}>
                  {t.img_cover
                    ? <img src={t.img_cover} alt={t.nazwa||''} className="card-img" style={{ width:'100%',aspectRatio:'4/3',objectFit:'cover',display:'block' }} />
                    : <div style={{ aspectRatio:'4/3',background:'#e8e4de' }} />
                  }
                </div>
                <p style={{ fontFamily:I,fontSize:'10px',letterSpacing:'.16em',textTransform:'uppercase',color:'#999',marginBottom:'6px' }}>
                  {t.data_od ? new Date(t.data_od).toLocaleDateString('pl-PL',{day:'numeric',month:'long'}) : ''}{t.data_do ? ` – ${new Date(t.data_do).toLocaleDateString('pl-PL',{day:'numeric',month:'long'})}` : ''}
                </p>
                <p style={{ fontFamily:C,fontSize:'18px',fontWeight:400,marginBottom:'3px' }}>{t.nazwa}</p>
                {t.miasto && <p style={{ fontFamily:C,fontSize:'15px',fontWeight:300,fontStyle:'italic',color:'#666' }}>{t.miasto}</p>}
                {t.artysci_txt && <p style={{ fontFamily:C,fontSize:'14px',fontWeight:300,color:'#888',marginTop:'4px' }}>{t.artysci_txt}</p>}
              </a>
            ))}
          </div>
        </section>
      ))}

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
