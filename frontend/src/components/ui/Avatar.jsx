import { useState } from 'react'
import { User } from 'lucide-react'

const sizes = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-14 h-14 text-lg',
  xl: 'w-20 h-20 text-2xl',
}

export default function Avatar({ src, username, size = 'md', className = '' }) {
  const [imgError, setImgError] = useState(false)

  if (src && !imgError) {
    return (
      <img
        src={src}
        alt={username || 'avatar'}
        onError={() => setImgError(true)}
        className={`${sizes[size]} rounded-full object-cover border border-border ${className}`}
      />
    )
  }

  return (
    <div
      className={`
        ${sizes[size]} rounded-full bg-bg-hover border border-border
        flex items-center justify-center text-text-muted font-semibold
        ${className}
      `}
    >
      {username ? username[0].toUpperCase() : <User size={16} />}
    </div>
  )
}