import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.jsx'
import { RegisterForm } from '../components/auth/RegisterForm.jsx'
import { CheckCircle } from 'lucide-react'

export function RegisterPage() {
  const { isAuthenticated, loading, user } = useAuth()
  if (!loading && isAuthenticated && user?.onboardingCompleted) return <Navigate to="/" replace />
  if (!loading && isAuthenticated && !user?.onboardingCompleted) return <Navigate to="/onboarding" replace />

  return (
    <div className="min-h-dvh flex flex-col md:flex-row">
      {/* Left panel */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-accent-500 to-accent-700 p-12 flex-col justify-between text-white">
        <div>
          <h1 className="text-3xl font-bold font-heading">MyCheckList</h1>
          <p className="text-accent-200 mt-1">Organisez vos démarches</p>
        </div>
        <div className="space-y-5">
          <h2 className="text-xl font-semibold">Créez votre compte gratuitement</h2>
          {['Suivi visuel de vos candidatures', 'Suivi des bourses et aides', 'Objectifs et jalons personnalisés', 'Tous vos documents au même endroit'].map((t, i) => (
            <div key={i} className="flex items-center gap-3">
              <CheckCircle size={18} className="text-accent-200 flex-shrink-0" />
              <p className="text-sm">{t}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-accent-200">Rejoignez les étudiants qui organisent mieux leurs démarches.</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-surface-50 to-white px-4 py-10">
        <div className="w-full max-w-md">
          <div className="text-center mb-8 md:hidden">
            <h1 className="text-2xl font-bold font-heading text-primary-800">MyCheckList</h1>
            <p className="mt-1 text-surface-500 text-sm">Organisez vos démarches</p>
          </div>
          <div className="md:mb-8 hidden md:block">
            <h2 className="text-2xl font-bold font-heading text-surface-900">Inscription</h2>
            <p className="mt-1 text-surface-500 text-sm">Prêt en moins d'une minute</p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg border border-surface-200/60 p-6 sm:p-8">
            <RegisterForm />
          </div>
        </div>
      </div>
    </div>
  )
}
