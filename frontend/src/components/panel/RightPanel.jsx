import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import SearchBar from './SearchBar'
import TrendingThreads from './TrendingThreads'
import WhoToFollow from './WhoToFollow'

export default function RightPanel() {
  const { t } = useTranslation()
  return (
    <div className="space-y-4 py-4">
      <SearchBar />
      <TrendingThreads />
      <WhoToFollow />

      {/* Footer links like X */}
      <nav className="px-4 text-xs text-text-muted flex flex-wrap gap-x-3 gap-y-1">
        <Link to="/terms" className="hover:underline">{t('panel.termsOfService')}</Link>
        <Link to="/privacy" className="hover:underline">{t('panel.privacyPolicy')}</Link>
        <Link to="/cookies" className="hover:underline">{t('panel.cookiePolicy')}</Link>
        <Link to="/accessibility" className="hover:underline">{t('panel.accessibility')}</Link>
        <span>&copy; {new Date().getFullYear()} Nexora</span>
      </nav>
    </div>
  )
}
