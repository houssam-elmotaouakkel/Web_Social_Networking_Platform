import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Archive, ArchiveRestore, ChevronLeft, ChevronRight, MessageCircle } from 'lucide-react'
import { threadsAPI } from '../../api/threads.api'
import Avatar from '../../components/ui/Avatar'
import LikeButton from '../../components/reactions/LikeButton'
import Spinner from '../../components/ui/Spinner'
import { useAuth } from '../../contexts/AuthContext'
import { timeAgo } from '../../utils/formatDate'
import { sanitizeMediaUrl, isAllowedUrl } from '../../utils/sanitizeUrl'
import toast from 'react-hot-toast'

export default function ArchivedThreadsPage() {
  const { t, i18n } = useTranslation()
  const { user: me } = useAuth()
  const navigate = useNavigate()
  const isRtl = i18n.dir() === 'rtl'
  const BackIcon = isRtl ? ChevronRight : ChevronLeft

  const [threads, setThreads] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await threadsAPI.getArchived()
        setThreads(data.threads)
      } catch {
        toast.error(t('thread.failedToLoadArchived'))
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [t])

  const handleUnarchive = async (threadId) => {
    try {
      await threadsAPI.unarchive(threadId)
      setThreads((prev) => prev.filter((t) => t.id !== threadId))
      toast.success(t('thread.threadUnarchived'))
    } catch (err) {
      toast.error(err.response?.data?.message || t('thread.unarchiveFailed'))
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-bg-primary/80 backdrop-blur-xl border-b border-border px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/settings')}
            className="md:hidden p-1.5 rounded-full hover:bg-bg-hover cursor-pointer"
          >
            <BackIcon size={20} className="text-text-primary" />
          </button>
          <div className="flex items-center gap-2">
            <Archive size={20} className="text-text-secondary" />
            <h2 className="text-xl font-bold text-text-primary">{t('settings.archivedThreads')}</h2>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1">
        {loading ? (
          <div className="flex justify-center py-12">
            <Spinner size={28} />
          </div>
        ) : threads.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Archive size={48} className="text-text-muted" />
            <p className="text-text-muted text-sm">{t('settings.noArchivedThreads')}</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {threads.map((thread) => (
              <article
                key={thread.id}
                className="px-4 py-3 hover:bg-bg-hover/50 transition-colors"
              >
                <div className="flex gap-3">
                  {/* Avatar */}
                  <div className="shrink-0">
                    <Avatar
                      src={thread.author?.avatarUrl}
                      username={thread.author?.username || me?.username}
                      size="md"
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-text-primary text-[15px] truncate">
                        {thread.author?.username || me?.username}
                      </span>
                      <span className="text-text-muted text-sm">·</span>
                      <span className="text-text-muted text-sm shrink-0">
                        {timeAgo(thread.createdAt)}
                      </span>

                      {/* Unarchive button */}
                      <button
                        onClick={() => handleUnarchive(thread.id)}
                        className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl
                                   text-sm font-medium text-accent hover:bg-accent/10
                                   cursor-pointer transition-colors"
                        title={t('thread.unarchive')}
                      >
                        <ArchiveRestore size={15} />
                        <span className="hidden sm:inline">{t('thread.unarchive')}</span>
                      </button>
                    </div>

                    {/* Thread content */}
                    <p className="text-text-primary text-[15px] leading-relaxed mt-1 whitespace-pre-wrap wrap-break-word">
                      {thread.content}
                    </p>

                    {/* Media */}
                    {thread.mediaUrls?.length > 0 && (
                      <div className={`mt-3 grid gap-2 ${
                        thread.mediaUrls.length === 1 ? 'grid-cols-1' : 'grid-cols-2'
                      }`}>
                        {thread.mediaUrls.filter(isAllowedUrl).map((url, i) => (
                          <img
                            key={i}
                            src={sanitizeMediaUrl(url)}
                            alt={`${t('thread.media')} ${i + 1}`}
                            className="rounded-xl border border-border object-cover w-full max-h-75"
                          />
                        ))}
                      </div>
                    )}

                    {/* Stats */}
                    <div className="flex items-center gap-6 mt-2 -ml-2">
                      <LikeButton
                        targetType="THREAD"
                        targetId={thread.id}
                        initialCount={thread.likesCount}
                        initialLiked={thread.likedByMe}
                      />
                      <button
                        onClick={() => navigate(`/thread/${thread.id}`)}
                        className="flex items-center gap-1.5 group cursor-pointer"
                      >
                        <div className="p-2 rounded-full group-hover:bg-accent/10 transition-colors">
                          <MessageCircle size={18} className="text-text-muted group-hover:text-accent" />
                        </div>
                        <span className="text-sm text-text-muted group-hover:text-accent">
                          {thread.repliesCount > 0 ? thread.repliesCount : ''}
                        </span>
                      </button>
                    </div>

                    {/* Archived date */}
                    <p className="text-xs text-text-muted mt-1">
                      {t('thread.archivedOn', { date: new Date(thread.archivedAt).toLocaleDateString() })}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
