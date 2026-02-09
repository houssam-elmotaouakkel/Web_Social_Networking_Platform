import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { User, Shield, Bell, Palette, Archive, ChevronLeft, ChevronRight } from 'lucide-react'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'

const CATEGORIES = [
  { to: '/settings/account', icon: User, labelKey: 'settings.categoryAccount' },
  { to: '/settings/privacy', icon: Shield, labelKey: 'settings.categoryPrivacy' },
  { to: '/settings/notifications', icon: Bell, labelKey: 'settings.categoryNotifications' },
  { to: '/settings/display', icon: Palette, labelKey: 'settings.categoryDisplay' },
  { to: '/settings/archived', icon: Archive, labelKey: 'settings.categoryArchived' },
]

export default function SettingsLayout() {
  const { t, i18n } = useTranslation()
  const location = useLocation()
  const isRtl = i18n.dir() === 'rtl'

  useDocumentTitle('pageTitle.settings')

  // On exact /settings, show only the sidebar (mobile) or sidebar+placeholder (desktop)
  const isIndex = location.pathname === '/settings'
  // On a sub-page, show the content panel
  const isSubPage = !isIndex

  const Chevron = isRtl ? ChevronLeft : ChevronRight

  return (
    <div className="flex min-h-screen">
      {/* Sidebar — always visible on desktop, hidden on mobile when sub-page active */}
      <div className={`${isSubPage ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-80 md:min-w-80 md:border-e border-border`}>
        {/* Header */}
        <div className="sticky top-0 z-10 bg-bg-primary/80 backdrop-blur-xl border-b border-border px-4 py-3">
          <h2 className="text-xl font-bold text-text-primary">{t('settings.settingsTitle')}</h2>
        </div>

        {/* Category list */}
        <nav className="flex-1 py-1">
          {CATEGORIES.map(({ to, icon: Icon, labelKey }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3.5 transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-bg-hover border-e-2 border-accent'
                    : 'hover:bg-bg-hover'
                }`
              }
            >
              <Icon size={20} className="text-text-secondary shrink-0" />
              <span className="text-[15px] font-medium text-text-primary flex-1">
                {t(labelKey)}
              </span>
              <Chevron size={18} className="text-text-muted" />
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Content panel — always visible on desktop, shown on mobile only when sub-page active */}
      <div className={`${isIndex ? 'hidden md:flex' : 'flex'} flex-col flex-1 min-w-0`}>
        {isIndex ? (
          // Desktop placeholder when no category selected
          <div className="flex-1 flex items-center justify-center">
            <p className="text-text-muted text-sm">{t('settings.selectCategory')}</p>
          </div>
        ) : (
          <Outlet />
        )}
      </div>
    </div>
  )
}
