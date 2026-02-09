import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { MessageCircle, Trash2, MoreHorizontal, Globe, Users, Lock, Archive, ChevronRight, Check } from 'lucide-react'
import { useState, useRef, useEffect, memo } from 'react'
import Avatar from '../ui/Avatar'
import LikeButton from '../reactions/LikeButton'
import RepostButton from '../reactions/RepostButton'
import SaveButton from '../reactions/SaveButton'
import { useAuth } from '../../contexts/AuthContext'
import { threadsAPI } from '../../api/threads.api'
import { timeAgo } from '../../utils/formatDate'
import { sanitizeMediaUrl, safeOpenUrl, isAllowedUrl } from '../../utils/sanitizeUrl'
import { useConfirm } from '../../hooks/useConfirm'
import ConfirmDialog from '../ui/ConfirmDialog'
import toast from 'react-hot-toast'

function FeedItem({ thread, author, onDelete, onUpdate }) {
  const navigate = useNavigate()
  const { user: me } = useAuth()
  const { t } = useTranslation()
  const [showMenu, setShowMenu] = useState(false)
  const [showVisOptions, setShowVisOptions] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [currentVisibility, setCurrentVisibility] = useState(thread.visibility)
  const menuRef = useRef(null)
  const { confirm, confirmDialogProps } = useConfirm()

  // Close dropdown on outside click
  useEffect(() => {
    if (!showMenu) return
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false)
        setShowVisOptions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showMenu])

  const isOwn = me?.id === thread.authorId

  const handleDelete = async (e) => {
    e.stopPropagation()
    if (!(await confirm(t('thread.deleteThisThread')))) return
    setDeleting(true)
    try {
      await threadsAPI.remove(thread.id)
      onDelete?.(thread.id)
      toast.success(t('thread.threadDeleted'))
    } catch (err) {
      toast.error(err.response?.data?.message || t('thread.deleteFailed'))
    } finally {
      setDeleting(false)
      setShowMenu(false)
    }
  }

  const handleArchive = async (e) => {
    e.stopPropagation()
    try {
      await threadsAPI.archive(thread.id)
      onDelete?.(thread.id) // remove from feed view
      toast.success(t('thread.threadArchived'))
    } catch (err) {
      toast.error(err.response?.data?.message || t('thread.archiveFailed'))
    }
    setShowMenu(false)
  }

  const handleVisibilityChange = async (e, newVis) => {
    e.stopPropagation()
    if (newVis === currentVisibility) { setShowMenu(false); return }
    try {
      await threadsAPI.updateVisibility(thread.id, newVis)
      setCurrentVisibility(newVis)
      toast.success(t('thread.visibilityUpdated'))
    } catch (err) {
      toast.error(err.response?.data?.message || t('thread.visibilityFailed'))
    }
    setShowMenu(false)
  }

  const VISIBILITY_OPTIONS = [
    { key: 'PUBLIC', icon: Globe, label: t('thread.everyone'), color: 'text-accent' },
    { key: 'FOLLOWERS', icon: Users, label: t('thread.followersOnly'), color: 'text-success' },
    { key: 'PRIVATE', icon: Lock, label: t('thread.onlyMe'), color: 'text-warning' },
  ]

  return (
    <>
    <article
      onClick={() => navigate(`/thread/${thread.id}`)}
      className="px-4 py-3 border-b border-border hover:bg-bg-hover/50
                 cursor-pointer transition-colors"
    >
      <div className="flex gap-3">
        {/* Avatar */}
        <div
          className="shrink-0"
          onClick={(e) => {
            e.stopPropagation()
            navigate(`/user/${thread.authorId}`)
          }}
        >
          <Avatar src={author?.avatarUrl} username={author?.username} size="md" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header: username · time · menu */}
          <div className="flex items-center gap-2">
            <span
              className="font-bold text-text-primary text-[15px] hover:underline truncate"
              onClick={(e) => {
                e.stopPropagation()
                navigate(`/user/${thread.authorId}`)
              }}
            >
              {author?.username || t('common.unknownUser')}
            </span>
            <span className="text-text-muted text-sm">·</span>
            <span className="text-text-muted text-sm shrink-0">{timeAgo(thread.createdAt)}</span>

            {/* Visibility badge */}
            {currentVisibility === 'FOLLOWERS' && (
              <Users size={13} className="text-success shrink-0" title={t('thread.followersOnly')} />
            )}
            {currentVisibility === 'PRIVATE' && (
              <Lock size={13} className="text-warning shrink-0" title={t('thread.onlyMe')} />
            )}

            {/* More menu */}
            {isOwn && (
              <div className="ml-auto relative" ref={menuRef}>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowMenu((v) => !v)
                    if (showMenu) setShowVisOptions(false)
                  }}
                  className="p-1.5 rounded-full hover:bg-bg-hover text-text-muted
                             hover:text-text-secondary cursor-pointer"
                  aria-label={t('thread.visibility')}
                >
                  <MoreHorizontal size={16} />
                </button>
                {showMenu && (
                  <div className="absolute right-0 top-8 bg-bg-card border border-border
                                  rounded-xl shadow-lg z-20 py-1 min-w-48">
                    {showVisOptions ? (
                      /* ── Visibility sub-menu ── */
                      <>
                        <div className="px-3 py-1.5 text-[11px] font-semibold text-text-muted uppercase tracking-wide">
                          {t('thread.visibility')}
                        </div>
                        {VISIBILITY_OPTIONS.map(({ key, icon: Icon, label, color }) => (
                          <button
                            key={key}
                            onClick={(e) => handleVisibilityChange(e, key)}
                            className={`flex items-center gap-2.5 w-full px-3 py-2 text-sm
                                       hover:bg-bg-hover cursor-pointer transition-colors ${
                              currentVisibility === key ? color + ' font-semibold' : 'text-text-secondary'
                            }`}
                          >
                            <Icon size={15} />
                            <span className="flex-1 text-start">{label}</span>
                            {currentVisibility === key && (
                              <Check size={15} className={color} />
                            )}
                          </button>
                        ))}

                        <div className="border-t border-border my-1" />

                        {/* Archive */}
                        <button
                          onClick={handleArchive}
                          className="flex items-center gap-2.5 w-full px-3 py-2 text-sm
                                     text-text-secondary hover:bg-bg-hover cursor-pointer transition-colors"
                        >
                          <Archive size={15} />
                          {t('thread.archive')}
                        </button>

                        {/* Delete */}
                        <button
                          onClick={handleDelete}
                          disabled={deleting}
                          className="flex items-center gap-2.5 w-full px-3 py-2 text-sm
                                     text-danger hover:bg-bg-hover cursor-pointer transition-colors"
                        >
                          <Trash2 size={15} />
                          {deleting ? t('thread.deleting') : t('thread.delete')}
                        </button>
                      </>
                    ) : (
                      /* ── Main menu ── */
                      <>
                        {/* Visibility item → opens sub-menu */}
                        <button
                          onClick={(e) => { e.stopPropagation(); setShowVisOptions(true) }}
                          className="flex items-center gap-2.5 w-full px-3 py-2.5 text-sm
                                     text-text-secondary hover:bg-bg-hover cursor-pointer transition-colors"
                        >
                          {currentVisibility === 'PUBLIC' ? (
                            <Globe size={15} className="text-accent" />
                          ) : currentVisibility === 'FOLLOWERS' ? (
                            <Users size={15} className="text-success" />
                          ) : (
                            <Lock size={15} className="text-warning" />
                          )}
                          <span className="flex-1 text-start">{t('thread.visibility')}</span>
                          <ChevronRight size={14} className="text-text-muted" />
                        </button>

                        <div className="border-t border-border my-1" />

                        {/* Archive */}
                        <button
                          onClick={handleArchive}
                          className="flex items-center gap-2.5 w-full px-3 py-2.5 text-sm
                                     text-text-secondary hover:bg-bg-hover cursor-pointer transition-colors"
                        >
                          <Archive size={15} />
                          {t('thread.archive')}
                        </button>

                        {/* Delete */}
                        <button
                          onClick={handleDelete}
                          disabled={deleting}
                          className="flex items-center gap-2.5 w-full px-3 py-2.5 text-sm
                                     text-danger hover:bg-bg-hover cursor-pointer transition-colors"
                        >
                          <Trash2 size={15} />
                          {deleting ? t('thread.deleting') : t('thread.delete')}
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Thread content */}
          <p className="text-text-primary text-[15px] leading-relaxed mt-1 whitespace-pre-wrap wrap-break-word">
            {thread.content}
          </p>

          {/* Media preview */}
          {thread.mediaUrls?.length > 0 && (
            <div className={`mt-3 grid gap-2 ${
              thread.mediaUrls.length === 1 ? 'grid-cols-1' :
              thread.mediaUrls.length === 2 ? 'grid-cols-2' :
              'grid-cols-2'
            }`}>
              {thread.mediaUrls.filter(isAllowedUrl).map((url, i) => (
                <img
                  key={i}
                  src={sanitizeMediaUrl(url)}
                  alt={`${t('thread.media')} ${i + 1}`}
                  onClick={(e) => {
                    e.stopPropagation()
                    safeOpenUrl(url)
                  }}
                  className="rounded-xl border border-border object-cover w-full max-h-75
                             hover:opacity-90 transition-opacity"
                />
              ))}
            </div>
          )}

          {/* Actions: like, reply, repost, save */}
          <div className="flex items-center gap-4 mt-2 -ml-2">
            <LikeButton
              targetType="THREAD"
              targetId={thread.id}
              initialCount={thread.likesCount}
              initialLiked={thread.likedByMe}
            />
            <button
              onClick={(e) => {
                e.stopPropagation()
                navigate(`/thread/${thread.id}`)
              }}
              className="flex items-center gap-1.5 group cursor-pointer"
            >
              <div className="p-2 rounded-full group-hover:bg-accent/10 transition-colors">
                <MessageCircle size={18} className="text-text-muted group-hover:text-accent" />
              </div>
              <span className="text-sm text-text-muted group-hover:text-accent">
                {thread.repliesCount > 0 ? thread.repliesCount : ''}
              </span>
            </button>
            <RepostButton
              threadId={thread.id}
              initialReposted={thread.repostedByMe}
              initialCount={thread.repostsCount}
            />
            <div className="ml-auto">
              <SaveButton
                threadId={thread.id}
                initialSaved={thread.savedByMe}
              />
            </div>
          </div>
        </div>
      </div>
    </article>
    <ConfirmDialog {...confirmDialogProps} />
    </>
  )
}

export default memo(FeedItem)
