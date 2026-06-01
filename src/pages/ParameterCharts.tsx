import { useMemo, useState } from 'react'
import { useData } from '../lib/DataContext'
import { LineChart, FlaskConical } from 'lucide-react'

type Metric = 'tds' | 'gh' | 'kh' | 'ph' | 'tempC'

const METRIC_LABELS: Record<Metric, string> = {
  tds:   'TDS (ppm)',
  gh:    'GH (°dGH)',
  kh:    'KH (°dKH)',
  ph:    'pH',
  tempC: 'Temp (°C)',
}

const METRIC_COLOR: Record<Metric, string> = {
  tds:   'var(--color-accent)',
  gh:    'var(--color-success)',
  kh:    'var(--color-warning)',
  ph:    'var(--color-orange)',
  tempC: 'var(--color-error)',
}

function fmtDate(iso: string) {
  const d = new Date(iso)
  return `${d.getDate().toString().padStart(2,'0')}.${(d.getMonth()+1).toString().padStart(2,'0')}`
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

// ── Minimal sparkline chart ───────────────────────────────────────────────────
function MiniChart({ points, color, height = 80 }: { points: number[]; color: string; height?: number }) {
  if (points.length < 2) return null
  const min = Math.min(...points)
  const max = Math.max(...points)
  const range = max - min || 1
  const w = 600
  const h = height
  const pad = 4

  const coords = points.map((v, i) => {
    const x = pad + (i / (points.length - 1)) * (w - 2 * pad)
    const y = h - pad - ((v - min) / range) * (h - 2 * pad)
    return `${x},${y}`
  })

  const pathD = 'M ' + coords.join(' L ')
  const areaD = `M ${pad},${h - pad} L ${coords.join(' L ')} L ${w - pad},${h - pad} Z`

  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', height, display: 'block' }} aria-hidden>
      <defs>
        <linearGradient id={`grad-${color.replace(/[^a-z]/g,'')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.18" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path d={areaD} fill={`url(#grad-${color.replace(/[^a-z]/g,'')})`} />
      <path d={pathD} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
      {/* last point dot */}
      <circle
        cx={parseFloat(coords[coords.length - 1].split(',')[0])}
        cy={parseFloat(coords[coords.length - 1].split(',')[1])}
        r="3" fill={color}
      />
    </svg>
  )
}

export function ParameterCharts() {
  const { data } = useData()
  const [tankId, setTankId] = useState(data.tanks[0]?.id ?? '')
  const [metric, setMetric] = useState<Metric>('tds')
  const [days, setDays]     = useState('60')

  const logs = useMemo(() => {
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - (parseInt(days) || 60))
    return data.logs
      .filter(l =>
        l.tankId === tankId &&
        l.category === 'water_test' &&
        l.values?.[metric] != null &&
        new Date(l.date) >= cutoff
      )
      .sort((a, b) => a.date.localeCompare(b.date))
  }, [data.logs, tankId, metric, days])

  const points  = logs.map(l => l.values![metric] as number)
  const avg     = points.length ? points.reduce((a, b) => a + b, 0) / points.length : 0
  const minVal  = points.length ? Math.min(...points) : 0
  const maxVal  = points.length ? Math.max(...points) : 0
  const last    = points[points.length - 1] ?? null

  if (data.tanks.length === 0) {
    return (
      <div>
        <div className="page-header">
          <h1 className="page-title">Parameter Charts</h1>
          <p className="page-subtitle">Visualize water parameter trends over time.</p>
        </div>
        <div className="card">
          <EmptyState
            icon={<FlaskConical size={22} />}
            title="No tanks configured"
            body="Add a tank in Settings to start charting water parameters."
          />
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Parameter Charts</h1>
        <p className="page-subtitle">Visualize water parameter trends over time.</p>
      </div>

      {/* Controls */}
      <div className="card mb-2">
        <div className="flex-row gap-1" style={{ flexWrap: 'wrap', marginBottom: 8 }}>
          {data.tanks.map(t => (
            <button
              key={t.id}
              className={`btn btn-sm ${tankId === t.id ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setTankId(t.id)}
            >{t.name}</button>
          ))}
        </div>
        <div className="flex-row gap-1" style={{ flexWrap: 'wrap', marginBottom: 8 }}>
          {(Object.keys(METRIC_LABELS) as Metric[]).map(m => (
            <button
              key={m}
              className={`btn btn-sm ${metric === m ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setMetric(m)}
              style={metric !== m ? { color: METRIC_COLOR[m] } : {}}
            >{METRIC_LABELS[m]}</button>
          ))}
        </div>
        <select className="select" style={{ width: 'fit-content' }} value={days} onChange={e => setDays(e.target.value)}>
          <option value="14">Last 14 days</option>
          <option value="30">Last 30 days</option>
          <option value="60">Last 60 days</option>
          <option value="90">Last 90 days</option>
          <option value="365">Last 365 days</option>
        </select>
      </div>

      {/* Chart */}
      {logs.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={<LineChart size={22} />}
            title="No data for this selection"
            body={`No ${METRIC_LABELS[metric]} readings found in the last ${days} days. Log water tests in the Logbook to populate this chart.`}
          />
        </div>
      ) : (
        <div className="card">
          <div className="card-header" style={{ marginBottom: 8 }}>
            {METRIC_LABELS[metric]} — {data.tanks.find(t => t.id === tankId)?.name}
          </div>

          <div className="grid-4 mb-2">
            <div>
              <div className="stat-value mono" style={{ color: METRIC_COLOR[metric] }}>{last?.toFixed(1) ?? '—'}</div>
              <div className="stat-label">Latest</div>
            </div>
            <div>
              <div className="stat-value mono">{avg.toFixed(1)}</div>
              <div className="stat-label">Average</div>
            </div>
            <div>
              <div className="stat-value mono">{minVal.toFixed(1)}</div>
              <div className="stat-label">Min</div>
            </div>
            <div>
              <div className="stat-value mono">{maxVal.toFixed(1)}</div>
              <div className="stat-label">Max</div>
            </div>
          </div>

          <MiniChart points={points} color={METRIC_COLOR[metric]} height={100} />

          <div style={{ marginTop: 8 }}>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>{METRIC_LABELS[metric]}</th>
                    <th>Δ prev</th>
                  </tr>
                </thead>
                <tbody>
                  {[...logs].reverse().map((log, i, arr) => {
                    const prev = arr[i + 1]?.values?.[metric] as number | undefined
                    const val  = log.values![metric] as number
                    const diff = prev != null ? val - prev : null
                    return (
                      <tr key={log.id}>
                        <td>{fmtDate(log.date)}</td>
                        <td className="mono">{val.toFixed(1)}</td>
                        <td className="mono" style={{ color: diff == null ? undefined : diff > 0 ? 'var(--color-warning)' : 'var(--color-success)' }}>
                          {diff == null ? '—' : `${diff > 0 ? '+' : ''}${diff.toFixed(1)}`}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
