import { useState, useCallback, useRef } from 'react'
import { feedAPI } from '../api/feed.api'
import { FEED_PAGE_SIZE } from '../utils/constants'

export function useFeed() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const cursorRef = useRef(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await feedAPI.get({ limit: FEED_PAGE_SIZE })
      setItems(data.items)
      cursorRef.current = data.nextCursor
      setHasMore(!!data.nextCursor)
    } catch {
    } finally {
      setLoading(false)
    }
  }, [])

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return
    setLoadingMore(true)
    try {
      const { data } = await feedAPI.get({ limit: FEED_PAGE_SIZE, cursor: cursorRef.current })
      setItems((prev) => [...prev, ...data.items])
      cursorRef.current = data.nextCursor
      setHasMore(!!data.nextCursor)
    } catch {
    } finally {
      setLoadingMore(false)
    }
  }, [loadingMore, hasMore])

  const prepend = useCallback((thread) => {
    setItems((prev) => [thread, ...prev])
  }, [])

  const removeItem = useCallback((threadId) => {
    setItems((prev) => prev.filter((t) => t.id !== threadId))
  }, [])

  const updateItem = useCallback((threadId, updates) => {
    setItems((prev) =>
      prev.map((t) => (t.id === threadId ? { ...t, ...updates } : t))
    )
  }, [])

  return { items, loading, loadingMore, hasMore, load, loadMore, prepend, removeItem, updateItem }
}
