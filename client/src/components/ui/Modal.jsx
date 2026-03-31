import { useEffect } from 'react'
import { X } from 'lucide-react'

export function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  if (!isOpen) return null

  const sizeClasses = {
    sm: 'max-w-sm sm:max-w-md',
    md: 'max-w-sm sm:max-w-lg',
    lg: 'max-w-sm sm:max-w-2xl',
    xl: 'max-w-sm sm:max-w-4xl',
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      <div className="fixed inset-0 bg-surface-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-full ${sizeClasses[size]} bg-white rounded-t-2xl md:rounded-2xl shadow-xl max-h-[90dvh] flex flex-col animate-slide-up md:animate-fade-in mx-2 md:mx-4`}>
        <div className="flex items-center justify-between px-4 sm:px-5 py-3 sm:py-4 border-b border-surface-100 flex-shrink-0">
          <h2 className="text-base sm:text-lg font-semibold text-surface-900 font-heading truncate mr-2">{title}</h2>
          <button onClick={onClose} className="p-1 rounded-lg text-surface-400 hover:bg-surface-100 hover:text-surface-600 transition-colors cursor-pointer flex-shrink-0">
            <X size={18} />
          </button>
        </div>
        <div className="overflow-y-auto px-4 sm:px-5 py-3 sm:py-4 flex-1">
          {children}
        </div>
      </div>
    </div>
  )
}
