import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, FlaskConical, TestTube, Droplets, Beaker,
  Baby, BookOpen, Settings, LineChart, TrendingUp,
  Heart, Shell, Star, Users
} from 'lucide-react'

const NAV = [
  // Core
  { to: '/',              label: 'Dashboard',        icon: LayoutDashboard, group: 'core' },
  { to: '/reference',     label: 'Reference',         icon: FlaskConical,    group: 'core' },
  // Water
  { to: '/parameters',    label: 'Parameter Check',   icon: TestTube,        group: 'water' },
  { to: '/calculator',    label: 'TDS Calculator',    icon: Droplets,        group: 'water' },
  { to: '/remineralize',  label: 'Remineralization',  icon: Beaker,          group: 'water' },
  { to: '/charts',        label: 'Parameter Charts',  icon: LineChart,       group: 'water' },
  { to: '/tds-creep',     label: 'TDS Creep',         icon: TrendingUp,      group: 'water' },
  // Breeding
  { to: '/breeding',      label: 'Breeding Timeline', icon: Baby,            group: 'breeding' },
  { to: '/breeding-pairs',label: 'Breeding Pairs',    icon: Heart,           group: 'breeding' },
  { to: '/molt',          label: 'Molt Tracker',      icon: Shell,           group: 'breeding' },
  { to: '/grades',        label: 'Grade Log',         icon: Star,            group: 'breeding' },
  { to: '/colony',        label: 'Colony Estimator',  icon: Users,           group: 'breeding' },
  // Log & Settings
  { to: '/logbook',       label: 'Logbook',           icon: BookOpen,        group: 'log' },
  { to: '/settings',      label: 'Settings',          icon: Settings,        group: 'log' },
]

const GROUPS: { key: string; label: string }[] = [
  { key: 'core',     label: 'Overview' },
  { key: 'water',    label: 'Water' },
  { key: 'breeding', label: 'Breeding' },
  { key: 'log',      label: 'Data' },
]

export function Sidebar() {
  return (
    <nav className="sidebar" aria-label="Main navigation">
      <div className="sidebar-logo">
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-label="Shrimp Lab logo">
          <circle cx="14" cy="14" r="13" stroke="var(--color-primary)" strokeWidth="1.5" />
          <path d="M8 18 Q10 12 14 13 Q18 14 18 10" stroke="var(--color-primary)" strokeWidth="1.5" strokeLinecap="round" fill="none" />
          <circle cx="18" cy="9" r="1.5" fill="var(--color-primary)" />
          <path d="M10 20 Q12 19 14 20" stroke="var(--color-primary)" strokeWidth="1" strokeLinecap="round" fill="none" />
        </svg>
        <span className="sidebar-brand">Shrimp Lab</span>
      </div>

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
                    className={({ isActive }) => `nav-link ${isActive ? 'nav-link--active' : ''}`}
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
