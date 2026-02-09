import { Bookmark } from 'lucide-react'
import { useState, useEffect } from 'react'
import { savesAPI } from '../../api/saves.api'

export default function SaveButton({ threadId, initialSaved = false, onToggle }) {
  const [saved, setSaved] = useState(initialSaved)

  useEffect(() => { setSaved(initialSaved) }, [initialSaved])
  const [animating, setAnimating] = useState(false)

  const handleToggle = async () => {
    const wasSaved = saved
    setSaved(!wasSaved)

    if (!wasSaved) {
      setAnimating(true)
      setTimeout(() => setAnimating(false), 300)
    }

    try {
      if (wasSaved) {
        await savesAPI.unsave(threadId)
      } else {
        await savesAPI.save(threadId)
      }
      onToggle?.(!wasSaved)
    } catch {
      setSaved(wasSaved)
    }
  }

  return (
    <button
      onClick={(e) => {
        e.stopPropagation()
        handleToggle()
      }}
      className="flex items-center group cursor-pointer"
      title={saved ? 'Unsave' : 'Save'}
    >
      <div className="p-2 rounded-full group-hover:bg-accent/10 transition-colors">
        <Bookmark
          size={18}
          className={`transition-all duration-200
            ${saved ? 'fill-accent text-accent' : 'text-text-muted group-hover:text-accent'}
            ${animating ? 'scale-125' : 'scale-100'}
          `}
        />
      </div>
    </button>
  )
}
