import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.jsx'
import { RegisterForm } from '../components/auth/RegisterForm.jsx'

export function RegisterPage() {
  const { isAuthenticated, loading } = useAuth()
  if (!loading && isAuthenticated) return <Navigate to="/" replace />

  return (
    <div className="min-h-dvh flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-accent-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold font-heading text-primary-800">Gestion</h1>
          <p className="mt-2 text-surface-500">Créez votre compte</p>
        </div>
        <div className="bg-white rounded-2xl shadow-lg border border-surface-200/60 p-8">
          <RegisterForm />
        </div>
      </div>
    </div>
  )
}
