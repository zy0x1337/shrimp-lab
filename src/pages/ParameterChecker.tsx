import { useState } from 'react'
import { useData } from '../lib/DataContext'
import { checkParameters } from '../lib/calculators'
import { formatSpecies, formatRange } from '../lib/species'
import type { SpeciesType, ParameterCheck } from '../lib/types'

export function ParameterChecker() {
  const { data } = useData()
  const [species, setSpecies] = useState<SpeciesType>(data.tanks[0]?.species ?? 'neocaridina')
  const [tankId, setTankId] = useState(data.tanks[0]?.id ?? '')
  const [values, setValues] = useState({ tds: '', gh: '', kh: '', ph: '', tempC: '' })
  const [checks, setChecks] = useState<ParameterCheck[] | null>(null)

  const run = () => {
    setChecks(checkParameters(species, {
      tds: values.tds ? parseFloat(values.tds) : undefined,
      gh: values.gh ? parseFloat(values.gh) : undefined,
      kh: values.kh ? parseFloat(values.kh) : undefined,
      ph: values.ph ? parseFloat(values.ph) : undefined,
      tempC: values.tempC ? parseFloat(values.tempC) : undefined,
    }))
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Parameter Checker</h1>
        <p className="page-subtitle">Compare your tank values against species target ranges.</p>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-header">Test Values</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {data.tanks.length > 0 && (
              <div>
                <label>Tank Profile</label>
                <select className="select" value={tankId} onChange={e => {
                  setTankId(e.target.value)
                  const t = data.tanks.find(x => x.id === e.target.value)
                  if (t) setSpecies(t.species)
                }}>
                  <option value="">— Select tank —</option>
                  {data.tanks.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
            )}

            <div>
              <label>Species</label>
              <select className="select" value={species} onChange={e => setSpecies(e.target.value as SpeciesType)}>
                <option value="neocaridina">Neocaridina (Cherry, Blue Dream, etc.)</option>
                <option value="caridina">Caridina (Crystal, Bee, Taiwan Bee)</option>
              </select>
            </div>

            {[
              ['tds', 'TDS (ppm)'],
              ['gh', 'GH (°dGH)'],
              ['kh', 'KH (°dKH)'],
              ['ph', 'pH'],
              ['tempC', 'Temperature (°C)'],
            ].map(([key, label]) => (
              <div key={key}>
                <label>{label}</label>
                <input
                  className="input"
                  type="number"
                  step={key === 'ph' ? '0.1' : '1'}
                  placeholder={`e.g. ${key === 'ph' ? '7.0' : key === 'tempC' ? '22' : '200'}`}
                  value={values[key as keyof typeof values]}
                  onChange={e => setValues(v => ({ ...v, [key]: e.target.value }))}
                  onKeyDown={e => e.key === 'Enter' && run()}
                />
              </div>
            ))}

            <button className="btn btn-primary" onClick={run}>Check Parameters</button>
          </div>
        </div>

        <div>
          {checks && checks.length > 0 ? (
            <div className="card">
              <div className="card-header">
                Results for {formatSpecies(species)}
                <span className="card-header-sub"> — vs target ranges</span>
              </div>
              {checks.map(c => (
                <div className="param-row" key={c.param}>
                  <span className="param-label">{c.label}</span>
                  <span className="param-value">{c.value} {c.range.unit}</span>
                  <span className="param-range">({formatRange(c.range)})</span>
                  <span className={`badge param-status ${
                    c.status === 'good' ? 'badge-good' : c.status === 'low' ? 'badge-warn' : 'badge-bad'
                  }`}>
                    {c.status === 'good' ? '✓ In Range' : c.status === 'low' ? '↓ Low' : '↑ High'}
                  </span>
                </div>
              ))}
              {checks.some(c => c.warning) && (
                <div className="mt-2" style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {checks.filter(c => c.warning).map(c => (
                    <div key={c.param} style={{ padding: '0.5rem 0.75rem', background: 'var(--color-accent-muted)', borderRadius: 'var(--radius)', fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
                      ⚠️ <strong>{c.label}:</strong> {c.warning}
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-2 text-xs text-muted">
                {checks.filter(c => c.status === 'good').length}/{checks.length} parameters in range
              </div>
            </div>
          ) : checks && checks.length === 0 ? (
            <div className="card empty-state">
              <div className="empty-state-icon">🧪</div>
              <div className="empty-state-title">Enter some values</div>
              <div className="empty-state-text">Fill in your tank parameters and click "Check Parameters" to see how they compare.</div>
            </div>
          ) : (
            <div className="card empty-state">
              <div className="empty-state-icon">🧪</div>
              <div className="empty-state-title">Parameter Checker</div>
              <div className="empty-state-text">Enter your tank values on the left and run the check to compare against target ranges for your shrimp species.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
