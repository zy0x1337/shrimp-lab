import { useState, useMemo } from 'react'
import { useData } from '../lib/DataContext'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface CreepStat {
  date: string
  tds: number
  daysSince: number | null
  rise: number | null
  risePerDay: number | null
}

export function TdsCreepAnalyzer() {
  const { data } = useData()
  const [tankId, setTankId] = useState(data.tanks[0]?.id ?? '')

  const stats: CreepStat[] = useMemo(() => {
    const entries = data.logs
      .filter(l => l.tankId === tankId && l.category === 'water_test' && l.values?.tds != null)
      .sort((a, b) => a.date.localeCompare(b.date))

    return entries.map((entry, i) => {
      if (i === 0) return { date: entry.date, tds: entry.values!.tds!, daysSince: null, rise: null, risePerDay: null }
      const prev = entries[i - 1]
      const days = Math.max(
        1,
        Math.round((new Date(entry.date).getTime() - new Date(prev.date).getTime()) / 86400000)
      )
      const rise = entry.values!.tds! - prev.values!.tds!
      return {
        date: entry.date,
        tds: entry.values!.tds!,
        daysSince: days,
        rise,
        risePerDay: +(rise / days).toFixed(2),
      }
    })
  }, [data.logs, tankId])

  const avgRisePerDay = useMemo(() => {
    const valid = stats.filter(s => s.risePerDay != null && s.risePerDay > 0)
    if (!valid.length) return null
    return +(valid.reduce((a, s) => a + s.risePerDay!, 0) / valid.length).toFixed(2)
  }, [stats])

  const lastTds = stats.length ? stats[stats.length - 1].tds : null
  const tank = data.tanks.find(t => t.id === tankId)
  const tdsTarget = tank?.species === 'caridina' ? { min: 100, max: 180 } : { min: 150, max: 250 }

  function tdsStatus(tds: number) {
    if (tds < tdsTarget.min) return 'low'
    if (tds > tdsTarget.max) return 'high'
    return 'good'
  }

  function fmtDate(iso: string) {
    const d = new Date(iso)
    return `${d.getDate().toString().padStart(2, '0')}.${(d.getMonth() + 1).toString().padStart(2, '0')}.${d.getFullYear()}`
  }

  if (data.tanks.length === 0) {
    return (
      <div>
        <div className="page-header">
          <h1 className="page-title">TDS Creep Analyzer</h1>
          <p className="page-subtitle">Track TDS rise between water changes.</p>
        </div>
        <div className="card"><p className="text-sm text-muted">No tanks yet. Add one in Settings.</p></div>
      </div>
    )
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">TDS Creep Analyzer</h1>
        <p className="page-subtitle">Detect evaporation creep vs contamination in your tank.</p>
      </div>

      {/* Tank selector */}
      <div className="card mb-2">
        <label style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', display: 'block', marginBottom: 4 }}>Tank</label>
        <select className="select" value={tankId} onChange={e => setTankId(e.target.value)}>
          {data.tanks.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
      </div>

      {/* Summary */}
      {stats.length >= 2 && (
        <div className="card mb-2">
          <div className="card-header">Summary</div>
          <div className="grid-3 text-sm">
            <div>
              <div className="stat-value" style={{ fontSize: '1.4rem', color: lastTds ? (tdsStatus(lastTds) === 'good' ? 'var(--color-success)' : 'var(--color-error)') : 'inherit' }}>
                {lastTds ?? '—'}
              </div>
              <div className="stat-label">Current TDS (ppm)</div>
            </div>
            <div>
              <div className="stat-value" style={{ fontSize: '1.4rem', color: avgRisePerDay && avgRisePerDay > 3 ? 'var(--color-error)' : avgRisePerDay && avgRisePerDay > 1 ? 'var(--color-warning)' : 'var(--color-success)' }}>
                {avgRisePerDay != null ? `+${avgRisePerDay}` : '—'}
              </div>
              <div className="stat-label">Avg. TDS rise / day</div>
            </div>
            <div>
              <div className="stat-value" style={{ fontSize: '1.4rem' }}>{tdsTarget.min}–{tdsTarget.max}</div>
              <div className="stat-label">Target range (ppm)</div>
            </div>
          </div>
          {avgRisePerDay != null && avgRisePerDay > 3 && (
            <div className="mt-1 text-sm" style={{ color: 'var(--color-error)' }}>
              ⚠ High TDS creep detected (&gt;3 ppm/day). Check for evaporation, top-off with RO/DI instead of tap.
            </div>
          )}
          {avgRisePerDay != null && avgRisePerDay > 1 && avgRisePerDay <= 3 && (
            <div className="mt-1 text-sm" style={{ color: 'var(--color-warning)' }}>
              Moderate creep (1–3 ppm/day). Monitor closely — increase top-off frequency.
            </div>
          )}
        </div>
      )}

      {/* Log table */}
      <div className="card">
        <div className="card-header">TDS History</div>
        {stats.length === 0 && (
          <p className="text-sm text-muted">No water test logs with TDS values for this tank yet.</p>
        )}
        {stats.length > 0 && (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-sm)' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border)', color: 'var(--color-text-muted)', textAlign: 'left' }}>
                  <th style={{ padding: '6px 8px' }}>Date</th>
                  <th style={{ padding: '6px 8px' }}>TDS</th>
                  <th style={{ padding: '6px 8px' }}>Days since prev.</th>
                  <th style={{ padding: '6px 8px' }}>Rise</th>
                  <th style={{ padding: '6px 8px' }}>Rise / day</th>
                  <th style={{ padding: '6px 8px' }}>Trend</th>
                </tr>
              </thead>
              <tbody>
                {stats.map((s, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--color-divider)' }}>
                    <td style={{ padding: '6px 8px', fontVariantNumeric: 'tabular-nums' }}>{fmtDate(s.date)}</td>
                    <td style={{ padding: '6px 8px', fontWeight: 600, color: tdsStatus(s.tds) === 'good' ? 'var(--color-success)' : tdsStatus(s.tds) === 'high' ? 'var(--color-error)' : 'var(--color-warning)' }}>
                      {s.tds}
                    </td>
                    <td style={{ padding: '6px 8px', color: 'var(--color-text-muted)' }}>{s.daysSince ?? '—'}</td>
                    <td style={{ padding: '6px 8px', color: s.rise != null ? (s.rise > 0 ? 'var(--color-error)' : s.rise < 0 ? 'var(--color-success)' : 'inherit') : 'inherit' }}>
                      {s.rise != null ? (s.rise > 0 ? `+${s.rise}` : s.rise) : '—'}
                    </td>
                    <td style={{ padding: '6px 8px', fontVariantNumeric: 'tabular-nums' }}>
                      {s.risePerDay != null ? (s.risePerDay > 0 ? `+${s.risePerDay}` : s.risePerDay) : '—'}
                    </td>
                    <td style={{ padding: '6px 8px' }}>
                      {s.rise == null ? <Minus size={14} color="var(--color-text-faint)" /> :
                        s.rise > 0 ? <TrendingUp size={14} color="var(--color-error)" /> :
                        s.rise < 0 ? <TrendingDown size={14} color="var(--color-success)" /> :
                        <Minus size={14} color="var(--color-text-faint)" />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
