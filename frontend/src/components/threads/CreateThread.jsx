import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Image, X, Globe, Users, Lock, Loader2, ChevronDown, Check } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useThreadComposer } from '../../hooks/useThreadComposer'
import Avatar from '../ui/Avatar'
import Button from '../ui/Button'
import { MAX_MEDIA_PER_THREAD } from '../../utils/constants'

const VISIBILITY_OPTIONS = [
  { value: 'PUBLIC', icon: Globe, labelKey: 'thread.everyone', color: 'text-accent' },
  { value: 'FOLLOWERS', icon: Users, labelKey: 'thread.followersOnly', color: 'text-success' },
  { value: 'PRIVATE', icon: Lock, labelKey: 'thread.onlyMe', color: 'text-warning' },
]

export default function CreateThread({ onCreated }) {
  const { user } = useAuth()
  const { t } = useTranslation()
  const [expanded, setExpanded] = useState(false)
  const [showVisibility, setShowVisibility] = useState(false)
  const visMenuRef = useRef(null)

  const {
    content, setContent,
    mediaUrls, visibility, setVisibility, uploading, posting, remaining,
    fileInputRef, textareaRef,
    handleFileSelect, removeMedia, handleSubmit: rawSubmit,
    autoResize, canPost,
  } = useThreadComposer({
    onCreated,
    t,
    onPostSuccess: () => setExpanded(false),
  })

  // Close visibility menu on outside click
  useEffect(() => {
    if (!showVisibility) return
    const handleClick = (e) => {
      if (visMenuRef.current && !visMenuRef.current.contains(e.target)) {
        setShowVisibility(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [showVisibility])

  const currentVis = VISIBILITY_OPTIONS.find((o) => o.value === visibility)

  return (
    <div className="border-b border-border px-4 py-3">
      <div className="flex gap-3">
        <Avatar src={user?.avatarUrl} username={user?.username} size="md" />

        <div className="flex-1 min-w-0">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => {
              setContent(e.target.value)
              autoResize(e)
            }}
            onFocus={() => setExpanded(true)}
            placeholder={t('thread.whatsOnYourMind')}
            rows={expanded ? 3 : 1}
            maxLength={remaining + content.length}
            className="w-full bg-transparent text-text-primary placeholder-text-muted
                       resize-none outline-none text-[15px] leading-relaxed py-2"
          />

          {/* Media previews */}
          {mediaUrls.length > 0 && (
            <div className="flex gap-2 mt-2 flex-wrap">
              {mediaUrls.map((url) => (
                <div key={url} className="relative group">
                  <img
                    src={url}
                    alt="media"
                    className="w-20 h-20 rounded-xl object-cover border border-border"
                  />
                  <button
                    onClick={() => removeMedia(url)}
                    className="absolute -top-1.5 -right-1.5 bg-bg-primary border border-border
                               rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity
                               cursor-pointer"
                  >
                    <X size={12} className="text-text-secondary" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Actions bar */}
          {expanded && (
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
              <div className="flex items-center gap-1">
                {/* Image upload */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading || mediaUrls.length >= MAX_MEDIA_PER_THREAD}
                  className="p-2 rounded-full hover:bg-accent/10 text-accent
                             disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                >
                  {uploading ? <Loader2 size={18} className="animate-spin" /> : <Image size={18} />}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                {/* Visibility dropdown */}
                <div className="relative" ref={visMenuRef}>
                  <button
                    onClick={() => setShowVisibility((v) => !v)}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs
                               font-medium hover:bg-bg-hover cursor-pointer"
                  >
                    <currentVis.icon size={14} className={currentVis.color} />
                    <span className={currentVis.color}>{t(currentVis.labelKey)}</span>
                    <ChevronDown size={12} className={`${currentVis.color} transition-transform ${showVisibility ? 'rotate-180' : ''}`} />
                  </button>

                  {showVisibility && (
                    <div className="absolute bottom-full left-0 mb-2 w-52 rounded-xl border border-border
                                    bg-bg-card shadow-xl z-20 py-1 animate-in fade-in slide-in-from-bottom-2 duration-150">
                      <p className="px-3 py-2 text-xs font-semibold text-text-muted uppercase tracking-wide">
                        {t('thread.visibility')}
                      </p>
                      {VISIBILITY_OPTIONS.map(({ value, icon: Icon, labelKey, color }) => (
                        <button
                          key={value}
                          onClick={() => { setVisibility(value); setShowVisibility(false) }}
                          className="flex items-center gap-3 w-full px-3 py-2.5 hover:bg-bg-hover
                                     cursor-pointer transition-colors"
                        >
                          <Icon size={16} className={color} />
                          <span className={`text-sm font-medium ${color}`}>{t(labelKey)}</span>
                          {visibility === value && (
                            <Check size={16} className={`ml-auto ${color}`} />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                {content.length > 0 && (
                  <span className={`text-xs ${remaining < 50 ? 'text-danger' : 'text-text-muted'}`}>
                    {remaining}
                  </span>
                )}
                <Button
                  size="sm"
                  loading={posting}
                  disabled={!canPost}
                  onClick={rawSubmit}
                >
                  {t('nav.post')}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
