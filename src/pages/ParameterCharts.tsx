import { useState, useMemo } from 'react'
import { useData } from '../lib/DataContext'
import type { LogEntry } from '../lib/types'

// ── Inline SVG line chart — no external deps ──────────────────────────────────
interface ChartPoint { x: number; y: number; date: string; value: number }

interface LineChartProps {
  points: ChartPoint[]
  color: string
  unit: string
  minY: number
  maxY: number
  targetMin?: number
  targetMax?: number
  width?: number
  height?: number
}

function LineChart({ points, color, unit, minY, maxY, targetMin, targetMax, width = 600, height = 140 }: LineChartProps) {
  if (points.length < 2) {
    return (
      <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-faint)', fontSize: 'var(--text-sm)' }}>
        Not enough data — log at least 2 water tests.
      </div>
    )
  }
  const pad = { t: 12, r: 12, b: 28, l: 40 }
  const W = width - pad.l - pad.r
  const H = height - pad.t - pad.b
  const range = maxY - minY || 1
  const toX = (x: number) => pad.l + (x / (points.length - 1)) * W
  const toY = (v: number) => pad.t + H - ((v - minY) / range) * H
  const polyline = points.map((p, i) => `${toX(i)},${toY(p.value)}`).join(' ')
  const area = `M${toX(0)},${toY(points[0].value)} ` +
    points.slice(1).map((p, i) => `L${toX(i + 1)},${toY(p.value)}`).join(' ') +
    ` L${toX(points.length - 1)},${pad.t + H} L${toX(0)},${pad.t + H} Z`
  // Y-axis labels
  const yTicks = [minY, (minY + maxY) / 2, maxY]
  // X-axis labels (first, mid, last)
  const xLabels = [0, Math.floor((points.length - 1) / 2), points.length - 1].filter((v, i, a) => a.indexOf(v) === i)

  return (
    <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height, overflow: 'visible' }} aria-label="Parameter trend chart">
      {/* Target band */}
      {targetMin !== undefined && targetMax !== undefined && (
        <rect
          x={pad.l} y={toY(targetMax)}
          width={W} height={toY(targetMin) - toY(targetMax)}
          fill={color} fillOpacity={0.08}
        />
      )}
      {/* Area fill */}
      <path d={area} fill={color} fillOpacity={0.12} />
      {/* Line */}
      <polyline points={polyline} fill="none" stroke={color} strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" />
      {/* Dots */}
      {points.map((p, i) => (
        <circle key={i} cx={toX(i)} cy={toY(p.value)} r={3} fill={color} />
      ))}
      {/* Y-axis */}
      <line x1={pad.l} y1={pad.t} x2={pad.l} y2={pad.t + H} stroke="var(--color-border)" strokeWidth={1} />
      {yTicks.map((v, i) => (
        <text key={i} x={pad.l - 6} y={toY(v) + 4} textAnchor="end" fontSize={10} fill="var(--color-text-faint)">
          {v % 1 === 0 ? v : v.toFixed(1)}
        </text>
      ))}
      {/* X-axis */}
      <line x1={pad.l} y1={pad.t + H} x2={pad.l + W} y2={pad.t + H} stroke="var(--color-border)" strokeWidth={1} />
      {xLabels.map((i) => (
        <text key={i} x={toX(i)} y={pad.t + H + 16} textAnchor="middle" fontSize={10} fill="var(--color-text-faint)">
          {points[i].date}
        </text>
      ))}
      {/* Unit label */}
      <text x={pad.l - 6} y={pad.t - 2} textAnchor="end" fontSize={10} fill="var(--color-text-faint)">{unit}</text>
    </svg>
  )
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const NEO_TARGETS = { tds: [150, 250], gh: [6, 8], kh: [2, 5], ph: [6.5, 7.8], tempC: [20, 24] }
const CAR_TARGETS = { tds: [100, 180], gh: [4, 6], kh: [0, 1], ph: [5.8, 6.8], tempC: [20, 24] }

