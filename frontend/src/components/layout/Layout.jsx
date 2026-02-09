import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import MobileNav from './MobileNav'
import BadgeProvider from '../../contexts/BadgeContext'
import RightPanel from '../panel/RightPanel'
import { PanelProvider, usePanel } from '../../contexts/PanelContext'
import { ComposeProvider, useCompose } from '../../contexts/ComposeContext'
import ComposeModal from '../threads/ComposeModal'

function LayoutInner() {
  const { expanded, collapsePanel } = usePanel()
  const { isOpen, closeCompose, onCreated } = useCompose()
  const { pathname } = useLocation()
  const showRightPanel = pathname === '/'

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Desktop: 3-column layout like Threads/X */}
      <div className="max-w-7xl mx-auto flex">
        {/* Left sidebar — expandable */}
        <aside
          className={`hidden md:flex shrink-0 sticky top-0 h-screen transition-all duration-300 ease-in-out ${
            expanded ? 'w-60' : 'w-17'
          }`}
          onMouseLeave={() => expanded && collapsePanel()}
        >
          <Sidebar />
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0 border-x border-border min-h-screen">
          <Outlet />
        </main>

        {/* Right panel — only on home feed */}
        {showRightPanel && (
          <aside className="hidden lg:block w-87.5 shrink-0 sticky top-0 h-screen overflow-y-auto scrollbar-none px-4">
            <RightPanel />
          </aside>
        )}
      </div>

      {/* Mobile bottom navigation */}
      <MobileNav />

      {/* Compose modal */}
      <ComposeModal isOpen={isOpen} onClose={closeCompose} onCreated={onCreated} />
    </div>
  )
}

export default function Layout() {
  return (
    <BadgeProvider>
      <ComposeProvider>
      <PanelProvider>
        <LayoutInner />
      </PanelProvider>
      </ComposeProvider>
    </BadgeProvider>
  )
}