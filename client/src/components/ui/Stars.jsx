import { useState } from 'react'

export default function Stars({ value = 0, onChange, size = 20, readonly = false }) {
  const [hovered, setHovered] = useState(0)
  const display = hovered || value

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <span
          key={star}
          style={{ fontSize: size, cursor: readonly ? 'default' : 'pointer', color: star <= display ? '#fbbf24' : '#1a2a3a' }}
          onMouseEnter={() => !readonly && setHovered(star)}
          onMouseLeave={() => !readonly && setHovered(0)}
          onClick={() => !readonly && onChange?.(star)}
        >★</span>
      ))}
    </div>
  )
}
