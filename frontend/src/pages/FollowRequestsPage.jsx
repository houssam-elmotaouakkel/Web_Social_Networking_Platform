import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, Check, X } from 'lucide-react'
import { followsAPI } from '../api/follows.api'
import { useBadges } from '../hooks/useBadges'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import Avatar from '../components/ui/Avatar'
import Spinner from '../components/ui/Spinner'
import toast from 'react-hot-toast'

export default function FollowRequestsPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { refreshBadges } = useBadges()

  useDocumentTitle('pageTitle.followRequests')

  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [acting, setActing] = useState({}) // { requestId: 'accepting' | 'rejecting' }

  const loadRequests = useCallback(async () => {
    try {
      const { data } = await followsAPI.getRequests()
      setRequests(data.requests || [])
    } catch {
      toast.error(t('notifications.failedToLoad'))
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => {
    loadRequests()
  }, [loadRequests])

  const handleAccept = async (requestId) => {
    setActing((prev) => ({ ...prev, [requestId]: 'accepting' }))
    try {
      await followsAPI.acceptRequest(requestId)
      setRequests((prev) => prev.filter((r) => r.requestId !== requestId))
      toast.success(t('follows.followRequestAccepted'))
      refreshBadges()
    } catch (err) {
      toast.error(err.response?.data?.message || t('follows.failedToAccept'))
    } finally {
      setActing((prev) => {
        const copy = { ...prev }
        delete copy[requestId]
        return copy
      })
    }
  }

  const handleReject = async (requestId) => {
    setActing((prev) => ({ ...prev, [requestId]: 'rejecting' }))
    try {
      await followsAPI.rejectRequest(requestId)
      setRequests((prev) => prev.filter((r) => r.requestId !== requestId))
      toast.success(t('follows.followRequestRejected'))
      refreshBadges()
    } catch (err) {
      toast.error(err.response?.data?.message || t('follows.failedToReject'))
    } finally {
      setActing((prev) => {
        const copy = { ...prev }
        delete copy[requestId]
        return copy
      })
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="sticky top-0 z-10 bg-bg-primary/80 backdrop-blur-xl border-b border-border
                      flex items-center gap-4 px-4 py-3">
        <button onClick={() => navigate(-1)} className="p-1.5 rounded-full hover:bg-bg-hover cursor-pointer">
          <ArrowLeft size={20} className="text-text-primary" />
        </button>
        <div>
          <h2 className="text-lg font-bold text-text-primary">{t('follows.followRequestsTitle')}</h2>
          {!loading && (
            <p className="text-xs text-text-muted">
              {t('follows.pendingRequestCount', { count: requests.length })}
            </p>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner size={28} />
        </div>
      ) : requests.length === 0 ? (
        <div className="text-center py-16 text-text-muted text-sm">
          {t('follows.noPendingRequests')}
        </div>
      ) : (
        <div>
          {requests.map((req) => {
            const user = req.follower
            const isActing = acting[req.requestId]
            return (
              <div
                key={req.requestId}
                className="flex items-center gap-3 px-4 py-3 border-b border-border
                           hover:bg-bg-hover transition-colors"
              >
                {/* User info */}
                <button
                  onClick={() => navigate(`/user/${req.followerId}`)}
                  className="cursor-pointer"
                >
                  <Avatar
                    src={user?.avatarUrl}
                    username={user?.username}
                    size="md"
                  />
                </button>
                <button
                  onClick={() => navigate(`/user/${req.followerId}`)}
                  className="flex-1 min-w-0 text-left cursor-pointer"
                >
                  <p className="text-sm font-semibold text-text-primary truncate">
                    {user?.username || t('common.loading')}
                  </p>
                  <p className="text-xs text-text-muted">
                    {t('follows.wantsToFollowYou')}
                  </p>
                </button>

                {/* Accept / Reject buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleAccept(req.requestId)}
                    disabled={!!isActing}
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl
                               bg-gradient-brand text-white text-sm font-semibold
                               hover:bg-gradient-brand-hover disabled:opacity-50 cursor-pointer transition-colors"
                  >
                    <Check size={16} />
                    <span className="hidden sm:inline">{t('follows.acceptButton')}</span>
                  </button>
                  <button
                    onClick={() => handleReject(req.requestId)}
                    disabled={!!isActing}
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl
                               border border-border text-text-secondary text-sm font-semibold
                               hover:border-danger hover:text-danger hover:bg-danger/10
                               disabled:opacity-50 cursor-pointer transition-colors"
                  >
                    <X size={16} />
                    <span className="hidden sm:inline">{t('follows.rejectButton')}</span>
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <div className="h-20 md:h-0" />
    </div>
  )
}
