import { NavLink } from 'react-router-dom'
import { Home, Bell, PenSquare, User, UserPlus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useBadges } from '../../hooks/useBadges'
import { useCompose } from '../../contexts/ComposeContext'

export default function MobileNav() {
  const { requestCount, unreadNotifs } = useBadges()
  const { openCompose } = useCompose()
  const { t } = useTranslation()

  const items = [
    { to: '/', icon: Home, badge: 0, label: t('nav.home') },
    { to: '/follow-requests', icon: UserPlus, badge: requestCount, label: t('nav.requests') },
    { action: openCompose, icon: PenSquare, badge: 0, label: t('nav.compose') },
    { to: '/notifications', icon: Bell, badge: unreadNotifs, label: t('nav.notifications') },
    { to: '/profile', icon: User, badge: 0, label: t('nav.profile') },
  ]

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-bg-primary/80 backdrop-blur-xl border-t border-border z-50">
      <div className="flex items-center justify-around py-3">
        {items.map(({ to, action, icon: Icon, badge, label }, idx) =>
          action ? (
            <button
              key={idx}
              onClick={action}
              aria-label={label}
              className="p-2 rounded-xl transition-all relative text-text-muted hover:text-text-secondary cursor-pointer"
            >
              <Icon size={24} />
            </button>
          ) : (
            <NavLink
              key={to}
              to={to}
              aria-label={label}
              className={({ isActive }) => `
                p-2 rounded-xl transition-all relative
                ${isActive ? 'text-text-primary' : 'text-text-muted hover:text-text-secondary'}
              `}
            >
              <Icon size={24} />
              {badge > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-[16px] flex items-center justify-center
                                 rounded-full bg-gradient-brand text-white text-[9px] font-bold px-0.5">
                  {badge > 99 ? '99+' : badge}
                </span>
              )}
            </NavLink>
          )
        )}
      </div>
    </nav>
  )
}