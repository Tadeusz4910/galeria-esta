'use client'

import { useState } from 'react'

interface WorkGalleryProps {
  idPracy: string
  altText: string
}

const C = '"Cormorant Garamond", Georgia, serif'

export default function WorkGallery({ idPracy, altText }: WorkGalleryProps) {
  // urls[0] = główne (BAU-1971-0015.jpg), urls[1..19] = _2.jpg..._20.jpg
  const urls: string[] = []
  urls.push(`https://galeria-esta.pl/viewing-room/images/prace/${idPracy}.jpg`)
  for (let i = 2; i <= 20; i++) {
    urls.push(`https://galeria-esta.pl/viewing-room/images/prace/${idPracy}_${i}.jpg`)
  }

  const [activeIdx, setActiveIdx] = useState(0)
  const [errors, setErrors] = useState<Set<number>>(new Set())

  const markError = (idx: number) => {
    setErrors((prev) => {
      if (prev.has(idx)) return prev
      const next = new Set(prev)
      next.add(idx)
      return next
    })
  }

  const allFailed = errors.size >= urls.length

  // Lista miniatur do pokazania (te które się załadowały)
  const validThumbs = urls
    .map((u, i) => ({ url: u, idx: i }))
    .filter((t) => !errors.has(t.idx))

  return (
    <div>
      {/* Główne zdjęcie */}
      <div
        style={{
          width: '100%',
          maxHeight: '78vh',
          minHeight: '320px',
          backgroundColor: '#fbfaf8',
          border: '1px solid #f0ebe2',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          marginBottom: '24px',
        }}
      >
        {allFailed || errors.has(activeIdx) ? (
          <span
            style={{
              fontFamily: C,
              fontSize: '48px',
              color: '#cfc6ba',
              letterSpacing: '0.1em',
            }}
          >
            ESTA
          </span>
        ) : (
          <img
            key={urls[activeIdx]}
            src={urls[activeIdx]}
            alt={altText}
            loading="eager"
            onError={() => markError(activeIdx)}
            style={{
              maxWidth: '100%',
              maxHeight: '78vh',
              width: 'auto',
              height: 'auto',
              objectFit: 'contain',
              display: 'block',
            }}
          />
        )}
      </div>

      {/* Miniatury — tylko gdy mamy więcej niż 1 zdjęcie i nie wszystkie padły */}
      {!allFailed && validThumbs.length > 1 && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(72px, 1fr))',
            gap: '10px',
          }}
        >
          {validThumbs.map(({ url, idx }) => (
            <button
              key={idx}
              type="button"
              onClick={() => setActiveIdx(idx)}
              style={{
                border:
                  idx === activeIdx
                    ? '2px solid #11110f'
                    : '1px solid #e7e0d7',
                padding: 0,
                background: '#fbfaf8',
                cursor: 'pointer',
                aspectRatio: '1',
                overflow: 'hidden',
              }}
              aria-label={`Zdjęcie ${idx + 1}`}
            >
              <img
                src={url}
                alt={`${altText} — ${idx + 1}`}
                loading="lazy"
                onError={() => markError(idx)}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                }}
              />
            </button>
          ))}
        </div>
      )}

    </div>
  )
}
