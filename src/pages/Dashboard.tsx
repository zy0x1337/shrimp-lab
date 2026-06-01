import { useData } from '../lib/DataContext'
import { formatSpecies, CATEGORY_ICONS, CATEGORY_LABELS, SPECIES } from '../lib/species'
import { estimateHatch } from '../lib/calculators'
import { useNavigate } from 'react-router-dom'
import {
  Droplets, Calculator, Timer, BookOpen, Plus, TrendingUp,
  AlertTriangle, Beaker, Layers, FlaskConical, BarChart2, Waves,
} from 'lucide-react'

// ── Helpers ────────────────────────────────────────────────────────────────
function DaysAgo({ date }: { date: string }) {
  const d = Math.floor((Date.now() - new Date(date).getTime()) / 86400000)
  if (d === 0) return <span style={{ color: 'var(--color-good)' }}>today</span>
  if (d === 1) return <span style={{ color: 'var(--color-text-muted)' }}>yesterday</span>
  return <span style={{ color: 'var(--color-text-faint)' }}>{d}d ago</span>
}

function HatchProgress({ daysElapsed, daysMin, daysMax }: { daysElapsed: number; daysMin: number; daysMax: number }) {
  const pct = Math.min(100, Math.round((daysElapsed / daysMax) * 100))
  const inWindow = daysElapsed >= daysMin
  return (
    <div style={{ marginTop: '0.5rem' }}>
      <div style={{
        height: '3px',
        background: 'var(--color-surface-offset)',
        borderRadius: '9999px',
        overflow: 'hidden',
      }}>
        <div style={{
          height: '100%',
          width: `${pct}%`,
          background: inWindow ? 'var(--color-good)' : 'var(--color-accent)',
          borderRadius: '9999px',
          transition: 'width 0.4s ease',
        }} />
      </div>
    </div>
  )
}

