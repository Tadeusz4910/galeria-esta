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

  if (!src || error) {
    return (
      <div
        style={{
          aspectRatio: '4/3',
          backgroundColor: '#f4f1ec',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid #e7e0d7',
        }}
      >
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
      </div>
    )
  }

  return (
    <div
      style={{
        aspectRatio: '4/3',
        backgroundColor: '#fbfaf8',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
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
          display: 'block',
        }}
      />
    </div>
  )
}
