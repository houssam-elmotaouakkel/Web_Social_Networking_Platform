import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../contexts/AuthContext'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import GridBackground from '../components/ui/GridBackground'
import toast from 'react-hot-toast'
import nexoraLogo from '../assets/nexora-icon.png'

export default function RegisterPage() {
  const { t } = useTranslation()
  const { register } = useAuth()
  const navigate = useNavigate()

  useDocumentTitle('pageTitle.register')

  const [form, setForm] = useState({ username: '', email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    setErrors((prev) => ({ ...prev, [e.target.name]: '' }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErrors({})

    try {
      await register(form)
      toast.success(t('auth.accountCreatedToast'))
      navigate('/')
    } catch (err) {
      const msg = err.response?.data?.message || t('auth.registrationFailed')
      const details = err.response?.data?.errors
      if (details) {
        const fieldErrors = {}
        details.forEach((d) => { fieldErrors[d.path] = d.message })
        setErrors(fieldErrors)
      } else {
        toast.error(msg)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative">
      <GridBackground />

      {/* Card */}
      <div className="relative z-10 w-full max-w-sm bg-bg-card/80 backdrop-blur-xl
                      border border-border rounded-2xl p-8 shadow-2xl shadow-accent/5">
        {/* Logo */}
        <div className="text-center mb-8">
          <img src={nexoraLogo} alt="Nexora" className="h-12 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gradient-brand tracking-wide uppercase">{t('auth.signUpTitle')}</h1>
          <p className="text-text-secondary mt-2 text-sm">{t('auth.joinCommunity')}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            name="username"
            type="text"
            placeholder={t('auth.usernamePlaceholder')}
            value={form.username}
            onChange={handleChange}
            error={errors.username}
            autoComplete="username"
          />
          <Input
            name="email"
            type="email"
            placeholder={t('auth.emailPlaceholder')}
            value={form.email}
            onChange={handleChange}
            error={errors.email}
            autoComplete="email"
          />
          <Input
            name="password"
            type="password"
            placeholder={t('auth.passwordMinPlaceholder')}
            value={form.password}
            onChange={handleChange}
            error={errors.password}
            autoComplete="new-password"
          />
          <Button type="submit" fullWidth loading={loading}>
            {t('auth.signUpButton')}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <span className="text-text-muted text-sm">{t('auth.alreadyHaveAccount')} </span>
          <Link to="/login" className="text-sm font-semibold">
            {t('auth.logInButton')}
          </Link>
        </div>
      </div>
    </div>
  )
}