import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { usersAPI } from '../api/users.api'
import { followsAPI } from '../api/follows.api'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import ProfileHeader from '../components/profile/ProfileHeader'
import FeedItem from '../components/feed/FeedItem'
import Spinner from '../components/ui/Spinner'
import toast from 'react-hot-toast'

export default function ProfilePage() {
  const { userId } = useParams()
  const { user: me, updateUser } = useAuth()
  const navigate = useNavigate()
  const { t } = useTranslation()

  // If no userId param, show own profile
  const targetId = userId || me?.id

  const [profile, setProfile] = useState(null)
  const [access, setAccess] = useState(null)
  const [followStatus, setFollowStatus] = useState(null)
  const [threads, setThreads] = useState([])
  const [loading, setLoading] = useState(true)

  const isOwn = targetId === me?.id

  useDocumentTitle('pageTitle.profile')

  const loadProfile = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await usersAPI.getProfile(targetId)
      setProfile(data.profile)
      setAccess(data.access)

      // Check follow status via dedicated endpoint (no 403 risk)
      if (!isOwn) {
        try {
          const { data: statusData } = await followsAPI.getStatus(targetId)
          setFollowStatus(statusData.status === 'NONE' ? null : statusData.status)
        } catch {
          setFollowStatus(null)
        }
      }

      // Load user's threads if full access
      if (data.access === 'FULL') {
        try {
          const { data: threadsData } = await usersAPI.getThreads(targetId)
          setThreads(threadsData.threads || [])
        } catch {
          setThreads([])
        }
      }
    } catch (err) {
      if (err.response?.status === 404) {
        toast.error(t('profile.userNotFound'))
        navigate('/')
      }
    } finally {
      setLoading(false)
    }
  }, [targetId, isOwn, me?.id, navigate, t])

  useEffect(() => {
    if (targetId) loadProfile()
  }, [targetId, loadProfile])

  const handleAvatarChange = async (file) => {
    try {
      const { data } = await usersAPI.uploadAvatar(file)
      updateUser(data.user)
      setProfile((prev) => ({ ...prev, avatarUrl: data.user.avatarUrl }))
      toast.success(t('profile.avatarUpdatedToast'))
    } catch (err) {
      toast.error(err.response?.data?.message || t('profile.uploadFailed'))
    }
  }

  const handleCoverChange = async (file) => {
    try {
      const { data } = await usersAPI.uploadCover(file)
      updateUser(data.user)
      setProfile((prev) => ({ ...prev, coverUrl: data.user.coverUrl }))
      toast.success(t('profile.coverUpdatedToast'))
    } catch (err) {
      toast.error(err.response?.data?.message || t('profile.uploadFailed'))
    }
  }

  const handleFollowChange = (newStatus) => {
    const prevStatus = followStatus
    setFollowStatus(newStatus)
    // Only adjust count based on transitions from/to ACCEPTED
    setProfile((prev) => {
      if (!prev || prev.followersCount == null) return prev
      let delta = 0
      if (newStatus === 'ACCEPTED' && prevStatus !== 'ACCEPTED') delta = 1
      else if (newStatus !== 'ACCEPTED' && prevStatus === 'ACCEPTED') delta = -1
      return { ...prev, followersCount: Math.max(0, prev.followersCount + delta) }
    })
  }

  const handleDeleteThread = (threadId) => {
    setThreads((prev) => prev.filter((t) => t.id !== threadId))
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size={28} />
      </div>
    )
  }

  if (!profile) return null

  const threadAuthor = {
    username: profile.username,
    avatarUrl: profile.avatarUrl,
  }

  return (
    <div>
      {/* Header — show back button if viewing someone else */}
      {!isOwn && (
        <div className="sticky top-0 z-10 bg-bg-primary/80 backdrop-blur-xl border-b border-border
                        flex items-center gap-4 px-4 py-3">
          <button onClick={() => navigate(-1)} className="p-1.5 rounded-full hover:bg-bg-hover cursor-pointer" aria-label={t('common.goBack')}>
            <ArrowLeft size={20} className="text-text-primary" />
          </button>
          <div>
            <h2 className="text-lg font-bold text-text-primary">{profile.username}</h2>
            {access === 'FULL' && (
              <p className="text-xs text-text-muted">{profile.threadsCount ?? 0} {t('profile.threads')}</p>
            )}
          </div>
        </div>
      )}

      <ProfileHeader
        profile={profile}
        access={access}
        followStatus={followStatus}
        onFollowChange={handleFollowChange}
        onAvatarChange={handleAvatarChange}
        onCoverChange={handleCoverChange}
      />

      {/* User's threads */}
      {access === 'FULL' && (
        <>
          {threads.length === 0 ? (
            <div className="text-center py-12 text-text-muted text-sm">
              {isOwn ? t('profile.noThreadsOwn') : t('profile.noThreadsOther')}
            </div>
          ) : (
            threads.map((thread) => (
              <FeedItem
                key={thread.id}
                thread={thread}
                author={threadAuthor}
                onDelete={handleDeleteThread}
              />
            ))
          )}
        </>
      )}

      {/* Mobile padding */}
      <div className="h-20 md:h-0" />
    </div>
  )
}