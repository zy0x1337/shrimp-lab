import { useState } from 'react'
import { estimateHatch } from '../lib/calculators'
import { formatSpecies } from '../lib/species'
import { useData } from '../lib/DataContext'
import type { HatchEstimate } from '../lib/calculators'

export function BreedingTimeline() {
  const { data, addBreeding, deleteBreeding } = useData()
  const [species, setSpecies] = useState<'neocaridina' | 'caridina'>('neocaridina')
  const [tankId, setTankId] = useState(data.tanks[0]?.id ?? '')
  const [berriedDate, setBerriedDate] = useState('')
  const [tempC, setTempC] = useState('22')
  const [result, setResult] = useState<HatchEstimate | null>(null)
  const [saved, setSaved] = useState(false)

  const calc = () => {
    if (!berriedDate) return
    setSaved(false)
    setResult(estimateHatch(berriedDate, parseFloat(tempC) || 22))
  }

  const save = () => {
    if (!result || !tankId) return
    addBreeding({ tankId, species, berriedDate, tempC: parseFloat(tempC) || 22 })
    setSaved(true)
  }

  const activeEntries = data.breeding.filter(b => {
    const days = Math.floor((Date.now() - new Date(b.berriedDate).getTime()) / 86400000)
    return days >= -1 && days <= 30
  })

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Breeding Timeline</h1>
        <p className="page-subtitle">Estimate hatch windows from berried dates and temperature.</p>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-header">New Estimate</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {data.tanks.length > 0 && (
              <div>
                <label>Tank</label>
                <select className="select" value={tankId} onChange={e => setTankId(e.target.value)}>
                  {data.tanks.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
            )}

            <div>
              <label>Species</label>
              <select className="select" value={species} onChange={e => setSpecies(e.target.value as any)}>
                <option value="neocaridina">Neocaridina</option>
                <option value="caridina">Caridina</option>
              </select>
            </div>

            <div>
              <label>Berried Date</label>
              <input className="input" type="date" value={berriedDate}
                onChange={e => { setBerriedDate(e.target.value); calc() }} />
            </div>

            <div>
              <label>Tank Temperature (°C)</label>
              <input className="input" type="number" step="0.5" value={tempC}
                placeholder="22"
                onChange={e => { setTempC(e.target.value); if (berriedDate) setTimeout(calc, 0) }} />
            </div>

            <button className="btn btn-primary" onClick={calc} disabled={!berriedDate}>Estimate Hatch Window</button>
          </div>
        </div>

        <div>
          {result ? (
            <div className="card">
              <div className="card-header">
                Hatch Estimate — {formatSpecies(species)}
              </div>

              <div className="grid-3 mb-2">
                <div>
                  <div className="stat-value" style={{ color: 'var(--color-accent)' }}>
                    {result.daysMin}–{result.daysMax}
                  </div>
                  <div className="stat-label">Days total</div>
                </div>
                <div>
                  <div className="stat-value">{result.daysElapsed}</div>
                  <div className="stat-label">Days elapsed</div>
                </div>
                <div>
                  <div className="stat-value" style={{ color: result.daysRemaining <= 3 ? 'var(--color-warn)' : 'var(--color-accent)' }}>
                    {result.daysRemaining}
                  </div>
                  <div className="stat-label">Days remaining</div>
                </div>
              </div>

              <div className="text-sm mb-2">
                <strong>Hatch window:</strong>{' '}
                {result.hatchStart.toLocaleDateString('de-DE', { day: 'numeric', month: 'short' })} –{' '}
                {result.hatchEnd.toLocaleDateString('de-DE', { day: 'numeric', month: 'short', year: 'numeric' })}
              </div>

              <div style={{ padding: '0.5rem 0.75rem', background: 'var(--color-accent-muted)', borderRadius: 'var(--radius)', fontSize: '0.85rem' }}>
                {result.note}
              </div>

              <div className="mt-2 flex-row gap-1">
                {data.tanks.length > 0 && (
                  <button className="btn btn-primary btn-sm" onClick={save} disabled={saved}>
                    {saved ? '✓ Saved' : 'Save to Track'}
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="card empty-state">
              <div className="empty-state-icon">🥚</div>
              <div className="empty-state-title">Timeline Estimator</div>
              <div className="empty-state-text">
                Enter a berried date and tank temperature to estimate when shrimplets will hatch.
                Typical range is 21–28 days at ~22°C.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Active entries */}
      {activeEntries.length > 0 && (
        <div className="mt-3">
          <div className="card-header">Active Tracking</div>
          <div className="table-wrap card">
            <table>
              <thead>
                <tr>
                  <th>Tank</th>
                  <th>Species</th>
                  <th>Berried</th>
                  <th>Days</th>
                  <th>Window</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {activeEntries.map(entry => {
                  const est = estimateHatch(entry.berriedDate, entry.tempC)
                  const tank = data.tanks.find(t => t.id === entry.tankId)
                  return (
                    <tr key={entry.id}>
                      <td>{tank?.name ?? '—'}</td>
                      <td><span className={`badge ${entry.species === 'neocaridina' ? 'badge-neo' : 'badge-caridina'}`}>{formatSpecies(entry.species)}</span></td>
                      <td>{new Date(entry.berriedDate).toLocaleDateString('de-DE')}</td>
                      <td className="mono">{est.daysElapsed}d</td>
                      <td className="mono text-sm">{est.hatchStart.toLocaleDateString('de-DE', { day: 'numeric', month: 'short' })} – {est.hatchEnd.toLocaleDateString('de-DE', { day: 'numeric', month: 'short' })}</td>
                      <td><button className="btn btn-danger btn-sm" onClick={() => deleteBreeding(entry.id)}>×</button></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
