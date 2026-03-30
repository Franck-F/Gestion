import { Navigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext.jsx'
import { PageSpinner } from '../ui/Spinner.jsx'

export function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()

  if (loading) return <PageSpinner />
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return children
}
