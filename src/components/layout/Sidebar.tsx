import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, FlaskConical, TestTube, Droplets, Beaker,
  Baby, BookOpen, Settings, LineChart, TrendingUp,
  Heart, Shell, Star, Users, Sun, Moon,
} from 'lucide-react'
import { useTheme } from '../../lib/ThemeContext'
import { useData } from '../../lib/DataContext'

const NAV = [
  // Core
  { to: '/',               label: 'Dashboard',        icon: LayoutDashboard, group: 'core' },
  { to: '/reference',      label: 'Reference',        icon: FlaskConical,    group: 'core' },
  // Water
  { to: '/parameters',     label: 'Parameter Check',  icon: TestTube,        group: 'water' },
  { to: '/calculator',     label: 'TDS Calculator',   icon: Droplets,        group: 'water' },
  { to: '/remineralize',   label: 'Remineralization', icon: Beaker,          group: 'water' },
  { to: '/charts',         label: 'Parameter Charts', icon: LineChart,       group: 'water' },
  { to: '/tds-creep',      label: 'TDS Creep',        icon: TrendingUp,      group: 'water' },
  // Breeding
  { to: '/breeding',       label: 'Breeding Timeline',icon: Baby,            group: 'breeding' },
  { to: '/breeding-pairs', label: 'Breeding Pairs',   icon: Heart,           group: 'breeding' },
  { to: '/molt',           label: 'Molt Tracker',     icon: Shell,           group: 'breeding' },
  { to: '/grades',         label: 'Grade Log',        icon: Star,            group: 'breeding' },
  { to: '/colony',         label: 'Colony Estimator', icon: Users,           group: 'breeding' },
  // Log & Settings
  { to: '/logbook',        label: 'Logbook',          icon: BookOpen,        group: 'log' },
  { to: '/settings',       label: 'Settings',         icon: Settings,        group: 'log' },
]

const GROUPS: { key: string; label: string }[] = [
  { key: 'core',     label: 'Overview' },
  { key: 'water',    label: 'Water' },
  { key: 'breeding', label: 'Breeding' },
  { key: 'log',      label: 'Data' },
]

interface SidebarProps {
  /** Mobile: sidebar is visible */
  isOpen?: boolean
  /** Mobile: close callback (overlay click or nav) */
  onClose?: () => void
}

export function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const { mode, toggleMode } = useTheme()
  const { updateSettings } = useData()

  function handleThemeToggle() {
    const next = mode === 'dark' ? 'light' : 'dark'
    toggleMode()
    // Keep DataContext / IndexedDB in sync
    updateSettings({ theme: next })
  }

  return (
    <nav
      id="sidebar-nav"
      className={`sidebar${isOpen ? ' sidebar--open' : ''}`}
      aria-label="Main navigation"
    >
      {/* ── Brand ─────────────────────────────────────── */}
      <div className="sidebar-logo">
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-label="Shrimp Lab logo">
          <circle cx="14" cy="14" r="13" stroke="var(--color-primary)" strokeWidth="1.5" />
          <path
            d="M8 18 Q10 12 14 13 Q18 14 18 10"
            stroke="var(--color-primary)"
            strokeWidth="1.5"
            strokeLinecap="round"
            fill="none"
          />
          <circle cx="18" cy="9" r="1.5" fill="var(--color-primary)" />
          <path
            d="M10 20 Q12 19 14 20"
            stroke="var(--color-primary)"
            strokeWidth="1"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
        <span className="sidebar-brand">Shrimp Lab</span>

        {/* Theme toggle — right-aligned in the logo row */}
        <button
          className="btn btn-ghost sidebar__theme-toggle"
          onClick={handleThemeToggle}
          aria-label={`Switch to ${mode === 'dark' ? 'light' : 'dark'} mode`}
          title={`Switch to ${mode === 'dark' ? 'light' : 'dark'} mode`}
          style={{ marginLeft: 'auto', padding: '0.25rem' }}
        >
          {mode === 'dark'
            ? <Sun  size={14} aria-hidden="true" />
            : <Moon size={14} aria-hidden="true" />}
        </button>
      </div>

      {/* ── Nav groups ────────────────────────────────── */}
      {GROUPS.map(group => {
        const items = NAV.filter(n => n.group === group.key)
        return (
          <div key={group.key} className="nav-group">
            <div className="nav-group-label">{group.label}</div>
            <ul role="list" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {items.map(({ to, label, icon: Icon }) => (
                <li key={to}>
                  <NavLink
                    to={to}
                    end={to === '/'}
                    className={({ isActive }) =>
                      `nav-link${isActive ? ' nav-link--active' : ''}`
                    }
                    onClick={onClose}
                  >
                    <Icon size={15} aria-hidden="true" />
                    <span>{label}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        )
      })}
    </nav>
  )
}
