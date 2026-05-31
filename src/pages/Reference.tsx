import { SPECIES, formatSpecies, formatRange } from '../lib/species'
import type { SpeciesType } from '../lib/types'

export function Reference() {
  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Species Reference</h1>
        <p className="page-subtitle">Target water parameters for Neocaridina and Caridina shrimp.</p>
      </div>

      <div className="grid-2">
        {(Object.keys(SPECIES) as SpeciesType[]).map(species => {
          const p = SPECIES[species]
          return (
            <div className="card" key={species}>
              <div className="card-header flex-between">
                <span>{formatSpecies(species)}</span>
                <span className={`badge ${species === 'neocaridina' ? 'badge-neo' : 'badge-caridina'}`}>
                  {formatSpecies(species)}
                </span>
              </div>
              <p className="text-sm text-muted mb-2">{p.description}</p>

              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Parameter</th>
                      <th>Target Range</th>
                    </tr>
                  </thead>
                  <tbody>
                    {([
                      ['TDS', p.tds],
                      ['GH', p.gh],
                      ['KH', p.kh],
                      ['pH', p.ph],
                      ['Temp', p.tempC],
                    ] as const).map(([label, r]) => (
                      <tr key={label}>
                        <td style={{ fontWeight: 600 }}>{label}</td>
                        <td className="mono">{formatRange(r)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-2" style={{ padding: '0.75rem', background: 'var(--color-accent-muted)', borderRadius: 'var(--radius)', fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
                ⚠️ {p.stabilityNote}
              </div>
            </div>
          )
        })}
      </div>

      <div className="card mt-2">
        <div className="card-header">Important Notes</div>
        <ul style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          <li>Range targets are <strong>guidelines</strong> — stability is more important than hitting exact numbers.</li>
          <li>Always <strong>drip-acclimate</strong> new shrimp over 1–2 hours.</li>
          <li>Caridina require <strong>active buffering substrate</strong> and <strong>RO/DI water</strong> with remineralizer.</li>
          <li>Neocaridina can adapt to a wider range if changes are gradual.</li>
          <li>Sudden parameter swings kill shrimp faster than suboptimal but stable parameters.</li>
        </ul>
      </div>
    </div>
  )
}
