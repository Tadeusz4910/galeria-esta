import Link from 'next/link'
import { artistSlug } from '@/lib/slug'

export interface PracaDetail {
  id: string
  id_pracy: string | null
  tytul: string
  rok: number | string | null
  rok_opis: string | null
  technika: string | null
  wymiary_pracy: string | null
  sygnatura: string | null
  wariant_edycja: string | null
  cena_oferowana: number | null
  opis_pracy: string | null
  proweniencja: string | null
  wystawy_historia: string | null
  literatura: string | null
  widocznosc: string | null

  artysta_id: string | null
  artysta_nazwa: string | null
  artysta_url: string | null

  idea: { id: string; nazwa: string } | null
  segmenty: { id: string; nazwa: string }[]
  style: { id: string; nazwa: string }[]
  dziedziny: { id: string; nazwa: string }[]
  pojecia: { id: string; nazwa: string }[]
}

interface SidebarProps {
  praca: PracaDetail
  showPrice?: boolean
}

const C = '"Cormorant Garamond", Georgia, serif'
const I = '"Instrument Sans", -apple-system, BlinkMacSystemFont, sans-serif'

const sectionHeader: React.CSSProperties = {
  fontFamily: I,
  fontSize: '11px',
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  color: '#777',
  borderTop: '1px solid #e7e0d7',
  paddingTop: '24px',
  marginTop: '32px',
  marginBottom: '14px',
}

const sectionBody: React.CSSProperties = {
  fontFamily: I,
  fontSize: '14px',
  lineHeight: 1.6,
  color: '#333',
  whiteSpace: 'pre-line',
}

const tropyStyle: React.CSSProperties = {
  fontFamily: I,
  fontSize: '11px',
  letterSpacing: '0.04em',
  lineHeight: 1.6,
  color: '#888',
}

const segmentStyle: React.CSSProperties = {
  fontFamily: I,
  fontSize: '13px',
  lineHeight: 1.5,
  color: '#555',
}

function formatPrice(value: number): string {
  return value.toLocaleString('pl-PL', { maximumFractionDigits: 0 }) + ' PLN'
}

function getArtistHref(praca: PracaDetail): string | null {
  if (praca.artysta_url) return `/artysta/${praca.artysta_url}`
  if (praca.artysta_nazwa) {
    const s = artistSlug(praca.artysta_nazwa)
    return s ? `/artysta/${s}` : null
  }
  return null
}

