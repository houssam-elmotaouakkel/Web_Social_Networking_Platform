import { useEffect, useRef, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useFeed } from '../hooks/useFeed'
import { useCompose } from '../contexts/ComposeContext'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import CreateThread from '../components/threads/CreateThread'
import FeedItem from '../components/feed/FeedItem'
import Spinner from '../components/ui/Spinner'

export default function FeedPage() {
  const { items, loading, loadingMore, hasMore, load, loadMore, prepend, removeItem } = useFeed()
  const { subscribe } = useCompose()
  const { t } = useTranslation()
  const observerRef = useRef(null)

  useDocumentTitle('pageTitle.home')

  // Initial load
  useEffect(() => {
    load()
  }, [load])

  // Subscribe to threads created from the compose modal
  useEffect(() => {
    return subscribe((thread) => prepend(thread))
  }, [subscribe, prepend])

  // Infinite scroll with IntersectionObserver
  const lastItemRef = useCallback(
    (node) => {
      if (loadingMore) return
      if (observerRef.current) observerRef.current.disconnect()

      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadMore()
        }
      })

      if (node) observerRef.current.observe(node)
    },
    [loadingMore, hasMore, loadMore]
  )

  return (
    <div>
      {/* Header */}
      <div className="sticky top-0 z-10 bg-bg-primary/80 backdrop-blur-xl border-b border-border">
        <h2 className="text-xl font-bold text-text-primary px-4 py-3">{t('feed.homeTitle')}</h2>
      </div>

      {/* Create thread */}
      <CreateThread onCreated={prepend} />

      {/* Feed */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner size={28} />
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 px-4">
          <p className="text-text-secondary text-lg">{t('feed.noThreadsYet')}</p>
          <p className="text-text-muted text-sm mt-1">
            {t('feed.noThreadsDescription')}
          </p>
        </div>
      ) : (
        <>
          {items.map((thread, i) => {
            const isLast = i === items.length - 1
            return (
              <div key={thread.id} ref={isLast ? lastItemRef : undefined}>
                <FeedItem
                  thread={thread}
                  author={thread.author}
                  onDelete={removeItem}
                />
              </div>
            )
          })}

          {loadingMore && (
            <div className="flex justify-center py-6">
              <Spinner size={24} />
            </div>
          )}

          {!hasMore && items.length > 5 && (
            <div className="text-center py-8 text-text-muted text-sm">
              {t('feed.reachedTheEnd')}
            </div>
          )}
        </>
      )}

      {/* Bottom padding for mobile nav */}
      <div className="h-20 md:h-0" />
    </div>
  )
}