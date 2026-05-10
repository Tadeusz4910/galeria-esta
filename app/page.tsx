import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Galeria ESTA | Sztuka Współczesna | Gliwice",
  description:
    "Galeria Sztuki Współczesnej ESTA w Gliwicach. 28 lat prezentacji najważniejszych zjawisk sztuki współczesnej w Polsce. Konceptualizm, sztuka konkretna, młode pokolenie.",
  keywords:
    "galeria sztuki, sztuka współczesna, Gliwice, konceptualizm, sztuka konkretna, ESTA",
};

export default function Home() {
  return (
    <main className="min-h-screen bg-[#faf9f7]">
      {/* NAWIGACJA */}
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          padding: "0 48px",
          height: "64px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "rgba(250,249,247,0.92)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid #e8e2d9",
        }}
      >
        <div
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "22px",
            fontWeight: 400,
            letterSpacing: "0.08em",
            color: "#11110f",
          }}
        >
          ESTA
        </div>
        <div
          style={{
            display: "flex",
            gap: "40px",
            fontFamily: "'Instrument Sans', sans-serif",
            fontSize: "11px",
            fontWeight: 400,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "#746f68",
          }}
        >
          {["Artyści", "Kolekcja", "Wystawy", "O Galerii", "Kontakt"].map(
            (item) => (
              <a
                key={item}
                href="#"
                style={{
                  color: "#746f68",
                  textDecoration: "none",
                  transition: "color 0.2s",
                }}
                onMouseEnter={(e) =>
                  ((e.target as HTMLElement).style.color = "#11110f")
                }
                onMouseLeave={(e) =>
                  ((e.target as HTMLElement).style.color = "#746f68")
                }
              >
                {item}
              </a>
            )
          )}
        </div>
        <div
          style={{
            fontFamily: "'Instrument Sans', sans-serif",
            fontSize: "10px",
            fontWeight: 400,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "#746f68",
          }}
        >
          PL · EN
        </div>
      </nav>

      {/* HERO */}
      <section
        style={{
          paddingTop: "64px",
          minHeight: "100vh",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
        }}
      >
        {/* Lewa kolumna – tekst */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "80px 64px 80px 48px",
            borderRight: "1px solid #e8e2d9",
          }}
        >
          <p
            style={{
              fontFamily: "'Instrument Sans', sans-serif",
              fontSize: "10px",
              fontWeight: 400,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "#9a948b",
              marginBottom: "32px",
            }}
          >
            Gliwice · Od 1997 roku
          </p>
          <h1
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "clamp(52px, 6vw, 88px)",
              fontWeight: 400,
              lineHeight: 1.0,
              color: "#11110f",
              marginBottom: "40px",
              letterSpacing: "-0.01em",
            }}
          >
            Galeria
            <br />
            Sztuki
            <br />
            <em
              style={{
                fontStyle: "italic",
                color: "#746f68",
              }}
            >
              Współczesnej
            </em>
          </h1>
          <p
            style={{
              fontFamily: "'Instrument Sans', sans-serif",
              fontSize: "14px",
              fontWeight: 300,
              lineHeight: 1.8,
              color: "#746f68",
              maxWidth: "420px",
              marginBottom: "56px",
            }}
          >
            28 lat prezentacji najważniejszych zjawisk sztuki współczesnej.
            Konceptualizm, sztuka konkretna i młode pokolenie twórców jako
            fundament programu.
          </p>
          <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
            <a
              href="#"
              style={{
                display: "inline-block",
                padding: "14px 36px",
                background: "#11110f",
                color: "#faf9f7",
                fontFamily: "'Instrument Sans', sans-serif",
                fontSize: "10px",
                fontWeight: 400,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                textDecoration: "none",
                transition: "background 0.2s",
              }}
            >
              Kolekcja
            </a>
            <a
              href="#"
              style={{
                display: "inline-block",
                padding: "14px 36px",
                border: "1px solid #cfc4b8",
                color: "#746f68",
                fontFamily: "'Instrument Sans', sans-serif",
                fontSize: "10px",
                fontWeight: 400,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                textDecoration: "none",
              }}
            >
              Artyści
            </a>
          </div>
        </div>

        {/* Prawa kolumna – obraz placeholder */}
        <div
          style={{
            background: "#f0ece5",
            position: "relative",
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "calc(100vh - 64px)",
          }}
        >
          <div
            style={{
              textAlign: "center",
            }}
          >
            <p
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "13px",
                fontStyle: "italic",
                color: "#9a948b",
                letterSpacing: "0.08em",
              }}
            >
              Aktualna wystawa
            </p>
          </div>
          {/* Dekoracyjna linia */}
          <div
            style={{
              position: "absolute",
              bottom: "48px",
              right: "48px",
              width: "80px",
              height: "1px",
              background: "#cfc4b8",
            }}
          />
        </div>
      </section>

      {/* STATYSTYKI */}
      <section
        style={{
          borderTop: "1px solid #e8e2d9",
          borderBottom: "1px solid #e8e2d9",
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
        }}
      >
        {[
          { number: "28", label: "Lat działalności" },
          { number: "200+", label: "Artystów" },
          { number: "500+", label: "Wystaw" },
          { number: "1997", label: "Rok założenia" },
        ].map((stat, i) => (
          <div
            key={i}
            style={{
              padding: "48px 40px",
              borderRight: i < 3 ? "1px solid #e8e2d9" : "none",
              textAlign: "center",
            }}
          >
            <p
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "48px",
                fontWeight: 400,
                color: "#11110f",
                lineHeight: 1,
                marginBottom: "8px",
              }}
            >
              {stat.number}
            </p>
            <p
              style={{
                fontFamily: "'Instrument Sans', sans-serif",
                fontSize: "10px",
                fontWeight: 400,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "#9a948b",
              }}
            >
              {stat.label}
            </p>
          </div>
        ))}
      </section>

      {/* AKTUALNE WYSTAWY */}
      <section style={{ padding: "96px 48px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            marginBottom: "64px",
          }}
        >
          <h2
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "36px",
              fontWeight: 400,
              color: "#11110f",
            }}
          >
            Aktualne wystawy
          </h2>
          <a
            href="#"
            style={{
              fontFamily: "'Instrument Sans', sans-serif",
              fontSize: "10px",
              fontWeight: 400,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "#746f68",
              textDecoration: "none",
            }}
          >
            Wszystkie wystawy →
          </a>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "1px",
            background: "#e8e2d9",
          }}
        >
          {[
            {
              artist: "Jan Kowalski",
              title: "Geometrie Ciszy",
              dates: "15.04 — 30.05.2026",
            },
            {
              artist: "Maria Nowak",
              title: "Przestrzenie Graniczne",
              dates: "20.04 — 15.06.2026",
            },
            {
              artist: "Piotr Wiśniewski",
              title: "Materia i Forma",
              dates: "01.05 — 20.06.2026",
            },
          ].map((exhibition, i) => (
            <div
              key={i}
              style={{
                background: "#faf9f7",
                padding: "40px",
                cursor: "pointer",
              }}
            >
              <div
                style={{
                  background: "#f0ece5",
                  height: "240px",
                  marginBottom: "28px",
                }}
              />
              <p
                style={{
                  fontFamily: "'Instrument Sans', sans-serif",
                  fontSize: "10px",
                  fontWeight: 400,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: "#9a948b",
                  marginBottom: "8px",
                }}
              >
                {exhibition.dates}
              </p>
              <p
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: "22px",
                  fontWeight: 400,
                  color: "#11110f",
                  marginBottom: "4px",
                }}
              >
                {exhibition.artist}
              </p>
              <p
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: "18px",
                  fontStyle: "italic",
                  color: "#746f68",
                }}
              >
                {exhibition.title}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer
        style={{
          borderTop: "1px solid #e8e2d9",
          padding: "48px",
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: "40px",
        }}
      >
        <div>
          <p
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "24px",
              fontWeight: 400,
              color: "#11110f",
              marginBottom: "16px",
            }}
          >
            ESTA
          </p>
          <p
            style={{
              fontFamily: "'Instrument Sans', sans-serif",
              fontSize: "12px",
              fontWeight: 300,
              lineHeight: 1.8,
              color: "#746f68",
            }}
          >
            Galeria Sztuki Współczesnej
            <br />
            Gliwice, Polska
            <br />
            Od 1997 roku
          </p>
        </div>
        <div>
          <p
            style={{
              fontFamily: "'Instrument Sans', sans-serif",
              fontSize: "10px",
              fontWeight: 400,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "#9a948b",
              marginBottom: "16px",
            }}
          >
            Godziny otwarcia
          </p>
          <p
            style={{
              fontFamily: "'Instrument Sans', sans-serif",
              fontSize: "12px",
              fontWeight: 300,
              lineHeight: 1.8,
              color: "#746f68",
            }}
          >
            Wtorek — Piątek: 11:00 — 18:00
            <br />
            Sobota: 11:00 — 15:00
            <br />
            Niedziela — Poniedziałek: zamknięte
          </p>
        </div>
        <div>
          <p
            style={{
              fontFamily: "'Instrument Sans', sans-serif",
              fontSize: "10px",
              fontWeight: 400,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "#9a948b",
              marginBottom: "16px",
            }}
          >
            Kontakt
          </p>
          <p
            style={{
              fontFamily: "'Instrument Sans', sans-serif",
              fontSize: "12px",
              fontWeight: 300,
              lineHeight: 1.8,
              color: "#746f68",
            }}
          >
            galeria@galeria-esta.pl
            <br />
            Instagram · Facebook
          </p>
        </div>
      </footer>
    </main>
  );
}
