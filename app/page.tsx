import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Galeria ESTA | Sztuka Współczesna | Gliwice",
  description: "Galeria Sztuki Współczesnej ESTA w Gliwicach. Od 1998 roku prezentujemy najważniejsze zjawiska sztuki współczesnej w Polsce. Konceptualizm, sztuka konkretna, młode pokolenie.",
};

export default function Home() {
  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .nav-link { color: #746f68; text-decoration: none; font-size: 11px; letter-spacing: 0.16em; text-transform: uppercase; transition: color 0.2s; }
        .nav-link:hover { color: #11110f; }
        .btn-dark { display: inline-block; padding: 12px 32px; background: #11110f; color: #faf9f7; font-size: 10px; letter-spacing: 0.2em; text-transform: uppercase; text-decoration: none; }
        .btn-light { display: inline-block; padding: 12px 32px; border: 1px solid #cfc4b8; color: #746f68; font-size: 10px; letter-spacing: 0.2em; text-transform: uppercase; text-decoration: none; }
        .card:hover { background: #f5f1ea !important; }
        .artist-link { color: #11110f; text-decoration: none; font-size: 13px; line-height: 2; border-bottom: 1px solid transparent; transition: border-color 0.2s; }
        .artist-link:hover { border-bottom-color: #cfc4b8; }
      `}</style>

      <main style={{ minHeight: "100vh", background: "#faf9f7", fontFamily: "Georgia, serif" }}>

        {/* NAWIGACJA */}
        <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, background: "rgba(250,249,247,0.95)", borderBottom: "1px solid #e8e2d9" }}>
          <div style={{ padding: "0 48px", height: "60px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <a href="/" style={{ fontFamily: "Georgia, serif", fontSize: "18px", fontWeight: 400, letterSpacing: "0.12em", color: "#11110f", textDecoration: "none" }}>
              GALERIA ESTA
            </a>
            <div style={{ display: "flex", gap: "32px", alignItems: "center" }}>
              {[
                { label: "Artyści", href: "/artysci" },
                { label: "Wystawy", href: "/wystawy" },
                { label: "Targi", href: "/targi" },
                { label: "Publikacje", href: "/publikacje" },
                { label: "Artykuły", href: "/artykuly" },
                { label: "Filmy", href: "/filmy" },
                { label: "Oferta", href: "/oferta" },
                { label: "O nas", href: "/o-nas" },
              ].map((item) => (
                <a key={item.label} href={item.href} className="nav-link">{item.label}</a>
              ))}
            </div>
            <a href="#" className="nav-link" style={{ fontSize: "10px" }}>PL · EN</a>
          </div>
        </nav>

        {/* HERO */}
        <section style={{ paddingTop: "60px", display: "grid", gridTemplateColumns: "1fr 1fr", minHeight: "90vh" }}>
          <div style={{ padding: "80px 64px 80px 48px", display: "flex", flexDirection: "column", justifyContent: "center", borderRight: "1px solid #e8e2d9" }}>
            <p style={{ fontFamily: "sans-serif", fontSize: "10px", letterSpacing: "0.22em", textTransform: "uppercase", color: "#9a948b", marginBottom: "24px" }}>
              Gliwice · Od 1998 roku
            </p>
            <h1 style={{ fontFamily: "Georgia, serif", fontSize: "clamp(36px, 4vw, 58px)", fontWeight: 400, lineHeight: 1.15, color: "#11110f", marginBottom: "32px" }}>
              Galeria Sztuki<br />
              <em style={{ color: "#746f68" }}>Współczesnej</em>
            </h1>
            <p style={{ fontFamily: "sans-serif", fontSize: "13px", lineHeight: 1.9, color: "#746f68", maxWidth: "400px", marginBottom: "48px" }}>
              Konceptualizm, sztuka konkretna i młode pokolenie twórców — program budowany konsekwentnie od 1998 roku.
            </p>
            <div style={{ display: "flex", gap: "16px" }}>
              <a href="/oferta" className="btn-dark">Oferta</a>
              <a href="/artysci" className="btn-light">Artyści</a>
            </div>
          </div>
          <div style={{ background: "#f0ece5", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", position: "relative", minHeight: "500px" }}>
            <p style={{ fontFamily: "Georgia, serif", fontSize: "12px", fontStyle: "italic", color: "#9a948b", letterSpacing: "0.06em" }}>Aktualna wystawa</p>
            <div style={{ position: "absolute", bottom: "40px", left: "48px", right: "48px", borderTop: "1px solid #cfc4b8", paddingTop: "16px" }}>
              <p style={{ fontFamily: "sans-serif", fontSize: "10px", letterSpacing: "0.16em", textTransform: "uppercase", color: "#9a948b" }}>19.09 — 28.09.2025</p>
              <p style={{ fontFamily: "Georgia, serif", fontSize: "16px", color: "#11110f", marginTop: "4px" }}>Łukasz Dziedzic · Tom Swoboda</p>
            </div>
          </div>
        </section>

        {/* WYSTAWY */}
        <section style={{ padding: "80px 48px", borderTop: "1px solid #e8e2d9" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "48px" }}>
            <h2 style={{ fontFamily: "Georgia, serif", fontSize: "28px", fontWeight: 400, color: "#11110f" }}>Wystawy</h2>
            <a href="/wystawy" className="nav-link">Archiwum wystaw →</a>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1px", background: "#e8e2d9" }}>
            {[
              { artist: "Łukasz Dziedzic · Tom Swoboda", title: "It's Hard to Dance with a Devil on Your Back", dates: "19.09 — 28.09.2025", img: "https://galeria-esta.pl/pliki/wystawy/plakat/185/ESTA_WGW2025_SM_FB_COVER_FP_1640x720.jpg" },
              { artist: "Marlena Szewczyk", title: "Więzi / Bonds", dates: "02.06 — 26.06.2025", img: "https://galeria-esta.pl/pliki/wystawy/plakat/184/szewczyk.png" },
              { artist: "Marek Sobczyk", title: "Obraz – Słowo – Wers", dates: "07.04 — 06.05.2025", img: "https://galeria-esta.pl/pliki/wystawy/plakat/183/ESTA_Sobczyk_SM_www_2040X900.png" },
            ].map((ex, i) => (
              <div key={i} className="card" style={{ background: "#faf9f7", cursor: "pointer" }}>
                <img src={ex.img} alt={ex.title} style={{ width: "100%", height: "220px", objectFit: "cover", display: "block" }} />
                <div style={{ padding: "28px 32px" }}>
                  <p style={{ fontFamily: "sans-serif", fontSize: "10px", letterSpacing: "0.16em", textTransform: "uppercase", color: "#9a948b", marginBottom: "8px" }}>{ex.dates}</p>
                  <p style={{ fontFamily: "Georgia, serif", fontSize: "17px", color: "#11110f", marginBottom: "4px" }}>{ex.artist}</p>
                  <p style={{ fontFamily: "Georgia, serif", fontSize: "14px", fontStyle: "italic", color: "#746f68" }}>{ex.title}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ARTYŚCI */}
        <section style={{ padding: "80px 48px", borderTop: "1px solid #e8e2d9", background: "#f5f2ed" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "48px" }}>
            <h2 style={{ fontFamily: "Georgia, serif", fontSize: "28px", fontWeight: 400, color: "#11110f" }}>Artyści</h2>
            <a href="/artysci" className="nav-link">Wszyscy artyści →</a>
          </div>
          <div style={{ columns: "4", columnGap: "40px" }}>
            {[
              "Natalia Bażowska", "Gerhard Jürgen Blum-Kwiatkowski", "Natalia Brandt",
              "Jan Chwałczyk", "Andrzej Dłużniewski", "Kajetan Dłużniewski",
              "Jan Dobkowski", "Stanisław Dróżdż", "Łukasz Dziedzic",
              "Stefan Gierowski", "Wanda Gołkowska", "Zbigniew Gostomski",
              "István Haász", "Jarosław Kozłowski", "Wojciech Kucharczyk",
              "Alfred Lenica", "Jerzy Lewczyński", "Tadeusz Łapiński",
              "Andrzej Matuszewski", "Jarosław Modzelewski", "Vera Molnár",
              "Jan Pamuła", "Andrzej Paruzel", "Włodzimierz Pawlak",
              "Rafał Pytel", "Wiesław Rosocha", "Marek Sobczyk",
              "Tom Swoboda", "Jan Tarasin", "Grupa Twożywo",
              "Andrzej Urbanowicz", "Mieczysław Wiśniewski", "Agata Żychlińska",
            ].map((name) => (
              <div key={name} style={{ breakInside: "avoid" }}>
                <a href="#" className="artist-link">{name}</a>
              </div>
            ))}
          </div>
        </section>

        {/* STATYSTYKI */}
        <section style={{ borderTop: "1px solid #e8e2d9", display: "grid", gridTemplateColumns: "repeat(4, 1fr)" }}>
          {[
            { number: "27", label: "Lat działalności" },
            { number: "33", label: "Artystów" },
            { number: "180+", label: "Wystaw" },
            { number: "1998", label: "Rok założenia" },
          ].map((stat, i) => (
            <div key={i} style={{ padding: "48px 40px", textAlign: "center", borderRight: i < 3 ? "1px solid #e8e2d9" : "none" }}>
              <p style={{ fontFamily: "Georgia, serif", fontSize: "44px", fontWeight: 400, color: "#11110f", lineHeight: 1, marginBottom: "8px" }}>{stat.number}</p>
              <p style={{ fontFamily: "sans-serif", fontSize: "10px", letterSpacing: "0.18em", textTransform: "uppercase", color: "#9a948b" }}>{stat.label}</p>
            </div>
          ))}
        </section>

        {/* FOOTER */}
        <footer style={{ borderTop: "1px solid #e8e2d9", padding: "48px", display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: "48px", background: "#11110f" }}>
          <div>
            <p style={{ fontFamily: "Georgia, serif", fontSize: "20px", color: "#faf9f7", marginBottom: "16px" }}>Galeria ESTA</p>
            <p style={{ fontFamily: "sans-serif", fontSize: "12px", lineHeight: 1.9, color: "#9a948b" }}>
              Galeria Sztuki Współczesnej<br />
              Gliwice, Polska<br />
              galeria@galeria-esta.pl
            </p>
          </div>
          <div>
            <p style={{ fontFamily: "sans-serif", fontSize: "10px", letterSpacing: "0.18em", textTransform: "uppercase", color: "#746f68", marginBottom: "16px" }}>Godziny otwarcia</p>
            <p style={{ fontFamily: "sans-serif", fontSize: "12px", lineHeight: 1.9, color: "#9a948b" }}>
              Wt — Pt: 11:00 — 18:00<br />
              Sob: 11:00 — 15:00<br />
              Nd — Pn: zamknięte
            </p>
          </div>
          <div>
            <p style={{ fontFamily: "sans-serif", fontSize: "10px", letterSpacing: "0.18em", textTransform: "uppercase", color: "#746f68", marginBottom: "16px" }}>Social media</p>
            <p style={{ fontFamily: "sans-serif", fontSize: "12px", lineHeight: 1.9, color: "#9a948b" }}>
              Instagram<br />Facebook
            </p>
          </div>
        </footer>

      </main>
    </>
  );
}
