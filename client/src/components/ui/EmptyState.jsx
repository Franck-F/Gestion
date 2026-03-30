import { Button } from './Button.jsx'

export function EmptyState({ icon: Icon, title, description, actionLabel, onAction }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {Icon && (
        <div className="w-16 h-16 rounded-2xl bg-surface-100 flex items-center justify-center mb-4">
          <Icon size={28} className="text-surface-400" />
        </div>
      )}
      <h3 className="text-lg font-semibold text-surface-800 font-heading">{title}</h3>
      {description && <p className="mt-1.5 text-sm text-surface-500 max-w-sm">{description}</p>}
      {actionLabel && onAction && (
        <Button onClick={onAction} className="mt-5">{actionLabel}</Button>
      )}
    </div>
  )
}
