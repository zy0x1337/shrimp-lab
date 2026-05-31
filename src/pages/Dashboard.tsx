import { useData } from '../lib/DataContext'
import { formatSpecies, CATEGORY_ICONS, CATEGORY_LABELS, SPECIES } from '../lib/species'
import { estimateHatch } from '../lib/calculators'
import { useNavigate } from 'react-router-dom'
import {
  Droplets, Calculator, Timer, BookOpen, Plus, TrendingUp,
  AlertTriangle, Beaker,
} from 'lucide-react'

export function Dashboard() {
  const { data } = useData()
  const nav = useNavigate()

  const now = new Date()
  const todayStr = now.toDateString()

  // Stats
  const stats = {
    tanks: data.tanks.length,
    logsToday: data.logs.filter(l => {
      return new Date(l.date).toDateString() === todayStr
    }).length,
    berried: data.breeding.filter(b => {
      const days = Math.floor((now.getTime() - new Date(b.berriedDate).getTime()) / 86400000)
      return days >= 0 && days <= 30
    }).length,
    totalLogs: data.logs.length,
  }

  // Recent activity (last 5 log entries)
  const recentLogs = [...data.logs]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)

  // Active berried tracking
  const activeBerried = data.breeding
    .filter(b => {
      const days = Math.floor((now.getTime() - new Date(b.berriedDate).getTime()) / 86400000)
      return days >= 0 && days <= 30
    })
    .map(b => {
      const est = estimateHatch(b.berriedDate, b.tempC)
      const tank = data.tanks.find(t => t.id === b.tankId)
      return { ...b, est, tank }
    })
    .sort((a, b) => a.est.daysRemaining - b.est.daysRemaining)

  // Parameter summaries per tank (latest water test)
  const tankSummaries = data.tanks.map(tank => {
    const latestTest = [...data.logs]
      .filter(l => l.tankId === tank.id && l.category === 'water_test' && l.values?.tds)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]

    const speciesParams = SPECIES[tank.species]
    return { tank, latestTest, speciesParams }
  })

  const hasAnyData = data.tanks.length > 0 || data.logs.length > 0

  return (
    <div>
      <div className="page-header flex-between">
        <div>
          <h1 className="page-title">🦐 Shrimp Lab</h1>
          <p className="page-subtitle">Freshwater shrimp toolkit — local, offline, free.</p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid-2 mb-3">
        {[
          { v: stats.tanks, l: 'Tanks', c: 'var(--color-accent)' },
          { v: stats.logsToday, l: 'Today', c: 'var(--color-good)' },
          { v: stats.berried, l: 'Berried', c: 'var(--color-warn)' },
          { v: stats.totalLogs, l: 'Total Logs', c: 'var(--color-text-muted)' },
        ].map(s => (
          <div className="card" key={s.l}>
            <div className="stat-value" style={{ color: s.c }}>{s.v}</div>
            <div className="stat-label">{s.l}</div>
          </div>
        ))}
      </div>

      {!hasAnyData ? (
        /* Fresh install — onboarding */
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">🦐</div>
            <div className="empty-state-title">Welcome to Shrimp Lab</div>
            <div className="empty-state-text">
              Your local-first toolkit for freshwater shrimp keeping.
              Start by adding a tank, then log water tests, track breeding,
              and use calculators to keep your colony thriving.
            </div>
            <div className="flex-row gap-1" style={{ flexWrap: 'wrap', justifyContent: 'center' }}>
              <button className="btn btn-primary" onClick={() => nav('/settings')}>
                <Plus size={16} /> Add Tank
              </button>
              <button className="btn btn-ghost" onClick={() => nav('/reference')}>
                View Species Reference
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Active berried alerts */}
          {activeBerried.length > 0 && (
            <div className="mb-3">
              <div className="card-header flex-between">
                <span><Timer size={16} style={{ display: 'inline', marginRight: '0.3rem', verticalAlign: 'middle' }} />Active Breeding</span>
                <button className="btn btn-ghost btn-sm" onClick={() => nav('/breeding')}>View All</button>
              </div>
              <div className="grid-2">
                {activeBerried.slice(0, 4).map(b => {
                  const urgent = b.est.daysRemaining <= 3
                  const isWindow = b.est.daysRemaining === 0 && b.est.daysElapsed <= b.est.daysMax
                  return (
                    <div
                      key={b.id}
                      className="card"
                      style={{ borderColor: urgent ? 'var(--color-warn)' : isWindow ? 'var(--color-accent)' : 'var(--color-border)' }}
                    >
                      <div className="flex-between mb-1">
                        <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                          {isWindow ? '🦐' : '🥚'} {b.tank?.name ?? 'Tank'}
                        </span>
                        <span className={`badge ${b.species === 'neocaridina' ? 'badge-neo' : 'badge-caridina'}`}>
                          {formatSpecies(b.species)}
                        </span>
                      </div>
                      <div className="text-sm text-muted">
                        {isWindow
                          ? 'Hatch window active — check for shrimplets!'
                          : b.est.daysRemaining <= 3
                            ? `⏰ ${b.est.daysRemaining}d remaining — nearly there`
                            : `${b.est.daysRemaining}d remaining · day ${b.est.daysElapsed}/${b.est.daysMin}–${b.est.daysMax}`
                        }
                      </div>
                      <div className="text-xs text-faint mt-1">
                        Berried {new Date(b.berriedDate).toLocaleDateString('de-DE')} · window {b.est.hatchStart.toLocaleDateString('de-DE', { day: 'numeric', month: 'short' })}–{b.est.hatchEnd.toLocaleDateString('de-DE', { day: 'numeric', month: 'short' })}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Quick actions */}
          <div className="mb-3">
            <div className="card-header">Quick Actions</div>
            <div className="grid-2">
              {[
                { to: '/parameters', icon: Droplets, label: 'Check Parameters', desc: 'Compare your values against target ranges' },
                { to: '/calculator', icon: Calculator, label: 'TDS Calculator', desc: 'Plan water changes to hit target TDS' },
                { to: '/remineralize', icon: Beaker, label: 'Remineralize', desc: 'Calculate remineralizer dosage for RO/DI water' },
                { to: '/breeding', icon: Timer, label: 'Breeding Timeline', desc: 'Estimate hatch windows from berried date' },
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
                    <a.icon size={20} style={{ color: 'var(--color-accent)' }} />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{a.label}</div>
                      <div className="text-xs text-muted">{a.desc}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Tank parameter snapshots */}
          {tankSummaries.length > 0 && (
            <div className="mb-3">
              <div className="card-header flex-between">
                <span><TrendingUp size={16} style={{ display: 'inline', marginRight: '0.3rem', verticalAlign: 'middle' }} />Tank Parameters</span>
                <button className="btn btn-ghost btn-sm" onClick={() => nav('/logbook')}>Logbook →</button>
              </div>
              <div className="grid-2">
                {tankSummaries.map(({ tank, latestTest, speciesParams }) => (
                  <div className="card" key={tank.id}>
                    <div className="flex-between mb-2">
                      <div>
                        <div style={{ fontWeight: 600 }}>{tank.name}</div>
                        <div className="text-xs text-muted">{tank.volumeL}L · {tank.substrate || '—'}</div>
                      </div>
                      <span className={`badge ${tank.species === 'neocaridina' ? 'badge-neo' : 'badge-caridina'}`}>
                        {formatSpecies(tank.species)}
                      </span>
                    </div>

                    {latestTest ? (
                      <div>
                        <div className="text-xs text-faint mb-1">
                          Last test: {new Date(latestTest.date).toLocaleDateString('de-DE')}
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                          {(['tds', 'gh', 'kh', 'ph', 'tempC'] as const).map(param => {
                            const v = latestTest.values?.[param]
                            if (v == null) return null
                            const range = speciesParams[param === 'tempC' ? 'tempC' : param]
                            const inRange = v >= range.min && v <= range.max
                            const close = !inRange && (
                              (param === 'ph' && Math.abs(v - range.min) <= 0.5) ||
                              (param !== 'ph' && (v >= range.min * 0.9 && v <= range.max * 1.1))
                            )
                            const labels: Record<string, string> = {
                              tds: 'TDS', gh: 'GH', kh: 'KH', ph: 'pH', tempC: '°C',
                            }
                            return (
                              <span
                                key={param}
                                className="badge"
                                style={{
                                  background: inRange ? 'rgba(74,222,176,0.12)' : close ? 'rgba(251,191,36,0.12)' : 'rgba(248,113,113,0.12)',
                                  color: inRange ? 'var(--color-good)' : close ? 'var(--color-warn)' : 'var(--color-bad)',
                                }}
                              >
                                {labels[param]} {v}
                              </span>
                            )
                          })}
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text-muted">
                        <AlertTriangle size={14} style={{ display: 'inline', marginRight: '0.3rem', verticalAlign: 'middle' }} />
                        No water test recorded yet.
                        <button
                          className="btn btn-ghost btn-sm"
                          style={{ marginLeft: '0.5rem' }}
                          onClick={() => nav('/logbook')}
                        >
                          Log Now
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent activity */}
          {recentLogs.length > 0 && (
            <div>
              <div className="card-header flex-between">
                <span><BookOpen size={16} style={{ display: 'inline', marginRight: '0.3rem', verticalAlign: 'middle' }} />Recent Activity</span>
                <button className="btn btn-ghost btn-sm" onClick={() => nav('/logbook')}>View All</button>
              </div>
              <div className="card" style={{ padding: 0 }}>
                {recentLogs.map((log, i) => {
                  const tank = data.tanks.find(t => t.id === log.tankId)
                  return (
                    <div
                      key={log.id}
                      className="flex-between"
                      style={{
                        padding: '0.65rem 1.25rem',
                        borderBottom: i < recentLogs.length - 1 ? '1px solid var(--color-divider)' : 'none',
                      }}
                    >
                      <div className="flex-row gap-2">
                        <span style={{ fontSize: '1.1rem' }}>{CATEGORY_ICONS[log.category]}</span>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>
                            {CATEGORY_LABELS[log.category]}
                            {tank && <span className="text-xs text-faint" style={{ marginLeft: '0.5rem' }}>{tank.name}</span>}
                          </div>
                          {log.notes && (
                            <div className="text-xs text-muted" style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {log.notes}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-xs text-faint mono">
                        {new Date(log.date).toLocaleDateString('de-DE', { day: 'numeric', month: 'short' })}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
