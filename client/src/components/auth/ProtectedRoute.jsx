import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext.jsx'
import { PageSpinner } from '../ui/Spinner.jsx'

export function ProtectedRoute({ children }) {
  const { user, isAuthenticated, loading } = useAuth()
  const location = useLocation()

  if (loading) return <PageSpinner />
  if (!isAuthenticated) return <Navigate to="/login" replace />

  // Redirect to onboarding if not completed (unless already on onboarding page)
  if (user && !user.onboardingCompleted && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />
  }

  return children
}
