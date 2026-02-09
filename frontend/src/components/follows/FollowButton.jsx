import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { followsAPI } from '../../api/follows.api'
import { UserPlus, UserCheck, Clock, UserX } from 'lucide-react'
import toast from 'react-hot-toast'

/**
 * followStatus: null | 'ACCEPTED' | 'PENDING'
 * onStatusChange: (newStatus) => void
 */
export default function FollowButton({ userId, followStatus, onStatusChange }) {
  const { t } = useTranslation()
  const [status, setStatus] = useState(followStatus)
  const [loading, setLoading] = useState(false)

  // Sync internal state when the prop changes (e.g. navigating between profiles)
  useEffect(() => {
    setStatus(followStatus)
  }, [followStatus])

  const handleFollow = async () => {
    setLoading(true)
    try {
      const { data } = await followsAPI.follow(userId)
      setStatus(data.status)
      onStatusChange?.(data.status)
      toast.success(data.message)
    } catch (err) {
      toast.error(err.response?.data?.message || t('follows.failedToFollow'))
    } finally {
      setLoading(false)
    }
  }

  const handleUnfollow = async () => {
    setLoading(true)
    try {
      await followsAPI.unfollow(userId)
      setStatus(null)
      onStatusChange?.(null)
      toast.success(t('follows.unfollowButton'))
    } catch (err) {
      toast.error(err.response?.data?.message || t('follows.failedToFollow'))
    } finally {
      setLoading(false)
    }
  }

  if (status === 'ACCEPTED') {
    return (
      <button
        onClick={handleUnfollow}
        disabled={loading}
        className="group flex items-center gap-2 px-4 py-1.5 rounded-xl border border-border
                   text-sm font-semibold cursor-pointer transition-all
                   hover:border-danger hover:bg-danger/10 hover:text-danger
                   disabled:opacity-50"
      >
        <UserCheck size={16} className="group-hover:hidden" />
        <UserX size={16} className="hidden group-hover:block" />
        <span className="group-hover:hidden">{t('follows.followingButton')}</span>
        <span className="hidden group-hover:block">{t('follows.unfollowButton')}</span>
      </button>
    )
  }

  if (status === 'PENDING') {
    return (
      <button
        onClick={handleUnfollow}
        disabled={loading}
        className="flex items-center gap-2 px-4 py-1.5 rounded-xl border border-border
                   text-sm font-semibold text-text-secondary cursor-pointer
                   hover:border-danger hover:bg-danger/10 hover:text-danger
                   disabled:opacity-50"
      >
        <Clock size={16} />
        <span>{t('follows.requestedButton')}</span>
      </button>
    )
  }

  // Not following
  return (
    <button
      onClick={handleFollow}
      disabled={loading}
      className="flex items-center gap-2 px-4 py-1.5 rounded-xl
                 bg-text-primary text-bg-primary text-sm font-bold cursor-pointer
                 hover:bg-text-secondary disabled:opacity-50 transition-colors"
    >
      <UserPlus size={16} />
      <span>{t('follows.followButton')}</span>
    </button>
  )
}
