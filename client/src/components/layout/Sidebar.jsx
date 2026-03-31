import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Briefcase, GraduationCap, Target,
  FileText, Calendar, BookOpen, Settings, LogOut, Bot
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext.jsx'
import { NotificationBell } from './NotificationBell.jsx'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/candidatures', icon: Briefcase, label: 'Alternance' },
  { to: '/bourses', icon: GraduationCap, label: 'Bourses' },
  { to: '/objectives', icon: Target, label: 'Objectifs' },
  { to: '/documents', icon: FileText, label: 'Documents' },
  { to: '/agenda', icon: Calendar, label: 'Agenda' },
  { to: '/journal', icon: BookOpen, label: 'Journal' },
  { to: '/chat', icon: Bot, label: 'Assistant IA' },
]

export function Sidebar() {
  const { user, logout } = useAuth()

  return (
    <aside className="hidden md:flex flex-col w-64 bg-white border-r border-surface-200/80 h-dvh sticky top-0">
      <div className="px-6 py-5 border-b border-surface-100">
        <h1 className="text-xl font-bold font-heading text-primary-700 tracking-tight">MyCheckList</h1>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-surface-600 hover:bg-surface-50 hover:text-surface-800'
              }`
            }
          >
            <Icon size={20} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-surface-100 space-y-1">
        <div className="flex items-center justify-between px-3 py-2">
          <span className="text-sm font-medium text-surface-600">Notifications</span>
          <NotificationBell />
        </div>
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              isActive ? 'bg-primary-50 text-primary-700' : 'text-surface-600 hover:bg-surface-50'
            }`
          }
        >
          <Settings size={20} />
          Paramètres
        </NavLink>

        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-surface-500 hover:bg-danger-50 hover:text-danger-600 transition-colors cursor-pointer"
        >
          <LogOut size={20} />
          Déconnexion
        </button>

        <div className="px-3 pt-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-sm font-semibold text-primary-700">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-surface-800 truncate">{user?.firstName} {user?.lastName}</p>
              <p className="text-xs text-surface-400 truncate">{user?.email}</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}
