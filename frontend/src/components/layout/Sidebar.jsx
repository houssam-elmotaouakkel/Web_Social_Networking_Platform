import { NavLink, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Home, Bell, User, Settings, LogOut, PenSquare, UserPlus, Bookmark, Repeat2 } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useBadges } from '../../hooks/useBadges'
import { usePanel } from '../../contexts/PanelContext'
import { useCompose } from '../../contexts/ComposeContext'
import nexoraLogo from '../../assets/nexora-logo.png'
import nexoraIcon from '../../assets/nexora-icon.png'

export default function Sidebar() {
  const { t } = useTranslation()
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { requestCount, unreadNotifs } = useBadges()
  const { expanded, togglePanel } = usePanel()
  const { openCompose } = useCompose()

  const navItems = [
    { to: '/', icon: Home, label: t('nav.home') },
    { to: '/follow-requests', icon: UserPlus, label: t('nav.requests'), badge: requestCount },
    { to: '/notifications', icon: Bell, label: t('nav.notifications'), badge: unreadNotifs },
    { to: '/saved', icon: Bookmark, label: t('nav.saved') },
    { to: '/reposts', icon: Repeat2, label: t('nav.reposts') },
    { to: '/profile', icon: User, label: t('nav.profile') },
    { to: '/settings', icon: Settings, label: t('nav.settings') },
  ]

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="flex flex-col h-full w-full py-4 px-2 transition-all duration-300">
      {/* Logo — click to toggle sidebar expand/collapse */}
      <div className="mb-6 px-2">
        <button onClick={togglePanel} className="cursor-pointer w-full">
          {expanded ? (
            <img src={nexoraLogo} alt="Nexora" className="h-8 object-contain object-left" />
          ) : (
            <img src={nexoraIcon} alt="Nexora" className="h-9 w-9 rounded-lg object-contain mx-auto" />
          )}
        </button>
      </div>

      {/* Nav links */}
      <div className="flex-1 space-y-1">
        {navItems.map(({ to, icon: Icon, label, badge }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `
              flex items-center ${expanded ? 'gap-3 px-3' : 'justify-center px-0'} py-3 rounded-xl text-base
              transition-all duration-200
              ${isActive
                ? 'text-text-primary font-bold bg-bg-hover'
                : 'text-text-secondary hover:text-text-primary hover:bg-bg-hover'
              }
            `}
          >
            <span className="relative">
              <Icon size={24} />
              {badge > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-4.5 h-4.5 flex items-center justify-center
                                 rounded-full bg-gradient-brand text-white text-[10px] font-bold px-1">
                  {badge > 99 ? '99+' : badge}
                </span>
              )}
            </span>
            {expanded && <span>{label}</span>}
          </NavLink>
        ))}
      </div>

      {/* Post button */}
      {expanded ? (
        <button
          onClick={openCompose}
          className="mb-4 w-full rounded-xl bg-gradient-brand hover:bg-gradient-brand-hover text-white
                     font-bold py-3 cursor-pointer"
        >
          {t('nav.post')}
        </button>
      ) : (
        <button
          onClick={openCompose}
          className="mb-4 mx-auto rounded-full bg-gradient-brand hover:bg-gradient-brand-hover text-white
                     p-3 cursor-pointer flex items-center justify-center"
        >
          <PenSquare size={20} />
        </button>
      )}

      {/* User & Logout */}
      <div className="border-t border-border pt-3">
        <button
          onClick={handleLogout}
          className={`flex items-center ${expanded ? 'gap-3' : 'justify-center'} w-full px-3 py-3 rounded-xl
                     text-text-secondary hover:text-danger hover:bg-bg-hover cursor-pointer`}
        >
          <LogOut size={20} />
          {expanded && <span className="text-sm">{t('nav.logOut')}</span>}
        </button>
      </div>
    </nav>
  )
}