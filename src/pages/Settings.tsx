import { useState, useRef } from 'react'
import { useData } from '../lib/DataContext'
import { exportData } from '../lib/db'
import { exportLogsCsv } from '../lib/calculators'
import { formatSpecies } from '../lib/species'
import type { SpeciesType } from '../lib/types'
import { Plus, Trash2, Download, Upload, Sun, Moon, FileSpreadsheet } from 'lucide-react'

export function SettingsPage() {
  const { data, addTank, updateTank, deleteTank, updateSettings, importData: doImport } = useData()
  const [newName, setNewName] = useState('')
  const [newVol, setNewVol] = useState('40')
  const [newSpecies, setNewSpecies] = useState<SpeciesType>('neocaridina')
  const [newSubstrate, setNewSubstrate] = useState('')
  const [importMsg, setImportMsg] = useState('')
  const [editingTankId, setEditingTankId] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

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
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `shrimp-lab-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleExportCsv = () => {
    const tankNames: Record<string, string> = {}
    data.tanks.forEach(t => { tankNames[t.id] = t.name })
    const csv = exportLogsCsv(data.logs, tankNames)
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `shrimp-lab-logs-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const text = await file.text()
      const ok = doImport(text)
      setImportMsg(ok ? '✓ Data imported successfully.' : '✗ Invalid file format.')
      setTimeout(() => setImportMsg(''), 3000)
    } catch {
      setImportMsg('✗ Failed to read file.')
      setTimeout(() => setImportMsg(''), 3000)
    }
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
            <Moon size={16} /> Dark
          </button>
          <button
            className={`btn ${data.settings.theme === 'light' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => updateSettings({ theme: 'light' })}
          >
            <Sun size={16} /> Light
          </button>
        </div>
      </div>

      {/* Unit prefs */}
      <div className="card mb-2">
        <div className="card-header">Units</div>
        <div className="flex-row gap-1">
          <button
            className={`btn ${data.settings.temperatureUnit === 'C' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => updateSettings({ temperatureUnit: 'C' })}
          >
            °C (Celsius)
          </button>
          <button
            className={`btn ${data.settings.temperatureUnit === 'F' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => updateSettings({ temperatureUnit: 'F' })}
          >
            °F (Fahrenheit)
          </button>
        </div>
      </div>

      {/* Tanks */}
      <div className="card mb-2">
        <div className="card-header">Tank Profiles</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {/* Existing tanks */}
          {data.tanks.map(tank => (
            <div key={tank.id}>
              {editingTankId === tank.id ? (
                <EditTankForm
                  tank={tank}
                  onSave={(patch) => { updateTank(tank.id, patch); setEditingTankId(null) }}
                  onCancel={() => setEditingTankId(null)}
                />
              ) : (
                <div
                  className="flex-between"
                  style={{ padding: '0.6rem 0.75rem', borderBottom: '1px solid var(--color-divider)', borderRadius: 'var(--radius)', cursor: 'pointer' }}
                  onClick={() => setEditingTankId(tank.id)}
                >
                  <div>
                    <div style={{ fontWeight: 600 }}>{tank.name}</div>
                    <div className="text-xs text-muted">
                      {tank.volumeL}L · {formatSpecies(tank.species)}
                      {tank.substrate ? ` · ${tank.substrate}` : ''}
                      {tank.notes ? ` · ${tank.notes}` : ''}
                    </div>
                  </div>
                  <div className="flex-row gap-1">
                    <span className={`badge ${tank.species === 'neocaridina' ? 'badge-neo' : 'badge-caridina'}`}>
                      {formatSpecies(tank.species)}
                    </span>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={e => { e.stopPropagation(); deleteTank(tank.id) }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              )}
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
                <label>Name</label>
                <input className="input" placeholder="e.g. Neo Tank" value={newName}
                  onChange={e => setNewName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAdd()} />
              </div>
              <div>
                <label>Volume (L)</label>
                <input className="input" type="number" value={newVol}
                  onChange={e => setNewVol(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAdd()} />
              </div>
            </div>
            <div className="grid-2">
              <div>
                <label>Species</label>
                <select className="select" value={newSpecies} onChange={e => setNewSpecies(e.target.value as SpeciesType)}>
                  <option value="neocaridina">Neocaridina</option>
                  <option value="caridina">Caridina</option>
                </select>
              </div>
              <div>
                <label>Substrate (optional)</label>
                <input className="input" placeholder="e.g. ADA Amazonia" value={newSubstrate}
                  onChange={e => setNewSubstrate(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAdd()} />
              </div>
            </div>
            <button className="btn btn-primary btn-sm" onClick={handleAdd} style={{ width: 'fit-content' }}>
              <Plus size={14} /> Add Tank
            </button>
          </div>
        </div>
      </div>

      {/* Import/Export */}
      <div className="card mb-2">
        <div className="card-header">Data Management</div>
        <div className="flex-row gap-1" style={{ flexWrap: 'wrap' }}>
          <button className="btn btn-ghost" onClick={handleExport}>
            <Download size={16} /> Export JSON
          </button>
          <button className="btn btn-ghost" onClick={handleExportCsv}>
            <FileSpreadsheet size={16} /> Export CSV
          </button>
          <button className="btn btn-ghost" onClick={() => fileRef.current?.click()}>
            <Upload size={16} /> Import JSON
          </button>
          <input ref={fileRef} type="file" accept=".json" style={{ display: 'none' }} onChange={handleImport} />
        </div>
        {importMsg && (
          <div className="mt-1 text-sm" style={{ color: importMsg.startsWith('✓') ? 'var(--color-good)' : 'var(--color-bad)' }}>
            {importMsg}
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
    </div>
  )
}

// Inline tank editor
function EditTankForm({ tank, onSave, onCancel }: {
  tank: { name: string; species: SpeciesType; volumeL: number; substrate?: string; notes?: string }
  onSave: (patch: { name: string; species: SpeciesType; volumeL: number; substrate?: string; notes?: string }) => void
  onCancel: () => void
}) {
  const [name, setName] = useState(tank.name)
  const [species, setSpecies] = useState<SpeciesType>(tank.species)
  const [volumeL, setVolumeL] = useState(tank.volumeL.toString())
  const [substrate, setSubstrate] = useState(tank.substrate ?? '')
  const [notes, setNotes] = useState(tank.notes ?? '')

  return (
    <div style={{ padding: '0.75rem', background: 'var(--color-surface2)', borderRadius: 'var(--radius)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <div className="grid-2">
        <div>
          <label>Name</label>
          <input className="input" value={name} onChange={e => setName(e.target.value)} />
        </div>
        <div>
          <label>Volume (L)</label>
          <input className="input" type="number" value={volumeL} onChange={e => setVolumeL(e.target.value)} />
        </div>
      </div>
      <div className="grid-2">
        <div>
          <label>Species</label>
          <select className="select" value={species} onChange={e => setSpecies(e.target.value as SpeciesType)}>
            <option value="neocaridina">Neocaridina</option>
            <option value="caridina">Caridina</option>
          </select>
        </div>
        <div>
          <label>Substrate</label>
          <input className="input" placeholder="e.g. ADA Amazonia" value={substrate} onChange={e => setSubstrate(e.target.value)} />
        </div>
      </div>
      <div>
        <label>Notes (optional)</label>
        <input className="input" placeholder="Any notes about this tank" value={notes} onChange={e => setNotes(e.target.value)} />
      </div>
      <div className="flex-row gap-1">
        <button className="btn btn-primary btn-sm" onClick={() => onSave({
          name: name || tank.name,
          species,
          volumeL: parseInt(volumeL) || tank.volumeL,
          substrate: substrate.trim() || undefined,
          notes: notes.trim() || undefined,
        })}>Save</button>
        <button className="btn btn-ghost btn-sm" onClick={onCancel}>Cancel</button>
      </div>
    </div>
  )
}
