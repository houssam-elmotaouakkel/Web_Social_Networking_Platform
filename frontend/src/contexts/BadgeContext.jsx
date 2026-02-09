import { useState, useEffect, useCallback } from 'react'
import { followsAPI } from '../api/follows.api'
import { notificationsAPI } from '../api/notifications.api'
import { BadgeContext } from './createBadgeContext'
import { BADGE_POLL_INTERVAL_MS } from '../utils/constants'

export default function BadgeProvider({ children }) {
  const [requestCount, setRequestCount] = useState(0)
  const [unreadNotifs, setUnreadNotifs] = useState(0)

  const refreshBadges = useCallback(async () => {
    try {
      const [reqRes, notifRes] = await Promise.all([
        followsAPI.getRequests(),
        notificationsAPI.unreadCount(),
      ])
      setRequestCount(reqRes.data.requests?.length || 0)
      setUnreadNotifs(notifRes.data.unreadCount || 0)
    } catch { /* ignore */ }
  }, [])

  // Initial fetch + polling (pauses when tab is hidden)
  useEffect(() => {
    let cancelled = false
    let interval = null

    const doFetch = async () => {
      if (!cancelled && document.visibilityState !== 'hidden') {
        await refreshBadges()
      }
    }

    const startPolling = () => {
      doFetch()
      interval = setInterval(doFetch, BADGE_POLL_INTERVAL_MS)
    }

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        // Refresh immediately on return + restart polling
        doFetch()
        if (!interval) interval = setInterval(doFetch, BADGE_POLL_INTERVAL_MS)
      } else {
        clearInterval(interval)
        interval = null
      }
    }

    startPolling()
    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      cancelled = true
      clearInterval(interval)
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [refreshBadges])

  return (
    <BadgeContext.Provider value={{ requestCount, unreadNotifs, refreshBadges }}>
      {children}
    </BadgeContext.Provider>
  )
}