export default function WorkDetailSidebar({
  praca,
  showPrice = true,
}: SidebarProps) {
  const artistHref = getArtistHref(praca)
  const rokDisplay = praca.rok

  const subject = `Zapytanie o pracę: ${praca.tytul}${rokDisplay ? `, ${rokDisplay}` : ''}`
  const body = `Dzień dobry,\n\nJestem zainteresowany/a pracą:\n${praca.artysta_nazwa ?? ''} — ${praca.tytul}${rokDisplay ? `, ${rokDisplay}` : ''}${praca.id_pracy ? ` (${praca.id_pracy})` : ''}.\n\nProszę o kontakt.\n`
  const mailto = `mailto:galeria@galeria-esta.pl?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`

  const hasTropy =
    praca.pojecia.length > 0 ||
    praca.segmenty.length > 0 ||
    praca.dziedziny.length > 0 ||
    praca.style.length > 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Nazwa artysty */}
      {praca.artysta_nazwa && (
        <div style={{ marginBottom: '14px' }}>
          {artistHref ? (
            <Link
              href={artistHref}
              style={{
                fontFamily: I,
                fontSize: '11px',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: '#555',
                textDecoration: 'none',
              }}
            >
              {praca.artysta_nazwa}
            </Link>
          ) : (
            <span
              style={{
                fontFamily: I,
                fontSize: '11px',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: '#888',
              }}
            >
              {praca.artysta_nazwa}
            </span>
          )}
        </div>
      )}

      {/* Tytuł + rok */}
      <h1
        style={{
          fontFamily: C,
          fontStyle: 'italic',
          fontSize: 'clamp(26px, 2.4vw, 32px)',
          fontWeight: 400,
          lineHeight: 1.2,
          color: '#11110f',
          margin: 0,
          marginBottom: '24px',
        }}
      >
        {praca.tytul}
        {rokDisplay ? `, ${rokDisplay}` : ''}
      </h1>

      {/* Dane techniczne */}
      <dl
        style={{
          fontFamily: I,
          fontSize: '14px',
          lineHeight: 1.6,
          color: '#444',
          margin: 0,
          marginBottom: '8px',
        }}
      >
        {praca.technika && (
          <div style={{ marginBottom: '4px' }}>{praca.technika}</div>
        )}
        {praca.wymiary_pracy && (
          <div style={{ marginBottom: '4px' }}>{praca.wymiary_pracy}</div>
        )}
        {praca.sygnatura && (
          <div style={{ marginBottom: '4px' }}>
            Sygnatura: {praca.sygnatura}
          </div>
        )}
        {praca.wariant_edycja && (
          <div style={{ marginBottom: '4px' }}>
            Edycja: {praca.wariant_edycja}
          </div>
        )}
      </dl>

      {/* Cena (D23: widoczna) */}
      {showPrice &&
        typeof praca.cena_oferowana === 'number' &&
        praca.cena_oferowana > 0 && (
          <div
            style={{
              fontFamily: I,
              fontSize: '15px',
              fontWeight: 500,
              color: '#11110f',
              marginTop: '24px',
            }}
          >
            {formatPrice(praca.cena_oferowana)}
          </div>
        )}

      {/* CTA: mailto */}
      <a
        href={mailto}
        style={{
          fontFamily: I,
          fontSize: '12px',
          color: '#11110f',
          textDecoration: 'none',
          borderBottom: '1px solid #11110f',
          paddingBottom: '2px',
          marginTop: '28px',
          alignSelf: 'flex-start',
        }}
      >
        Zapytaj o pracę →
      </a>

      {/* Tropy: pojęcia → segment → dziedziny → style — bez nagłówków, bez prefiksów */}
      {hasTropy && (
        <div
          style={{
            marginTop: '40px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
          }}
        >
          {praca.pojecia.length > 0 && (
            <div className="ws-tropy" style={tropyStyle}>
              {praca.pojecia.map((p, i) => (
                <span key={p.id}>
                  <Link
                    href={`/kolekcja?tag=${encodeURIComponent(p.nazwa.toLowerCase())}`}
                  >
                    {p.nazwa}
                  </Link>
                  {i < praca.pojecia.length - 1 && (
                    <span className="sep" aria-hidden="true">·</span>
                  )}
                </span>
              ))}
            </div>
          )}

          {praca.segmenty.length > 0 && (
            <div style={segmentStyle}>
              {praca.segmenty.map((s) => s.nazwa).join(', ')}
            </div>
          )}

          {praca.dziedziny.length > 0 && (
            <div className="ws-tropy" style={tropyStyle}>
              {praca.dziedziny.map((d, i) => (
                <span key={d.id}>
                  <Link
                    href={`/kolekcja?tag=${encodeURIComponent(d.nazwa.toLowerCase())}`}
                  >
                    {d.nazwa}
                  </Link>
                  {i < praca.dziedziny.length - 1 && (
                    <span className="sep" aria-hidden="true">·</span>
                  )}
                </span>
              ))}
            </div>
          )}

          {praca.style.length > 0 && (
            <div className="ws-tropy" style={tropyStyle}>
              {praca.style.map((s, i) => (
                <span key={s.id}>
                  <Link
                    href={`/kolekcja?tag=${encodeURIComponent(s.nazwa.toLowerCase())}`}
                  >
                    {s.nazwa}
                  </Link>
                  {i < praca.style.length - 1 && (
                    <span className="sep" aria-hidden="true">·</span>
                  )}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* PROWENIENCJA */}
      {praca.proweniencja && (
        <>
          <div style={sectionHeader}>Proweniencja</div>
          <div style={sectionBody}>{praca.proweniencja}</div>
        </>
      )}

      {/* WYSTAWY */}
      {praca.wystawy_historia && (
        <>
          <div style={sectionHeader}>Wystawy</div>
          <div style={sectionBody}>{praca.wystawy_historia}</div>
        </>
      )}

      {/* BIBLIOGRAFIA */}
      {praca.literatura && (
        <>
          <div style={sectionHeader}>Bibliografia</div>
          <div style={sectionBody}>{praca.literatura}</div>
        </>
      )}

      <style>{`
        .ws-tropy a {
          color: #888;
          text-decoration: none;
          border-bottom: 1px solid transparent;
          transition: color .15s, border-color .15s;
        }
        .ws-tropy a:hover {
          color: #11110f;
          border-bottom-color: #11110f;
        }
        .ws-tropy .sep {
          color: #ccc;
          margin: 0 6px;
        }
      `}</style>
    </div>
  )
}
