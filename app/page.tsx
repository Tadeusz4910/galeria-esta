import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default async function Home() {
  const { data: wystawyAll } = await supabase
    .from('wystawy')
    .select('tytul, artysci_txt, data_od, data_do, url_wystawy, img_plakat, opis_krotki, miejsce')
    .not('tytul', 'is', null)
    .order('data_od', { ascending: false })
    .limit(8)

  const { data: targiAll } = await supabase
    .from('targi')
    .select('nazwa, artysci_txt, data_od, data_do, url_targu, img_cover, opis')
    .eq('publiczne', true)
    .order('data_od', { ascending: false })
    .limit(6)

  const { data: artysci } = await supabase
    .from('artysci')
    .select('nazwisko_i_imie, url_artysty')
    .eq('status_w_galerii', 'aktywny')
    .order('nazwisko_i_imie')

  const now = new Date()

  const aktualna = wystawyAll?.find(w => new Date(w.data_od) <= now && new Date(w.data_do) >= now) || wystawyAll?.[0]
  const upcoming = wystawyAll?.find(w => new Date(w.data_od) > now)
  const pozostaleWystawy = wystawyAll?.filter(w =>
    w.url_wystawy !== aktualna?.url_wystawy &&
    w.url_wystawy !== upcoming?.url_wystawy
  ).slice(0, 4) || []

  const aktualneTargi = targiAll?.[0]
  const pozostaleTargi = targiAll?.slice(1, 5) || []

  const fmtDate = (d: string | null) => d
    ? new Date(d).toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' })
    : ''

  const C = '"Cormorant Garamond", Georgia, serif'
  const I = '"Instrument Sans", sans-serif'

  return (
    <main style={{ background: '#fff', color: '#111' }}>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0;}
        a{text-decoration:none;color:inherit;}
        .nav-link{font-family:"Instrument Sans",sans-serif;font-size:11px;letter-spacing:.12em;text-transform:uppercase;opacity:.5;transition:opacity .2s;}
        .nav-link:hover{opacity:1;}
        .card-img{transition:transform .8s cubic-bezier(.25,.46,.45,.94);}
        .card-hover:hover .card-img{transform:scale(1.03);}
        .artist-link{font-family:"Cormorant Garamond",Georgia,serif;display:block;font-size:17px;font-weight:400;line-height:2.4;border-bottom:1px solid #ebebeb;}
        .artist-link:hover{opacity:.4;}
        .arrow-link{display:inline-flex;align-items:center;gap:8px;font-family:"Instrument Sans",sans-serif;font-size:11px;letter-spacing:.12em;text-transform:uppercase;opacity:.6;transition:opacity .2s;}
        .arrow-link:hover{opacity:1;}
      `}</style>

      {/* NAWIGACJA */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, padding: '0 40px', height: '54px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,.96)', borderBottom: '1px solid #ebebeb' }}>
        <a href="/" style={{ fontFamily: C, fontSize: '16px', fontWeight: 400, letterSpacing: '.2em', textTransform: 'uppercase' }}>
          Galeria ESTA
        </a>
        <div style={{ display: 'flex', gap: '28px' }}>
          {['Artysci', 'Wystawy', 'Targi', 'Publikacje', 'Artykuly', 'Filmy', 'Oferta', 'Viewing Room', 'O nas'].map(item => (
            <a key={item} href="#" className="nav-link">{item}</a>
          ))}
        </div>
        <a href="#" className="nav-link" style={{ fontSize: '10px' }}>PL / EN</a>
      </nav>

      {/* HERO – pelnoekranowe zdjecie */}
      <section style={{ paddingTop: '54px', height: '100vh', overflow: 'hidden' }}>
        <img src={aktualna?.img_plakat || ''} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      </section>

      {/* AKTUALNA WYSTAWA – tekst lewo, zdjecie prawo */}
      <section style={{ display: 'grid', gridTemplateColumns: '2fr 3fr', minHeight: '80vh', borderTop: '1px solid #ebebeb' }}>
        <div style={{ padding: '72px 48px', display: 'flex', flexDirection: 'column', justifyContent: 'center', borderRight: '1px solid #ebebeb' }}>
          <p style={{ fontFamily: I, fontSize: '10px', fontWeight: 600, letterSpacing: '.2em', textTransform: 'uppercase', marginBottom: '36px' }}>Aktualna wystawa</p>
          <h2 style={{ fontFamily: C, fontSize: 'clamp(28px,3vw,48px)', fontWeight: 400, lineHeight: 1.05, marginBottom: '8px' }}>{aktualna?.artysci_txt || ''}</h2>
          <p style={{ fontFamily: C, fontSize: 'clamp(16px,1.8vw,26px)', fontWeight: 300, fontStyle: 'italic', color: '#666', marginBottom: '32px', lineHeight: 1.3 }}>{aktualna?.tytul || ''}</p>
          <p style={{ fontFamily: I, fontSize: '13px', marginBottom: '4px' }}>{fmtDate(aktualna?.data_od || null)} &ndash; {fmtDate(aktualna?.data_do || null)}</p>
          <p style={{ fontFamily: I, fontSize: '13px', fontWeight: 600, marginBottom: '32px' }}>{aktualna?.miejsce || 'Galeria ESTA, Gliwice'}</p>
          {aktualna?.opis_krotki && <p style={{ fontFamily: I, fontSize: '13px', color: '#555', lineHeight: 1.8, marginBottom: '40px' }}>{aktualna.opis_krotki}</p>}
          <a href={`/wystawa/${aktualna?.url_wystawy || ''}`} className="arrow-link">&rarr; Wiecej o wystawie</a>
        </div>
        <div style={{ overflow: 'hidden' }}>
          <img src={aktualna?.img_plakat || ''} alt={aktualna?.tytul || ''} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        </div>
      </section>

      {/* UPCOMING – zdjecie lewo, tekst prawo */}
      {upcoming && (
        <section style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', minHeight: '80vh', borderTop: '1px solid #ebebeb' }}>
          <div style={{ overflow: 'hidden' }}>
            <img src={upcoming.img_plakat || ''} alt={upcoming.tytul || ''} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          </div>
          <div style={{ padding: '72px 48px', display: 'flex', flexDirection: 'column', justifyContent: 'center', borderLeft: '1px solid #ebebeb' }}>
            <p style={{ fontFamily: I, fontSize: '10px', fontWeight: 600, letterSpacing: '.2em', textTransform: 'uppercase', marginBottom: '36px' }}>Upcoming</p>
            <h2 style={{ fontFamily: C, fontSize: 'clamp(28px,3vw,48px)', fontWeight: 400, lineHeight: 1.05, marginBottom: '8px' }}>{upcoming.artysci_txt || ''}</h2>
            <p style={{ fontFamily: C, fontSize: 'clamp(16px,1.8vw,26px)', fontWeight: 300, fontStyle: 'italic', color: '#666', marginBottom: '32px', lineHeight: 1.3 }}>{upcoming.tytul || ''}</p>
            <p style={{ fontFamily: I, fontSize: '13px', marginBottom: '4px' }}>{fmtDate(upcoming.data_od)} &ndash; {fmtDate(upcoming.data_do)}</p>
            <p style={{ fontFamily: I, fontSize: '13px', fontWeight: 600, marginBottom: '32px' }}>{upcoming.miejsce || 'Galeria ESTA, Gliwice'}</p>
            {upcoming.opis_krotki && <p style={{ fontFamily: I, fontSize: '13px', color: '#555', lineHeight: 1.8, marginBottom: '40px' }}>{upcoming.opis_krotki}</p>}
            <a href={`/wystawa/${upcoming.url_wystawy}`} className="arrow-link">&rarr; Wiecej o wystawie</a>
          </div>
        </section>
      )}

      {/* POZOSTALE WYSTAWY – siatka 2 kolumny */}
      <section style={{ padding: '80px 40px', borderTop: '1px solid #ebebeb' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '56px' }}>
          <h2 style={{ fontFamily: C, fontSize: '28px', fontWeight: 400 }}>Wystawy</h2>
          <a href="/wystawy" className="arrow-link">Wszystkie wystawy</a>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '64px 48px' }}>
          {pozostaleWystawy.map((w, i) => (
            <a key={i} href={`/wystawa/${w.url_wystawy}`} className="card-hover" style={{ display: 'block' }}>
              <div style={{ overflow: 'hidden', marginBottom: '24px' }}>
                <img src={w.img_plakat || ''} alt={w.tytul || ''} className="card-img" style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover', display: 'block' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '8px', alignItems: 'start', marginBottom: '8px' }}>
                <div>
                  <p style={{ fontFamily: C, fontSize: '22px', fontWeight: 400, marginBottom: '2px', lineHeight: 1.2 }}>{w.artysci_txt}</p>
                  <p style={{ fontFamily: C, fontSize: '17px', fontWeight: 300, fontStyle: 'italic', color: '#666', lineHeight: 1.3 }}>{w.tytul}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontFamily: I, fontSize: '11px', color: '#999', whiteSpace: 'nowrap', lineHeight: 1.8 }}>
                    {w.data_od ? new Date(w.data_od).toLocaleDateString('pl-PL', { day: 'numeric', month: 'long' }) : ''}<br />
                    {w.data_do ? new Date(w.data_do).toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' }) : ''}
                  </p>
                </div>
              </div>
              {w.opis_krotki && <p style={{ fontFamily: I, fontSize: '13px', color: '#555', lineHeight: 1.8, marginBottom: '16px' }}>{w.opis_krotki}</p>}
              <span className="arrow-link">&rarr; Wiecej</span>
            </a>
          ))}
        </div>
      </section>

      {/* AKTUALNE TARGI – tekst lewo, zdjecie prawo */}
      <section style={{ display: 'grid', gridTemplateColumns: '2fr 3fr', minHeight: '70vh', borderTop: '1px solid #ebebeb', background: '#faf9f7' }}>
        <div style={{ padding: '72px 48px', display: 'flex', flexDirection: 'column', justifyContent: 'center', borderRight: '1px solid #ebebeb' }}>
          <p style={{ fontFamily: I, fontSize: '10px', fontWeight: 600, letterSpacing: '.2em', textTransform: 'uppercase', marginBottom: '36px' }}>Ostatnie targi</p>
          <h2 style={{ fontFamily: C, fontSize: 'clamp(24px,2.5vw,40px)', fontWeight: 400, lineHeight: 1.05, marginBottom: '8px' }}>{aktualneTargi?.nazwa || ''}</h2>
          <p style={{ fontFamily: I, fontSize: '13px', marginBottom: '4px', marginTop: '24px' }}>{fmtDate(aktualneTargi?.data_od || null)} &ndash; {fmtDate(aktualneTargi?.data_do || null)}</p>
          {aktualneTargi?.artysci_txt && <p style={{ fontFamily: I, fontSize: '13px', color: '#555', lineHeight: 1.8, marginBottom: '40px', marginTop: '8px' }}>{aktualneTargi.artysci_txt}</p>}
          <a href={`/targ/${aktualneTargi?.url_targu || ''}`} className="arrow-link">&rarr; Wiecej o targach</a>
        </div>
        <div style={{ overflow: 'hidden' }}>
          {aktualneTargi?.img_cover
            ? <img src={aktualneTargi.img_cover} alt={aktualneTargi.nazwa || ''} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            : <div style={{ width: '100%', height: '100%', background: '#e8e4de' }} />
          }
        </div>
      </section>

      {/* POZOSTALE TARGI – siatka 2 kolumny */}
      <section style={{ padding: '80px 40px', borderTop: '1px solid #ebebeb', background: '#faf9f7' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '56px' }}>
          <h2 style={{ fontFamily: C, fontSize: '28px', fontWeight: 400 }}>Targi</h2>
          <a href="/targi" className="arrow-link">Wszystkie targi</a>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '64px 48px' }}>
          {pozostaleTargi.map((t, i) => (
            <a key={i} href={`/targ/${t.url_targu}`} className="card-hover" style={{ display: 'block' }}>
              <div style={{ overflow: 'hidden', marginBottom: '24px', background: '#e8e8e8' }}>
                {t.img_cover
                  ? <img src={t.img_cover} alt={t.nazwa || ''} className="card-img" style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover', display: 'block' }} />
                  : <div style={{ aspectRatio: '4/3', background: '#e0ddd8' }} />
                }
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '8px', alignItems: 'start', marginBottom: '8px' }}>
                <p style={{ fontFamily: C, fontSize: '22px', fontWeight: 400, lineHeight: 1.2 }}>{t.nazwa}</p>
                <p style={{ fontFamily: I, fontSize: '11px', color: '#999', whiteSpace: 'nowrap', lineHeight: 1.8, textAlign: 'right' }}>
                  {t.data_od ? new Date(t.data_od).toLocaleDateString('pl-PL', { day: 'numeric', month: 'long' }) : ''}<br />
                  {t.data_do ? new Date(t.data_do).toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' }) : ''}
                </p>
              </div>
              {t.artysci_txt && <p style={{ fontFamily: I, fontSize: '13px', color: '#555', lineHeight: 1.8, marginBottom: '16px' }}>{t.artysci_txt}</p>}
              <span className="arrow-link">&rarr; Wiecej</span>
            </a>
          ))}
        </div>
      </section>

      {/* ARTYSCI */}
      <section style={{ padding: '80px 40px', borderTop: '1px solid #ebebeb', display: 'grid', gridTemplateColumns: '200px 1fr', gap: '80px', alignItems: 'start' }}>
        <div>
          <h2 style={{ fontFamily: C, fontSize: '28px', fontWeight: 400, marginBottom: '24px' }}>Artysci</h2>
          <a href="/artysci" className="arrow-link">Wszyscy artysci</a>
        </div>
        <div style={{ columns: '3', columnGap: '40px' }}>
          {(artysci || []).map(a => (
            <a key={a.url_artysty || a.nazwisko_i_imie} href={`/${a.url_artysty || '#'}`} className="artist-link">
              {a.nazwisko_i_imie}
            </a>
          ))}
        </div>
      </section>

      {/* VIEWING ROOM */}
      <section style={{ padding: '96px 40px', borderTop: '1px solid #ebebeb', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '96px', alignItems: 'center' }}>
        <div>
          <p style={{ fontFamily: I, fontSize: '10px', letterSpacing: '.2em', textTransform: 'uppercase', color: '#999', marginBottom: '24px' }}>Oferty indywidualne</p>
          <h2 style={{ fontFamily: C, fontSize: 'clamp(36px,4vw,56px)', fontWeight: 400, lineHeight: 1.05, marginBottom: '28px' }}>Viewing Room</h2>
          <p style={{ fontFamily: I, fontSize: '13px', color: '#555', lineHeight: 1.9, marginBottom: '40px', maxWidth: '380px' }}>
            Prywatne pokazy wyselekcjonowanych prac dla kolekcjonerow. Kazda oferta tworzona indywidualnie.
          </p>
          <a href="#" className="arrow-link">&rarr; Zapytaj o oferte</a>
        </div>
        <div style={{ background: '#f0ece5', aspectRatio: '4/3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ fontFamily: C, fontSize: '13px', fontStyle: 'italic', color: '#aaa' }}>Viewing Room — wkrotce</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: '#111', padding: '64px 40px', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '48px' }}>
        <div>
          <p style={{ fontFamily: C, fontSize: '18px', fontWeight: 400, color: '#fff', letterSpacing: '.1em', marginBottom: '20px' }}>Galeria ESTA</p>
          <p style={{ fontFamily: I, fontSize: '12px', lineHeight: 2, color: '#555' }}>ul. Raciborska 8, Gliwice<br />Od 1998 roku<br />galeria@galeria-esta.pl</p>
        </div>
        <div>
          <p style={{ fontFamily: I, fontSize: '10px', letterSpacing: '.18em', textTransform: 'uppercase', color: '#333', marginBottom: '16px' }}>Menu</p>
          {['Artysci', 'Wystawy', 'Targi', 'Oferta', 'Viewing Room', 'O nas'].map(item => (
            <a key={item} href="#" style={{ display: 'block', fontFamily: I, fontSize: '12px', color: '#555', lineHeight: 2.2 }}>{item}</a>
          ))}
        </div>
        <div>
          <p style={{ fontFamily: I, fontSize: '10px', letterSpacing: '.18em', textTransform: 'uppercase', color: '#333', marginBottom: '16px' }}>Godziny</p>
          <p style={{ fontFamily: I, fontSize: '12px', lineHeight: 2, color: '#555' }}>Wt — Pt: 11:00 — 18:00<br />Sob: 11:00 — 15:00<br />Nd — Pn: zamkniete</p>
        </div>
        <div>
          <p style={{ fontFamily: I, fontSize: '10px', letterSpacing: '.18em', textTransform: 'uppercase', color: '#333', marginBottom: '16px' }}>Social</p>
          <p style={{ fontFamily: I, fontSize: '12px', lineHeight: 2.2, color: '#555' }}>Instagram<br />Facebook</p>
        </div>
      </footer>
    </main>
  )
}
