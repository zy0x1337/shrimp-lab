import { useState } from 'react'
import { useData } from '../lib/DataContext'
import type { BreedingPair, ShrimpGrade, SpeciesType } from '../lib/types'
import { formatSpecies } from '../lib/species'
import { Plus, Trash2, Archive, ArchiveRestore } from 'lucide-react'

const GRADES: ShrimpGrade[] = ['S', 'SS', 'SSS', 'SSSS', 'custom']

function fmtDate(iso: string) {
  const d = new Date(iso)
  return `${d.getDate().toString().padStart(2,'0')}.${(d.getMonth()+1).toString().padStart(2,'0')}.${d.getFullYear()}`
}

export function BreedingPairs() {
  const { data, addBreedingPair, updateBreedingPair, deleteBreedingPair } = useData()
  const [showRetired, setShowRetired] = useState(false)

  // Form state
  const [name, setName]             = useState('')
  const [tankId, setTankId]         = useState(data.tanks[0]?.id ?? '')
  const [species, setSpecies]       = useState<SpeciesType>('neocaridina')
  const [maleName, setMaleName]     = useState('')
  const [maleGrade, setMaleGrade]   = useState<ShrimpGrade>('SS')
  const [femaleName, setFemaleName] = useState('')
  const [femaleGrade, setFemaleGrade] = useState<ShrimpGrade>('SSS')
  const [startDate, setStartDate]   = useState(new Date().toISOString().slice(0,10))
  const [notes, setNotes]           = useState('')

  const handleAdd = () => {
    if (!name.trim() || !tankId) return
    addBreedingPair({ name: name.trim(), tankId, species, maleName: maleName.trim() || undefined, maleGrade, femaleName: femaleName.trim() || undefined, femaleGrade, startDate, notes: notes.trim() || undefined })
    setName(''); setMaleName(''); setFemaleName(''); setNotes('')
  }

  const active  = data.breedingPairs.filter(p => !p.endDate)
  const retired = data.breedingPairs.filter(p => !!p.endDate)
  const visible = showRetired ? retired : active

  const tankName = (id: string) => data.tanks.find(t => t.id === id)?.name ?? id

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Breeding Pairs</h1>
        <p className="page-subtitle">Track male/female pairings, grades, and litter history.</p>
      </div>

      {/* Add pair */}
      <div className="card mb-2">
        <div className="card-header">New Pair</div>
        <div className="grid-2">
          <div>
            <label>Pair name</label>
            <input className="input" placeholder="e.g. SSS × SS Red Wine" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div>
            <label>Tank</label>
            <select className="select" value={tankId} onChange={e => setTankId(e.target.value)}>
              {data.tanks.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
        </div>
        <div className="grid-2" style={{ marginTop: 8 }}>
          <div>
            <label>Species</label>
            <select className="select" value={species} onChange={e => setSpecies(e.target.value as SpeciesType)}>
              <option value="neocaridina">Neocaridina</option>
              <option value="caridina">Caridina</option>
            </select>
          </div>
          <div>
            <label>Start date</label>
            <input className="input" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
          </div>
        </div>

        {/* Male */}
        <div style={{ marginTop: 8, padding: '0.75rem', background: 'var(--color-surface-offset)', borderRadius: 'var(--radius)' }}>
          <div className="text-sm" style={{ fontWeight: 600, marginBottom: 6, color: 'var(--color-primary)' }}>♂ Male</div>
          <div className="grid-2">
            <div>
              <label>Name (optional)</label>
              <input className="input" placeholder="e.g. Blue King" value={maleName} onChange={e => setMaleName(e.target.value)} />
            </div>
            <div>
              <label>Grade</label>
              <select className="select" value={maleGrade} onChange={e => setMaleGrade(e.target.value as ShrimpGrade)}>
                {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Female */}
        <div style={{ marginTop: 8, padding: '0.75rem', background: 'var(--color-surface-offset)', borderRadius: 'var(--radius)' }}>
          <div className="text-sm" style={{ fontWeight: 600, marginBottom: 6, color: 'var(--color-error)' }}>♀ Female</div>
          <div className="grid-2">
            <div>
              <label>Name (optional)</label>
              <input className="input" placeholder="e.g. Ruby Queen" value={femaleName} onChange={e => setFemaleName(e.target.value)} />
            </div>
            <div>
              <label>Grade</label>
              <select className="select" value={femaleGrade} onChange={e => setFemaleGrade(e.target.value as ShrimpGrade)}>
                {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 8 }}>
          <label>Notes</label>
          <input className="input" placeholder="Any notes about this pair…" value={notes} onChange={e => setNotes(e.target.value)} />
        </div>
        <button className="btn btn-primary btn-sm" style={{ marginTop: 8, width: 'fit-content' }} onClick={handleAdd} disabled={!name.trim() || !tankId}>
          <Plus size={14} /> Add Pair
        </button>
      </div>

      {/* Toggle active / retired */}
      <div className="flex-row gap-1 mb-2">
        <button className={`btn btn-sm ${!showRetired ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setShowRetired(false)}>
          Active ({active.length})
        </button>
        <button className={`btn btn-sm ${showRetired ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setShowRetired(true)}>
          Retired ({retired.length})
        </button>
      </div>

      {/* Pair cards */}
      {visible.length === 0 && (
        <div className="card"><p className="text-sm text-muted">{showRetired ? 'No retired pairs.' : 'No active pairs yet.'}</p></div>
      )}
      {visible.map(pair => (
        <PairCard
          key={pair.id}
          pair={pair}
          tankName={tankName(pair.tankId)}
          onRetire={() => updateBreedingPair(pair.id, { endDate: new Date().toISOString().slice(0,10) })}
          onRestore={() => updateBreedingPair(pair.id, { endDate: undefined })}
          onDelete={() => deleteBreedingPair(pair.id)}
        />
      ))}
    </div>
  )
}

