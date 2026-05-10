import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Galeria ESTA | Sztuka Wspolczesna | Gliwice",
  description: "Galeria Sztuki Wspolczesnej ESTA w Gliwicach. Od 1998 roku.",
};

const exhibitions = [
  {
    artist: "Lukasz Dziedzic / Tom Swoboda",
    title: "It's Hard to Dance with a Devil on Your Back",
    dates: "19.09 - 28.09.2025",
    img: "https://galeria-esta.pl/pliki/wystawy/plakat/185/ESTA_WGW2025_SM_FB_COVER_FP_1640x720.jpg",
  },
  {
    artist: "Marlena Szewczyk",
    title: "Wiezi / Bonds",
    dates: "02.06 - 26.06.2025",
    img: "https://galeria-esta.pl/pliki/wystawy/plakat/184/szewczyk.png",
  },
  {
    artist: "Marek Sobczyk",
    title: "Obraz - Slowo - Wers",
    dates: "07.04 - 06.05.2025",
    img: "https://galeria-esta.pl/pliki/wystawy/plakat/183/ESTA_Sobczyk_SM_www_2040X900.png",
  },
];

const fairs = [
  {
    name: "Art Collect 2026",
    artists: "Lukasz Dziedzic / Tom Swoboda / Agata Zychlinska",
    dates: "27.02 - 01.03.2026",
    img: "https://galeria-esta.pl/pliki/targi/banner/UNTAMED_AC_PROMO_FB COVER.jpg",
  },
  {
    name: "Hotel Warszawa Art Fair 2025",
    artists: "Wanda Golkowska / Zbigniew Gostomski / Grupa Twozywo",
    dates: "05.09 - 07.09.2025",
    img: "https://galeria-esta.pl/pliki/targi/banner/40/2-01.jpg",
  },
  {
    name: "Hotel Warszawa 2024",
    artists: "",
    dates: "07.09 - 08.09.2024",
    img: "https://galeria-esta.pl/pliki/targi/banner/39/HWAF24 cover2.png",
  },
];

const articles = [
  {
    title: "Art Collect | L. Dziedzic / T. Swoboda",
    date: "27.02.2026",
    author: "Jacek Stapowicz",
    excerpt: "Zapraszamy na Targi Sztuki Art Collect - wystawa Nieoswojone.",
  },
  {
    title: "Art Collect 2026 | Agata Zychlinska",
    date: "17.02.2026",
    author: "Jacek Stapowicz",
    excerpt: "Agata Zychlinska na targach Art Collect 2026.",
  },
  {
    title: "Marek Sobczyk | projekt performerski",
    date: "17.05.2025",
    author: "Jacek Stapowicz",
    excerpt: "O projekcie performerskim towarzyszacym wystawie w Galerii ESTA.",
  },
  {
    title: "NIEON I-XLI | Andrzej Dluzniewski o cyklu",
    date: "16.02.2024",
    author: "Tadeusz Stapowicz",
    excerpt: "Andrzej Dluzniewski opowiada o cyklu NIEON.",
  },
];

const artists = [
  "Natalia Bazowska","Gerhard Jurgen Blum-Kwiatkowski","Natalia Brandt",
  "Jan Chwalczyk","Andrzej Dluzniewski","Kajetan Dluzniewski",
  "Jan Dobkowski","Stanislaw Drozdz","Lukasz Dziedzic",
  "Stefan Gierowski","Wanda Golkowska","Zbigniew Gostomski",
  "Istvan Haasz","Jaroslaw Kozlowski","Wojciech Kucharczyk",
  "Alfred Lenica","Jerzy Lewczynski","Tadeusz Lapinski",
  "Andrzej Matuszewski","Jaroslaw Modzelewski","Vera Molnar",
  "Jan Pamula","Andrzej Paruzel","Wlodzimierz Pawlak",
  "Rafal Pytel","Wieslaw Rosocha","Marek Sobczyk",
  "Tom Swoboda","Jan Tarasin","Grupa Twozywo",
  "Andrzej Urbanowicz","Mieczyslaw Wisniewski","Agata Zychlinska",
];

const navItems = ["Artysci","Wystawy","Targi","Publikacje","Artykuly","Filmy","Oferta","Viewing Room","O nas"];
const footerMenu = ["Artysci","Wystawy","Targi","Oferta","Viewing Room","O nas"];

