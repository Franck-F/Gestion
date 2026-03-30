import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar.jsx'
import { BottomNav } from './BottomNav.jsx'
import { Header } from './Header.jsx'

export function AppLayout() {
  return (
    <div className="flex min-h-dvh w-full bg-surface-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 px-4 md:px-8 py-6 pb-24 md:pb-6 max-w-6xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
      <BottomNav />
    </div>
  )
}
