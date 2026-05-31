import { useData } from '../lib/DataContext'
import { formatSpecies } from '../lib/species'
import { useNavigate } from 'react-router-dom'
import { Droplets, Calculator, Timer, BookOpen, Plus } from 'lucide-react'

export function Dashboard() {
  const { data } = useData()
  const nav = useNavigate()

  const stats = {
    tanks: data.tanks.length,
    logsToday: data.logs.filter(l => {
      const d = new Date(l.date)
      const today = new Date()
      return d.toDateString() === today.toDateString()
    }).length,
    berried: data.breeding.filter(b => {
      const bd = new Date(b.berriedDate)
      const now = new Date()
      const days = Math.floor((now.getTime() - bd.getTime()) / 86400000)
      return days >= 0 && days <= 28
    }).length,
    totalLogs: data.logs.length,
  }

  return (
    <div>
      <div className="page-header flex-between">
        <div>
          <h1 className="page-title">🦐 Shrimp Lab</h1>
          <p className="page-subtitle">Freshwater shrimp toolkit — local, offline, free.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid-2 mb-3">
        {[
          { v: stats.tanks, l: 'Tanks',   c: 'var(--color-accent)' },
          { v: stats.logsToday, l: 'Today', c: 'var(--color-good)' },
          { v: stats.berried, l: 'Berried', c: 'var(--color-warn)' },
          { v: stats.totalLogs, l: 'Logs',  c: 'var(--color-text-muted)' },
        ].map(s => (
          <div className="card" key={s.l}>
            <div className="stat-value" style={{ color: s.c }}>{s.v}</div>
            <div className="stat-label">{s.l}</div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid-2">
        {[
          { to: '/parameters', icon: Droplets, label: 'Check Parameters', desc: 'Compare your values against target ranges' },
          { to: '/calculator', icon: Calculator, label: 'TDS Calculator', desc: 'Plan water changes to hit target TDS' },
          { to: '/breeding', icon: Timer, label: 'Breeding Timeline', desc: 'Estimate hatch windows from berried date' },
          { to: '/logbook', icon: BookOpen, label: 'Logbook', desc: 'Record water tests, molts, deaths, and notes' },
        ].map(a => (
          <button
            key={a.to}
            className="card"
            onClick={() => nav(a.to)}
            style={{ cursor: 'pointer', textAlign: 'left', border: '1px solid var(--color-border)', background: 'var(--color-surface)' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-accent)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border)' }}
          >
            <div className="flex-row gap-2">
              <a.icon size={22} style={{ color: 'var(--color-accent)' }} />
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{a.label}</div>
                <div className="text-xs text-muted">{a.desc}</div>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Tanks overview */}
      {data.tanks.length > 0 && (
        <div className="mt-3">
          <div className="card-header">Your Tanks</div>
          <div className="grid-2">
            {data.tanks.map(tank => (
              <div className="card" key={tank.id}>
                <div className="flex-between mb-1">
                  <span style={{ fontWeight: 600 }}>{tank.name}</span>
                  <span className={`badge ${tank.species === 'neocaridina' ? 'badge-neo' : 'badge-caridina'}`}>
                    {formatSpecies(tank.species)}
                  </span>
                </div>
                <div className="text-sm text-muted">{tank.volumeL}L</div>
                {tank.substrate && <div className="text-xs text-muted">{tank.substrate}</div>}
              </div>
            ))}
          </div>
        </div>
      )}

      {data.tanks.length === 0 && (
        <div className="card mt-3">
          <div className="empty-state">
            <div className="empty-state-icon">🐟</div>
            <div className="empty-state-title">Add your first tank</div>
            <div className="empty-state-text">
              Go to Settings to add a tank profile (Neocaridina or Caridina).
              This will unlock tank-specific logging and parameter checking.
            </div>
            <button className="btn btn-primary" onClick={() => nav('/settings')}>
              <Plus size={16} /> Add Tank
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
