import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { CalendarDays, Lock, Camera, Eye, Pencil } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import Avatar from '../ui/Avatar'
import Button from '../ui/Button'
import FollowButton from '../follows/FollowButton'
import ImageViewerModal from '../ui/ImageViewerModal'
import { fullDate } from '../../utils/formatDate'

function useClickOutside(ref, handler) {
  useEffect(() => {
    const listener = (e) => {
      if (!ref.current || ref.current.contains(e.target)) return
      handler()
    }
    document.addEventListener('mousedown', listener)
    return () => document.removeEventListener('mousedown', listener)
  }, [ref, handler])
}

export default function ProfileHeader({ profile, access, followStatus, onFollowChange, onAvatarChange, onCoverChange }) {
  const { user: me } = useAuth()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const isOwn = me?.id === profile.id

  const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:4000'

  // Menu state
  const [coverMenuOpen, setCoverMenuOpen] = useState(false)
  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false)
  const [viewerSrc, setViewerSrc] = useState(null)
  const [viewerAlt, setViewerAlt] = useState('')

  const coverMenuRef = useRef(null)
  const avatarMenuRef = useRef(null)
  const coverFileRef = useRef(null)
  const avatarFileRef = useRef(null)

  useClickOutside(coverMenuRef, () => setCoverMenuOpen(false))
  useClickOutside(avatarMenuRef, () => setAvatarMenuOpen(false))

  const avatarSrc = profile.avatarUrl
    ? (profile.avatarUrl.startsWith('http') ? profile.avatarUrl : `${API_BASE}${profile.avatarUrl}`)
    : null
  const coverSrc = profile.coverUrl
    ? `${API_BASE}${profile.coverUrl}`
    : null

  const menuItemClass = `flex items-center gap-2.5 w-full px-3 py-2 text-sm text-text-primary
                          hover:bg-bg-hover rounded-lg transition-colors cursor-pointer`

  return (
    <div className="border-b border-border">
      {/* Banner area */}
      <div className="relative h-40 group">
        {coverSrc ? (
          <img
            src={coverSrc}
            alt={t('profile.coverAlt')}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-linear-to-r from-bg-card to-bg-hover" />
        )}

        {/* Cover overlay — clickable */}
        {isOwn && (
          <div className="absolute inset-0" ref={coverMenuRef}>
            <button
              onClick={() => setCoverMenuOpen((v) => !v)}
              className="absolute inset-0 w-full h-full flex items-center justify-center
                         bg-black/0 group-hover:bg-black/40 cursor-pointer transition-colors"
            >
              <Camera size={24} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>

            {coverMenuOpen && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20
                              bg-bg-primary border border-border rounded-xl shadow-xl py-1.5 px-1 min-w-45">
                {coverSrc && (
                  <button
                    className={menuItemClass}
                    onClick={() => {
                      setCoverMenuOpen(false)
                      setViewerSrc(coverSrc)
                      setViewerAlt(t('profile.coverAlt'))
                    }}
                  >
                    <Eye size={16} className="text-text-muted" />
                    {t('profile.viewPhoto')}
                  </button>
                )}
                <button
                  className={menuItemClass}
                  onClick={() => {
                    setCoverMenuOpen(false)
                    coverFileRef.current?.click()
                  }}
                >
                  <Pencil size={16} className="text-text-muted" />
                  {t('profile.changePhoto')}
                </button>
              </div>
            )}

            <input
              ref={coverFileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) onCoverChange?.(file)
                e.target.value = ''
              }}
            />
          </div>
        )}

        {/* For non-own: click cover to view */}
        {!isOwn && coverSrc && (
          <button
            onClick={() => { setViewerSrc(coverSrc); setViewerAlt(t('profile.coverAlt')) }}
            className="absolute inset-0 w-full h-full cursor-pointer"
          />
        )}
      </div>

      {/* Avatar + actions row */}
      <div className="px-4 flex items-end justify-between -mt-12">
        <div className="relative" ref={avatarMenuRef}>
          <button
            onClick={() => {
              if (isOwn) {
                setAvatarMenuOpen((v) => !v)
              } else if (avatarSrc) {
                setViewerSrc(avatarSrc)
                setViewerAlt(profile.username)
              }
            }}
            className="cursor-pointer block"
          >
            <Avatar src={profile.avatarUrl} username={profile.username} size="xl"
                    className="ring-4 ring-bg-primary" />
          </button>

          {isOwn && (
            <div className="absolute bottom-0 right-0 p-1.5 rounded-full bg-bg-primary border border-border pointer-events-none">
              <Camera size={14} className="text-text-secondary" />
            </div>
          )}

          {isOwn && avatarMenuOpen && (
            <div className="absolute top-full left-0 mt-1 z-20
                            bg-bg-primary border border-border rounded-xl shadow-xl py-1.5 px-1 min-w-45">
              {avatarSrc && (
                <button
                  className={menuItemClass}
                  onClick={() => {
                    setAvatarMenuOpen(false)
                    setViewerSrc(avatarSrc)
                    setViewerAlt(profile.username)
                  }}
                >
                  <Eye size={16} className="text-text-muted" />
                  {t('profile.viewPhoto')}
                </button>
              )}
              <button
                className={menuItemClass}
                onClick={() => {
                  setAvatarMenuOpen(false)
                  avatarFileRef.current?.click()
                }}
              >
                <Pencil size={16} className="text-text-muted" />
                {t('profile.changePhoto')}
              </button>
            </div>
          )}

          <input
            ref={avatarFileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) onAvatarChange?.(file)
              e.target.value = ''
            }}
          />
        </div>

        <div className="pb-2">
          {isOwn ? (
            <Button variant="outline" size="sm" onClick={() => navigate('/edit-profile')}>
              {t('profile.editProfileButton')}
            </Button>
          ) : (
            <FollowButton
              userId={profile.id}
              followStatus={followStatus}
              onStatusChange={onFollowChange}
            />
          )}
        </div>
      </div>

      {/* User info */}
      <div className="px-4 mt-3 pb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold text-text-primary">{profile.username}</h2>
          {profile.isPrivate && (
            <Lock size={14} className="text-text-muted" title={t('profile.privateAccount')} />
          )}
        </div>

        {profile.bio && (
          <p className="text-text-primary text-[15px] mt-1 whitespace-pre-wrap">{profile.bio}</p>
        )}

        {profile.createdAt && (
          <div className="flex items-center gap-1.5 mt-2 text-text-muted text-sm">
            <CalendarDays size={14} />
            <span>{t('profile.joined', { date: fullDate(profile.createdAt) })}</span>
          </div>
        )}

        {/* Stats — only for FULL access */}
        {access === 'FULL' && (
          <div className="flex items-center gap-5 mt-3">
            <button
              onClick={() => navigate(`/user/${profile.id}/following`)}
              className="text-sm cursor-pointer hover:underline"
            >
              <span className="font-bold text-text-primary">{profile.followingCount ?? 0}</span>{' '}
              <span className="text-text-muted">{t('follows.followingTitle')}</span>
            </button>
            <button
              onClick={() => navigate(`/user/${profile.id}/followers`)}
              className="text-sm cursor-pointer hover:underline"
            >
              <span className="font-bold text-text-primary">{profile.followersCount ?? 0}</span>{' '}
              <span className="text-text-muted">{t('follows.followersTitle')}</span>
            </button>
            <span className="text-sm">
              <span className="font-bold text-text-primary">{profile.threadsCount ?? 0}</span>{' '}
              <span className="text-text-muted">{t('profile.threads')}</span>
            </span>
          </div>
        )}

        {/* Limited access message */}
        {access === 'LIMITED' && !isOwn && (
          <div className="mt-4 text-center py-8 border-t border-border">
            <Lock size={32} className="mx-auto text-text-muted mb-2" />
            <p className="text-text-secondary font-semibold">{t('profile.thisAccountIsPrivate')}</p>
            <p className="text-text-muted text-sm mt-1">{t('profile.followToSeeThreads')}</p>
          </div>
        )}
      </div>

      {/* Image viewer modal */}
      <ImageViewerModal
        src={viewerSrc}
        alt={viewerAlt}
        isOpen={!!viewerSrc}
        onClose={() => setViewerSrc(null)}
      />
    </div>
  )
}
