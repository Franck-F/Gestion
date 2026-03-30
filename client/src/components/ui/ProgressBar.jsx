export function ProgressBar({ value = 0, max = 100, className = '', color = 'bg-primary-500' }) {
  const percent = Math.min(Math.round((value / max) * 100), 100)
  return (
    <div className={`w-full bg-surface-100 rounded-full h-2 overflow-hidden ${className}`}>
      <div
        className={`h-full rounded-full transition-all duration-500 ease-out ${color}`}
        style={{ width: `${percent}%` }}
      />
    </div>
  )
}
