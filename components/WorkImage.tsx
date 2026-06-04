'use client'

import { useState } from 'react'

type WorkImageProps = {
  src: string | null
  alt: string
  idPracy?: string
}

const C = '"Cormorant Garamond", Georgia, serif'

export default function WorkImage({ src, alt }: WorkImageProps) {
  const [error, setError] = useState(false)

  return (
    <div
      style={{
        width: '100%',
        aspectRatio: '4 / 4.85',
        backgroundColor: '#fbfaf8',
        border: '1px solid #f0ebe2',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      {!src || error ? (
        <span
          style={{
            fontFamily: C,
            fontSize: '32px',
            color: '#cfc6ba',
            letterSpacing: '0.1em',
          }}
        >
          ESTA
        </span>
      ) : (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          onError={() => setError(true)}
          style={{
            maxWidth: '100%',
            maxHeight: '100%',
            width: 'auto',
            height: 'auto',
            objectFit: 'contain',
          }}
        />
      )}
    </div>
  )
}
