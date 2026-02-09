import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { usersAPI } from '../api/users.api'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import Avatar from '../components/ui/Avatar'
import toast from 'react-hot-toast'
import Toggle from '../components/ui/Toggle'
import ImageViewerModal from '../components/ui/ImageViewerModal'
import { Camera, Eye, Pencil } from 'lucide-react'
import { USERNAME_MIN_LENGTH, USERNAME_MAX_LENGTH, BIO_MAX_LENGTH } from '../utils/constants'
import { sanitizeMediaUrl } from '../utils/sanitizeUrl'

export default function EditProfilePage() {
  const { user, updateUser } = useAuth()
  const navigate = useNavigate()
  const { t } = useTranslation()

  useDocumentTitle('pageTitle.editProfile')

  const [form, setForm] = useState({
    username: user?.username || '',
    bio: user?.bio || '',
  })
  const [isPrivate, setIsPrivate] = useState(user?.isPrivate || false)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [savingPrivacy, setSavingPrivacy] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadingCover, setUploadingCover] = useState(false)
  const [viewerSrc, setViewerSrc] = useState(null)
  const [viewerAlt, setViewerAlt] = useState('')

  const avatarFileRef = useRef(null)
  const coverFileRef = useRef(null)

  const avatarSrc = sanitizeMediaUrl(user?.avatarUrl)
  const coverSrc = sanitizeMediaUrl(user?.coverUrl)

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    setErrors((prev) => ({ ...prev, [e.target.name]: '' }))
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setErrors({})
    try {
      const { data } = await usersAPI.updateMe({
        username: form.username.trim(),
        bio: form.bio.trim(),
      })
      updateUser(data.user)
      toast.success(t('profile.profileUpdatedToast'))
      navigate('/profile')
    } catch (err) {
      const msg = err.response?.data?.message || t('profile.updateFailed')
      const details = err.response?.data?.errors
      if (details) {
        const fieldErrors = {}
        details.forEach((d) => { fieldErrors[d.path] = d.message })
        setErrors(fieldErrors)
      } else {
        toast.error(msg)
      }
    } finally {
      setSaving(false)
    }
  }

  const handlePrivacyToggle = async () => {
    setSavingPrivacy(true)
    try {
      const newVal = !isPrivate
      const { data } = await usersAPI.updatePrivacy(newVal)
      setIsPrivate(newVal)
      updateUser(data.user)
      toast.success(newVal ? t('profile.accountSetToPrivate') : t('profile.accountSetToPublic'))
    } catch (err) {
      toast.error(err.response?.data?.message || t('profile.failedToUpdatePrivacy'))
    } finally {
      setSavingPrivacy(false)
    }
  }

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const { data } = await usersAPI.uploadAvatar(file)
      updateUser(data.user)
      toast.success(t('profile.avatarUpdatedToast'))
    } catch (err) {
      toast.error(err.response?.data?.message || t('profile.uploadFailed'))
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const handleCoverUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingCover(true)
    try {
      const { data } = await usersAPI.uploadCover(file)
      updateUser(data.user)
      toast.success(t('profile.coverUpdatedToast'))
    } catch (err) {
      toast.error(err.response?.data?.message || t('profile.uploadFailed'))
    } finally {
      setUploadingCover(false)
      e.target.value = ''
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="sticky top-0 z-10 bg-bg-primary/80 backdrop-blur-xl border-b border-border
                      flex items-center gap-4 px-4 py-3">
        <button
          onClick={() => navigate(-1)}
          aria-label={t('common.goBack')}
          className="p-1.5 rounded-full hover:bg-bg-hover cursor-pointer"
        >
          <ArrowLeft size={20} className="text-text-primary" />
        </button>
        <h2 className="text-xl font-bold text-text-primary">{t('profile.editProfileTitle')}</h2>
      </div>

      <div className="max-w-md mx-auto px-4 py-6 space-y-8">
        {/* Cover image section */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-text-secondary">{t('profile.coverLabel')}</label>
          <div className="relative group rounded-xl overflow-hidden border border-border">
            {coverSrc ? (
              <img
                src={coverSrc}
                alt={t('profile.coverAlt')}
                className="w-full h-32 object-cover"
              />
            ) : (
              <div className="w-full h-32 bg-linear-to-r from-bg-card to-bg-hover" />
            )}
            <div className="absolute inset-0 flex items-center justify-center gap-3
                            bg-black/0 group-hover:bg-black/40 transition-colors">
              {coverSrc && (
                <button
                  type="button"
                  onClick={() => { setViewerSrc(coverSrc); setViewerAlt(t('profile.coverAlt')) }}
                  className="p-2.5 rounded-full bg-black/60 hover:bg-black/80 text-white
                             opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  title={t('profile.viewPhoto')}
                >
                  <Eye size={18} />
                </button>
              )}
              <button
                type="button"
                onClick={() => coverFileRef.current?.click()}
                disabled={uploadingCover}
                className="p-2.5 rounded-full bg-black/60 hover:bg-black/80 text-white
                           opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                title={t('profile.changePhoto')}
              >
                <Pencil size={18} />
              </button>
            </div>
          </div>
          <input
            ref={coverFileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleCoverUpload}
            disabled={uploadingCover}
          />
          {uploadingCover && (
            <p className="text-xs text-text-muted text-center">{t('profile.uploading')}</p>
          )}
        </div>

        {/* Avatar section */}
        <div className="flex flex-col items-center gap-3">
          <div className="relative group">
            <Avatar src={user?.avatarUrl} username={user?.username} size="xl" />
            <div className="absolute inset-0 flex items-center justify-center gap-2 rounded-full
                            bg-black/0 group-hover:bg-black/40 transition-colors">
              {avatarSrc && (
                <button
                  type="button"
                  onClick={() => { setViewerSrc(avatarSrc); setViewerAlt(user?.username) }}
                  className="p-1.5 rounded-full bg-black/60 hover:bg-black/80 text-white
                             opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  title={t('profile.viewPhoto')}
                >
                  <Eye size={14} />
                </button>
              )}
              <button
                type="button"
                onClick={() => avatarFileRef.current?.click()}
                disabled={uploading}
                className="p-1.5 rounded-full bg-black/60 hover:bg-black/80 text-white
                           opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                title={t('profile.changePhoto')}
              >
                <Pencil size={14} />
              </button>
            </div>
          </div>
          <input
            ref={avatarFileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleAvatarUpload}
            disabled={uploading}
          />
          {uploading && (
            <p className="text-xs text-text-muted">{t('profile.uploading')}</p>
          )}
        </div>

        {/* Profile form */}
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label={t('profile.usernameLabel')}
            name="username"
            value={form.username}
            onChange={handleChange}
            error={errors.username}
            minLength={USERNAME_MIN_LENGTH}
            maxLength={USERNAME_MAX_LENGTH}
          />

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-text-secondary">{t('profile.bioLabel')}</label>
            <textarea
              name="bio"
              value={form.bio}
              onChange={handleChange}
              maxLength={BIO_MAX_LENGTH}
              rows={3}
              placeholder={t('profile.bioPlaceholder')}
              className="w-full rounded-xl border border-border bg-bg-input px-4 py-2.5
                         text-text-primary placeholder-text-muted resize-none
                         focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
            />
            <div className="text-right text-xs text-text-muted">
              {form.bio.length}/{BIO_MAX_LENGTH}
            </div>
          </div>

          <Button type="submit" fullWidth loading={saving}>
            {t('profile.saveButton')}
          </Button>
        </form>

        {/* Privacy section */}
        <div className="border-t border-border pt-6">
          <h3 className="text-base font-bold text-text-primary mb-2">{t('profile.privacySection')}</h3>
          <div className="flex items-center justify-between p-4 rounded-xl bg-bg-card border border-border">
            <div>
              <p className="text-sm font-medium text-text-primary">{t('profile.privateAccount')}</p>
              <p className="text-xs text-text-muted mt-0.5">
                {t('profile.privateAccountDescription')}
              </p>
            </div>
            <Toggle enabled={isPrivate} onChange={handlePrivacyToggle} disabled={savingPrivacy} />
          </div>
        </div>
      </div>

      {/* Image viewer modal */}
      <ImageViewerModal
        src={viewerSrc}
        alt={viewerAlt}
        isOpen={!!viewerSrc}
        onClose={() => setViewerSrc(null)}
      />

      {/* Mobile padding */}
      <div className="h-20 md:h-0" />
    </div>
  )
}
