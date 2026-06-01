import { useState, useMemo } from 'react'
import { useData } from '../lib/DataContext'
import { BarChart2, FlaskConical } from 'lucide-react'

const DENSITY: Record<string, { min: number; max: number; label: string }> = {
  low:    { min: 1,   max: 2,   label: 'Low (1–2 / L)' },
  medium: { min: 2,   max: 4,   label: 'Medium (2–4 / L)' },
  high:   { min: 4,   max: 6,   label: 'High (4–6 / L)' },
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

export function ColonyEstimator() {
  const { data } = useData()
  const [tankId, setTankId]           = useState(data.tanks[0]?.id ?? '')
  const [density, setDensity]         = useState<keyof typeof DENSITY>('medium')
  const [berriedPct, setBerriedPct]   = useState('10')
  const [shrimpletFactor, setShrimpletFactor] = useState('2.5')
  const [observed, setObserved]       = useState('')

  const tank = data.tanks.find(t => t.id === tankId)

  const est = useMemo(() => {
    const vol = tank?.volumeL ?? 0
    const d = DENSITY[density]
    const bPct = parseFloat(berriedPct) / 100 || 0.1
    const sf = parseFloat(shrimpletFactor) || 2.5
    const obs = parseInt(observed) || null

    const minPop = Math.round(vol * d.min)
    const maxPop = Math.round(vol * d.max)
    const midPop = Math.round((minPop + maxPop) / 2)

    const fromBerried    = obs ? Math.round(obs / bPct) : null
    const fromShrimplets = obs ? Math.round(obs * sf)   : null

    const recentBerried = data.logs
      .filter(l => l.tankId === tankId && l.category === 'berried')
      .reduce((a, l) => a + (l.values?.count ?? 1), 0)

    return { minPop, maxPop, midPop, fromBerried, fromShrimplets, recentBerried }
  }, [tank, density, berriedPct, shrimpletFactor, observed, data.logs, tankId])

  if (data.tanks.length === 0) {
    return (
      <div>
        <div className="page-header">
          <h1 className="page-title">Colony Estimator</h1>
          <p className="page-subtitle">Estimate colony size from tank and observation data.</p>
        </div>
        <div className="card">
          <EmptyState
            icon={<FlaskConical size={22} />}
            title="No tanks configured"
            body="Add a tank in Settings to use the colony estimator."
          />
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Colony Estimator</h1>
        <p className="page-subtitle">Estimate population size from tank volume, density, and observations.</p>
      </div>

      <div className="card mb-2">
        <div className="card-header">Parameters</div>
        <div className="grid-2">
          <div>
            <label>Tank</label>
            <select className="select" value={tankId} onChange={e => setTankId(e.target.value)}>
              {data.tanks.map(t => <option key={t.id} value={t.id}>{t.name} ({t.volumeL} L)</option>)}
            </select>
          </div>
          <div>
            <label>Stocking density</label>
            <select className="select" value={density} onChange={e => setDensity(e.target.value as keyof typeof DENSITY)}>
              {Object.entries(DENSITY).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </div>
        </div>
        <div className="grid-2" style={{ marginTop: 8 }}>
          <div>
            <label>Berried female % (approx.)</label>
            <input className="input" type="number" min="1" max="50" value={berriedPct}
              onChange={e => setBerriedPct(e.target.value)} />
          </div>
          <div>
            <label>Shrimplet multiplier</label>
            <input className="input" type="number" step="0.1" min="1" value={shrimpletFactor}
              onChange={e => setShrimpletFactor(e.target.value)} />
          </div>
        </div>
        <div style={{ marginTop: 8, maxWidth: 240 }}>
          <label>Observed count (berried ♀ or shrimplets)</label>
          <input className="input" type="number" min="0" placeholder="Optional" value={observed}
            onChange={e => setObserved(e.target.value)} />
        </div>
      </div>

      <div className="card">
        <div className="card-header">Estimates — {tank?.name} ({tank?.volumeL} L)</div>
        <div className="grid-3">
          <div>
            <div className="stat-value" style={{ color: 'var(--color-accent)' }}>
              {est.minPop}–{est.maxPop}
            </div>
            <div className="stat-label">Capacity range</div>
          </div>
          <div>
            <div className="stat-value">{est.midPop}</div>
            <div className="stat-label">Mid estimate</div>
          </div>
          {est.recentBerried > 0 && (
            <div>
              <div className="stat-value" style={{ color: 'var(--color-warn)' }}>{est.recentBerried}</div>
              <div className="stat-label">Berried logged</div>
            </div>
          )}
        </div>

        {observed && (
          <div className="grid-2" style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--color-divider)' }}>
            {est.fromBerried !== null && (
              <div>
                <div className="stat-value">{est.fromBerried}</div>
                <div className="stat-label">Est. from berried %</div>
              </div>
            )}
            {est.fromShrimplets !== null && (
              <div>
                <div className="stat-value">{est.fromShrimplets}</div>
                <div className="stat-label">Est. from shrimplets ×{shrimpletFactor}</div>
              </div>
            )}
          </div>
        )}

        <div className="text-xs text-muted" style={{ marginTop: '1rem' }}>
          Capacity based on {DENSITY[density].label} for a {tank?.volumeL} L tank.
          Estimates are approximate — actual population depends on survival rate,
          feeding, and water quality.
        </div>
      </div>
    </div>
  )
}