export default function Home() {
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
        .tl{color:#111;text-decoration:none;}
        .tl:hover{text-decoration:underline;text-underline-offset:3px;}
        .lbl{font-family:sans-serif;font-size:10px;letter-spacing:.2em;text-transform:uppercase;color:#999;}
      `}</style>

      <main>
        {/* NAV */}
        <nav style={{position:"fixed",top:0,left:0,right:0,zIndex:100,padding:"0 40px",height:"54px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <a href="/" style={{fontFamily:"Georgia,serif",fontSize:"15px",letterSpacing:".16em",color:"#fff",textDecoration:"none"}}>GALERIA ESTA</a>
          <div style={{display:"flex",gap:"24px"}}>
            {navItems.map(item => <a key={item} href="#" className="nw">{item}</a>)}
          </div>
          <a href="#" className="nw" style={{fontSize:"10px"}}>PL / EN</a>
        </nav>

        {/* HERO */}
        <section style={{position:"relative",height:"100vh",overflow:"hidden"}}>
          <img src={exhibitions[0].img} alt="Aktualna wystawa" style={{width:"100%",height:"100%",objectFit:"cover",display:"block"}} />
          <div style={{position:"absolute",inset:0,background:"linear-gradient(to top,rgba(0,0,0,.75) 0%,rgba(0,0,0,.1) 50%,transparent 100%)"}} />
          <div style={{position:"absolute",bottom:0,left:0,right:0,padding:"48px 40px",display:"flex",justifyContent:"space-between",alignItems:"flex-end"}}>
            <div>
              <p className="lbl" style={{color:"rgba(255,255,255,.55)",marginBottom:"12px"}}>Aktualna wystawa &middot; {exhibitions[0].dates}</p>
              <h1 style={{fontSize:"clamp(24px,3.5vw,46px)",fontWeight:400,color:"#fff",lineHeight:1.25,maxWidth:"600px"}}>
                {exhibitions[0].artist}<br />
                <em style={{opacity:.8,fontSize:".88em"}}>{exhibitions[0].title}</em>
              </h1>
            </div>
            <a href="#" style={{display:"inline-block",padding:"11px 26px",border:"1px solid rgba(255,255,255,.45)",color:"#fff",fontFamily:"sans-serif",fontSize:"10px",letterSpacing:".18em",textTransform:"uppercase",textDecoration:"none",whiteSpace:"nowrap"}}>
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
            {exhibitions.map((ex,i) => (
              <div key={i} className="ch" style={{cursor:"pointer"}}>
                <div style={{overflow:"hidden",marginBottom:"14px"}}>
                  <img src={ex.img} alt={ex.title} style={{width:"100%",height:"260px",objectFit:"cover",display:"block"}} />
                </div>
                <p className="lbl" style={{marginBottom:"6px"}}>{ex.dates}</p>
                <p style={{fontSize:"16px",color:"#111",marginBottom:"3px"}}>{ex.artist}</p>
                <p style={{fontSize:"14px",fontStyle:"italic",color:"#666"}}>{ex.title}</p>
              </div>
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
            {fairs.map((f,i) => (
              <div key={i} className="ch" style={{cursor:"pointer"}}>
                <div style={{overflow:"hidden",marginBottom:"14px"}}>
                  <img src={f.img} alt={f.name} style={{width:"100%",height:"220px",objectFit:"cover",display:"block"}} />
                </div>
                <p className="lbl" style={{marginBottom:"6px"}}>{f.dates}</p>
                <p style={{fontSize:"16px",color:"#111",marginBottom:"3px"}}>{f.name}</p>
                {f.artists && <p style={{fontSize:"13px",color:"#888",fontStyle:"italic"}}>{f.artists}</p>}
              </div>
            ))}
          </div>
        </section>

        <hr style={{border:"none",borderTop:"1px solid #e5e5e5",margin:"0 40px"}} />

        {/* ARTYKULY */}
        <section style={{padding:"72px 40px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:"36px"}}>
            <h2 style={{fontSize:"22px",fontWeight:400,color:"#111"}}>Artykuly</h2>
            <a href="/artykuly" className="nb">Wszystkie artykuly &rarr;</a>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0"}}>
            {articles.map((a,i) => (
              <div key={i} style={{padding:"32px 0",borderBottom:"1px solid #e5e5e5",borderRight:i%2===0?"1px solid #e5e5e5":"none",paddingLeft:i%2===1?"40px":"0",paddingRight:i%2===0?"40px":"0"}}>
                <p className="lbl" style={{marginBottom:"10px"}}>{a.date} &middot; {a.author}</p>
                <h3 style={{fontSize:"18px",fontWeight:400,color:"#111",marginBottom:"10px",lineHeight:1.35}}>
                  <a href="#" className="tl">{a.title}</a>
                </h3>
                <p style={{fontFamily:"sans-serif",fontSize:"13px",color:"#888",lineHeight:1.7}}>{a.excerpt}</p>
              </div>
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
            {artists.map(name => <a key={name} href="#" className="al">{name}</a>)}
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
              Gliwice, Polska &middot; Od 1998 roku<br />
              galeria@galeria-esta.pl
            </p>
          </div>
          <div>
            <p className="lbl" style={{color:"#444",marginBottom:"16px"}}>Menu</p>
            {footerMenu.map(item => (
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
  );
}
