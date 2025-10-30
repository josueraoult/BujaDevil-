'use client'

import { useState, useEffect, createContext, useContext } from 'react'
import { cn } from '../../lib/utils'

// Context pour le thème
const ThemeContext = createContext()

// Provider du thème
export function ThemeProvider({ children, defaultTheme = 'system' }) {
  const [theme, setTheme] = useState(defaultTheme)

  useEffect(() => {
    const storedTheme = localStorage.getItem('theme') || defaultTheme
    setTheme(storedTheme)
    applyTheme(storedTheme)
  }, [defaultTheme])

  const applyTheme = (newTheme) => {
    if (typeof window === 'undefined') return
    
    const root = window.document.documentElement
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    const appliedTheme = newTheme === 'system' ? systemTheme : newTheme

    root.classList.remove('light', 'dark')
    root.classList.add(appliedTheme)

    // Mettre à jour le meta theme-color
    const metaTheme = document.querySelector('meta[name="theme-color"]')
    if (metaTheme) {
      metaTheme.content = appliedTheme === 'dark' ? '#1e293b' : '#0ea5e9'
    }
  }

  const setThemeAndSave = (newTheme) => {
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
    applyTheme(newTheme)
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme: setThemeAndSave }}>
      {children}
    </ThemeContext.Provider>
  )
}

// Hook pour utiliser le thème
export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

// Switch de thème
export function ThemeToggle({ className }) {
  const { theme, setTheme } = useTheme()

  const toggleTheme = () => {
    const themes = ['light', 'dark', 'system']
    const currentIndex = themes.indexOf(theme)
    const nextTheme = themes[(currentIndex + 1) % themes.length]
    setTheme(nextTheme)
  }

  const getThemeIcon = () => {
    switch (theme) {
      case 'light': return '☀️'
      case 'dark': return '🌙'
      case 'system': return '💻'
      default: return '⚡'
    }
  }

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        'p-2 rounded-lg bg-gray-100 dark:bg-dark-300 hover:bg-gray-200 dark:hover:bg-dark-400 border border-gray-300 dark:border-dark-400 transition-all duration-200',
        className
      )}
      aria-label={`Thème actuel: ${theme}. Cliquer pour changer`}
    >
      <span className="text-lg">{getThemeIcon()}</span>
    </button>
  )
}

// Boutons avec variantes
export function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  loading = false,
  disabled = false,
  className,
  ...props 
}) {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'
  
  const variants = {
    primary: 'bg-primary-600 hover:bg-primary-700 text-white focus:ring-primary-500 shadow-sm hover:shadow',
    secondary: 'bg-gray-100 dark:bg-dark-300 hover:bg-gray-200 dark:hover:bg-dark-400 text-gray-900 dark:text-gray-100 focus:ring-gray-500 border border-gray-300 dark:border-dark-400',
    danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500 shadow-sm hover:shadow',
    ghost: 'bg-transparent hover:bg-gray-100 dark:hover:bg-dark-300 text-gray-700 dark:text-gray-300 focus:ring-gray-500',
    glass: 'backdrop-blur-md bg-white/10 dark:bg-dark-300/10 text-gray-900 dark:text-gray-100 hover:bg-opacity-20 focus:ring-white border border-white/20'
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
    xl: 'px-8 py-4 text-lg'
  }

  return (
    <button
      className={cn(
        baseClasses,
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {children}
    </button>
  )
}

// Input avec label et erreur
export function Input({
  label,
  error,
  description,
  className,
  ...props
}) {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}
      <input
        className={cn(
          'w-full px-3 py-2 border border-gray-300 dark:border-dark-400 rounded-lg bg-white dark:bg-dark-200 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200',
          error && 'border-red-500 focus:ring-red-500 focus:border-red-500',
          className
        )}
        {...props}
      />
      {error && (
        <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
      )}
      {description && !error && (
        <p className="text-gray-500 dark:text-gray-400 text-sm">{description}</p>
      )}
    </div>
  )
}

