import { useState } from 'react'
import { useData } from '../lib/DataContext'
import { CATEGORY_LABELS, CATEGORY_ICONS } from '../lib/species'
import type { LogCategory } from '../lib/types'
import { Plus, X } from 'lucide-react'

const CATEGORIES: LogCategory[] = ['water_test', 'molt', 'death', 'berried', 'shrimplets', 'maintenance', 'note']

export function Logbook() {
  const { data, addLog, deleteLog } = useData()
  const [showForm, setShowForm] = useState(false)
  const [tankId, setTankId] = useState(data.tanks[0]?.id ?? '')
  const [category, setCategory] = useState<LogCategory>('water_test')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [notes, setNotes] = useState('')
  const [vals, setVals] = useState({ tds: '', gh: '', kh: '', ph: '', tempC: '', count: '', waterChangePct: '' })
  const [filter, setFilter] = useState<LogCategory | ''>('')

  const submit = () => {
    if (!tankId) return
    addLog({
      date, tankId, category, notes: notes || undefined,
      values: {
        tds: vals.tds ? parseFloat(vals.tds) : undefined,
        gh: vals.gh ? parseFloat(vals.gh) : undefined,
        kh: vals.kh ? parseFloat(vals.kh) : undefined,
        ph: vals.ph ? parseFloat(vals.ph) : undefined,
        tempC: vals.tempC ? parseFloat(vals.tempC) : undefined,
        count: vals.count ? parseInt(vals.count) : undefined,
        waterChangePct: vals.waterChangePct ? parseFloat(vals.waterChangePct) : undefined,
      },
    })
    setShowForm(false)
    setNotes('')
    setVals({ tds: '', gh: '', kh: '', ph: '', tempC: '', count: '', waterChangePct: '' })
  }

  const logs = [...data.logs]
    .filter(l => !filter || l.category === filter)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 100)

  return (
    <div>
      <div className="page-header flex-between">
        <div>
          <h1 className="page-title">Logbook</h1>
          <p className="page-subtitle">Record water tests, molts, deaths, berried females, and notes.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)} disabled={data.tanks.length === 0}>
          <Plus size={16} /> New Entry
        </button>
      </div>

      {data.tanks.length === 0 && (
        <div className="card mb-2" style={{ background: 'var(--color-accent-muted)', fontSize: '0.85rem' }}>
          ⚠️ Add a tank in Settings before logging entries.
        </div>
      )}

      {/* Filter */}
      <div className="flex-row gap-1 mb-2" style={{ flexWrap: 'wrap' }}>
        <button className={`btn btn-sm ${!filter ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setFilter('')}>All</button>
        {CATEGORIES.map(c => (
          <button key={c} className={`btn btn-sm ${filter === c ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setFilter(c)}>
            {CATEGORY_ICONS[c]} {CATEGORY_LABELS[c]}
          </button>
        ))}
      </div>

      {/* New Entry Form */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div className="flex-between mb-2">
              <h3 style={{ fontWeight: 700, fontSize: '1.1rem' }}>New Log Entry</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowForm(false)}><X size={16} /></button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div>
                <label>Tank</label>
                <select className="select" value={tankId} onChange={e => setTankId(e.target.value)}>
                  {data.tanks.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>

              <div>
                <label>Category</label>
                <select className="select" value={category} onChange={e => setCategory(e.target.value as LogCategory)}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{CATEGORY_ICONS[c]} {CATEGORY_LABELS[c]}</option>)}
                </select>
              </div>

              <div>
                <label>Date</label>
                <input className="input" type="date" value={date} onChange={e => setDate(e.target.value)} />
              </div>

              {/* Show relevant value inputs based on category */}
              {category === 'water_test' && (
                <div className="grid-2">
                  {[['tds', 'TDS (ppm)'], ['gh', 'GH (°dGH)'], ['kh', 'KH (°dKH)'], ['ph', 'pH'], ['tempC', 'Temp (°C)']].map(([k, l]) => (
                    <div key={k}>
                      <label>{l}</label>
                      <input className="input" type="number" step="0.1" placeholder="—"
                        value={vals[k as keyof typeof vals]}
                        onChange={e => setVals(v => ({ ...v, [k]: e.target.value }))} />
                    </div>
                  ))}
                </div>
              )}

              {category === 'maintenance' && (
                <div>
                  <label>Water Change (%)</label>
                  <input className="input" type="number" step="1" placeholder="e.g. 30"
                    value={vals.waterChangePct}
                    onChange={e => setVals(v => ({ ...v, waterChangePct: e.target.value }))} />
                </div>
              )}

              {(category === 'molt' || category === 'death' || category === 'berried' || category === 'shrimplets') && (
                <div>
                  <label>Count</label>
                  <input className="input" type="number" step="1" placeholder="e.g. 1"
                    value={vals.count}
                    onChange={e => setVals(v => ({ ...v, count: e.target.value }))} />
                </div>
              )}

              <div>
                <label>Notes (optional)</label>
                <textarea className="input" rows={3} placeholder="Any observations…"
                  value={notes} onChange={e => setNotes(e.target.value)}
                  style={{ resize: 'vertical', fontFamily: 'var(--font-sans)' }} />
              </div>

              <button className="btn btn-primary" onClick={submit}>Save Entry</button>
            </div>
          </div>
        </div>
      )}

      {/* Log entries */}
      {logs.length > 0 ? (
        <div className="table-wrap card">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Tank</th>
                <th>Category</th>
                <th>Values</th>
                <th>Notes</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {logs.map(log => {
                const tank = data.tanks.find(t => t.id === log.tankId)
                return (
                  <tr key={log.id}>
                    <td className="mono text-xs">{new Date(log.date).toLocaleDateString('de-DE')}</td>
                    <td>{tank?.name ?? '—'}</td>
                    <td>
                      <span style={{ fontSize: '0.8rem' }}>
                        {CATEGORY_ICONS[log.category]} {CATEGORY_LABELS[log.category]}
                      </span>
                    </td>
                    <td className="mono text-xs">
                      {log.values?.tds != null && <span>TDS {log.values.tds} </span>}
                      {log.values?.gh != null && <span>GH {log.values.gh} </span>}
                      {log.values?.kh != null && <span>KH {log.values.kh} </span>}
                      {log.values?.ph != null && <span>pH {log.values.ph} </span>}
                      {log.values?.tempC != null && <span>{log.values.tempC}°C </span>}
                      {log.values?.count != null && <span>×{log.values.count} </span>}
                      {log.values?.waterChangePct != null && <span>{log.values.waterChangePct}% WC </span>}
                    </td>
                    <td className="text-sm" style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {log.notes || '—'}
                    </td>
                    <td><button className="btn btn-danger btn-sm" onClick={() => deleteLog(log.id)}>×</button></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="card empty-state">
          <div className="empty-state-icon">📖</div>
          <div className="empty-state-title">No entries yet</div>
          <div className="empty-state-text">Start logging water tests, molts, and other events to track your tanks over time.</div>
        </div>
      )}
    </div>
  )
}
