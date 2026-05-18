// components/Nav.tsx
// Wspolny komponent nawigacji – uzyj we wszystkich page.tsx
// Importuj: import Nav from '@/components/Nav'
// Uzyj: <Nav active="artysci" />

const menuItems = [
  { label: 'Artysci', href: '/artysci', key: 'artysci' },
  { label: 'Wystawy', href: '/wystawy', key: 'wystawy' },
  { label: 'Targi', href: '/targi', key: 'targi' },
  { label: 'Idee', href: '/idee', key: 'idee' },
  { label: 'Kolekcja', href: '/kolekcja', key: 'kolekcja' },
  { label: 'Kompendium', href: '/kompendium', key: 'kompendium' },
  { label: 'Viewing Room', href: '/viewing-room', key: 'viewing-room' },
  { label: 'O nas', href: '/o-nas', key: 'o-nas' },
]

export default function Nav({ active }: { active?: string }) {
  const C = '"Cormorant Garamond", Georgia, serif'
  const I = '"Instrument Sans", sans-serif'

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      padding: '0 40px', height: '54px', display: 'flex',
      alignItems: 'center', justifyContent: 'space-between',
      background: 'rgba(255,255,255,.96)', borderBottom: '1px solid #ebebeb'
    }}>
      <a href="/" style={{
        fontFamily: C, fontSize: '16px', fontWeight: 400,
        letterSpacing: '.2em', textTransform: 'uppercase',
        textDecoration: 'none', color: '#111'
      }}>
        Galeria ESTA
      </a>

      <div style={{ display: 'flex', gap: '24px' }}>
        {menuItems.map(item => (
          <a
            key={item.key}
            href={item.href}
            style={{
              fontFamily: I, fontSize: '11px', letterSpacing: '.12em',
              textTransform: 'uppercase', textDecoration: 'none',
              color: '#111',
              opacity: active === item.key ? 1 : 0.45,
              transition: 'opacity .2s',
            }}
          >
            {item.label}
          </a>
        ))}
      </div>

      <a href="#" style={{
        fontFamily: I, fontSize: '10px', letterSpacing: '.16em',
        textTransform: 'uppercase', textDecoration: 'none',
        color: '#111', opacity: 0.45
      }}>
        PL / EN
      </a>
    </nav>
  )
}