const PARAMS: { key: keyof typeof NEO_TARGETS; label: string; unit: string; color: string }[] = [
  { key: 'tds',   label: 'TDS',         unit: 'ppm',    color: 'var(--color-primary)' },
  { key: 'gh',    label: 'GH',          unit: '°dGH',   color: 'var(--color-success)' },
  { key: 'kh',    label: 'KH',          unit: '°dKH',   color: 'var(--color-warning)' },
  { key: 'ph',    label: 'pH',          unit: 'pH',     color: 'var(--color-error)' },
  { key: 'tempC', label: 'Temperature', unit: '°C',     color: 'var(--color-orange)' },
]

function fmt(date: string): string {
  const d = new Date(date)
  return `${d.getDate().toString().padStart(2, '0')}.${(d.getMonth() + 1).toString().padStart(2, '0')}`
}

function extractPoints(logs: LogEntry[], tankId: string, param: keyof typeof NEO_TARGETS): ChartPoint[] {
  return logs
    .filter(l => l.tankId === tankId && l.category === 'water_test' && l.values?.[param] != null)
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((l, i) => ({ x: i, y: 0, date: fmt(l.date), value: l.values![param] as number }))
}

// ── Page ──────────────────────────────────────────────────────────────────────
export function ParameterCharts() {
  const { data } = useData()
  const [tankId, setTankId] = useState(data.tanks[0]?.id ?? '')
  const [days, setDays] = useState(30)

  const tank = data.tanks.find(t => t.id === tankId)
  const targets = tank?.species === 'caridina' ? CAR_TARGETS : NEO_TARGETS

  const cutoff = useMemo(() => {
    const d = new Date()
    d.setDate(d.getDate() - days)
    return d.toISOString().slice(0, 10)
  }, [days])

  const filteredLogs = data.logs.filter(l => l.date >= cutoff)

  if (data.tanks.length === 0) {
    return (
      <div>
        <div className="page-header">
          <h1 className="page-title">Parameter Charts</h1>
          <p className="page-subtitle">Visualize water quality trends over time.</p>
        </div>
        <div className="card">
          <p className="text-sm text-muted">No tanks yet. Add a tank in Settings first.</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Parameter Charts</h1>
        <p className="page-subtitle">Water quality trends per tank.</p>
      </div>

      {/* Controls */}
      <div className="card mb-2">
        <div className="flex-row gap-1" style={{ flexWrap: 'wrap', alignItems: 'center' }}>
          <div>
            <label style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', display: 'block', marginBottom: 4 }}>Tank</label>
            <select className="select" value={tankId} onChange={e => setTankId(e.target.value)}>
              {data.tanks.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', display: 'block', marginBottom: 4 }}>Range</label>
            <div className="flex-row gap-1">
              {[7, 14, 30, 90].map(d => (
                <button
                  key={d}
                  className={`btn btn-sm ${days === d ? 'btn-primary' : 'btn-ghost'}`}
                  onClick={() => setDays(d)}
                >
                  {d}d
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      {PARAMS.map(({ key, label, unit, color }) => {
        const points = extractPoints(filteredLogs, tankId, key)
        const tgt = targets[key]
        const allVals = points.map(p => p.value)
        const minY = allVals.length ? Math.min(...allVals, tgt[0]) * 0.95 : tgt[0] * 0.9
        const maxY = allVals.length ? Math.max(...allVals, tgt[1]) * 1.05 : tgt[1] * 1.1

        return (
          <div key={key} className="card mb-2">
            <div className="flex-between mb-1">
              <div className="card-header" style={{ marginBottom: 0 }}>{label}</div>
              <span className="badge" style={{ background: color, color: '#fff', fontSize: 'var(--text-xs)' }}>
                target {tgt[0]}–{tgt[1]} {unit}
              </span>
            </div>
            <LineChart
              points={points}
              color={color}
              unit={unit}
              minY={minY}
              maxY={maxY}
              targetMin={tgt[0]}
              targetMax={tgt[1]}
              height={150}
            />
          </div>
        )
      })}
    </div>
  )
}
