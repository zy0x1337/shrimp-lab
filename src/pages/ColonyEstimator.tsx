import { useState, useMemo } from 'react'
import { useData } from '../lib/DataContext'

// Recommended stocking densities (shrimp per litre)
const DENSITY: Record<string, { min: number; max: number; label: string }> = {
  low:    { min: 1,   max: 2,   label: 'Low (1–2 / L)' },
  medium: { min: 2,   max: 4,   label: 'Medium (2–4 / L)' },
  high:   { min: 4,   max: 6,   label: 'High (4–6 / L)' },
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

    // From observed berried females: total ≈ berried / berriedPct
    const fromBerried = obs ? Math.round(obs / bPct) : null

    // From observed shrimplets: total ≈ shrimplets × shrimpletFactor
    const fromShrimplets = obs ? Math.round(obs * sf) : null

    // Recent berried count from logs
    const recentBerried = data.logs
      .filter(l => l.tankId === tankId && l.category === 'berried')
      .reduce((a, l) => a + (l.values?.count ?? 1), 0)

    return { minPop, maxPop, midPop, fromBerried, fromShrimplets, recentBerried }
  }, [tank, density, berriedPct, shrimpletFactor, observed, data.logs, tankId])

  if (data.tanks.length === 0) {
    return (
      <div>
        <div className="page-header"><h1 className="page-title">Colony Estimator</h1><p className="page-subtitle">Estimate colony size from tank and observation data.</p></div>
        <div className="card"><p className="text-sm text-muted">No tanks yet. Add one in Settings.</p></div>
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
        <div className="card-header">Tank & Density</div>
        <div className="grid-2">
          <div>
            <label>Tank</label>
            <select className="select" value={tankId} onChange={e => setTankId(e.target.value)}>
              {data.tanks.map(t => <option key={t.id} value={t.id}>{t.name} ({t.volumeL}L)</option>)}
            </select>
          </div>
          <div>
            <label>Stocking density</label>
            <select className="select" value={density} onChange={e => setDensity(e.target.value as keyof typeof DENSITY)}>
              {Object.entries(DENSITY).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="card mb-2">
        <div className="card-header">Observation-based Estimates</div>
        <div className="grid-2">
          <div>
            <label>Estimated % berried females in colony</label>
            <input className="input" type="number" min="1" max="100" placeholder="10" value={berriedPct}
              onChange={e => setBerriedPct(e.target.value)} />
            <div className="text-xs text-muted" style={{ marginTop: 4 }}>Typical range: 5–20 %</div>
          </div>
          <div>
            <label>Shrimplet multiplier (total / observed)</label>
            <input className="input" type="number" min="1" step="0.5" placeholder="2.5" value={shrimpletFactor}
              onChange={e => setShrimpletFactor(e.target.value)} />
            <div className="text-xs text-muted" style={{ marginTop: 4 }}>Accounts for hiding shrimplets. Default: 2.5×</div>
          </div>
        </div>
        <div style={{ marginTop: 8, maxWidth: 240 }}>
          <label>Observed count (berried ♀ or shrimplets)</label>
          <input className="input" type="number" min="0" placeholder="e.g. 5" value={observed}
            onChange={e => setObserved(e.target.value)} />
        </div>
      </div>

      {/* Results */}
      <div className="card">
        <div className="card-header">Estimated Colony Size</div>
        <div className="grid-3 text-sm" style={{ marginBottom: 16 }}>
          <div>
            <div className="stat-value" style={{ fontSize: '1.8rem' }}>{est.minPop}–{est.maxPop}</div>
            <div className="stat-label">Density-based range</div>
            <div className="text-xs text-muted" style={{ marginTop: 2 }}>{tank?.volumeL}L × {DENSITY[density].min}–{DENSITY[density].max} / L</div>
          </div>
          {est.fromBerried !== null && (
            <div>
              <div className="stat-value" style={{ fontSize: '1.8rem' }}>{est.fromBerried}</div>
              <div className="stat-label">From berried % estimate</div>
              <div className="text-xs text-muted" style={{ marginTop: 2 }}>{observed} berried ÷ {berriedPct}%</div>
            </div>
          )}
          {est.fromShrimplets !== null && (
            <div>
              <div className="stat-value" style={{ fontSize: '1.8rem' }}>{est.fromShrimplets}</div>
              <div className="stat-label">From shrimplet estimate</div>
              <div className="text-xs text-muted" style={{ marginTop: 2 }}>{observed} × {shrimpletFactor}×</div>
            </div>
          )}
        </div>

        {est.recentBerried > 0 && (
          <div className="text-sm text-muted" style={{ borderTop: '1px solid var(--color-divider)', paddingTop: 12 }}>
            📖 Logbook: <strong>{est.recentBerried}</strong> berried female(s) recorded for this tank.
          </div>
        )}

        <div className="text-xs text-faint" style={{ marginTop: 12 }}>
          These are estimates only. Actual colony size depends on hiding spots, plant density, feeding behaviour, and mortality rates.
        </div>
      </div>
    </div>
  )
}
