import { forwardRef } from 'react'

export const Input = forwardRef(({ label, error, icon: Icon, className = '', ...props }, ref) => {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-xs sm:text-sm font-medium text-surface-700">{label}</label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400">
            <Icon size={16} />
          </div>
        )}
        <input
          ref={ref}
          className={`w-full rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm text-surface-800 placeholder:text-surface-400 transition-colors focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100 ${Icon ? 'pl-9' : ''} ${error ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-100' : ''} ${className}`}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-danger-500">{error}</p>}
    </div>
  )
})
