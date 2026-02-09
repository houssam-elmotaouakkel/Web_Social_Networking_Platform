import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Bookmark } from 'lucide-react'
import { savesAPI } from '../api/saves.api'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import FeedItem from '../components/feed/FeedItem'
import Spinner from '../components/ui/Spinner'
import toast from 'react-hot-toast'

export default function SavedThreadsPage() {
  const { t } = useTranslation()
  useDocumentTitle('pageTitle.saved')

  const [threads, setThreads] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await savesAPI.getSaved()
        setThreads(data.threads)
      } catch {
        toast.error(t('saves.failedToLoad'))
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [t])

  const handleUnsave = (threadId) => {
    setThreads((prev) => prev.filter((th) => th.id !== threadId))
  }

  return (
    <div>
      {/* Header */}
      <div className="sticky top-0 z-10 bg-bg-primary/80 backdrop-blur-xl border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <Bookmark size={20} className="text-text-secondary" />
          <h2 className="text-xl font-bold text-text-primary">{t('saves.title')}</h2>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner size={28} />
        </div>
      ) : threads.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <Bookmark size={48} className="text-text-muted" />
          <p className="text-text-muted text-sm">{t('saves.noSavedThreads')}</p>
        </div>
      ) : (
        threads.map((thread) => (
          <FeedItem
            key={thread.id}
            thread={{ ...thread, savedByMe: true }}
            author={thread.author}
            onDelete={() => handleUnsave(thread.id)}
          />
        ))
      )}

      {/* Mobile padding */}
      <div className="h-20 md:h-0" />
    </div>
  )
}
