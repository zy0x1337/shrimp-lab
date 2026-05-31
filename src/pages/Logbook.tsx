import { useState } from 'react'
import { useData } from '../lib/DataContext'
import { CATEGORY_LABELS, CATEGORY_ICONS } from '../lib/species'
import type { LogCategory, LogEntry } from '../lib/types'
import { Plus, X, Pencil } from 'lucide-react'

const CATEGORIES: LogCategory[] = ['water_test', 'molt', 'death', 'berried', 'shrimplets', 'maintenance', 'note']

export function Logbook() {
  const { data, addLog, updateLog, deleteLog } = useData()
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [tankId, setTankId] = useState(data.tanks[0]?.id ?? '')
  const [category, setCategory] = useState<LogCategory>('water_test')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [notes, setNotes] = useState('')
  const [vals, setVals] = useState({ tds: '', gh: '', kh: '', ph: '', tempC: '', count: '', waterChangePct: '' })
  const [filter, setFilter] = useState<LogCategory | ''>('')

  const resetForm = () => {
    setEditingId(null)
    setTankId(data.tanks[0]?.id ?? '')
    setCategory('water_test')
    setDate(new Date().toISOString().slice(0, 10))
    setNotes('')
    setVals({ tds: '', gh: '', kh: '', ph: '', tempC: '', count: '', waterChangePct: '' })
    setShowForm(false)
  }

  const openNew = () => {
    resetForm()
    setShowForm(true)
  }

  const openEdit = (log: LogEntry) => {
    setEditingId(log.id)
    setTankId(log.tankId)
    setCategory(log.category)
    setDate(log.date)
    setNotes(log.notes ?? '')
    setVals({
      tds: log.values?.tds?.toString() ?? '',
      gh: log.values?.gh?.toString() ?? '',
      kh: log.values?.kh?.toString() ?? '',
      ph: log.values?.ph?.toString() ?? '',
      tempC: log.values?.tempC?.toString() ?? '',
      count: log.values?.count?.toString() ?? '',
      waterChangePct: log.values?.waterChangePct?.toString() ?? '',
    })
    setShowForm(true)
  }

  const submit = () => {
    if (!tankId) return

    const entryValues = {
      tds: vals.tds ? parseFloat(vals.tds) : undefined,
      gh: vals.gh ? parseFloat(vals.gh) : undefined,
      kh: vals.kh ? parseFloat(vals.kh) : undefined,
      ph: vals.ph ? parseFloat(vals.ph) : undefined,
      tempC: vals.tempC ? parseFloat(vals.tempC) : undefined,
      count: vals.count ? parseInt(vals.count) : undefined,
      waterChangePct: vals.waterChangePct ? parseFloat(vals.waterChangePct) : undefined,
    }

    if (editingId) {
      updateLog(editingId, {
        date, tankId, category, notes: notes || undefined, values: entryValues,
      })
    } else {
      addLog({
        date, tankId, category, notes: notes || undefined, values: entryValues,
      })
    }
    resetForm()
  }

  const logs = [...data.logs]
    .filter(l => !filter || l.category === filter)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 100)

  const formatParamValue = (log: LogEntry): string => {
    const parts: string[] = []
    if (log.values?.tds != null) parts.push(`TDS ${log.values.tds}`)
    if (log.values?.gh != null) parts.push(`GH ${log.values.gh}`)
    if (log.values?.kh != null) parts.push(`KH ${log.values.kh}`)
    if (log.values?.ph != null) parts.push(`pH ${log.values.ph}`)
    if (log.values?.tempC != null) parts.push(`${log.values.tempC}°C`)
    if (log.values?.count != null) parts.push(`×${log.values.count}`)
    if (log.values?.waterChangePct != null) parts.push(`${log.values.waterChangePct}% WC`)
    return parts.join(' · ') || '—'
  }

  return (
    <div>
      <div className="page-header flex-between">
        <div>
          <h1 className="page-title">Logbook</h1>
          <p className="page-subtitle">Record water tests, molts, deaths, berried females, and notes.</p>
        </div>
        <button className="btn btn-primary" onClick={openNew} disabled={data.tanks.length === 0}>
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

      {/* Entry Form Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={resetForm}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div className="flex-between mb-2">
              <h3 style={{ fontWeight: 700, fontSize: '1.1rem' }}>
                {editingId ? 'Edit Entry' : 'New Log Entry'}
              </h3>
              <button className="btn btn-ghost btn-sm" onClick={resetForm}><X size={16} /></button>
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

              <div className="flex-row gap-1">
                <button className="btn btn-primary" onClick={submit}>
                  {editingId ? 'Update Entry' : 'Save Entry'}
                </button>
                {editingId && (
                  <button className="btn btn-ghost" onClick={resetForm}>Cancel</button>
                )}
              </div>
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
                <th style={{ width: '80px' }}></th>
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
                    <td className="mono text-xs">{formatParamValue(log)}</td>
                    <td className="text-sm" style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {log.notes || '—'}
                    </td>
                    <td>
                      <div className="flex-row gap-1">
                        <button className="btn btn-ghost btn-sm" onClick={() => openEdit(log)} title="Edit">
                          <Pencil size={14} />
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => deleteLog(log.id)} title="Delete">
                          <X size={14} />
                        </button>
                      </div>
                    </td>
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
