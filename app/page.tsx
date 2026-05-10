import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Galeria ESTA | Sztuka Współczesna | Gliwice",
  description: "Galeria Sztuki Współczesnej ESTA w Gliwicach. Od 1998 roku prezentujemy najważniejsze zjawiska sztuki współczesnej w Polsce.",
};

export default function Home() {
  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #fff; }
        .nav-link-white { color: #fff; text-decoration: none; font-size: 11px; letter-spacing: 0.13em; text-transform: uppercase; opacity: 0.75; transition: opacity 0.2s; }
        .nav-link-white:hover { opacity: 1; }
        .nav-link { color: #111; text-decoration: none; font-size: 11px; letter-spacing: 0.13em; text-transform: uppercase; opacity: 0.5; transition: opacity 0.2s; }
        .nav-link:hover { opacity: 1; }
        .card-hover:hover img { transform: scale(1.04); }
        .card-hover img { transition: transform 0.6s ease; }
        .text-link { color: #111; text-decoration: none; }
        .text-link:hover { text-decoration: underline; text-underline-offset: 3px; }
        .artist-item { color: #111; text-decoration: none; font-size: 13px; line-height: 2.3; display: block; letter-spacing: 0.01em; }
        .artist-item:hover { opacity: 0.5; }
        .section-label { font-family: sans-serif; font-size: 10px; letter-spacing: 0.2em; text-transform: uppercase; color: #999; }
        .divider { border: none; border-top: 1px solid #e5e5e5; }
      `}</style>

      <main style={{ minHeight: "100vh", background: "#fff", fontFamily: "Georgia, serif" }}>

        {/* NAWIGACJA */}
        <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, padding: "0 40px", height: "54px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <a href="/" style={{ fontFamily: "Georgia, serif", fontSize: "15px", letterSpacing: "0.16em", color: "#fff", textDecoration: "none" }}>
            GALERIA ESTA
          </a>
          <div style={{ display: "flex", gap: "26px" }}>
            {["Artyści","Wystawy","Targi","Publikacje","Artykuły","Filmy","Oferta","Viewing Room","O nas"].map(item => (
              <a key={item} href="#" className="nav-link-white">{item}</a>
            ))}
          </div>
          <a href="#" className="nav-link-white" style={{ fontSize: "10px" }}>PL · EN</a>
        </nav>

        {/* HERO – pełnoekranowe */}
        <section style={{ position: "relative", height: "100vh", overflow: "hidden" }}>
          <img
            src="https://galeria-esta.pl/pliki/wystawy/plakat/185/ESTA_WGW2025_SM_FB_COVER_FP_1640x720.jpg"
            alt="Aktualna wystawa"
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.15) 45%, transparent 100%)" }} />
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "48px 40px", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <div>
              <p className="section-label" style={{ color: "rgba(255,255,255,0.55)", marginBottom: "12px" }}>Aktualna wystawa · 19.09 — 28.09.2025</p>
              <h1 style={{ fontFamily: "Georgia, serif", fontSize: "clamp(26px, 3.5vw, 48px)", fontWeight: 400, color: "#fff", lineHeight: 1.25, maxWidth: "620px" }}>
                Łukasz Dziedzic · Tom Swoboda<br />
                <em style={{ opacity: 0.8, fontSize: "0.9em" }}>It&apos;s Hard to Dance with a Devil on Your Back</em>
              </h1>
            </div>
            <a href="#" style={{ display: "inline-block", padding: "11px 26px", border: "1px solid rgba(255,255,255,0.5)", color: "#fff", fontFamily: "sans-serif", fontSize: "10px", letterSpacing: "0.18em", textTransform: "uppercase", textDecoration: "none", whiteSpace: "nowrap" }}>
              Zobacz wystawę
            </a>
          </div>
        </section>

        {/* WYSTAWY */}
        <section style={{ padding: "72px 40px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "36px" }}>
            <h2 style={{ fontSize: "22px", fontWeight: 400, color: "#111" }}>Wystawy</h2>
            <a href="/wystawy" className="nav-link">Archiwum wystaw →</a>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "28px" }}>
            {[
              { artist: "Łukasz Dziedzic · Tom Swoboda", title: "It's Hard to Dance with a Devil on Your Back", dates: "19.09 — 28.09.2025", img: "https://galeria-esta.pl/pliki/wystawy/plakat/185/ESTA_WGW2025_SM_FB_COVER_FP_1640x720.jpg" },
              { artist: "Marlena Szewczyk", title: "Więzi / Bonds", dates: "02.06 — 26.06.2025", img: "https://galeria-esta.pl/pliki/wystawy/plakat/184/szewczyk.png" },
              { artist: "Marek Sobczyk", title: "Obraz – Słowo – Wers [Polityka kulturalna]", dates: "07.04 — 06.05.2025", img: "https://galeria-esta.pl/pliki/wystawy/plakat/183/ESTA_Sobczyk_SM_www_2040X900.png" },
            ].map((ex, i) => (
              <div key={i} className="card-hover" style={{ cursor: "pointer" }}>
                <div style={{ overflow: "hidden", marginBottom: "14px" }}>
                  <img src={ex.img} alt={ex.title} style={{ width: "100%", height: "260px", objectFit: "cover", display: "block" }} />
                </div>
                <p className="section-label" style={{ marginBottom: "6px" }}>{ex.dates}</p>
                <p style={{ fontSize: "16px", color: "#111", marginBottom: "3px" }}>{ex.artist}</p>
                <p style={{ fontSize: "14px", fontStyle: "italic", color: "#666" }}>{ex.title}</p>
              </div>
            ))}
          </div>
        </section>

        <hr className="divider" style={{ margin: "0 40px" }} />

        {/* TARGI */}
        <section style={{ padding: "72px 40px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "36px" }}>
            <h2 style={{ fontSize: "22px", fontWeight: 400, color: "#111" }}>Targi</h2>
            <a href="/targi" className="nav-link">Wszystkie targi →</a>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "28px" }}>
            {[
              { name: "Art Collect 2026", artists: "Łukasz Dziedzic · Tom Swoboda · Agata Żychlińska", dates: "27.02 — 01.03.2026", img: "https://galeria-esta.pl/pliki/targi/banner//UNTAMED_AC_PROMO_FB COVER.jpg" },
              { name: "Hotel Warszawa Art Fair 2025", artists: "Wanda Gołkowska · Zbigniew Gostomski · Grupa Twożywo", dates: "05.09 — 07.09.2025", img: "https://galeria-esta.pl/pliki/targi/banner/40/2-01.jpg" },
              { name: "Hotel Warszawa 2024", artists: "", dates: "07.09 — 08.09.2024", img: "https://galeria-esta.pl/pliki/targi/banner/39/HWAF24 cover2.png" },
            ].map((t, i) => (
              <div key={i} className="card-hover" style={{ cursor: "pointer" }}>
                <div style={{ overflow: "hidden", marginBottom: "14px" }}>
                  <img src={t.img} alt={t.name} style={{ width: "100%", height: "220px", objectFit: "cover", display: "block" }} />
                </div>
                <p className="section-label" style={{ marginBottom: "6px" }}>{t.dates}</p>
                <p style={{ fontSize: "16px", color: "#111", marginBottom: "3px" }}>{t.name}</p>
                {t.artists && <p style={{ fontSize: "13px", color: "#888", fontStyle: "italic" }}>{t.artists}</p>}
              </div>
            ))}
          </div>
        </section>

        <hr className="divider" style={{ margin: "0 40px" }} />

        {/* ARTYKUŁY */}
        <section style={{ padding: "72px 40px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "36px" }}>
            <h2 style={{ fontSize: "22px", fontWeight: 400, color: "#111" }}>Artykuły</h2>
            <a href="/artykuly" className="nav-link">Wszystkie artykuły →</a>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0" }}>
            {[
              { title: "Art Collect | Ł. Dziedzic · T. Swoboda", date: "27.02.2026", author: "Jacek Stapowicz", excerpt: "Serdecznie zapraszamy na Targi Sztuki Art Collect, gdzie zaprezentujemy wystawę „Nieoswojone"." },
              { title: "Art Collect 2026 | Agata Żychlińska", date: "17.02.2026", author: "Jacek Stapowicz", excerpt: "Agata Żychlińska na targach Art Collect 2026 – prezentacja prac i rozmowa z artystką." },
              { title: "Marek Sobczyk | projekt performerski", date: "17.05.2025", author: "Jacek Stapowicz", excerpt: "O projekcie performerskim towarzyszącym wystawie w Galerii ESTA." },
              { title: "NIEON I–XLI · Andrzej Dłużniewski o cyklu", date: "16.02.2024", author: "Tadeusz Stapowicz", excerpt: "Andrzej Dłużniewski opowiada o cyklu NIEON – prace powstające od lat 70." },
            ].map((a, i) => (
              <div key={i} style={{ padding: "32px 0", borderBottom: "1px solid #e5e5e5", borderRight: i % 2 === 0 ? "1px solid #e5e5e5" : "none", paddingLeft: i % 2 === 1 ? "40px" : "0", paddingRight: i % 2 === 0 ? "40px" : "0" }}>
                <p className="section-label" style={{ marginBottom: "10px" }}>{a.date} · {a.author}</p>
                <h3 style={{ fontSize: "18px", fontWeight: 400, color: "#111", marginBottom: "10px", lineHeight: 1.35 }}>
                  <a href="#" className="text-link">{a.title}</a>
                </h3>
                <p style={{ fontFamily: "sans-serif", fontSize: "13px", color: "#888", lineHeight: 1.7 }}>{a.excerpt}</p>
              </div>
            ))}
          </div>
        </section>

        <hr className="divider" style={{ margin: "0 40px" }} />

        {/* ARTYŚCI */}
        <section style={{ padding: "72px 40px", background: "#faf9f7" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "40px" }}>
            <h2 style={{ fontSize: "22px", fontWeight: 400, color: "#111" }}>Artyści</h2>
            <a href="/artysci" className="nav-link">Wszyscy artyści →</a>
          </div>
          <div style={{ columns: "4", columnGap: "32px" }}>
            {[
              "Natalia Bażowska","Gerhard Jürgen Blum-Kwiatkowski","Natalia Brandt",
              "Jan Chwałczyk","Andrzej Dłużniewski","Kajetan Dłużniewski",
              "Jan Dobkowski","Stanisław Dróżdż","Łukasz Dziedzic",
              "Stefan Gierowski","Wanda Gołkowska","Zbigniew Gostomski",
              "István Haász","Jarosław Kozłowski","Wojciech Kucharczyk",
              "Alfred Lenica","Jerzy Lewczyński","Tadeusz Łapiński",
              "Andrzej Matuszewski","Jarosław Modzelewski","Vera Molnár",
              "Jan Pamuła","Andrzej Paruzel","Włodzimierz Pawlak",
              "Rafał Pytel","Wiesław Rosocha","Marek Sobczyk",
              "Tom Swoboda","Jan Tarasin","Grupa Twożywo",
              "Andrzej Urbanowicz","Mieczysław Wiśniewski","Agata Żychlińska",
            ].map(name => (
              <a key={name} href="#" className="artist-item">{name}</a>
            ))}
          </div>
        </section>

        {/* VIEWING ROOM – zapowiedź */}
        <section style={{ padding: "72px 40px", background: "#111", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "80px", alignItems: "center" }}>
          <div>
            <p className="section-label" style={{ color: "#555", marginBottom: "20px" }}>Nowa usługa</p>
            <h2 style={{ fontSize: "clamp(28px, 3vw, 44px)", fontWeight: 400, color: "#fff", lineHeight: 1.2, marginBottom: "24px" }}>
              Viewing Room —<br />
              <em style={{ color: "#888" }}>oferty indywidualne</em>
            </h2>
            <p style={{ fontFamily: "sans-serif", fontSize: "13px", color: "#888", lineHeight: 1.9, marginBottom: "36px", maxWidth: "420px" }}>
              Prywatne pokazy wyselekcjonowanych prac dla kolekcjonerów. Każda oferta tworzona indywidualnie — dostosowana do gustu, historii i budżetu kolekcjonera.
            </p>
            <a href="#" style={{ display: "inline-block", padding: "12px 28px", border: "1px solid #444", color: "#fff", fontFamily: "sans-serif", fontSize: "10px", letterSpacing: "0.18em", textTransform: "uppercase", textDecoration: "none" }}>
              Zapytaj o ofertę
            </a>
          </div>
          <div style={{ background: "#1a1a1a", height: "380px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <p style={{ fontFamily: "Georgia, serif", fontSize: "13px", fontStyle: "italic", color: "#444" }}>Viewing Room · wkrótce</p>
          </div>
        </section>

        {/* FOOTER */}
        <footer style={{ background: "#0a0a0a", padding: "56px 40px", display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: "40px" }}>
          <div>
            <p style={{ fontFamily: "Georgia, serif", fontSize: "17px", color: "#fff", marginBottom: "16px" }}>Galeria ESTA</p>
            <p style={{ fontFamily: "sans-serif", fontSize: "12px", lineHeight: 2, color: "#666" }}>
              Galeria Sztuki Współczesnej<br />
              Gliwice, Polska · Od 1998 roku<br />
              galeria@galeria-esta.pl
            </p>
          </div>
          <div>
            <p className="section-label" style={{ color: "#444", marginBottom: "16px" }}>Menu</p>
            {["Artyści","Wystawy","Targi","Oferta","Viewing Room","O nas"].map(item => (
              <a key={item} href="#" style={{ display: "block", fontFamily: "sans-serif", fontSize: "12px", color: "#666", textDecoration: "none", lineHeight: 2.2 }}>{item}</a>
            ))}
          </div>
          <div>
            <p className="section-label" style={{ color: "#444", marginBottom: "16px" }}>Godziny</p>
            <p style={{ fontFamily: "sans-serif", fontSize: "12px", lineHeight: 2, color: "#666" }}>
              Wt — Pt: 11:00 — 18:00<br />
              Sob: 11:00 — 15:00<br />
              Nd — Pn: zamknięte
            </p>
          </div>
          <div>
            <p className="section-label" style={{ color: "#444", marginBottom: "16px" }}>Social</p>
            <p style={{ fontFamily: "sans-serif", fontSize: "12px", lineHeight: 2.2, color: "#666" }}>
              Instagram<br />Facebook
            </p>
          </div>
        </footer>

      </main>
    </>
  );
}