// Textarea
export function Textarea({
  label,
  error,
  description,
  className,
  ...props
}) {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}
      <textarea
        className={cn(
          'w-full px-3 py-2 border border-gray-300 dark:border-dark-400 rounded-lg bg-white dark:bg-dark-200 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 resize-none',
          error && 'border-red-500 focus:ring-red-500 focus:border-red-500',
          className
        )}
        {...props}
      />
      {error && (
        <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
      )}
      {description && !error && (
        <p className="text-gray-500 dark:text-gray-400 text-sm">{description}</p>
      )}
    </div>
  )
}

// Select
export function Select({
  label,
  error,
  description,
  options = [],
  className,
  ...props
}) {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}
      <select
        className={cn(
          'w-full px-3 py-2 border border-gray-300 dark:border-dark-400 rounded-lg bg-white dark:bg-dark-200 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200',
          error && 'border-red-500 focus:ring-red-500 focus:border-red-500',
          className
        )}
        {...props}
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
      )}
      {description && !error && (
        <p className="text-gray-500 dark:text-gray-400 text-sm">{description}</p>
      )}
    </div>
  )
}

// Card component
export function Card({ className, children, ...props }) {
  return (
    <div
      className={cn('bg-white dark:bg-dark-200 rounded-xl border border-gray-200 dark:border-dark-300 shadow-sm', className)}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({ className, children, ...props }) {
  return (
    <div
      className={cn('p-6 pb-4', className)}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardTitle({ className, children, ...props }) {
  return (
    <h3
      className={cn('text-lg font-semibold leading-6', className)}
      {...props}
    >
      {children}
    </h3>
  )
}

export function CardDescription({ className, children, ...props }) {
  return (
    <p
      className={cn('text-sm text-gray-600 dark:text-gray-400 mt-1', className)}
      {...props}
    >
      {children}
    </p>
  )
}

export function CardContent({ className, children, ...props }) {
  return (
    <div
      className={cn('p-6 pt-0', className)}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardFooter({ className, children, ...props }) {
  return (
    <div
      className={cn('p-6 pt-0 flex items-center', className)}
      {...props}
    >
      {children}
    </div>
  )
}

// Badge component
export function Badge({ 
  variant = 'default', 
  className, 
  children, 
  ...props 
}) {
  const variants = {
    default: 'bg-gray-100 dark:bg-dark-300 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-dark-400',
    primary: 'bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-800',
    success: 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800',
    warning: 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800',
    danger: 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800',
    news: 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800',
    gaming: 'bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800',
    apps: 'bg-cyan-100 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800',
    tutorials: 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800'
  }

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}

// Modal component
export function Modal({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'md',
  className 
}) {
  useEffect(() => {
    if (isOpen && typeof window !== 'undefined') {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div 
        className={cn(
          'bg-white dark:bg-dark-200 rounded-xl w-full max-h-[90vh] overflow-y-auto animate-scale-in',
          sizes[size],
          className
        )}
      >
        {/* Header */}
        {(title || onClose) && (
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-dark-300">
            {title && (
              <h2 className="text-xl font-semibold">{title}</h2>
            )}
            {onClose && (
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-dark-300 rounded-lg transition-colors"
              >
                ✕
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  )
}

// Loading spinner
export function LoadingSpinner({ size = 'md', className }) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  }

  return (
    <div className={cn('flex items-center justify-center', className)}>
      <svg 
        className={cn('animate-spin text-primary-600', sizes[size])} 
        fill="none" 
        viewBox="0 0 24 24"
      >
        <circle 
          className="opacity-25" 
          cx="12" 
          cy="12" 
          r="10" 
          stroke="currentColor" 
          strokeWidth="4"
        />
        <path 
          className="opacity-75" 
          fill="currentColor" 
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </div>
  )
}

// Skeleton loader
export function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn('animate-pulse bg-gray-200 dark:bg-dark-300 rounded', className)}
      {...props}
    />
  )
}

// Toast notification system
const ToastContext = createContext()

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const addToast = (toast) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast = { id, ...toast }
    setToasts(prev => [...prev, newToast])

    // Auto remove after 5 seconds
    setTimeout(() => {
      removeToast(id)
    }, 5000)
  }

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map(toast => (
          <Toast key={toast.id} {...toast} onClose={() => removeToast(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

function Toast({ title, description, variant = 'default', onClose }) {
  const variants = {
    default: 'bg-white dark:bg-dark-200 border-gray-300 dark:border-dark-400',
    success: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
    warning: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
    danger: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
  }

  const icons = {
    default: '💡',
    success: '✅',
    warning: '⚠️',
    danger: '❌'
  }

  return (
    <div className={cn(
      'flex items-start p-4 rounded-lg border shadow-lg max-w-sm animate-slide-up',
      variants[variant]
    )}>
      <div className="flex-shrink-0 mr-3 text-lg">
        {icons[variant]}
      </div>
      <div className="flex-1">
        {title && (
          <div className="font-medium text-gray-900 dark:text-gray-100">
            {title}
          </div>
        )}
        {description && (
          <div className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            {description}
          </div>
        )}
      </div>
      <button
        onClick={onClose}
        className="flex-shrink-0 ml-4 p-1 hover:bg-gray-100 dark:hover:bg-dark-300 rounded transition-colors"
      >
        ✕
      </button>
    </div>
  )
}

// Progress bar
export function ProgressBar({ 
  value = 0, 
  max = 100, 
  showLabel = false,
  className 
}) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100))

  return (
    <div className={cn('space-y-2', className)}>
      {showLabel && (
        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
          <span>Progression</span>
          <span>{percentage.toFixed(0)}%</span>
        </div>
      )}
      <div className="w-full bg-gray-200 dark:bg-dark-300 rounded-full h-2">
        <div
          className="bg-gradient-to-r from-primary-500 to-purple-500 h-2 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

// Avatar component
export function Avatar({ 
  src, 
  alt, 
  size = 'md', 
  fallback,
  className 
}) {
  const [error, setError] = useState(false)

  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  }

  if (error || !src) {
    return (
      <div
        className={cn(
          'rounded-full bg-gradient-to-br from-primary-400 to-purple-500 flex items-center justify-center text-white font-semibold',
          sizes[size],
          className
        )}
      >
        {fallback || (alt ? alt.charAt(0).toUpperCase() : '?')}
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setError(true)}
      className={cn(
        'rounded-full object-cover',
        sizes[size],
        className
      )}
    />
  )
}

// Table component (simplifié)
export function Table({ className, children, ...props }) {
  return (
    <div className={cn('overflow-x-auto', className)}>
      <table className="w-full" {...props}>
        {children}
      </table>
    </div>
  )
}

// Pagination component
export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className
}) {
  const pages = []
  
  // Generate page numbers with ellipsis
  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 ||
      i === totalPages ||
      (i >= currentPage - 1 && i <= currentPage + 1)
    ) {
      pages.push(i)
    } else if (i === currentPage - 2 || i === currentPage + 2) {
      pages.push('...')
    }
  }

  // Remove consecutive ellipsis
  const filteredPages = pages.filter((page, index) => {
    return index === 0 || page !== pages[index - 1]
  })

  return (
    <div className={cn('flex items-center justify-center space-x-1', className)}>
      <Button
        variant="ghost"
        size="sm"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        ←
      </Button>

      {filteredPages.map((page, index) => (
        <Button
          key={index}
          variant={page === currentPage ? 'primary' : 'ghost'}
          size="sm"
          disabled={page === '...'}
          onClick={() => typeof page === 'number' && onPageChange(page)}
        >
          {page}
        </Button>
      ))}

      <Button
        variant="ghost"
        size="sm"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        →
      </Button>
    </div>
  )
}

// Tabs component
export function Tabs({ 
  tabs, 
  activeTab, 
  onTabChange,
  className 
}) {
  return (
    <div className={cn('border-b border-gray-200 dark:border-dark-300', className)}>
      <nav className="flex space-x-8">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              'py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200',
              activeTab === tab.id
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-dark-400'
            )}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  )
}
