import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ChevronLeft, ChevronRight, UserPlus, UserCheck, MessageCircle, Heart } from 'lucide-react'
import { settingsAPI } from '../../api/settings.api'
import Toggle from '../../components/ui/Toggle'
import Spinner from '../../components/ui/Spinner'
import toast from 'react-hot-toast'

const NOTIF_OPTIONS = [
  { key: 'followRequest', labelKey: 'settings.followRequestsLabel', descKey: 'settings.followRequestsDesc', icon: UserPlus },
  { key: 'followAccepted', labelKey: 'settings.followAcceptedLabel', descKey: 'settings.followAcceptedDesc', icon: UserCheck },
  { key: 'reply', labelKey: 'settings.repliesLabel', descKey: 'settings.repliesDesc', icon: MessageCircle },
  { key: 'likeThread', labelKey: 'settings.threadLikesLabel', descKey: 'settings.threadLikesDesc', icon: Heart },
  { key: 'likeReply', labelKey: 'settings.replyLikesLabel', descKey: 'settings.replyLikesDesc', icon: Heart },
]

export default function NotificationSettingsPage() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const isRtl = i18n.dir() === 'rtl'

  const [prefs, setPrefs] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const BackChevron = isRtl ? ChevronRight : ChevronLeft

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await settingsAPI.getMe()
        setPrefs(data.notificationsPrefs)
      } catch {
        toast.error(t('settings.failedToLoadSettings'))
      } finally {
        setLoading(false)
      }
    }
    load()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleToggle = async (key, value) => {
    const prev = { ...prefs }
    setPrefs((p) => ({ ...p, [key]: value }))
    setSaving(true)
    try {
      await settingsAPI.updateMe({ notificationsPrefs: { [key]: value } })
    } catch {
      setPrefs(prev)
      toast.error(t('settings.failedToUpdateSetting'))
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size={28} />
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="sticky top-0 z-10 bg-bg-primary/80 backdrop-blur-xl border-b border-border px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => navigate('/settings')}
          className="md:hidden p-1 -ms-1 rounded-full hover:bg-bg-hover transition-colors cursor-pointer"
        >
          <BackChevron size={20} className="text-text-primary" />
        </button>
        <h2 className="text-xl font-bold text-text-primary">{t('settings.categoryNotifications')}</h2>
      </div>

      {/* Notification preferences */}
      <section className="px-4 py-4">
        <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-1">
          {t('settings.notificationPreferences')}
        </h3>
        <p className="text-xs text-text-muted mb-4">
          {t('settings.chooseNotifications')}
        </p>

        <div className="space-y-1">
          {NOTIF_OPTIONS.map(({ key, labelKey, descKey, icon: Icon }) => (
            <div
              key={key}
              className="flex items-center justify-between py-3 px-3 rounded-xl hover:bg-bg-hover transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <Icon size={18} className="text-text-muted shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-text-primary">{t(labelKey)}</p>
                  <p className="text-xs text-text-muted">{t(descKey)}</p>
                </div>
              </div>
              <Toggle
                enabled={prefs?.[key] ?? true}
                onChange={(val) => handleToggle(key, val)}
                disabled={saving}
              />
            </div>
          ))}
        </div>
      </section>

      <div className="h-20 md:h-0" />
    </div>
  )
}
