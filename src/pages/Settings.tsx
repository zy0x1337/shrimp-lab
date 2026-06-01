import { useState, useRef, useEffect } from 'react'
import { useData } from '../lib/DataContext'
import { exportData } from '../lib/db'
import { exportLogsCsv } from '../lib/calculators'
import { formatSpecies } from '../lib/species'
import type { SpeciesType } from '../lib/types'
import { Plus, Trash2, Download, Upload, Sun, Moon, FileSpreadsheet, X } from 'lucide-react'

export function SettingsPage() {
  const { data, addTank, updateTank, deleteTank, updateSettings, importData: doImport } = useData()
  const [newName, setNewName]           = useState('')
  const [newVol, setNewVol]             = useState('40')
  const [newSpecies, setNewSpecies]     = useState<SpeciesType>('neocaridina')
  const [newSubstrate, setNewSubstrate] = useState('')
  const [importMsg, setImportMsg]       = useState<{ text: string; ok: boolean } | null>(null)
  const [editingTank, setEditingTank]   = useState<typeof data.tanks[0] | null>(null)
  const fileRef   = useRef<HTMLInputElement>(null)
  const dialogRef = useRef<HTMLDialogElement>(null)

  // Drive the native <dialog> open/close from editingTank state
  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (editingTank) {
      dialog.showModal()
    } else {
      // Only call close() if the dialog is currently open to avoid DOMException
      if (dialog.open) dialog.close()
    }
  }, [editingTank])

  const handleAdd = () => {
    if (!newName.trim()) return
    addTank({
      name: newName.trim(),
      species: newSpecies,
      volumeL: parseInt(newVol) || 40,
      substrate: newSubstrate.trim() || undefined,
    })
    setNewName(''); setNewVol('40'); setNewSubstrate('')
  }

  const handleExport = () => {
    const json = exportData(data)
    const blob = new Blob([json], { type: 'application/json' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `shrimp-lab-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleExportCsv = () => {
    const tankNames: Record<string, string> = {}
    data.tanks.forEach(t => { tankNames[t.id] = t.name })
    const csv  = exportLogsCsv(data.logs, tankNames)
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `shrimp-lab-logs-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const text = await file.text()
      const ok   = doImport(text)
      setImportMsg({ text: ok ? '\u2713 Data imported successfully.' : '\u2717 Invalid file format.', ok })
      setTimeout(() => setImportMsg(null), 4000)
    } catch {
      setImportMsg({ text: '\u2717 Failed to read file.', ok: false })
      setTimeout(() => setImportMsg(null), 4000)
    }
    e.target.value = ''
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">Manage tanks, theme, and data.</p>
      </div>

      {/* Theme */}
      <div className="card mb-2">
        <div className="card-header">Appearance</div>
        <div className="flex-row gap-1">
          <button
            className={`btn ${data.settings.theme === 'dark' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => updateSettings({ theme: 'dark' })}
          >
            <Moon size={16} aria-hidden="true" /> Dark
          </button>
          <button
            className={`btn ${data.settings.theme === 'light' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => updateSettings({ theme: 'light' })}
          >
            <Sun size={16} aria-hidden="true" /> Light
          </button>
        </div>
      </div>

      {/* Units */}
      <div className="card mb-2">
        <div className="card-header">Units</div>
        <div className="flex-row gap-1">
          <button
            className={`btn ${data.settings.temperatureUnit === 'C' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => updateSettings({ temperatureUnit: 'C' })}
          >
            \u00b0C (Celsius)
          </button>
          <button
            className={`btn ${data.settings.temperatureUnit === 'F' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => updateSettings({ temperatureUnit: 'F' })}
          >
            \u00b0F (Fahrenheit)
          </button>
        </div>
      </div>

      {/* Tanks */}
      <div className="card mb-2">
        <div className="card-header">Tank Profiles</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {data.tanks.map(tank => (
            <div
              key={tank.id}
              className="flex-between"
              role="button"
              tabIndex={0}
              aria-label={`Edit tank ${tank.name}`}
              style={{
                padding: '0.6rem 0.75rem',
                borderBottom: '1px solid var(--color-divider)',
                borderRadius: 'var(--radius)',
                cursor: 'pointer',
              }}
              onClick={() => setEditingTank(tank)}
              onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && setEditingTank(tank)}
            >
              <div>
                <div style={{ fontWeight: 600 }}>{tank.name}</div>
                <div className="text-xs text-muted">
                  {tank.volumeL}L \u00b7 {formatSpecies(tank.species)}
                  {tank.substrate ? ` \u00b7 ${tank.substrate}` : ''}
                  {tank.notes ? ` \u00b7 ${tank.notes}` : ''}
                </div>
              </div>
              <div className="flex-row gap-1">
                <span className={`badge ${tank.species === 'neocaridina' ? 'badge-neo' : 'badge-caridina'}`}>
                  {formatSpecies(tank.species)}
                </span>
                <button
                  className="btn btn-danger btn-sm"
                  aria-label={`Delete tank ${tank.name}`}
                  onClick={e => { e.stopPropagation(); deleteTank(tank.id) }}
                >
                  <Trash2 size={14} aria-hidden="true" />
                </button>
              </div>
            </div>
          ))}

          {data.tanks.length === 0 && (
            <div className="text-sm text-muted">No tanks yet. Add one below.</div>
          )}

          {/* Add new tank */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '0.75rem', background: 'var(--color-surface2)', borderRadius: 'var(--radius)' }}>
            <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>Add Tank</div>
            <div className="grid-2">
              <div>
                <label htmlFor="new-tank-name">Name</label>
                <input id="new-tank-name" className="input" placeholder="e.g. Neo Tank" value={newName}
                  onChange={e => setNewName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAdd()} />
              </div>
              <div>
                <label htmlFor="new-tank-vol">Volume (L)</label>
                <input id="new-tank-vol" className="input" type="number" value={newVol}
                  onChange={e => setNewVol(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAdd()} />
              </div>
            </div>
            <div className="grid-2">
              <div>
                <label htmlFor="new-tank-species">Species</label>
                <select id="new-tank-species" className="select" value={newSpecies} onChange={e => setNewSpecies(e.target.value as SpeciesType)}>
                  <option value="neocaridina">Neocaridina</option>
                  <option value="caridina">Caridina</option>
                </select>
              </div>
              <div>
                <label htmlFor="new-tank-substrate">Substrate (optional)</label>
                <input id="new-tank-substrate" className="input" placeholder="e.g. ADA Amazonia" value={newSubstrate}
                  onChange={e => setNewSubstrate(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAdd()} />
              </div>
            </div>
            <button className="btn btn-primary btn-sm" onClick={handleAdd} style={{ width: 'fit-content' }}>
              <Plus size={14} aria-hidden="true" /> Add Tank
            </button>
          </div>
        </div>
      </div>

      {/* Import/Export */}
      <div className="card mb-2">
        <div className="card-header">Data Management</div>
        <div className="flex-row gap-1" style={{ flexWrap: 'wrap' }}>
          <button className="btn btn-ghost" onClick={handleExport}>
            <Download size={16} aria-hidden="true" /> Export JSON
          </button>
          <button className="btn btn-ghost" onClick={handleExportCsv}>
            <FileSpreadsheet size={16} aria-hidden="true" /> Export CSV
          </button>
          <button className="btn btn-ghost" onClick={() => fileRef.current?.click()}>
            <Upload size={16} aria-hidden="true" /> Import JSON
          </button>
          <input ref={fileRef} type="file" accept=".json" style={{ display: 'none' }} onChange={handleImport} />
        </div>
        {importMsg && (
          <div
            role="status"
            aria-live="polite"
            className="mt-1 text-sm"
            style={{ color: importMsg.ok ? 'var(--color-good)' : 'var(--color-bad)' }}
          >
            {importMsg.text}
          </div>
        )}
        <div className="text-xs text-faint mt-1">
          JSON exports all data (tanks, logs, breeding, settings). CSV exports log entries for spreadsheet use. Import restores from a JSON backup.
        </div>
      </div>

      {/* Stats */}
      <div className="card">
        <div className="card-header">Data Summary</div>
        <div className="grid-3 text-sm text-muted">
          <div>
            <div className="stat-value" style={{ fontSize: '1.2rem' }}>{data.tanks.length}</div>
            <div className="stat-label">Tank{data.tanks.length !== 1 ? 's' : ''}</div>
          </div>
          <div>
            <div className="stat-value" style={{ fontSize: '1.2rem' }}>{data.logs.length}</div>
            <div className="stat-label">Log Entr{data.logs.length !== 1 ? 'ies' : 'y'}</div>
          </div>
          <div>
            <div className="stat-value" style={{ fontSize: '1.2rem' }}>{data.breeding.length}</div>
            <div className="stat-label">Breeding</div>
          </div>
        </div>
      </div>

      {/* Native <dialog> for tank editing — browser handles focus trap + Escape */}
      <dialog
        ref={dialogRef}
        className="tank-edit-dialog"
        aria-label={editingTank ? `Edit tank: ${editingTank.name}` : 'Edit tank'}
        onClose={() => setEditingTank(null)}
      >
        {editingTank && (
          <EditTankForm
            tank={editingTank}
            onSave={patch => { updateTank(editingTank.id, patch); setEditingTank(null) }}
            onCancel={() => setEditingTank(null)}
          />
        )}
      </dialog>
    </div>
  )
}

// ── Tank edit form (rendered inside <dialog>) ─────────────────────────────────
function EditTankForm({
  tank,
  onSave,
  onCancel,
}: {
  tank: { name: string; species: SpeciesType; volumeL: number; substrate?: string; notes?: string }
  onSave: (patch: { name: string; species: SpeciesType; volumeL: number; substrate?: string; notes?: string }) => void
  onCancel: () => void
}) {
  const [name, setName]           = useState(tank.name)
  const [species, setSpecies]     = useState<SpeciesType>(tank.species)
  const [volumeL, setVolumeL]     = useState(tank.volumeL.toString())
  const [substrate, setSubstrate] = useState(tank.substrate ?? '')
  const [notes, setNotes]         = useState(tank.notes ?? '')

  return (
    <div className="tank-edit-dialog__inner">
      <div className="tank-edit-dialog__header">
        <h2 className="tank-edit-dialog__title">Edit Tank</h2>
        <button
          className="btn btn-ghost"
          onClick={onCancel}
          aria-label="Close dialog"
          style={{ padding: '0.25rem' }}
        >
          <X size={18} aria-hidden="true" />
        </button>
      </div>

      <div className="grid-2">
        <div>
          <label htmlFor="edit-tank-name">Name</label>
          <input id="edit-tank-name" className="input" value={name} onChange={e => setName(e.target.value)} />
        </div>
        <div>
          <label htmlFor="edit-tank-vol">Volume (L)</label>
          <input id="edit-tank-vol" className="input" type="number" value={volumeL} onChange={e => setVolumeL(e.target.value)} />
        </div>
      </div>
      <div className="grid-2" style={{ marginTop: 8 }}>
        <div>
          <label htmlFor="edit-tank-species">Species</label>
          <select id="edit-tank-species" className="select" value={species} onChange={e => setSpecies(e.target.value as SpeciesType)}>
            <option value="neocaridina">Neocaridina</option>
            <option value="caridina">Caridina</option>
          </select>
        </div>
        <div>
          <label htmlFor="edit-tank-substrate">Substrate</label>
          <input id="edit-tank-substrate" className="input" placeholder="e.g. ADA Amazonia" value={substrate} onChange={e => setSubstrate(e.target.value)} />
        </div>
      </div>
      <div style={{ marginTop: 8 }}>
        <label htmlFor="edit-tank-notes">Notes (optional)</label>
        <input id="edit-tank-notes" className="input" placeholder="Any notes about this tank" value={notes} onChange={e => setNotes(e.target.value)} />
      </div>
      <div className="flex-row gap-1" style={{ marginTop: 12 }}>
        <button
          className="btn btn-primary btn-sm"
          onClick={() => onSave({
            name: name.trim() || tank.name,
            species,
            volumeL: parseInt(volumeL) || tank.volumeL,
            substrate: substrate.trim() || undefined,
            notes: notes.trim() || undefined,
          })}
        >
          Save changes
        </button>
        <button className="btn btn-ghost btn-sm" onClick={onCancel}>Cancel</button>
      </div>
    </div>
  )
}
