import { useState } from 'react'
import { getReminPresets, calcRemineralization } from '../lib/calculators'
import type { ReminResult } from '../lib/calculators'
import { Beaker, Info } from 'lucide-react'

const PRESETS = getReminPresets()

export function RemineralizationPlanner() {
  const [volumeL, setVolumeL] = useState('')
  const [targetGh, setTargetGh] = useState('')
  const [targetTds, setTargetTds] = useState('')
  const [sourceTds, setSourceTds] = useState('0')
  const [presetKey, setPresetKey] = useState('salty-shrimp-gh')
  const [customGrams, setCustomGrams] = useState('')
  const [customTdsPerGh, setCustomTdsPerGh] = useState('25')
  const [result, setResult] = useState<ReminResult | null>(null)

  const calc = () => {
    setResult(calcRemineralization(
      parseFloat(targetGh) || 0,
      parseFloat(targetTds) || 0,
      parseFloat(volumeL) || 0,
      presetKey,
      customGrams ? parseFloat(customGrams) : undefined,
      customTdsPerGh ? parseFloat(customTdsPerGh) : undefined,
      parseFloat(sourceTds) || 0,
    ))
  }

  const preset = PRESETS[presetKey]
  const isCustom = presetKey === 'custom'

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Remineralization Planner</h1>
        <p className="page-subtitle">
          Calculate how much remineralizer to add to RO/DI water to hit your target GH and TDS.
        </p>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <Beaker size={16} style={{ display: 'inline', marginRight: '0.4rem', verticalAlign: 'middle' }} />
            Water &amp; Target
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div>
              <label>Water Volume (L)</label>
              <input className="input" type="number" step="0.5" placeholder="e.g. 10"
                value={volumeL} onChange={e => setVolumeL(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && calc()} />
              <div className="text-xs text-faint mt-1">Volume of RO/DI water you&apos;re preparing</div>
            </div>

            <div className="grid-2">
              <div>
                <label>Target GH (°dGH)</label>
                <input className="input" type="number" step="0.5" placeholder="e.g. 6"
                  value={targetGh} onChange={e => setTargetGh(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && calc()} />
              </div>
              <div>
                <label>Target TDS (ppm)</label>
                <input className="input" type="number" step="1" placeholder="e.g. 150"
                  value={targetTds} onChange={e => setTargetTds(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && calc()} />
              </div>
            </div>

            <div>
              <label>Source Water TDS (ppm)</label>
              <input className="input" type="number" step="1" placeholder="0"
                value={sourceTds} onChange={e => setSourceTds(e.target.value)} />
              <div className="text-xs text-faint mt-1">RO/DI is typically 0–5 ppm. Leave at 0 for pure RO/DI.</div>
            </div>

            <div>
              <label>Remineralizer</label>
              <select className="select" value={presetKey} onChange={e => setPresetKey(e.target.value)}>
                {Object.entries(PRESETS).map(([key, p]) => (
                  <option key={key} value={key}>{p.label}</option>
                ))}
              </select>
            </div>

            {isCustom && (
              <div style={{ padding: '0.75rem', background: 'var(--color-surface2)', borderRadius: 'var(--radius)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div className="text-sm" style={{ fontWeight: 600 }}>Custom Product Values</div>
                <div>
                  <label>Grams per +1°dGH per 10L</label>
                  <input className="input" type="number" step="0.01" placeholder="e.g. 0.3"
                    value={customGrams} onChange={e => setCustomGrams(e.target.value)} />
                </div>
                <div>
                  <label>Approx. TDS per +1°dGH</label>
                  <input className="input" type="number" step="1" placeholder="e.g. 25"
                    value={customTdsPerGh} onChange={e => setCustomTdsPerGh(e.target.value)} />
                  <div className="text-xs text-faint mt-1">Check your product label or measure with a TDS meter.</div>
                </div>
              </div>
            )}

            <button className="btn btn-primary" onClick={calc}>Calculate</button>
          </div>
        </div>

        <div>
          {result && result.valid ? (
            <div className="card">
              <div className="card-header">Dosage Result</div>

              <div className="grid-3 mb-2">
                <div>
                  <div className="stat-value" style={{ color: 'var(--color-accent)' }}>
                    {result.gramsGh}g
                  </div>
                  <div className="stat-label">Remineralizer</div>
                </div>
                <div>
                  <div className="stat-value">{result.tsp}</div>
                  <div className="stat-label">Teaspoons (~approx)</div>
                </div>
                <div>
                  <div className="stat-value">{result.estimatedTds}</div>
                  <div className="stat-label">Est. TDS (ppm)</div>
                </div>
              </div>

              <div className="text-xs text-muted mb-2">
                Using: {preset.label}{isCustom ? ' (custom values)' : ` (${preset.gPerGhPer10L}g / +1°dGH / 10L)`}
              </div>

              {result.warning && (
                <div style={{ padding: '0.5rem 0.75rem', background: 'rgba(251,191,36,0.12)', borderRadius: 'var(--radius)', fontSize: '0.85rem', color: 'var(--color-text)' }}>
                  ⚠️ {result.warning}
                </div>
              )}
              {!result.warning && (
                <div className="badge badge-good">✓ Ready to mix</div>
              )}
            </div>
          ) : result && !result.valid ? (
            <div className="card">
              <div className="card-header">Cannot Calculate</div>
              <p className="text-sm text-muted">{result.warning}</p>
            </div>
          ) : (
            <div className="card empty-state">
              <div className="empty-state-icon">⚗️</div>
              <div className="empty-state-title">Remineralization Planner</div>
              <div className="empty-state-text">
                Enter your target GH, TDS, and water volume to calculate the exact amount
                of remineralizer needed for your RO/DI water.
              </div>
            </div>
          )}

          <div className="card mt-2">
            <div className="card-header">
              <Info size={14} style={{ display: 'inline', marginRight: '0.3rem', verticalAlign: 'middle' }} />
              Tips
            </div>
            <ul style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              <li>Always mix remineralizer in a separate container before adding to tank.</li>
              <li>Let water sit for 24h after mixing — GH/TDS can drift slightly.</li>
              <li>Use a precision scale (0.01g) for small batches under 20L.</li>
              <li>GH/KH+ products also raise KH — check your buffer needs.</li>
              <li>For Caridina: use GH+ only (no KH). For Neocaridina: GH/KH+ is fine.</li>
              <li>Teaspoon measurements are rough estimates. Weigh for accuracy.</li>
            </ul>
          </div>

          {/* Quick reference */}
          <div className="card mt-2">
            <div className="card-header">Quick Reference</div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Species</th>
                    <th>Target GH</th>
                    <th>Target TDS</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><span className="badge badge-neo">Neo</span></td>
                    <td className="mono">6–8 °dGH</td>
                    <td className="mono">150–250 ppm</td>
                  </tr>
                  <tr>
                    <td><span className="badge badge-caridina">Caridina</span></td>
                    <td className="mono">4–6 °dGH</td>
                    <td className="mono">100–180 ppm</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
