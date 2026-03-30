import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Briefcase, GraduationCap, Target,
  FileText, Calendar, BookOpen
} from 'lucide-react'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Home' },
  { to: '/candidatures', icon: Briefcase, label: 'Alternance' },
  { to: '/bourses', icon: GraduationCap, label: 'Bourses' },
  { to: '/objectives', icon: Target, label: 'Objectifs' },
  { to: '/agenda', icon: Calendar, label: 'Agenda' },
]

export function BottomNav() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-surface-200/80 px-2 pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-around">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 py-2 px-3 text-xs font-medium transition-colors ${
                isActive ? 'text-primary-600' : 'text-surface-400'
              }`
            }
          >
            <Icon size={22} />
            <span>{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
