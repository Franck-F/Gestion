import { forwardRef } from 'react'

export const Select = forwardRef(({ label, error, options = [], placeholder, className = '', ...props }, ref) => {
  return (
    <div className="space-y-1">
      {label && <label className="block text-xs sm:text-sm font-medium text-surface-700">{label}</label>}
      <select
        ref={ref}
        className={`w-full rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm text-surface-800 transition-colors focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100 ${error ? 'border-danger-500' : ''} ${className}`}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {error && <p className="text-xs text-danger-500">{error}</p>}
    </div>
  )
})
