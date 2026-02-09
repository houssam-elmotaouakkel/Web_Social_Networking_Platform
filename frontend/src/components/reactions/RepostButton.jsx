import { Repeat2 } from 'lucide-react'
import { useState, useEffect } from 'react'
import { repostsAPI } from '../../api/reposts.api'

export default function RepostButton({ threadId, initialReposted = false, initialCount = 0, onToggle }) {
  const [reposted, setReposted] = useState(initialReposted)
  const [count, setCount] = useState(initialCount)

  useEffect(() => { setReposted(initialReposted) }, [initialReposted])
  useEffect(() => { setCount(initialCount) }, [initialCount])
  const [animating, setAnimating] = useState(false)

  const handleToggle = async () => {
    const wasReposted = reposted
    setReposted(!wasReposted)
    setCount((c) => (wasReposted ? c - 1 : c + 1))

    if (!wasReposted) {
      setAnimating(true)
      setTimeout(() => setAnimating(false), 300)
    }

    try {
      if (wasReposted) {
        await repostsAPI.unrepost(threadId)
      } else {
        await repostsAPI.repost(threadId)
      }
      onToggle?.(!wasReposted)
    } catch {
      setReposted(wasReposted)
      setCount((c) => (wasReposted ? c + 1 : c - 1))
    }
  }

  return (
    <button
      onClick={(e) => {
        e.stopPropagation()
        handleToggle()
      }}
      className="flex items-center gap-1.5 group cursor-pointer"
      title={reposted ? 'Undo repost' : 'Repost'}
    >
      <div className="p-2 rounded-full group-hover:bg-success/10 transition-colors">
        <Repeat2
          size={18}
          className={`transition-all duration-200
            ${reposted ? 'text-success' : 'text-text-muted group-hover:text-success'}
            ${animating ? 'scale-125' : 'scale-100'}
          `}
        />
      </div>
      <span className={`text-sm ${reposted ? 'text-success' : 'text-text-muted group-hover:text-success'}`}>
        {count > 0 ? count : ''}
      </span>
    </button>
  )
}
