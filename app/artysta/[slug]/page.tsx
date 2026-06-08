import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import Nav from '@/components/Nav'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Pole nazwisko_i_imie ma format "Nazwisko Imie" -> wyswietlamy "Imie Nazwisko".
// Nazwy zbiorowe (np. "Grupa Twozywo") i nazwy nie-2-wyrazowe zostawiamy bez zmian.
function formatImieNazwisko(raw: string): string {
  const n = (raw || '').trim().replace(/\s+/g, ' ')
  if (!n) return ''
  if (/^grupa\b/i.test(n)) return n
  const parts = n.split(' ')
  return parts.length === 2 ? `${parts[1]} ${parts[0]}` : n
}

export default async function ArtystaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  const { data: artysci } = await supabase
    .from('artysci')
    .select('*')
    .eq('url_artysty', slug)
    .limit(1)

  const a = artysci?.[0]
  if (!a) notFound()

  // Linia programowa: idea glowna (single, via FK na artysci.idea_glowna_id)
  const { data: ideeGlowneArr } = a.idea_glowna_id
    ? await supabase
        .from('idee')
        .select('id, slug, nazwa')
        .eq('id', a.idea_glowna_id)
        .limit(1)
    : { data: [] as any[] }
  const ideaGlowna = ideeGlowneArr?.[0] ?? null

  // Linia programowa: idee uzupelniajace (M:N artysci_idee, filter rola)
  const { data: ideeUzupelniajaceArr } = await supabase
    .from('artysci_idee')
    .select('idee(id, slug, nazwa)')
    .eq('artysta_id', a.id)
    .eq('rola', 'uzupelniajaca')
    .limit(4)
  const ideeUzupelniajace = (ideeUzupelniajaceArr || [])
    .map((ai: any) => ai.idee)
    .filter(Boolean)

  // Linia programowa: pojecia (M:N pojecia_artysci, max 6)
  const { data: pojeciaArtystyArr } = await supabase
    .from('pojecia_artysci')
    .select('pojecia(id, slug, nazwa)')
    .eq('artysta_id', a.id)
    .limit(6)
  const pojeciaArtysty = (pojeciaArtystyArr || [])
    .map((pa: any) => pa.pojecia)
    .filter(Boolean)

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

  // Zdjecie pracy na HERO: media powiazane z artysta (typ=praca).
  // praca_id bywa NULL, dlatego laczymy po artysta_id. media.url to pelny URL do Storage.
  const { data: heroMedia } = await supabase
    .from('media')
    .select('url, alt')
    .eq('artysta_id', a.id)
    .eq('typ', 'praca')
    .order('created_at', { ascending: false })
    .limit(1)

  const C = '"Cormorant Garamond", Georgia, serif'
  const I = '"Instrument Sans", sans-serif'

  const fmtYear = (d: string | null) => d ? new Date(d).getFullYear() : ''

  const getZdjeciePracy = (pracaId: string) =>
    zdjeciaPrac?.find(z => z.praca_id === pracaId)

  const imie = a.nazwisko_i_imie?.trim() || ''
  const imieNazwisko = formatImieNazwisko(a.nazwisko_i_imie || '')
  const dlaczegoZdanie = (a.dlaczego_wazny || '').trim().split(/(?<=[.!?])\s/)[0] || ''

  // HERO: zdjecie_hero -> praca z media (po artysta_id) -> placeholder. Nigdy portret (zdjecie_artysty).
  const usingHero = !!(a.zdjecie_hero && a.zdjecie_hero.trim())
  const heroSrc = usingHero ? a.zdjecie_hero : (heroMedia?.[0]?.url || '')
  const heroAlt = usingHero ? (a.zdjecie_alt || imieNazwisko) : (heroMedia?.[0]?.alt || imieNazwisko)

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
        .idea-card{background:#fff;padding:32px;display:block;transition:background .2s;}
        .idea-card:hover{background:#f9f9f7;}
        .art-hero{display:flex;flex-direction:column;border-bottom:1px solid #ebebeb;padding-top:54px;}
        .art-hero-media{background:#fff;display:flex;align-items:center;justify-content:center;padding:56px 32px;}
        .art-hero-img{width:100%;max-width:340px;height:auto;display:block;}
        .art-hero-ph{padding:48px;text-align:center;}
        .art-hero-ph p{font-family:"Cormorant Garamond",Georgia,serif;font-size:clamp(48px,18vw,96px);font-weight:300;color:#e3e0da;line-height:1;letter-spacing:.05em;}
        .art-hero-info{display:flex;flex-direction:column;padding:8px 32px 64px;}
        .art-hero-back{font-family:"Instrument Sans",sans-serif;font-size:10px;letter-spacing:.16em;text-transform:uppercase;color:#999;margin-bottom:40px;}
        .art-hero-name{font-family:"Cormorant Garamond",Georgia,serif;font-size:clamp(30px,6vw,52px);font-weight:300;line-height:1.05;letter-spacing:-.01em;margin-bottom:28px;}
        .art-hero-program{display:flex;flex-direction:column;gap:12px;margin-bottom:32px;}
        .art-hero-program-idea{font-family:"Cormorant Garamond",Georgia,serif;font-style:italic;font-size:18px;color:#444;text-decoration:none;border-bottom:1px solid transparent;transition:color .15s,border-color .15s;display:inline-block;align-self:flex-start;}
        .art-hero-program-idea:hover{color:#11110f;border-bottom-color:#11110f;}
        .art-hero-program-uzup{font-family:"Cormorant Garamond",Georgia,serif;font-style:italic;font-size:13px;color:#777;line-height:1.6;}
        .art-hero-program-uzup a{color:#777;text-decoration:none;border-bottom:1px solid transparent;transition:color .15s,border-color .15s;}
        .art-hero-program-uzup a:hover{color:#11110f;border-bottom-color:#11110f;}
        .art-hero-program-uzup .sep{color:#ccc;margin:0 6px;}
        .art-hero-program-pojecia{font-family:"Instrument Sans",sans-serif;font-size:13px;color:#777;line-height:1.6;}
        .art-hero-program-pojecia a{color:#777;text-decoration:none;border-bottom:1px solid transparent;transition:color .15s,border-color .15s;}
        .art-hero-program-pojecia a:hover{color:#11110f;border-bottom-color:#11110f;}
        .art-hero-program-pojecia .sep{color:#ccc;margin:0 6px;}
        .art-hero-why{font-family:"Cormorant Garamond",Georgia,serif;font-style:italic;font-size:clamp(15px,1.6vw,19px);color:#777;line-height:1.5;max-width:440px;margin-bottom:40px;}
        @media (min-width:900px){
          .art-hero{flex-direction:row;min-height:80vh;}
          .art-hero-media{flex:1;padding:80px;}
          .art-hero-img{max-width:420px;}
          .art-hero-info{flex:1;justify-content:center;padding:80px 64px;border-left:1px solid #ebebeb;}
          .art-hero-back{margin-bottom:48px;}
        }
      `}</style>

      {/* NAV */}
      <Nav active="artysci" />

      {/* HERO */}
      <section className="art-hero">
        {/* LEWA – praca artysty, z bialym marginesem ze wszystkich stron */}
        <div className="art-hero-media">
          {heroSrc ? (
            <img src={heroSrc} alt={heroAlt} className="art-hero-img" />
          ) : (
            <div className="art-hero-ph">
              <p>{imie.split(' ')[0]?.[0]}{imie.split(' ')[1]?.[0]}</p>
            </div>
          )}
        </div>

        {/* PRAWA – lekko, z hierarchia */}
        <div className="art-hero-info">
          <a href="/artysci" className="art-hero-back">&larr; Artysci</a>
          <h1 className="art-hero-name">{imieNazwisko}</h1>
          {(ideaGlowna || ideeUzupelniajace.length > 0 || pojeciaArtysty.length > 0) && (
            <div className="art-hero-program">
              {ideaGlowna && (
                <a
                  href={`/idee/${ideaGlowna.slug}`}
                  className="art-hero-program-idea"
                >
                  {ideaGlowna.nazwa}
                </a>
              )}
              {ideeUzupelniajace.length > 0 && (
                <div className="art-hero-program-uzup">
                  {ideeUzupelniajace.map((ia: any, idx: number) => (
                    <span key={ia.id}>
                      <a href={`/idee/${ia.slug}`}>
                        {ia.nazwa}
                      </a>
                      {idx < ideeUzupelniajace.length - 1 && (
                        <span className="sep">·</span>
                      )}
                    </span>
                  ))}
                </div>
              )}
              {pojeciaArtysty.length > 0 && (
                <div className="art-hero-program-pojecia">
                  {pojeciaArtysty.map((p: any, idx: number) => {
                    const nazwa = p.nazwa
                    return (
                      <span key={p.id}>
                        <a href={`/kolekcja?tag=${encodeURIComponent(nazwa.toLowerCase())}`}>
                          {nazwa}
                        </a>
                        {idx < pojeciaArtysty.length - 1 && (
                          <span className="sep">·</span>
                        )}
                      </span>
                    )
                  })}
                </div>
              )}
            </div>
          )}
          {dlaczegoZdanie && (
            <p className="art-hero-why">{dlaczegoZdanie}</p>
          )}
          <a href={`mailto:galeria@galeria-esta.pl?subject=Zapytanie o prace ${imieNazwisko}`} className="arrow-link">
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
