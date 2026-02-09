import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft } from 'lucide-react'
import { followsAPI } from '../api/follows.api'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import UserListItem from '../components/follows/UserListItem'
import Spinner from '../components/ui/Spinner'

export default function FollowingPage() {
  const { userId } = useParams()
  const navigate = useNavigate()
  const { t } = useTranslation()

  useDocumentTitle('pageTitle.following')

  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [count, setCount] = useState(0)

  useEffect(() => {
    loadFollowing()
  }, [userId]) // eslint-disable-line react-hooks/exhaustive-deps

  const loadFollowing = async () => {
    setLoading(true)
    try {
      const { data } = await followsAPI.getFollowing(userId)
      setItems(data.items)
      setCount(data.count)
    } catch (err) {
      if (err.response?.status === 403) {
        navigate(`/user/${userId}`)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="sticky top-0 z-10 bg-bg-primary/80 backdrop-blur-xl border-b border-border
                      flex items-center gap-4 px-4 py-3">
        <button onClick={() => navigate(-1)} aria-label={t('common.goBack')} className="p-1.5 rounded-full hover:bg-bg-hover cursor-pointer">
          <ArrowLeft size={20} className="text-text-primary" />
        </button>
        <div>
          <h2 className="text-xl font-bold text-text-primary">{t('follows.followingTitle')}</h2>
          <p className="text-xs text-text-muted">{count} {t('follows.followingTitle')}</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Spinner size={28} /></div>
      ) : items.length === 0 ? (
        <p className="text-center text-text-muted py-12 text-sm">{t('follows.notFollowingAnyone')}</p>
      ) : (
        items.map((u) => <UserListItem key={u.id} user={u} />)
      )}

      <div className="h-20 md:h-0" />
    </div>
  )
}
