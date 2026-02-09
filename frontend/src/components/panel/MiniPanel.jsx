import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Search, Bell, Settings, TrendingUp } from 'lucide-react'
import { useBadges } from '../../hooks/useBadges'
import { usePanel } from '../../contexts/PanelContext'

export default function MiniPanel() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { unreadNotifs } = useBadges()
  const { expandPanel } = usePanel()

  const items = [
    {
      icon: Search,
      label: t('panel.searchPlaceholder'),
      onClick: expandPanel,
    },
    {
      icon: TrendingUp,
      label: t('panel.trendingTitle'),
      onClick: expandPanel,
    },
    {
      icon: Bell,
      label: t('nav.notifications'),
      badge: unreadNotifs,
      onClick: () => navigate('/notifications'),
    },
    {
      icon: Settings,
      label: t('nav.settings'),
      onClick: () => navigate('/settings'),
    },
  ]

  return (
    <div className="flex flex-col items-center py-6 gap-2">
      {items.map(({ icon: Icon, label, badge, onClick }) => (
        <button
          key={label}
          onClick={onClick}
          className="relative p-3 rounded-xl text-text-secondary hover:text-text-primary
                     hover:bg-bg-hover transition-all cursor-pointer group"
          title={label}
          aria-label={label}
        >
          <Icon size={22} />
          {badge > 0 && (
            <span className="absolute top-1.5 right-1.5 min-w-4.5 h-4.5 flex items-center justify-center
                             rounded-full bg-gradient-brand text-white text-[10px] font-bold px-1">
              {badge > 99 ? '99+' : badge}
            </span>
          )}
        </button>
      ))}
    </div>
  )
}
