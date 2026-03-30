export function Spinner({ size = 'md', className = '' }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-10 h-10' }
  return (
    <div className={`${sizes[size]} animate-spin rounded-full border-2 border-surface-200 border-t-primary-500 ${className}`} />
  )
}

export function PageSpinner() {
  return (
    <div className="flex-1 flex items-center justify-center py-20">
      <Spinner size="lg" />
    </div>
  )
}
