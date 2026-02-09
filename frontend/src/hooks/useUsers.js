import { useState, useCallback, useRef } from 'react'
import { usersAPI } from '../api/users.api'

/**
 * User cache hook — resolves authorId → { username, avatarUrl }
 * Avoids duplicate API calls for the same user across feed items.
 *
 * Uses a ref-based cache for lookup so resolveUsers has a stable identity
 * (no `users` state in its dependency array → prevents infinite re-render loops).
 */
export function useUsers() {
  const [users, setUsers] = useState({})
  const cacheRef = useRef({})
  const pending = useRef(new Set())

  const resolveUsers = useCallback(async (userIds) => {
    const toFetch = [...new Set(userIds)].filter(
      (id) => !cacheRef.current[id] && !pending.current.has(id)
    )

    if (toFetch.length === 0) return

    toFetch.forEach((id) => pending.current.add(id))

    const results = await Promise.allSettled(
      toFetch.map((id) => usersAPI.getProfile(id))
    )

    const newUsers = {}
    results.forEach((result, i) => {
      const id = toFetch[i]
      pending.current.delete(id)
      if (result.status === 'fulfilled') {
        const p = result.value.data.profile
        newUsers[id] = {
          id: p.id,
          username: p.username,
          avatarUrl: p.avatarUrl,
          isPrivate: p.isPrivate,
        }
      }
    })

    if (Object.keys(newUsers).length > 0) {
      // Update ref first (for immediate next-call lookup)
      cacheRef.current = { ...cacheRef.current, ...newUsers }
      // Then update state (triggers re-render so components see the resolved users)
      setUsers((prev) => ({ ...prev, ...newUsers }))
    }
  }, []) // ← stable identity — no deps

  return { users, resolveUsers }
}
