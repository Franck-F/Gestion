import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Menu, Settings, LogOut, BookOpen, FileText } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext.jsx'

export function Header() {
  const { user, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="md:hidden sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-surface-200/80 px-4 py-3">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold font-heading text-primary-700">Gestion</h1>
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 rounded-lg hover:bg-surface-100 transition-colors cursor-pointer"
          >
            <Menu size={22} className="text-surface-600" />
          </button>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg border border-surface-200 py-2 z-20">
                <div className="px-4 py-2 border-b border-surface-100 mb-1">
                  <p className="text-sm font-medium text-surface-800">{user?.firstName} {user?.lastName}</p>
                  <p className="text-xs text-surface-400">{user?.email}</p>
                </div>
                <Link to="/documents" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-surface-600 hover:bg-surface-50">
                  <FileText size={16} /> Documents
                </Link>
                <Link to="/journal" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-surface-600 hover:bg-surface-50">
                  <BookOpen size={16} /> Journal
                </Link>
                <Link to="/settings" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-surface-600 hover:bg-surface-50">
                  <Settings size={16} /> Paramètres
                </Link>
                <button onClick={() => { logout(); setMenuOpen(false) }} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-danger-600 hover:bg-danger-50 cursor-pointer">
                  <LogOut size={16} /> Déconnexion
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
