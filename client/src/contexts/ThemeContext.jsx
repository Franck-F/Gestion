import { createContext, useContext, useState, useEffect, useCallback } from 'react'

export const THEMES = {
  ocean: {
    name: 'Océan',
    dark: false,
    colors: { primary: '#2578eb', accent: '#ff5722' },
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
    dark: false,
    colors: { primary: '#059669', accent: '#8b5cf6' },
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
    dark: false,
    colors: { primary: '#e11d48', accent: '#f59e0b' },
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
    dark: false,
    colors: { primary: '#7c3aed', accent: '#06b6d4' },
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
    colors: { primary: '#818cf8', accent: '#f472b6' },
    vars: {
      '--color-primary-50': '#1e1b4b', '--color-primary-100': '#312e81', '--color-primary-200': '#3730a3',
      '--color-primary-300': '#4f46e5', '--color-primary-400': '#6366f1', '--color-primary-500': '#818cf8',
      '--color-primary-600': '#818cf8', '--color-primary-700': '#a5b4fc', '--color-primary-800': '#c7d2fe',
      '--color-primary-900': '#e0e7ff', '--color-primary-950': '#eef2ff',
      '--color-accent-50': '#500724', '--color-accent-100': '#831843', '--color-accent-200': '#9d174d',
      '--color-accent-300': '#db2777', '--color-accent-400': '#ec4899', '--color-accent-500': '#f472b6',
      '--color-accent-600': '#f472b6', '--color-accent-700': '#f9a8d4', '--color-accent-800': '#fbcfe8',
      // Surface: inverted for dark
      '--color-surface-50': '#0b0f1a', '--color-surface-100': '#111827', '--color-surface-200': '#1f2937',
      '--color-surface-300': '#374151', '--color-surface-400': '#6b7280', '--color-surface-500': '#9ca3af',
      '--color-surface-600': '#d1d5db', '--color-surface-700': '#e5e7eb', '--color-surface-800': '#f3f4f6',
      '--color-surface-900': '#f9fafb', '--color-surface-950': '#ffffff',
      // Success/warning/danger adjusted for dark
      '--color-success-50': '#052e16', '--color-success-500': '#4ade80', '--color-success-600': '#22c55e',
      '--color-warning-50': '#451a03', '--color-warning-500': '#fbbf24', '--color-warning-600': '#f59e0b',
      '--color-danger-50': '#450a0a', '--color-danger-500': '#f87171', '--color-danger-600': '#ef4444',
    },
  },
}

const SURFACE_KEYS = [
  '--color-surface-50', '--color-surface-100', '--color-surface-200', '--color-surface-300',
  '--color-surface-400', '--color-surface-500', '--color-surface-600', '--color-surface-700',
  '--color-surface-800', '--color-surface-900', '--color-surface-950',
  '--color-success-50', '--color-success-500', '--color-success-600',
  '--color-warning-50', '--color-warning-500', '--color-warning-600',
  '--color-danger-50', '--color-danger-500', '--color-danger-600',
]

const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
  const [themeId, setThemeId] = useState(() => localStorage.getItem('theme') || 'ocean')

  const applyTheme = useCallback((id) => {
    const theme = THEMES[id]
    if (!theme) return

    const root = document.documentElement

    // Reset all vars
    const allKeys = new Set()
    Object.values(THEMES).forEach(t => Object.keys(t.vars).forEach(k => allKeys.add(k)))
    SURFACE_KEYS.forEach(k => allKeys.add(k))
    allKeys.forEach(k => root.style.removeProperty(k))

    // Apply theme vars
    Object.entries(theme.vars).forEach(([key, value]) => {
      root.style.setProperty(key, value)
    })

    // Toggle dark class for bg-white override
    if (theme.dark) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [])

  useEffect(() => {
    applyTheme(themeId)
  }, [themeId, applyTheme])

  const setTheme = useCallback((id) => {
    setThemeId(id)
    localStorage.setItem('theme', id)
  }, [])

  const isDark = THEMES[themeId]?.dark || false

  return (
    <ThemeContext.Provider value={{ themeId, setTheme, themes: THEMES, isDark }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) throw new Error('useTheme must be used within ThemeProvider')
  return context
}
