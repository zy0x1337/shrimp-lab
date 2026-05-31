import { useState } from 'react'
import { calcTdsWaterChange } from '../lib/calculators'
import type { TdsCalcResult } from '../lib/types'

export function TdsCalculator() {
  const [tankL, setTankL] = useState('')
  const [current, setCurrent] = useState('')
  const [target, setTarget] = useState('')
  const [replacement, setReplacement] = useState('')
  const [result, setResult] = useState<TdsCalcResult | null>(null)

  const calc = () => {
    setResult(calcTdsWaterChange(
      parseFloat(tankL) || 0,
      parseFloat(current) || 0,
      parseFloat(target) || 0,
      parseFloat(replacement) || 0,
    ))
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">TDS Water Change Calculator</h1>
        <p className="page-subtitle">
          Calculate how much water to change to reach a target TDS level.
        </p>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-header">Input</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[
              ['tankL', 'Tank Volume (L)'],
              ['current', 'Current TDS (ppm)'],
              ['target', 'Target TDS (ppm)'],
              ['replacement', 'Replacement Water TDS (ppm)'],
            ].map(([key, label], i) => {
              const vals = { tankL, current, target, replacement }
              const setters: Record<string, (v: string) => void> = { tankL: setTankL, current: setCurrent, target: setTarget, replacement: setReplacement }
              return (
                <div key={key}>
                  <label>{label}</label>
                  <input
                    className="input" type="number" step="1"
                    placeholder={i === 0 ? 'e.g. 40' : 'e.g. 200'}
                    value={vals[key as keyof typeof vals]}
                    onChange={e => setters[key](e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && calc()}
                  />
                </div>
              )
            })}
            <button className="btn btn-primary" onClick={calc}>Calculate</button>
          </div>
        </div>

        <div>
          {result && result.valid ? (
            <div className="card">
              <div className="card-header">Result</div>
              <div className="grid-2 mb-2">
                <div>
                  <div className="stat-value" style={{ color: result.changePct > 30 ? 'var(--color-warn)' : 'var(--color-accent)' }}>
                    {result.changePct}%
                  </div>
                  <div className="stat-label">Water to change</div>
                </div>
                <div>
                  <div className="stat-value">{result.changeVolumeL}L</div>
                  <div className="stat-label">Volume ({result.changeVolumeGal} gal)</div>
                </div>
              </div>

              <div className="text-xs text-faint mono mb-2">
                Formula: (Current − Target) ÷ (Current − Replacement) × 100
              </div>

              {result.warning && (
                <div style={{ padding: '0.5rem 0.75rem', background: result.changePct > 50 ? 'rgba(248,113,113,0.12)' : 'rgba(251,191,36,0.12)', borderRadius: 'var(--radius)', fontSize: '0.85rem', color: 'var(--color-text)' }}>
                  ⚠️ {result.warning}
                </div>
              )}
              {!result.warning && (
                <div className="badge badge-good">✓ Safe change amount</div>
              )}
            </div>
          ) : result && !result.valid ? (
            <div className="card">
              <div className="card-header">Cannot Calculate</div>
              <p className="text-sm text-muted">{result.warning}</p>
            </div>
          ) : (
            <div className="card empty-state">
              <div className="empty-state-icon">💧</div>
              <div className="empty-state-title">TDS Calculator</div>
              <div className="empty-state-text">Enter your tank values to calculate the optimal water change percentage.</div>
            </div>
          )}

          <div className="card mt-2">
            <div className="card-header">How It Works</div>
            <p className="text-sm text-muted">
              The formula calculates what percentage of water to replace so the final TDS
              lands at your target. This assumes the replacement water mixes evenly and
              instantly — in practice, go slower.
            </p>
            <ul className="mt-2" style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              <li>If change &gt; 30%: split into 2–3 smaller changes over several days.</li>
              <li>Match temperature of replacement water to tank.</li>
              <li>Drip replacement water in slowly if parameters differ significantly.</li>
              <li>TDS rises over time from evaporation and feeding — test regularly.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
