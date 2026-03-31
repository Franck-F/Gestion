export function PageHeader({ title, description, action }) {
  return (
    <div className="flex items-start justify-between gap-3 mb-4 md:mb-6">
      <div className="min-w-0">
        <h1 className="text-lg sm:text-xl md:text-2xl font-bold font-heading text-surface-900 truncate">{title}</h1>
        {description && <p className="mt-0.5 text-xs sm:text-sm text-surface-500 truncate">{description}</p>}
      </div>
      <div className="flex-shrink-0">{action}</div>
    </div>
  )
}
