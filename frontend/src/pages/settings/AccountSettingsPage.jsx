import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ChevronLeft, ChevronRight, Mail, AtSign, KeyRound, AlertTriangle, LogOut, Eye, EyeOff, Trash2 } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { authAPI } from '../../api/auth.api'
import { usersAPI } from '../../api/users.api'
import ReportProblemModal from '../../components/ui/ReportProblemModal'
import toast from 'react-hot-toast'

export default function AccountSettingsPage() {
  const { t, i18n } = useTranslation()
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const isRtl = i18n.dir() === 'rtl'

  const [reportOpen, setReportOpen] = useState(false)

  // Delete account state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deletePassword, setDeletePassword] = useState('')
  const [deleting, setDeleting] = useState(false)

  // Change password state
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [saving, setSaving] = useState(false)
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const BackChevron = isRtl ? ChevronRight : ChevronLeft

  const handleChangePassword = async (e) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      toast.error(t('settings.passwordsDoNotMatch'))
      return
    }
    setSaving(true)
    try {
      await authAPI.changePassword({ currentPassword, newPassword })
      toast.success(t('settings.passwordChanged'))
      setShowPasswordForm(false)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      const msg = err.response?.data?.message || t('settings.passwordChangeFailed')
      toast.error(msg)
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handleDeleteAccount = async () => {
    if (!deletePassword) return
    setDeleting(true)
    try {
      // Verify password first by attempting a login
      await authAPI.login({ email: user.email, password: deletePassword })
      // Password correct — proceed with deletion
      await usersAPI.deleteMe()
      toast.success(t('settings.deleteAccountSuccess'))
      logout()
      navigate('/login')
    } catch (err) {
      const msg = err.response?.data?.message || t('settings.deleteAccountFailed')
      toast.error(msg)
    } finally {
      setDeleting(false)
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
        <h2 className="text-xl font-bold text-text-primary">{t('settings.categoryAccount')}</h2>
      </div>

      {/* Account info */}
      <section className="px-4 py-4">
        <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-3">
          {t('settings.accountInfo')}
        </h3>
        <div className="space-y-1">
          <div className="flex items-center gap-3 py-3 px-3 rounded-xl">
            <AtSign size={18} className="text-text-muted shrink-0" />
            <div className="min-w-0">
              <p className="text-xs text-text-muted">{t('settings.usernameLabel')}</p>
              <p className="text-sm font-medium text-text-primary">{user?.username}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 py-3 px-3 rounded-xl">
            <Mail size={18} className="text-text-muted shrink-0" />
            <div className="min-w-0">
              <p className="text-xs text-text-muted">{t('settings.emailLabel')}</p>
              <p className="text-sm font-medium text-text-primary">{user?.email}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Change password */}
      <section className="px-4 py-4 border-t border-border">
        <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-3">
          {t('settings.changePassword')}
        </h3>

        {!showPasswordForm ? (
          <button
            onClick={() => setShowPasswordForm(true)}
            className="flex items-center gap-3 py-3 px-3 rounded-xl hover:bg-bg-hover transition-colors cursor-pointer w-full"
          >
            <KeyRound size={18} className="text-text-muted" />
            <span className="text-sm font-medium text-text-primary">{t('settings.changePassword')}</span>
          </button>
        ) : (
          <form onSubmit={handleChangePassword} className="space-y-3 px-1">
            {/* Current password */}
            <div className="relative">
              <input
                type={showCurrent ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder={t('settings.currentPasswordPlaceholder')}
                className="w-full bg-bg-input border border-border rounded-xl py-2.5 px-3 pe-10 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent"
                required
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute end-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary cursor-pointer"
              >
                {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* New password */}
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder={t('settings.newPasswordPlaceholder')}
                className="w-full bg-bg-input border border-border rounded-xl py-2.5 px-3 pe-10 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent"
                required
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute end-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary cursor-pointer"
              >
                {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* Confirm password */}
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder={t('settings.confirmPasswordPlaceholder')}
                className="w-full bg-bg-input border border-border rounded-xl py-2.5 px-3 pe-10 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent"
                required
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute end-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary cursor-pointer"
              >
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setShowPasswordForm(false)
                  setCurrentPassword('')
                  setNewPassword('')
                  setConfirmPassword('')
                }}
                className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium text-text-secondary hover:bg-bg-hover transition-colors cursor-pointer"
              >
                {t('settings.cancelButton')}
              </button>
              <button
                type="submit"
                disabled={saving || !currentPassword || !newPassword || !confirmPassword}
                className="flex-1 py-2.5 rounded-xl bg-gradient-brand text-white text-sm font-medium hover:bg-gradient-brand-hover transition-colors disabled:opacity-50 cursor-pointer"
              >
                {saving ? t('common.loading') : t('settings.savePasswordButton')}
              </button>
            </div>
          </form>
        )}
      </section>

      {/* Report a problem */}
      <section className="px-4 py-4 border-t border-border">
        <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-3">
          {t('settings.reportSection')}
        </h3>
        <button
          onClick={() => setReportOpen(true)}
          className="w-full flex items-center gap-3 py-3 px-3 rounded-xl hover:bg-bg-hover transition-colors cursor-pointer"
        >
          <AlertTriangle size={18} className="text-text-muted" />
          <div className="text-start flex-1 min-w-0">
            <p className="text-sm font-medium text-text-primary">{t('report.title')}</p>
            <p className="text-xs text-text-muted">{t('report.settingsDesc')}</p>
          </div>
        </button>
      </section>

      {/* Log out */}
      <section className="px-4 py-4 border-t border-border">
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 py-3 px-3 rounded-xl text-danger hover:bg-danger/10 transition-colors cursor-pointer"
        >
          <LogOut size={18} />
          <span className="text-sm font-medium">{t('settings.logOut')}</span>
        </button>
      </section>

      {/* Delete account */}
      <section className="px-4 py-4 border-t border-border">
        <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-3">
          {t('settings.deleteAccountSection')}
        </h3>
        {!showDeleteConfirm ? (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="w-full flex items-center gap-3 py-3 px-3 rounded-xl hover:bg-danger/10 transition-colors cursor-pointer"
          >
            <Trash2 size={18} className="text-danger" />
            <div className="text-start flex-1 min-w-0">
              <p className="text-sm font-medium text-danger">{t('settings.deleteAccountTitle')}</p>
              <p className="text-xs text-text-muted">{t('settings.deleteAccountDesc')}</p>
            </div>
          </button>
        ) : (
          <div className="px-1 space-y-3">
            <div className="p-3 rounded-xl bg-danger/10 border border-danger/20">
              <p className="text-sm font-semibold text-danger">{t('settings.deleteAccountConfirmTitle')}</p>
              <p className="text-xs text-text-muted mt-1">{t('settings.deleteAccountConfirmDesc')}</p>
            </div>
            <input
              type="password"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              placeholder={t('settings.deleteAccountPasswordPlaceholder')}
              className="w-full bg-bg-input border border-border rounded-xl py-2.5 px-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-danger"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteConfirm(false)
                  setDeletePassword('')
                }}
                className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium text-text-secondary hover:bg-bg-hover transition-colors cursor-pointer"
              >
                {t('settings.cancelButton')}
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={deleting || !deletePassword}
                className="flex-1 py-2.5 rounded-xl bg-danger text-white text-sm font-medium hover:bg-danger/90 transition-colors disabled:opacity-50 cursor-pointer"
              >
                {deleting ? t('common.loading') : t('settings.deleteAccountConfirmButton')}
              </button>
            </div>
          </div>
        )}
      </section>

      <div className="h-20 md:h-0" />

      <ReportProblemModal isOpen={reportOpen} onClose={() => setReportOpen(false)} />
    </div>
  )
}
