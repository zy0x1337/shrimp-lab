/**
 * ThemeContext — manages data-style + data-mode on <html>.
 * Reads initial value from DataContext (settings.theme) and keeps them in sync.
 * Also exposes a toggle so any component can flip dark/light.
 */
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react'

type Mode = 'dark' | 'light'

interface ThemeCtx {
  mode: Mode
  toggleMode: () => void
  setMode: (m: Mode) => void
}

const ThemeContext = createContext<ThemeCtx | null>(null)

function resolveInitialMode(storedTheme?: string): Mode {
  if (storedTheme === 'light') return 'light'
  if (storedTheme === 'dark') return 'dark'
  // Fall back to system preference
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function ThemeProvider({
  children,
  storedTheme,
}: {
  children: ReactNode
  storedTheme?: string
}) {
  const [mode, setModeState] = useState<Mode>(() => resolveInitialMode(storedTheme))

  // Apply tokens to <html> whenever mode changes
  useEffect(() => {
    const root = document.documentElement
    root.setAttribute('data-style', 'torque')
    root.setAttribute('data-mode', mode)
  }, [mode])

  // Keep in sync if the parent DataProvider changes settings.theme externally
  useEffect(() => {
    if (storedTheme === 'light' || storedTheme === 'dark') {
      setModeState(storedTheme)
    }
  }, [storedTheme])

  const setMode = useCallback((m: Mode) => setModeState(m), [])
  const toggleMode = useCallback(
    () => setModeState(prev => (prev === 'dark' ? 'light' : 'dark')),
    []
  )

  return (
    <ThemeContext.Provider value={{ mode, toggleMode, setMode }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme(): ThemeCtx {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider')
  return ctx
}
