export function Card({ children, className = '', onClick, hover }) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl border border-surface-200/80 ${hover ? 'hover:border-surface-300 hover:shadow-md transition-all duration-200 cursor-pointer' : ''} ${className}`}
    >
      {children}
    </div>
  )
}

export function CardHeader({ children, className = '' }) {
  return <div className={`px-5 py-4 border-b border-surface-100 ${className}`}>{children}</div>
}

export function CardBody({ children, className = '' }) {
  return <div className={`px-5 py-4 ${className}`}>{children}</div>
}
