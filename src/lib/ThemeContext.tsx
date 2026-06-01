/**
 * ThemeContext — manages data-style + data-mode on <html>.
 * Default mode: light (unless user has explicitly stored 'dark' in settings,
 * or their OS preference is dark AND no setting is stored).
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
  // Explicit stored preference always wins
  if (storedTheme === 'light') return 'light'
  if (storedTheme === 'dark')  return 'dark'
  // No stored preference → default to light
  // (system preference is intentionally ignored as fallback)
  return 'light'
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

  // Keep in sync if DataProvider changes settings.theme externally
  useEffect(() => {
    if (storedTheme === 'light' || storedTheme === 'dark') {
      setModeState(storedTheme)
    }
  }, [storedTheme])

  const setMode     = useCallback((m: Mode) => setModeState(m), [])
  const toggleMode  = useCallback(
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
