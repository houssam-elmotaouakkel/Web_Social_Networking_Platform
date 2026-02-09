import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { usersAPI } from '../../api/users.api'
import { followsAPI } from '../../api/follows.api'
import Avatar from '../ui/Avatar'
import toast from 'react-hot-toast'

export default function WhoToFollow() {
  const { t } = useTranslation()
  const [users, setUsers] = useState([])
  const [followingIds, setFollowingIds] = useState(new Set())
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  const loadSuggestions = useCallback(async () => {
    try {
      const res = await usersAPI.suggestions(5)
      setUsers(res.data.users)
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadSuggestions()
  }, [loadSuggestions])

  async function handleFollow(userId) {
    try {
      await followsAPI.follow(userId)
      setFollowingIds((prev) => new Set([...prev, userId]))
    } catch (err) {
      toast.error(err.response?.data?.message || t('follows.failedToFollow'))
    }
  }

  if (loading) {
    return (
      <div className="rounded-2xl bg-bg-card border border-border p-4">
        <h3 className="font-bold text-text-primary mb-3">{t('panel.whoToFollow')}</h3>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3 animate-pulse">
              <div className="w-10 h-10 rounded-full bg-bg-hover" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3.5 bg-bg-hover rounded w-24" />
                <div className="h-3 bg-bg-hover rounded w-16" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (users.length === 0) return null

  return (
    <div className="rounded-2xl bg-bg-card border border-border overflow-hidden">
      <h3 className="font-bold text-text-primary px-4 pt-4 pb-2 text-lg">{t('panel.whoToFollow')}</h3>

      {users.map((user) => (
        <div
          key={user.id}
          className="flex items-center gap-3 px-4 py-3 hover:bg-bg-hover transition-colors cursor-pointer"
          onClick={() => navigate(`/user/${user.id}`)}
        >
          <Avatar src={user.avatarUrl} username={user.username} size="md" />

          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-text-primary truncate">
              {user.username}
            </p>
            {user.bio ? (
              <p className="text-xs text-text-muted truncate">{user.bio}</p>
            ) : (
              user.followersCount > 0 && (
                <p className="text-xs text-text-muted">
                  {user.followersCount} {user.followersCount !== 1 ? t('follows.followers') : t('follows.follower')}
                </p>
              )
            )}
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation()
              if (!followingIds.has(user.id)) handleFollow(user.id)
            }}
            className={`text-sm font-bold px-4 py-1.5 rounded-full transition-all ${
              followingIds.has(user.id)
                ? 'bg-transparent border border-border text-text-secondary cursor-default'
                : 'bg-text-primary text-bg-primary hover:opacity-90'
            }`}
          >
            {followingIds.has(user.id) ? t('follows.followingButton') : t('follows.followButton')}
          </button>
        </div>
      ))}

      {users.length >= 5 && (
        <div className="px-4 py-3 text-accent text-sm">
          {t('panel.refreshForMore')}
        </div>
      )}
    </div>
  )
}
