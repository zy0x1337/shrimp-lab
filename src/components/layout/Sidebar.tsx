import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, FlaskConical, TestTube, Droplets, Beaker,
  Baby, BookOpen, Settings, LineChart, TrendingUp, Utensils
} from 'lucide-react'

const NAV = [
  { to: '/',            label: 'Dashboard',        icon: LayoutDashboard },
  { to: '/reference',   label: 'Reference',         icon: FlaskConical },
  { to: '/parameters',  label: 'Parameter Check',   icon: TestTube },
  { to: '/calculator',  label: 'TDS Calculator',    icon: Droplets },
  { to: '/remineralize',label: 'Remineralization',  icon: Beaker },
  { to: '/breeding',    label: 'Breeding',          icon: Baby },
  { to: '/logbook',     label: 'Logbook',           icon: BookOpen },
  { to: '/charts',      label: 'Parameter Charts',  icon: LineChart },
  { to: '/tds-creep',   label: 'TDS Creep',         icon: TrendingUp },
  { to: '/settings',    label: 'Settings',          icon: Settings },
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
      <ul role="list" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {NAV.map(({ to, label, icon: Icon }) => (
          <li key={to}>
            <NavLink
              to={to}
              end={to === '/'}
              className={({ isActive }) => `nav-link ${isActive ? 'nav-link--active' : ''}`}
            >
              <Icon size={16} aria-hidden="true" />
              <span>{label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
