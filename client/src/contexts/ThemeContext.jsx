import { createContext, useContext, useState, useEffect, useCallback } from 'react'

export const THEMES = {
  ocean: {
    name: 'Océan',
    colors: {
      primary: '#2578eb',
      accent: '#ff5722',
    },
    vars: {
      '--color-primary-50': '#eff8ff', '--color-primary-100': '#dbeffe', '--color-primary-200': '#bfe3fe',
      '--color-primary-300': '#93d2fd', '--color-primary-400': '#60b8fa', '--color-primary-500': '#3b97f6',
      '--color-primary-600': '#2578eb', '--color-primary-700': '#1d62d8', '--color-primary-800': '#1e50af',
      '--color-primary-900': '#1e458a', '--color-primary-950': '#172b54',
      '--color-accent-50': '#fff5f0', '--color-accent-100': '#ffe8db', '--color-accent-200': '#ffcdb6',
      '--color-accent-300': '#ffa987', '--color-accent-400': '#ff7d4d', '--color-accent-500': '#ff5722',
      '--color-accent-600': '#f03a06', '--color-accent-700': '#c72a07', '--color-accent-800': '#9e240e',
    },
  },
  emerald: {
    name: 'Émeraude',
    colors: {
      primary: '#059669',
      accent: '#8b5cf6',
    },
    vars: {
      '--color-primary-50': '#ecfdf5', '--color-primary-100': '#d1fae5', '--color-primary-200': '#a7f3d0',
      '--color-primary-300': '#6ee7b7', '--color-primary-400': '#34d399', '--color-primary-500': '#10b981',
      '--color-primary-600': '#059669', '--color-primary-700': '#047857', '--color-primary-800': '#065f46',
      '--color-primary-900': '#064e3b', '--color-primary-950': '#022c22',
      '--color-accent-50': '#f5f3ff', '--color-accent-100': '#ede9fe', '--color-accent-200': '#ddd6fe',
      '--color-accent-300': '#c4b5fd', '--color-accent-400': '#a78bfa', '--color-accent-500': '#8b5cf6',
      '--color-accent-600': '#7c3aed', '--color-accent-700': '#6d28d9', '--color-accent-800': '#5b21b6',
    },
  },
  sunset: {
    name: 'Coucher de soleil',
    colors: {
      primary: '#e11d48',
      accent: '#f59e0b',
    },
    vars: {
      '--color-primary-50': '#fff1f2', '--color-primary-100': '#ffe4e6', '--color-primary-200': '#fecdd3',
      '--color-primary-300': '#fda4af', '--color-primary-400': '#fb7185', '--color-primary-500': '#f43f5e',
      '--color-primary-600': '#e11d48', '--color-primary-700': '#be123c', '--color-primary-800': '#9f1239',
      '--color-primary-900': '#881337', '--color-primary-950': '#4c0519',
      '--color-accent-50': '#fffbeb', '--color-accent-100': '#fef3c7', '--color-accent-200': '#fde68a',
      '--color-accent-300': '#fcd34d', '--color-accent-400': '#fbbf24', '--color-accent-500': '#f59e0b',
      '--color-accent-600': '#d97706', '--color-accent-700': '#b45309', '--color-accent-800': '#92400e',
    },
  },
  purple: {
    name: 'Améthyste',
    colors: {
      primary: '#7c3aed',
      accent: '#06b6d4',
    },
    vars: {
      '--color-primary-50': '#f5f3ff', '--color-primary-100': '#ede9fe', '--color-primary-200': '#ddd6fe',
      '--color-primary-300': '#c4b5fd', '--color-primary-400': '#a78bfa', '--color-primary-500': '#8b5cf6',
      '--color-primary-600': '#7c3aed', '--color-primary-700': '#6d28d9', '--color-primary-800': '#5b21b6',
      '--color-primary-900': '#4c1d95', '--color-primary-950': '#2e1065',
      '--color-accent-50': '#ecfeff', '--color-accent-100': '#cffafe', '--color-accent-200': '#a5f3fc',
      '--color-accent-300': '#67e8f9', '--color-accent-400': '#22d3ee', '--color-accent-500': '#06b6d4',
      '--color-accent-600': '#0891b2', '--color-accent-700': '#0e7490', '--color-accent-800': '#155e75',
    },
  },
  midnight: {
    name: 'Nuit',
    dark: true,
    colors: {
      primary: '#60a5fa',
      accent: '#f472b6',
    },
    vars: {
      '--color-primary-50': '#1e3a5f', '--color-primary-100': '#1e3a5f', '--color-primary-200': '#2563eb',
      '--color-primary-300': '#3b82f6', '--color-primary-400': '#60a5fa', '--color-primary-500': '#60a5fa',
      '--color-primary-600': '#3b82f6', '--color-primary-700': '#93bbfd', '--color-primary-800': '#bfdbfe',
      '--color-primary-900': '#dbeafe', '--color-primary-950': '#eff6ff',
      '--color-accent-50': '#4a1942', '--color-accent-100': '#831843', '--color-accent-200': '#be185d',
      '--color-accent-300': '#ec4899', '--color-accent-400': '#f472b6', '--color-accent-500': '#f472b6',
      '--color-accent-600': '#ec4899', '--color-accent-700': '#f9a8d4', '--color-accent-800': '#fbcfe8',
      '--color-surface-50': '#0f172a', '--color-surface-100': '#1e293b', '--color-surface-200': '#334155',
      '--color-surface-300': '#475569', '--color-surface-400': '#64748b', '--color-surface-500': '#94a3b8',
      '--color-surface-600': '#cbd5e1', '--color-surface-700': '#e2e8f0', '--color-surface-800': '#f1f5f9',
      '--color-surface-900': '#f8fafc', '--color-surface-950': '#ffffff',
    },
  },
}

const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
  const [themeId, setThemeId] = useState(() => localStorage.getItem('theme') || 'ocean')

  const applyTheme = useCallback((id) => {
    const theme = THEMES[id]
    if (!theme) return

    const root = document.documentElement
    // Reset to defaults first (remove previous theme vars)
    Object.keys(THEMES.ocean.vars).forEach(k => root.style.removeProperty(k))
    // Also reset dark surface vars if switching from dark
    ;['--color-surface-50', '--color-surface-100', '--color-surface-200', '--color-surface-300',
      '--color-surface-400', '--color-surface-500', '--color-surface-600', '--color-surface-700',
      '--color-surface-800', '--color-surface-900', '--color-surface-950'].forEach(k => root.style.removeProperty(k))

    // Apply new theme vars
    Object.entries(theme.vars).forEach(([key, value]) => {
      root.style.setProperty(key, value)
    })

    // Dark mode body
    if (theme.dark) {
      document.body.style.colorScheme = 'dark'
    } else {
      document.body.style.colorScheme = 'light'
    }
  }, [])

  useEffect(() => {
    applyTheme(themeId)
  }, [themeId, applyTheme])

  const setTheme = useCallback((id) => {
    setThemeId(id)
    localStorage.setItem('theme', id)
  }, [])

  return (
    <ThemeContext.Provider value={{ themeId, setTheme, themes: THEMES }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) throw new Error('useTheme must be used within ThemeProvider')
  return context
}