// ── Dashboard ─────────────────────────────────────────────────────────────
export function Dashboard() {
  const { data } = useData()
  const nav = useNavigate()

  const now = new Date()
  const todayStr = now.toDateString()

  const stats = {
    tanks:      data.tanks.length,
    logsToday:  data.logs.filter(l => new Date(l.date).toDateString() === todayStr).length,
    berried:    data.breeding.filter(b => {
      const d = Math.floor((now.getTime() - new Date(b.berriedDate).getTime()) / 86400000)
      return d >= 0 && d <= 30
    }).length,
    totalLogs:  data.logs.length,
  }

  const recentLogs = [...data.logs]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 6)

  const activeBerried = data.breeding
    .filter(b => {
      const d = Math.floor((now.getTime() - new Date(b.berriedDate).getTime()) / 86400000)
      return d >= 0 && d <= 35
    })
    .map(b => {
      const est = estimateHatch(b.berriedDate, b.tempC)
      const tank = data.tanks.find(t => t.id === b.tankId)
      return { ...b, est, tank }
    })
    .sort((a, b) => a.est.daysRemaining - b.est.daysRemaining)

  const tankSummaries = data.tanks.map(tank => {
    const latestTest = [...data.logs]
      .filter(l => l.tankId === tank.id && l.category === 'water_test' && l.values?.tds)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]
    return { tank, latestTest, speciesParams: SPECIES[tank.species] }
  })

  const hasAnyData = data.tanks.length > 0 || data.logs.length > 0

  // ── Quick-action config ───────────────────────────────────────────────
  const quickActions = [
    { to: '/parameters',   icon: Droplets,      label: 'Parameters',    desc: 'Check water values' },
    { to: '/calculator',   icon: Calculator,    label: 'TDS Calc',      desc: 'Water change planner' },
    { to: '/remineralize', icon: Beaker,        label: 'Remineralize',  desc: 'RO/DI dosage' },
    { to: '/breeding',     icon: Timer,         label: 'Breeding',      desc: 'Hatch timeline' },
    { to: '/logbook',      icon: BookOpen,      label: 'Logbook',       desc: 'Log an entry' },
    { to: '/charts',       icon: BarChart2,     label: 'Charts',        desc: 'Parameter history' },
    { to: '/molt',         icon: Layers,        label: 'Molt Tracker',  desc: 'Moult records' },
    { to: '/colony',       icon: Waves,         label: 'Colony',        desc: 'Population estimate' },
  ]

  return (
    <div className="dashboard">

      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="dashboard-hero">
        <div className="dashboard-hero__text">
          <h1 className="page-title">Shrimp Lab</h1>
          <p className="page-subtitle">Freshwater shrimp toolkit — local, offline, free.</p>
        </div>
        {data.tanks.length > 0 && (
          <button className="btn btn-primary btn-sm" onClick={() => nav('/logbook')}>
            <Plus size={14} /> Log Entry
          </button>
        )}
      </div>

      {/* ── Stats row ───────────────────────────────────────────────── */}
      <div className="stats-row">
        {[
          { v: stats.tanks,     l: 'Tanks',      c: 'var(--color-accent)' },
          { v: stats.berried,   l: 'Berried',    c: 'var(--color-warn)' },
          { v: stats.logsToday, l: 'Today',      c: 'var(--color-good)' },
          { v: stats.totalLogs, l: 'Total Logs', c: 'var(--color-text-muted)' },
        ].map(s => (
          <div className="stat-card" key={s.l}>
            <div className="stat-value" style={{ color: s.c, fontSize: '1.6rem' }}>{s.v}</div>
            <div className="stat-label">{s.l}</div>
          </div>
        ))}
      </div>

      {!hasAnyData ? (
        /* ── Onboarding ─────────────────────────────────────────── */
        <div className="card" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🦐</div>
          <div style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: '0.4rem' }}>Welcome to Shrimp Lab</div>
          <p className="text-sm text-muted" style={{ maxWidth: '42ch', margin: '0 auto 1.5rem' }}>
            Your local-first toolkit for freshwater shrimp keeping.
            Start by adding a tank — everything else builds on that.
          </p>
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={() => nav('/settings')}>
              <Plus size={15} /> Add Tank
            </button>
            <button className="btn btn-ghost" onClick={() => nav('/reference')}>
              Species Reference
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* ── Active breeding alerts ───────────────────────────── */}
          {activeBerried.length > 0 && (
            <section className="dashboard-section">
              <div className="section-header">
                <span className="section-title"><Timer size={13} /> Active Breeding</span>
                <button className="btn btn-ghost btn-sm" onClick={() => nav('/breeding')}>View all →</button>
              </div>
              <div className="grid-2">
                {activeBerried.slice(0, 4).map(b => {
                  const isWindow   = b.est.daysRemaining === 0 && b.est.daysElapsed <= b.est.daysMax
                  const urgent     = !isWindow && b.est.daysRemaining <= 3
                  return (
                    <div key={b.id} className="card breeding-card">
                      <div className="flex-between mb-1">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <span style={{ fontSize: '1rem' }}>{isWindow ? '🦐' : '🥚'}</span>
                          <span style={{ fontWeight: 600, fontSize: '0.88rem' }}>
                            {b.tank?.name ?? 'Tank'}
                          </span>
                        </div>
                        <span className={`badge ${b.species === 'neocaridina' ? 'badge-neo' : 'badge-caridina'}`}>
                          {formatSpecies(b.species)}
                        </span>
                      </div>

                      <div className="text-xs text-muted" style={{ marginBottom: '0.2rem' }}>
                        {isWindow
                          ? '✓ Hatch window — check for shrimplets'
                          : urgent
                            ? `⏰ ${b.est.daysRemaining}d remaining`
                            : `Day ${b.est.daysElapsed} of ${b.est.daysMin}–${b.est.daysMax}`
                        }
                      </div>

                      <HatchProgress
                        daysElapsed={b.est.daysElapsed}
                        daysMin={b.est.daysMin}
                        daysMax={b.est.daysMax}
                      />

                      <div className="text-xs text-faint" style={{ marginTop: '0.4rem' }}>
                        Berried {new Date(b.berriedDate).toLocaleDateString('de-DE')} ·{' '}
                        window {b.est.hatchStart.toLocaleDateString('de-DE', { day: 'numeric', month: 'short' })}–
                        {b.est.hatchEnd.toLocaleDateString('de-DE', { day: 'numeric', month: 'short' })}
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>
          )}

          {/* ── Quick actions ────────────────────────────────────── */}
          <section className="dashboard-section">
            <div className="section-header">
              <span className="section-title">Tools</span>
            </div>
            <div className="quick-actions-grid">
              {quickActions.map(a => (
                <button
                  key={a.to}
                  className="quick-action-btn"
                  onClick={() => nav(a.to)}
                >
                  <a.icon size={16} className="quick-action-icon" />
                  <span className="quick-action-label">{a.label}</span>
                  <span className="quick-action-desc">{a.desc}</span>
                </button>
              ))}
            </div>
          </section>

          {/* ── Tank snapshots ───────────────────────────────────── */}
          {tankSummaries.length > 0 && (
            <section className="dashboard-section">
              <div className="section-header">
                <span className="section-title"><TrendingUp size={13} /> Tanks</span>
                <button className="btn btn-ghost btn-sm" onClick={() => nav('/logbook')}>Logbook →</button>
              </div>
              <div className="grid-2">
                {tankSummaries.map(({ tank, latestTest, speciesParams }) => (
                  <div className="card" key={tank.id}>
                    <div className="flex-between mb-2">
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.92rem' }}>{tank.name}</div>
                        <div className="text-xs text-faint">{tank.volumeL}L{tank.substrate ? ` · ${tank.substrate}` : ''}</div>
                      </div>
                      <span className={`badge ${tank.species === 'neocaridina' ? 'badge-neo' : 'badge-caridina'}`}>
                        {formatSpecies(tank.species)}
                      </span>
                    </div>

                    {latestTest ? (
                      <div>
                        <div className="text-xs text-faint" style={{ marginBottom: '0.4rem' }}>
                          Last test: <DaysAgo date={latestTest.date} />
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                          {(['tds', 'gh', 'kh', 'ph', 'tempC'] as const).map(param => {
                            const v = latestTest.values?.[param]
                            if (v == null) return null
                            const range = speciesParams[param === 'tempC' ? 'tempC' : param]
                            const inRange = v >= range.min && v <= range.max
                            const close   = !inRange && (
                              (param === 'ph' && Math.abs(v - range.min) <= 0.5) ||
                              (param !== 'ph' && v >= range.min * 0.9 && v <= range.max * 1.1)
                            )
                            const labels: Record<string, string> = {
                              tds: 'TDS', gh: 'GH', kh: 'KH', ph: 'pH', tempC: '°C',
                            }
                            return (
                              <span
                                key={param}
                                className="badge"
                                style={{
                                  background: inRange
                                    ? 'oklch(0.88 0.10 160 / 0.18)'
                                    : close
                                    ? 'oklch(0.85 0.12 80 / 0.18)'
                                    : 'oklch(0.70 0.18 25 / 0.14)',
                                  color: inRange
                                    ? 'var(--color-good)'
                                    : close
                                    ? 'var(--color-warn)'
                                    : 'var(--color-bad)',
                                  borderColor: 'transparent',
                                }}
                              >
                                {labels[param]} {v}
                              </span>
                            )
                          })}
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text-muted" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <AlertTriangle size={13} />
                        No water test yet.
                        <button className="btn btn-ghost btn-sm" onClick={() => nav('/logbook')}>Log now</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ── Recent activity ──────────────────────────────────── */}
          {recentLogs.length > 0 && (
            <section className="dashboard-section">
              <div className="section-header">
                <span className="section-title"><BookOpen size={13} /> Recent Activity</span>
                <button className="btn btn-ghost btn-sm" onClick={() => nav('/logbook')}>View all →</button>
              </div>
              <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                {recentLogs.map((log, i) => {
                  const tank = data.tanks.find(t => t.id === log.tankId)
                  return (
                    <div
                      key={log.id}
                      className="activity-row"
                      style={{ borderBottom: i < recentLogs.length - 1 ? '1px solid var(--color-divider)' : 'none' }}
                    >
                      <span className="activity-icon">{CATEGORY_ICONS[log.category]}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                          {CATEGORY_LABELS[log.category]}
                          {tank && <span className="text-xs text-faint" style={{ marginLeft: '0.4rem', fontWeight: 400 }}>{tank.name}</span>}
                        </div>
                        {log.notes && (
                          <div className="text-xs text-muted" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {log.notes}
                          </div>
                        )}
                      </div>
                      <div className="text-xs text-faint mono" style={{ whiteSpace: 'nowrap', flexShrink: 0 }}>
                        <DaysAgo date={log.date} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  )
}
