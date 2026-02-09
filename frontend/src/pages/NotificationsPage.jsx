import { useEffect, useState, useCallback, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { CheckCheck, Trash2 } from 'lucide-react'
import { notificationsAPI } from '../api/notifications.api'
import { useBadges } from '../hooks/useBadges'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import NotificationItem from '../components/notifications/NotificationItem'
import Spinner from '../components/ui/Spinner'
import toast from 'react-hot-toast'
import { NOTIFICATIONS_PAGE_SIZE } from '../utils/constants'
import { useConfirm } from '../hooks/useConfirm'
import ConfirmDialog from '../components/ui/ConfirmDialog'

export default function NotificationsPage() {
  const { t } = useTranslation()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [nextCursor, setNextCursor] = useState(null)
  const [hasMore, setHasMore] = useState(true)
  const sentinelObserverRef = useRef(null)
  const { refreshBadges } = useBadges()
  const { confirm, confirmDialogProps } = useConfirm()

  useDocumentTitle('pageTitle.notifications')

  const loadNotifications = useCallback(async (cursor = null) => {
    if (cursor) setLoadingMore(true)
    else setLoading(true)

    try {
      const params = { limit: NOTIFICATIONS_PAGE_SIZE }
      if (cursor) params.cursor = cursor

      const { data } = await notificationsAPI.list(params)
      const items = data.items || []

      setNotifications((prev) => cursor ? [...prev, ...items] : items)
      setNextCursor(data.nextCursor)
      setHasMore(!!data.nextCursor)
    } catch {
      toast.error(t('notifications.failedToLoad'))
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [])

  useEffect(() => {
    loadNotifications()
  }, [loadNotifications])

  // Callback ref for infinite scroll sentinel — avoids stale closure issues
  const nextCursorRef = useRef(nextCursor)
  nextCursorRef.current = nextCursor

  const sentinelRef = useCallback(
    (node) => {
      if (sentinelObserverRef.current) sentinelObserverRef.current.disconnect()
      if (!node) return

      sentinelObserverRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && !loadingMore && nextCursorRef.current) {
            loadNotifications(nextCursorRef.current)
          }
        },
        { threshold: 0.5 }
      )
      sentinelObserverRef.current.observe(node)
    },
    [loadingMore, loadNotifications]
  )

  const handleMarkRead = async (notificationId) => {
    try {
      await notificationsAPI.markRead(notificationId)
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n))
      )
      refreshBadges()
    } catch { /* silent */ }
  }

  const handleMarkAllRead = async () => {
    try {
      await notificationsAPI.markAllRead()
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
      toast.success(t('notifications.allMarkedAsRead'))
      refreshBadges()
    } catch {
      toast.error(t('notifications.failedToMarkAllRead'))
    }
  }

  const handleDeleteAll = async () => {
    if (!(await confirm(t('notifications.confirmDeleteAll')))) return
    try {
      await notificationsAPI.deleteAll()
      setNotifications([])
      setHasMore(false)
      setNextCursor(null)
      toast.success(t('notifications.allDeleted'))
      refreshBadges()
    } catch {
      toast.error(t('notifications.failedToDelete'))
    }
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length

  return (
    <>
    <div>
      {/* Header */}
      <div className="sticky top-0 z-10 bg-bg-primary/80 backdrop-blur-xl border-b border-border
                      flex items-center justify-between px-4 py-3">
        <div>
          <h2 className="text-xl font-bold text-text-primary">{t('notifications.notificationsTitle')}</h2>
          {unreadCount > 0 && (
            <p className="text-xs text-text-muted">{t('notifications.unreadCount', { count: unreadCount })}</p>
          )}
        </div>
        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="flex items-center gap-1.5 text-sm text-accent hover:text-accent-hover
                         cursor-pointer transition-colors"
            >
              <CheckCheck size={16} />
              <span className="hidden sm:inline">{t('notifications.markAllRead')}</span>
            </button>
          )}
          {notifications.length > 0 && (
            <button
              onClick={handleDeleteAll}
              className="flex items-center gap-1.5 text-sm text-danger hover:text-red-400
                         cursor-pointer transition-colors"
            >
              <Trash2 size={16} />
              <span className="hidden sm:inline">{t('notifications.deleteAll')}</span>
            </button>
          )}
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner size={28} />
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-text-muted text-sm">{t('notifications.noNotificationsYet')}</p>
          <p className="text-text-muted text-xs mt-1">
            {t('notifications.noNotificationsDescription')}
          </p>
        </div>
      ) : (
        <>
          {notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              actor={notification.actor}
              onMarkRead={handleMarkRead}
            />
          ))}

          {/* Infinite scroll sentinel */}
          {hasMore && (
            <div ref={sentinelRef} className="flex justify-center py-6">
              {loadingMore && <Spinner size={20} />}
            </div>
          )}
        </>
      )}

      <div className="h-20 md:h-0" />
    </div>
    <ConfirmDialog {...confirmDialogProps} />
    </>
  )
}