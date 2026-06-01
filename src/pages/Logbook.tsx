import { useState } from 'react'
import { useData } from '../lib/DataContext'
import type { LogCategory, LogEntry } from '../lib/types'
import { Pencil, Trash2, Check, X, BookOpen, FlaskConical } from 'lucide-react'

const CATEGORIES: { value: LogCategory; label: string; emoji: string }[] = [
  { value: 'water_test',  label: 'Water Test',  emoji: '🧪' },
  { value: 'feeding',     label: 'Feeding',      emoji: '🍽️' },
  { value: 'molt',        label: 'Molt',         emoji: '🦐' },
  { value: 'berried',     label: 'Berried',      emoji: '🥚' },
  { value: 'shrimplets',  label: 'Shrimplets',   emoji: '🐣' },
  { value: 'death',       label: 'Death',        emoji: '💀' },
  { value: 'maintenance', label: 'Maintenance',  emoji: '🔧' },
  { value: 'note',        label: 'Note',         emoji: '📝' },
]

function fmtDate(iso: string) {
  const d = new Date(iso)
  return `${d.getDate().toString().padStart(2, '0')}.${(d.getMonth() + 1).toString().padStart(2, '0')}.${d.getFullYear()}`
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

export function Logbook() {
  const { data, addLog, updateLog, deleteLog } = useData()
  const [filter, setFilter] = useState<LogCategory | 'all'>('all')
  const [tankFilter, setTankFilter] = useState<string>('all')
  const [editingId, setEditingId] = useState<string | null>(null)

  const [newDate, setNewDate] = useState(new Date().toISOString().slice(0, 10))
  const [newTankId, setNewTankId] = useState(data.tanks[0]?.id ?? '')
  const [newCat, setNewCat] = useState<LogCategory>('water_test')
  const [newNotes, setNewNotes] = useState('')
  const [newTds, setNewTds] = useState('')
  const [newGh, setNewGh]   = useState('')
  const [newKh, setNewKh]   = useState('')
  const [newPh, setNewPh]   = useState('')
  const [newTemp, setNewTemp] = useState('')
  const [newWaterChangePct, setNewWaterChangePct] = useState('')
  const [newFoodType, setNewFoodType] = useState('')
  const [newFoodAmount, setNewFoodAmount] = useState('')
  const [newCount, setNewCount] = useState('')

  const handleAdd = () => {
    if (!newTankId) return
    const values: LogEntry['values'] = {}
    if (newCat === 'water_test') {
      if (newTds)           values.tds           = parseFloat(newTds)
      if (newGh)            values.gh            = parseFloat(newGh)
      if (newKh)            values.kh            = parseFloat(newKh)
      if (newPh)            values.ph            = parseFloat(newPh)
      if (newTemp)          values.tempC         = parseFloat(newTemp)
      if (newWaterChangePct) values.waterChangePct = parseFloat(newWaterChangePct)
    } else if (newCat === 'feeding') {
      if (newFoodType)   values.foodType    = newFoodType.trim()
      if (newFoodAmount) values.foodAmountG = parseFloat(newFoodAmount)
    } else if (['molt', 'death', 'berried', 'shrimplets'].includes(newCat)) {
      if (newCount) values.count = parseInt(newCount)
    }
    addLog({ date: newDate, tankId: newTankId, category: newCat, values: Object.keys(values).length ? values : undefined, notes: newNotes.trim() || undefined })
    setNewNotes(''); setNewTds(''); setNewGh(''); setNewKh(''); setNewPh(''); setNewTemp('')
    setNewWaterChangePct(''); setNewFoodType(''); setNewFoodAmount(''); setNewCount('')
  }

  const filtered = data.logs
    .filter(l => filter === 'all' || l.category === filter)
    .filter(l => tankFilter === 'all' || l.tankId === tankFilter)
    .sort((a, b) => b.date.localeCompare(a.date))

  const tankName = (id: string) => data.tanks.find(t => t.id === id)?.name ?? id

  const noTanks = data.tanks.length === 0

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Logbook</h1>
        <p className="page-subtitle">Record water tests, feedings, molts, and events.</p>
      </div>

      {noTanks ? (
        <div className="card">
          <EmptyState
            icon={<FlaskConical size={22} />}
            title="No tanks configured"
            body="Add a tank in Settings before logging events."
          />
        </div>
      ) : (
        <>
          {/* Add entry */}
          <div className="card mb-2">
            <div className="card-header">Add Entry</div>
            <div className="grid-2">
              <div>
                <label>Date</label>
                <input className="input" type="date" value={newDate} onChange={e => setNewDate(e.target.value)} />
              </div>
              <div>
                <label>Tank</label>
                <select className="select" value={newTankId} onChange={e => setNewTankId(e.target.value)}>
                  {data.tanks.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
            </div>
            <div style={{ marginTop: 8 }}>
              <label>Category</label>
              <div className="flex-row gap-1" style={{ flexWrap: 'wrap', marginTop: 4 }}>
                {CATEGORIES.map(c => (
                  <button
                    key={c.value}
                    className={`btn btn-sm ${newCat === c.value ? 'btn-primary' : 'btn-ghost'}`}
                    onClick={() => setNewCat(c.value)}
                  >
                    {c.emoji} {c.label}
                  </button>
                ))}
              </div>
            </div>

            {newCat === 'water_test' && (
              <div className="grid-3" style={{ marginTop: 8 }}>
                <div><label>TDS (ppm)</label><input className="input" type="number" placeholder="200" value={newTds} onChange={e => setNewTds(e.target.value)} /></div>
                <div><label>GH (°dGH)</label><input className="input" type="number" placeholder="7" value={newGh} onChange={e => setNewGh(e.target.value)} /></div>
                <div><label>KH (°dKH)</label><input className="input" type="number" placeholder="3" value={newKh} onChange={e => setNewKh(e.target.value)} /></div>
                <div><label>pH</label><input className="input" type="number" step="0.1" placeholder="7.2" value={newPh} onChange={e => setNewPh(e.target.value)} /></div>
                <div><label>Temp (°C)</label><input className="input" type="number" placeholder="22" value={newTemp} onChange={e => setNewTemp(e.target.value)} /></div>
                <div><label>Water change (%)</label><input className="input" type="number" placeholder="20" value={newWaterChangePct} onChange={e => setNewWaterChangePct(e.target.value)} /></div>
              </div>
            )}
            {newCat === 'feeding' && (
              <div className="grid-2" style={{ marginTop: 8 }}>
                <div><label>Food type</label><input className="input" placeholder="e.g. Hikari Shrimp Cuisine" value={newFoodType} onChange={e => setNewFoodType(e.target.value)} /></div>
                <div><label>Amount (g)</label><input className="input" type="number" step="0.1" placeholder="0.5" value={newFoodAmount} onChange={e => setNewFoodAmount(e.target.value)} /></div>
              </div>
            )}
            {['molt', 'death', 'berried', 'shrimplets'].includes(newCat) && (
              <div style={{ marginTop: 8, maxWidth: 160 }}>
                <label>Count</label>
                <input className="input" type="number" min="1" placeholder="1" value={newCount} onChange={e => setNewCount(e.target.value)} />
              </div>
            )}

            <div style={{ marginTop: 8 }}>
              <label>Notes (optional)</label>
              <input className="input" placeholder="Any additional notes…" value={newNotes} onChange={e => setNewNotes(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAdd()} />
            </div>
            <button className="btn btn-primary btn-sm" onClick={handleAdd} style={{ marginTop: 8, width: 'fit-content' }}
              disabled={!newTankId}>
              Add Entry
            </button>
          </div>

          {/* Filters */}
          <div className="card mb-2">
            <div className="flex-row gap-1" style={{ flexWrap: 'wrap', marginBottom: 8 }}>
              <button className={`btn btn-sm ${filter === 'all' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setFilter('all')}>All</button>
              {CATEGORIES.map(c => (
                <button key={c.value} className={`btn btn-sm ${filter === c.value ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setFilter(c.value)}>
                  {c.emoji} {c.label}
                </button>
              ))}
            </div>
            <select className="select" style={{ width: 'fit-content' }} value={tankFilter} onChange={e => setTankFilter(e.target.value)}>
              <option value="all">All tanks</option>
              {data.tanks.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>

          {/* Entries */}
          <div className="card">
            {filtered.length === 0 ? (
              <EmptyState
                icon={<BookOpen size={22} />}
                title="No entries yet"
                body="Use the form above to log your first water test, feeding, or event."
              />
            ) : (
              filtered.map(entry => (
                <LogRow
                  key={entry.id}
                  entry={entry}
                  tankName={tankName(entry.tankId)}
                  editing={editingId === entry.id}
                  onEdit={() => setEditingId(entry.id)}
                  onSave={(patch) => { updateLog(entry.id, patch); setEditingId(null) }}
                  onCancel={() => setEditingId(null)}
                  onDelete={() => deleteLog(entry.id)}
                />
              ))
            )}
          </div>
        </>
      )}
    </div>
  )
}

function LogRow({ entry, tankName, editing, onEdit, onSave, onCancel, onDelete }: {
  entry: LogEntry
  tankName: string
  editing: boolean
  onEdit: () => void
  onSave: (p: Partial<LogEntry>) => void
  onCancel: () => void
  onDelete: () => void
}) {
  const [notes, setNotes] = useState(entry.notes ?? '')
  const cat = CATEGORIES.find(c => c.value === entry.category)

  function summarize(e: LogEntry) {
    const v = e.values
    if (!v) return ''
    const parts: string[] = []
    if (v.tds)           parts.push(`TDS ${v.tds}`)
    if (v.gh)            parts.push(`GH ${v.gh}`)
    if (v.kh)            parts.push(`KH ${v.kh}`)
    if (v.ph)            parts.push(`pH ${v.ph}`)
    if (v.tempC)         parts.push(`${v.tempC}°C`)
    if (v.waterChangePct) parts.push(`WC ${v.waterChangePct}%`)
    if (v.foodType)      parts.push(v.foodType)
    if (v.foodAmountG)   parts.push(`${v.foodAmountG}g`)
    if (v.count)         parts.push(`×${v.count}`)
    return parts.join(' · ')
  }

  if (editing) {
    return (
      <div style={{ padding: '0.75rem', borderBottom: '1px solid var(--color-divider)', display: 'flex', gap: 8, alignItems: 'center' }}>
        <input className="input" style={{ flex: 1 }} value={notes} onChange={e => setNotes(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') onSave({ notes: notes.trim() || undefined }); if (e.key === 'Escape') onCancel() }} />
        <button className="btn btn-primary btn-sm" onClick={() => onSave({ notes: notes.trim() || undefined })}><Check size={14} /></button>
        <button className="btn btn-ghost btn-sm" onClick={onCancel}><X size={14} /></button>
      </div>
    )
  }

  return (
    <div style={{ padding: '0.6rem 0.75rem', borderBottom: '1px solid var(--color-divider)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="flex-row gap-1" style={{ alignItems: 'center', flexWrap: 'wrap' }}>
          <span>{cat?.emoji}</span>
          <span className="text-sm" style={{ fontWeight: 600 }}>{cat?.label}</span>
          {summarize(entry) && <span className="text-xs text-muted mono">{summarize(entry)}</span>}
        </div>
        <div className="text-xs text-muted" style={{ marginTop: 2 }}>
          {tankName} · {fmtDate(entry.date)}
          {entry.notes && ` · ${entry.notes}`}
        </div>
      </div>
      <div className="flex-row gap-1">
        <button className="btn btn-ghost btn-sm" onClick={onEdit} title="Edit notes"><Pencil size={13} /></button>
        <button className="btn btn-danger btn-sm" onClick={onDelete}><Trash2 size={13} /></button>
      </div>
    </div>
  )
}
