import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Briefcase, GraduationCap, Target, Calendar
} from 'lucide-react'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Home' },
  { to: '/candidatures', icon: Briefcase, label: 'Candidat.' },
  { to: '/bourses', icon: GraduationCap, label: 'Bourses' },
  { to: '/objectives', icon: Target, label: 'Objectifs' },
  { to: '/agenda', icon: Calendar, label: 'Agenda' },
]

export function BottomNav() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-surface-200">
      <div className="flex items-stretch h-14 max-w-md mx-auto" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center justify-center gap-0.5 min-w-0 ${
                isActive ? 'text-primary-600' : 'text-surface-400'
              }`
            }
          >
            <Icon size={18} strokeWidth={2} />
            <span className="text-[10px] leading-tight font-medium truncate max-w-full px-0.5">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