function PairCard({ pair, tankName, onRetire, onRestore, onDelete }: {
  pair: BreedingPair
  tankName: string
  onRetire: () => void
  onRestore: () => void
  onDelete: () => void
}) {
  const retired = !!pair.endDate
  return (
    <div className="card mb-2">
      <div className="flex-between">
        <div>
          <div style={{ fontWeight: 700, fontSize: 'var(--text-base)' }}>{pair.name}</div>
          <div className="text-xs text-muted" style={{ marginTop: 2 }}>
            {tankName} · {formatSpecies(pair.species)}
            {pair.startDate && ` · since ${new Date(pair.startDate).toLocaleDateString('de-DE')}`}
            {retired && pair.endDate && ` · retired ${new Date(pair.endDate).toLocaleDateString('de-DE')}`}
          </div>
        </div>
        <div className="flex-row gap-1">
          {retired
            ? <button className="btn btn-sm btn-ghost" onClick={onRestore} title="Restore pair"><ArchiveRestore size={14} /></button>
            : <button className="btn btn-sm btn-ghost" onClick={onRetire} title="Retire pair"><Archive size={14} /></button>
          }
          <button className="btn btn-sm btn-danger" onClick={onDelete}><Trash2 size={14} /></button>
        </div>
      </div>

      <div className="grid-2" style={{ marginTop: 12, gap: 8 }}>
        {/* Male */}
        <div style={{ padding: '0.6rem 0.75rem', background: 'var(--color-surface-offset)', borderRadius: 'var(--radius)' }}>
          <div className="text-xs" style={{ color: 'var(--color-primary)', fontWeight: 600, marginBottom: 4 }}>♂ Male</div>
          <div className="text-sm">{pair.maleName ?? '—'}</div>
          {pair.maleGrade && <span className="badge" style={{ marginTop: 4 }}>{pair.maleGrade}</span>}
        </div>
        {/* Female */}
        <div style={{ padding: '0.6rem 0.75rem', background: 'var(--color-surface-offset)', borderRadius: 'var(--radius)' }}>
          <div className="text-xs" style={{ color: 'var(--color-error)', fontWeight: 600, marginBottom: 4 }}>♀ Female</div>
          <div className="text-sm">{pair.femaleName ?? '—'}</div>
          {pair.femaleGrade && <span className="badge" style={{ marginTop: 4 }}>{pair.femaleGrade}</span>}
        </div>
      </div>

      {pair.notes && <div className="text-xs text-muted" style={{ marginTop: 8 }}>{pair.notes}</div>}
    </div>
  )
}
