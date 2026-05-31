import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Droplets, Calculator, Timer, BookOpen, BookMarked, Settings,
} from 'lucide-react'

const NAV = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/reference', icon: BookMarked, label: 'Reference' },
  { to: '/parameters', icon: Droplets, label: 'Checker' },
  { to: '/calculator', icon: Calculator, label: 'TDS Calc' },
  { to: '/breeding', icon: Timer, label: 'Breeding' },
  { to: '/logbook', icon: BookOpen, label: 'Logbook' },
  { to: '/settings', icon: Settings, label: 'Settings' },
]

export function Sidebar() {
  return (
    <nav className="sidebar">
      <div className="nav-brand">🦐 Shrimp Lab</div>
      {NAV.map(item => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === '/'}
          className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
        >
          <item.icon size={18} />
          <span className="nav-label">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
