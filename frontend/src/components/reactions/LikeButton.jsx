import { Heart } from 'lucide-react'
import { useState, useEffect } from 'react'
import { reactionsAPI } from '../../api/reactions.api'

export default function LikeButton({ targetType, targetId, initialCount = 0, initialLiked = false, onToggle }) {
  const [liked, setLiked] = useState(initialLiked)
  const [count, setCount] = useState(initialCount)

  // Sync with parent when props change (e.g. re-fetch)
  useEffect(() => { setLiked(initialLiked) }, [initialLiked])
  useEffect(() => { setCount(initialCount) }, [initialCount])
  const [animating, setAnimating] = useState(false)

  const handleToggle = async () => {
    // Optimistic update
    const wasLiked = liked
    setLiked(!wasLiked)
    setCount((c) => (wasLiked ? c - 1 : c + 1))

    if (!wasLiked) {
      setAnimating(true)
      setTimeout(() => setAnimating(false), 300)
    }

    try {
      const { data } = await reactionsAPI.toggleLike(targetType, targetId)
      setLiked(data.liked)
      onToggle?.(data.liked)
    } catch {
      // Revert on error
      setLiked(wasLiked)
      setCount((c) => (wasLiked ? c + 1 : c - 1))
    }
  }

  return (
    <button
      onClick={(e) => {
        e.stopPropagation()
        handleToggle()
      }}
      className="flex items-center gap-1.5 group cursor-pointer"
    >
      <div className="p-2 rounded-full group-hover:bg-like/10 transition-colors">
        <Heart
          size={18}
          className={`transition-all duration-200
            ${liked ? 'fill-like text-like' : 'text-text-muted group-hover:text-like'}
            ${animating ? 'scale-125' : 'scale-100'}
          `}
        />
      </div>
      <span className={`text-sm ${liked ? 'text-like' : 'text-text-muted group-hover:text-like'}`}>
        {count > 0 ? count : ''}
      </span>
    </button>
  )
}
