import { AlertTriangle } from 'lucide-react'
import { Button } from './Button.jsx'

export function ErrorState({ message = 'Erreur de chargement', onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-14 h-14 rounded-2xl bg-danger-50 flex items-center justify-center mb-4">
        <AlertTriangle size={24} className="text-danger-500" />
      </div>
      <p className="text-sm text-surface-600 mb-4">{message}</p>
      {onRetry && <Button variant="secondary" onClick={onRetry}>Réessayer</Button>}
    </div>
  )
}
