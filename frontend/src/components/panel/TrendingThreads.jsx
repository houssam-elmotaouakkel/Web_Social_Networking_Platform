import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { threadsAPI } from '../../api/threads.api'
import { MessageCircle, Heart, TrendingUp } from 'lucide-react'
import Avatar from '../ui/Avatar'
import { relativeTime } from '../../utils/formatDate'

export default function TrendingThreads() {
  const { t } = useTranslation()
  const [threads, setThreads] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  const loadTrending = useCallback(async () => {
    try {
      const res = await threadsAPI.trending(5)
      setThreads(res.data.threads)
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadTrending()
  }, [loadTrending])

  if (loading) {
    return (
      <div className="rounded-2xl bg-bg-card border border-border p-4">
        <h3 className="font-bold text-text-primary mb-3 flex items-center gap-2">
          <TrendingUp size={18} className="text-accent" />
          {t('panel.trendingTitle')}
        </h3>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse space-y-2">
              <div className="h-3.5 bg-bg-hover rounded w-full" />
              <div className="h-3 bg-bg-hover rounded w-3/4" />
              <div className="flex gap-3">
                <div className="h-3 bg-bg-hover rounded w-12" />
                <div className="h-3 bg-bg-hover rounded w-12" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (threads.length === 0) return null

  return (
    <div className="rounded-2xl bg-bg-card border border-border overflow-hidden">
      <h3 className="font-bold text-text-primary px-4 pt-4 pb-2 text-lg flex items-center gap-2">
        <TrendingUp size={18} className="text-accent" />
        {t('panel.trendingTitle')}
      </h3>

      {threads.map((thread, idx) => {
        const author = thread.author || {}
        const engagement = thread.likesCount + thread.repliesCount

        return (
          <div
            key={thread.id}
            onClick={() => navigate(`/thread/${thread.id}`)}
            className="px-4 py-3 hover:bg-bg-hover transition-colors cursor-pointer border-t border-border/50 first:border-t-0"
          >
            {/* Category line */}
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs text-text-muted">
                {idx + 1} · {t('panel.trendingTitle')}
              </span>
            </div>

            {/* Thread content preview */}
            <p className="text-sm text-text-primary font-medium leading-snug line-clamp-2 mb-1.5">
              {thread.content}
            </p>

            {/* Author + stats */}
            <div className="flex items-center gap-3 text-xs text-text-muted">
              <div className="flex items-center gap-1.5">
                <Avatar src={author.avatarUrl} username={author.username} size="sm" className="w-4! h-4!" />
                <span>{author.username}</span>
              </div>
              <span>·</span>
              <span>{relativeTime(thread.createdAt)}</span>
              {engagement > 0 && (
                <>
                  <span>·</span>
                  <span>{t('thread.interactions', { count: engagement.toLocaleString() })}</span>
                </>
              )}
            </div>

            {/* Engagement bar */}
            <div className="flex items-center gap-4 mt-2 text-xs text-text-muted">
              <span className="flex items-center gap-1">
                <Heart size={12} className={thread.likesCount > 0 ? 'text-like' : ''} />
                {thread.likesCount}
              </span>
              <span className="flex items-center gap-1">
                <MessageCircle size={12} />
                {thread.repliesCount}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
