import { Link } from 'react-router-dom'
import { Home } from 'lucide-react'
import { Button } from '../components/ui/Button.jsx'

export function NotFoundPage() {
  return (
    <div className="min-h-dvh flex items-center justify-center px-4">
      <div className="text-center">
        <p className="text-6xl font-bold font-heading text-primary-200">404</p>
        <h1 className="mt-4 text-xl font-semibold text-surface-800">Page non trouvée</h1>
        <p className="mt-2 text-surface-500">La page que vous cherchez n'existe pas.</p>
        <Link to="/">
          <Button className="mt-6"><Home size={18} /> Retour au dashboard</Button>
        </Link>
      </div>
    </div>
  )
}
