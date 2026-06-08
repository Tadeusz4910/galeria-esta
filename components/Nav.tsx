'use client'

// components/Nav.tsx
// Wspolny komponent nawigacji – uzyj we WSZYSTKICH page.tsx
// Importuj: import Nav from '@/components/Nav'
// Uzyj: <Nav active="artysci" />
// Mobile first: na telefonie chowa sie pod ikona hamburgera (pelnoekranowe menu).

import { useState } from 'react'

const menuItems = [
  { label: 'Artyści', href: '/artysci', key: 'artysci' },
  { label: 'Wystawy', href: '/wystawy', key: 'wystawy' },
  { label: 'Targi', href: '/targi', key: 'targi' },
  { label: 'Kolekcja', href: '/kolekcja', key: 'kolekcja' },
  { label: 'Zasoby', href: '/zasoby', key: 'zasoby' },
  { label: 'Viewing Room', href: '/viewing-room', key: 'viewing-room' },
  { label: 'Kompendium', href: '/kompendium', key: 'kompendium' },
  { label: 'Blog', href: '/blog', key: 'blog' },
  { label: 'O nas', href: '/o-nas', key: 'o-nas' },
  { label: 'Kontakt', href: '/kontakt', key: 'kontakt' },
]

export default function Nav({ active }: { active?: string }) {
  const [open, setOpen] = useState(false)
  const C = '"Cormorant Garamond", Georgia, serif'
  const I = '"Instrument Sans", sans-serif'

  return (
    <nav className="esta-nav" style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      height: '54px', display: 'flex',
      alignItems: 'center', justifyContent: 'space-between',
      background: 'rgba(255,255,255,.96)', borderBottom: '1px solid #ebebeb',
    }}>
      <a href="/" className="esta-nav-logo" style={{
        fontFamily: C, fontSize: '16px', fontWeight: 400,
        letterSpacing: '.2em', textTransform: 'uppercase',
        textDecoration: 'none', color: '#111', zIndex: 102,
      }}>
        Galeria ESTA
      </a>

      {/* Menu desktop */}
      <div className="esta-nav-desktop">
        {menuItems.map(item => (
          <a
            key={item.key}
            href={item.href}
            className="esta-nav-link"
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
        <a href="#" className="esta-nav-link" style={{
          fontFamily: I, fontSize: '10px', letterSpacing: '.16em',
          textTransform: 'uppercase', textDecoration: 'none',
          color: '#111', opacity: 0.45,
        }}>
          PL / EN
        </a>
      </div>

      {/* Hamburger mobile */}
      <button
        type="button"
        aria-label={open ? 'Zamknij menu' : 'Otwórz menu'}
        aria-expanded={open}
        onClick={() => setOpen(v => !v)}
        className="esta-nav-burger"
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          width: '32px', height: '32px', padding: 0, zIndex: 102,
          display: 'none', flexDirection: 'column', justifyContent: 'center',
          gap: '6px', alignItems: 'flex-end',
        }}
      >
        <span style={{
          display: 'block', width: open ? '24px' : '24px', height: '1.5px',
          background: '#111', transition: 'transform .25s, opacity .25s',
          transform: open ? 'translateY(7.5px) rotate(45deg)' : 'none',
        }} />
        <span style={{
          display: 'block', width: '24px', height: '1.5px', background: '#111',
          transition: 'opacity .2s', opacity: open ? 0 : 1,
        }} />
        <span style={{
          display: 'block', width: open ? '24px' : '16px', height: '1.5px',
          background: '#111', transition: 'transform .25s, width .25s',
          transform: open ? 'translateY(-7.5px) rotate(-45deg)' : 'none',
        }} />
      </button>

      {/* Pelnoekranowe menu mobile */}
      <div
        className="esta-nav-mobile"
        style={{
          position: 'fixed', inset: 0, background: '#fff', zIndex: 101,
          display: 'none', flexDirection: 'column',
          justifyContent: 'center', alignItems: 'flex-start',
          padding: '54px 32px 32px', gap: '4px',
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
          transform: open ? 'translateY(0)' : 'translateY(-8px)',
          transition: 'opacity .25s, transform .25s',
        }}
      >
        {menuItems.map(item => (
          <a
            key={item.key}
            href={item.href}
            onClick={() => setOpen(false)}
            style={{
              fontFamily: C, fontSize: '30px', fontWeight: 400,
              letterSpacing: '.02em', textDecoration: 'none',
              color: active === item.key ? '#111' : '#444',
              padding: '10px 0',
            }}
          >
            {item.label}
          </a>
        ))}
        <a href="#" onClick={() => setOpen(false)} style={{
          marginTop: '24px', fontFamily: I, fontSize: '12px',
          letterSpacing: '.18em', textTransform: 'uppercase',
          textDecoration: 'none', color: '#111', opacity: 0.5,
        }}>
          PL / EN
        </a>
      </div>

      <style>{`
        .esta-nav { padding: 0 40px; }
        .esta-nav-desktop {
          display: flex;
          align-items: center;
          gap: 18px;
          flex-wrap: wrap;
          justify-content: flex-end;
        }
        .esta-nav-link:hover { opacity: 1 !important; }
        @media (max-width: 960px) {
          .esta-nav { padding: 0 20px; }
          .esta-nav-desktop { display: none; }
          .esta-nav-burger { display: flex !important; }
          .esta-nav-mobile { display: flex !important; }
        }
      `}</style>
    </nav>
  )
}
