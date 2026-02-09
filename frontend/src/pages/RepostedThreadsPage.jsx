import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Repeat2 } from 'lucide-react'
import { repostsAPI } from '../api/reposts.api'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import FeedItem from '../components/feed/FeedItem'
import Spinner from '../components/ui/Spinner'
import toast from 'react-hot-toast'

export default function RepostedThreadsPage() {
  const { t } = useTranslation()
  useDocumentTitle('pageTitle.reposts')

  const [threads, setThreads] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await repostsAPI.getReposted()
        setThreads(data.threads)
      } catch {
        toast.error(t('reposts.failedToLoad'))
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [t])

  const handleRemove = (threadId) => {
    setThreads((prev) => prev.filter((th) => th.id !== threadId))
  }

  return (
    <div>
      {/* Header */}
      <div className="sticky top-0 z-10 bg-bg-primary/80 backdrop-blur-xl border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <Repeat2 size={20} className="text-text-secondary" />
          <h2 className="text-xl font-bold text-text-primary">{t('reposts.title')}</h2>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner size={28} />
        </div>
      ) : threads.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <Repeat2 size={48} className="text-text-muted" />
          <p className="text-text-muted text-sm">{t('reposts.noRepostedThreads')}</p>
        </div>
      ) : (
        threads.map((thread) => (
          <FeedItem
            key={thread.id}
            thread={{ ...thread, repostedByMe: true }}
            author={thread.author}
            onDelete={() => handleRemove(thread.id)}
          />
        ))
      )}

      {/* Mobile padding */}
      <div className="h-20 md:h-0" />
    </div>
  )
}
