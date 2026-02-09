import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ChevronLeft, ChevronRight, Lock, Globe, Users, EyeOff, Check } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { usersAPI } from '../../api/users.api'
import { settingsAPI } from '../../api/settings.api'
import Toggle from '../../components/ui/Toggle'
import toast from 'react-hot-toast'

const VISIBILITY_OPTIONS = [
  { value: 'PUBLIC', icon: Globe, labelKey: 'thread.everyone', descKey: 'settings.visibilityEveryoneDesc' },
  { value: 'FOLLOWERS', icon: Users, labelKey: 'thread.followersOnly', descKey: 'settings.visibilityFollowersDesc' },
  { value: 'PRIVATE', icon: EyeOff, labelKey: 'thread.onlyMe', descKey: 'settings.visibilityPrivateDesc' },
]

export default function PrivacySettingsPage() {
  const { t, i18n } = useTranslation()
  const { user, updateUser } = useAuth()
  const navigate = useNavigate()
  const isRtl = i18n.dir() === 'rtl'

  const [isPrivate, setIsPrivate] = useState(user?.isPrivate ?? false)
  const [defaultVis, setDefaultVis] = useState(user?.defaultVisibility || 'PUBLIC')
  const [saving, setSaving] = useState(false)
  const [savingVis, setSavingVis] = useState(false)

  const BackChevron = isRtl ? ChevronRight : ChevronLeft

  const handleTogglePrivacy = async (value) => {
    const prev = isPrivate
    setIsPrivate(value)
    setSaving(true)
    try {
      await usersAPI.updatePrivacy(value)
      updateUser({ isPrivate: value })
      toast.success(value ? t('profile.accountSetToPrivate') : t('profile.accountSetToPublic'))
    } catch {
      setIsPrivate(prev)
      toast.error(t('profile.failedToUpdatePrivacy'))
    } finally {
      setSaving(false)
    }
  }

  const handleVisibilityChange = async (value) => {
    if (value === defaultVis || savingVis) return
    const prev = defaultVis
    setDefaultVis(value)
    setSavingVis(true)
    try {
      await settingsAPI.updateMe({ defaultVisibility: value })
      updateUser({ defaultVisibility: value })
      toast.success(t('settings.defaultVisibilityUpdated'))
    } catch {
      setDefaultVis(prev)
      toast.error(t('settings.failedToUpdateSetting'))
    } finally {
      setSavingVis(false)
    }
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
        <h2 className="text-xl font-bold text-text-primary">{t('settings.categoryPrivacy')}</h2>
      </div>

      {/* Private account */}
      <section className="px-4 py-4">
        <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-3">
          {t('settings.privacySection')}
        </h3>
        <div className="flex items-center justify-between py-3 px-3 rounded-xl hover:bg-bg-hover transition-colors">
          <div className="flex items-center gap-3 min-w-0">
            <Lock size={18} className="text-text-muted shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-medium text-text-primary">{t('profile.privateAccount')}</p>
              <p className="text-xs text-text-muted">{t('profile.privateAccountDescription')}</p>
            </div>
          </div>
          <Toggle
            enabled={isPrivate}
            onChange={handleTogglePrivacy}
            disabled={saving}
          />
        </div>
      </section>

      {/* Default thread visibility */}
      <section className="px-4 py-4 border-t border-border">
        <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-3">
          {t('settings.threadVisibilityTitle')}
        </h3>
        <div className="space-y-1">
          {VISIBILITY_OPTIONS.map(({ value, icon: Icon, labelKey, descKey }) => {
            const selected = defaultVis === value
            return (
              <button
                key={value}
                onClick={() => handleVisibilityChange(value)}
                disabled={savingVis}
                className={`flex items-center gap-3 w-full px-3 py-3 rounded-xl transition-colors
                           cursor-pointer disabled:opacity-60 ${
                  selected ? 'bg-bg-hover' : 'hover:bg-bg-hover/50'
                }`}
              >
                <Icon size={18} className={selected ? 'text-accent' : 'text-text-muted'} />
                <div className="flex-1 min-w-0 text-start">
                  <p className={`text-sm font-medium ${selected ? 'text-accent' : 'text-text-primary'}`}>
                    {t(labelKey)}
                  </p>
                  <p className="text-xs text-text-muted">{t(descKey)}</p>
                </div>
                {selected && <Check size={18} className="text-accent shrink-0" />}
              </button>
            )
          })}
        </div>
      </section>

      <div className="h-20 md:h-0" />
    </div>
  )
}
