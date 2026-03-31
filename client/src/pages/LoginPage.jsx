import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.jsx'
import { LoginForm } from '../components/auth/LoginForm.jsx'
import { Briefcase, Target, FileText } from 'lucide-react'

export function LoginPage() {
  const { isAuthenticated, loading } = useAuth()
  if (!loading && isAuthenticated) return <Navigate to="/" replace />

  return (
    <div className="min-h-dvh flex flex-col md:flex-row">
      {/* Left panel — branding */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-primary-600 to-primary-800 p-12 flex-col justify-between text-white">
        <div>
          <h1 className="text-3xl font-bold font-heading">Gestion</h1>
          <p className="text-primary-200 mt-1">Pilotage de parcours</p>
        </div>
        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0"><Briefcase size={20} /></div>
            <div><p className="font-semibold">Suivez vos candidatures</p><p className="text-sm text-primary-200">Pipeline visuel pour chaque étape</p></div>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0"><Target size={20} /></div>
            <div><p className="font-semibold">Fixez vos objectifs</p><p className="text-sm text-primary-200">Suivi SMART avec jalons et streaks</p></div>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0"><FileText size={20} /></div>
            <div><p className="font-semibold">Gérez vos documents</p><p className="text-sm text-primary-200">Checklist et versioning de vos fichiers</p></div>
          </div>
        </div>
        <p className="text-xs text-primary-300">Organisez toutes vos démarches en un seul endroit.</p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-surface-50 to-white px-4 py-10">
        <div className="w-full max-w-md">
          <div className="text-center mb-8 md:hidden">
            <h1 className="text-3xl font-bold font-heading text-primary-800">Gestion</h1>
            <p className="mt-1 text-surface-500 text-sm">Pilotage de parcours</p>
          </div>
          <div className="md:mb-8 hidden md:block">
            <h2 className="text-2xl font-bold font-heading text-surface-900">Connexion</h2>
            <p className="mt-1 text-surface-500 text-sm">Accédez à votre espace personnel</p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg border border-surface-200/60 p-8">
            <LoginForm />
          </div>
        </div>
      </div>
    </div>
  )
}
