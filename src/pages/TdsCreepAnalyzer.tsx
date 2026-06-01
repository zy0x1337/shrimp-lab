import { useState, useMemo } from 'react'
import { useData } from '../lib/DataContext'
import { TrendingUp, FlaskConical } from 'lucide-react'

function fmtDate(iso: string) {
  const d = new Date(iso)
  return `${d.getDate().toString().padStart(2,'0')}.${(d.getMonth()+1).toString().padStart(2,'0')}.${d.getFullYear()}`
}

// ── Inline EmptyState ─────────────────────────────────────────────────────────
function EmptyState({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      textAlign: 'center', padding: '2.5rem 1.5rem', gap: '0.75rem',
    }}>
      <div style={{
        width: 48, height: 48, borderRadius: 'var(--radius-lg)',
        background: 'var(--color-surface-offset)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--color-accent)',
      }}>{icon}</div>
      <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--color-text)' }}>{title}</div>
      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', maxWidth: '32ch', lineHeight: 1.5 }}>{body}</div>
    </div>
  )
}

export function TdsCreepAnalyzer() {
  const { data } = useData()
  const [tankId, setTankId] = useState(data.tanks[0]?.id ?? '')
  const [window, setWindow] = useState('30')

  const tdsLogs = useMemo(() =>
    data.logs
      .filter(l => l.tankId === tankId && l.category === 'water_test' && l.values?.tds != null)
      .sort((a, b) => a.date.localeCompare(b.date)),
    [data.logs, tankId]
  )

  const windowDays = parseInt(window) || 30

  const analysis = useMemo(() => {
    if (tdsLogs.length < 2) return null
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - windowDays)
    const recent = tdsLogs.filter(l => new Date(l.date) >= cutoff)
    if (recent.length < 2) return null

    const first = recent[0].values!.tds!
    const last  = recent[recent.length - 1].values!.tds!
    const delta = last - first
    const days  = Math.max(1, Math.round((new Date(recent[recent.length-1].date).getTime() - new Date(recent[0].date).getTime()) / 86400000))
    const ratePerDay  = delta / days
    const ratePerWeek = ratePerDay * 7

    const allValues = recent.map(l => l.values!.tds!)
    const avg = allValues.reduce((a, b) => a + b, 0) / allValues.length
    const min = Math.min(...allValues)
    const max = Math.max(...allValues)

    const severity: 'ok' | 'warn' | 'critical' =
      Math.abs(ratePerWeek) < 10 ? 'ok' :
      Math.abs(ratePerWeek) < 25 ? 'warn' : 'critical'

    return { first, last, delta, days, ratePerDay, ratePerWeek, avg, min, max, severity, count: recent.length }
  }, [tdsLogs, windowDays])

  if (data.tanks.length === 0) {
    return (
      <div>
        <div className="page-header">
          <h1 className="page-title">TDS Creep Analyzer</h1>
          <p className="page-subtitle">Detect gradual TDS drift in your tanks over time.</p>
        </div>
        <div className="card">
          <EmptyState
            icon={<FlaskConical size={22} />}
            title="No tanks configured"
            body="Add a tank in Settings to start analyzing TDS creep."
          />
        </div>
      </div>
    )
  }

  const severityColor = {
    ok:       'var(--color-success)',
    warn:     'var(--color-warning)',
    critical: 'var(--color-error)',
  }

  const severityLabel = {
    ok:       'Stable',
    warn:     'Moderate creep',
    critical: 'Significant drift',
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">TDS Creep Analyzer</h1>
        <p className="page-subtitle">Detect gradual TDS drift and evaporation creep over time.</p>
      </div>

      <div className="card mb-2">
        <div className="card-header">Analysis window</div>
        <div className="grid-2">
          <div>
            <label>Tank</label>
            <select className="select" value={tankId} onChange={e => setTankId(e.target.value)}>
              {data.tanks.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          <div>
            <label>Days to analyze</label>
            <select className="select" value={window} onChange={e => setWindow(e.target.value)}>
              <option value="14">Last 14 days</option>
              <option value="30">Last 30 days</option>
              <option value="60">Last 60 days</option>
              <option value="90">Last 90 days</option>
            </select>
          </div>
        </div>
      </div>

      {tdsLogs.length < 2 ? (
        <div className="card">
          <EmptyState
            icon={<TrendingUp size={22} />}
            title="Not enough TDS data"
            body="Log at least 2 water tests with TDS values for this tank to see creep analysis."
          />
        </div>
      ) : !analysis ? (
        <div className="card">
          <EmptyState
            icon={<TrendingUp size={22} />}
            title="No data in this window"
            body={`No TDS readings found in the last ${windowDays} days. Try a wider analysis window.`}
          />
        </div>
      ) : (
        <>
          <div className="card mb-2">
            <div className="card-header">Analysis — last {windowDays} days ({analysis.count} readings)</div>
            <div className="grid-4">
              <div>
                <div className="stat-value mono" style={{ color: severityColor[analysis.severity] }}>
                  {analysis.delta > 0 ? '+' : ''}{analysis.delta.toFixed(0)}
                </div>
                <div className="stat-label">Total Δ TDS</div>
              </div>
              <div>
                <div className="stat-value mono">
                  {analysis.ratePerWeek > 0 ? '+' : ''}{analysis.ratePerWeek.toFixed(1)}
                </div>
                <div className="stat-label">ppm / week</div>
              </div>
              <div>
                <div className="stat-value mono">{analysis.avg.toFixed(0)}</div>
                <div className="stat-label">Average TDS</div>
              </div>
              <div>
                <div className="stat-value" style={{ color: severityColor[analysis.severity] }}>
                  {severityLabel[analysis.severity]}
                </div>
                <div className="stat-label">Status</div>
              </div>
            </div>

            {analysis.severity !== 'ok' && (
              <div className="mt-1 text-sm" style={{ color: severityColor[analysis.severity] }}>
                {analysis.severity === 'warn'
                  ? '⚠ Mild TDS creep detected. Monitor closely and consider a small water change.'
                  : '⚠ Significant TDS drift. Perform a water change and check for evaporation or overfeeding.'}
              </div>
            )}
          </div>

          <div className="card">
            <div className="card-header">TDS Readings</div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>TDS (ppm)</th>
                    <th>Δ prev</th>
                  </tr>
                </thead>
                <tbody>
                  {tdsLogs.map((log, i) => {
                    const prev = i > 0 ? tdsLogs[i-1].values!.tds! : null
                    const diff = prev != null ? log.values!.tds! - prev : null
                    return (
                      <tr key={log.id}>
                        <td>{fmtDate(log.date)}</td>
                        <td className="mono">{log.values?.tds}</td>
                        <td className="mono" style={{ color: diff == null ? undefined : diff > 0 ? 'var(--color-error)' : diff < 0 ? 'var(--color-success)' : undefined }}>
                          {diff == null ? '—' : `${diff > 0 ? '+' : ''}${diff.toFixed(0)}`}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
