import { useState, useMemo } from 'react'
import { useData } from '../lib/DataContext'
import type { ShrimpGrade, SpeciesType } from '../lib/types'
import { Plus, Star } from 'lucide-react'

const GRADES: ShrimpGrade[] = ['S', 'SS', 'SSS', 'SSSS', 'custom']

const GRADE_COLORS: Record<string, string> = {
  S:    'var(--color-text-muted)',
  SS:   'var(--color-warning)',
  SSS:  'var(--color-orange)',
  SSSS: 'var(--color-error)',
}

const GRADE_TIPS: Partial<Record<ShrimpGrade, string>> = {
  S:    'Single solid color, minimal pattern imperfections.',
  SS:   'Good color intensity, minor pattern variations acceptable.',
  SSS:  'High color intensity, clean pattern, desirable traits dominant.',
  SSSS: 'Exceptional specimen — near-perfect expression of the target morph.',
}

const NEO_MORPHS = ['Red Cherry', 'Bloody Mary', 'Painted Fire Red', 'Blue Dream', 'Blue Velvet', 'Yellow Neon', 'Orange Neon', 'Black Rose', 'White Pearl', 'Green Jade', 'Other']
const CAR_MORPHS = ['CRS', 'CBS', 'Mosura', 'Shadow Panda', 'Pinto', 'Wine Red', 'King Kong', 'Blue Bolt', 'Taiwan Bee', 'Super Crystal', 'Other']

function fmtDate(iso: string) {
  const d = new Date(iso)
  return `${d.getDate().toString().padStart(2,'0')}.${(d.getMonth()+1).toString().padStart(2,'0')}.${d.getFullYear()}`
}

export function GradeLog() {
  const { data, addLog } = useData()
  const [tankId, setTankId]       = useState(data.tanks[0]?.id ?? '')
  const [date, setDate]           = useState(new Date().toISOString().slice(0,10))
  const [grade, setGrade]         = useState<ShrimpGrade>('SS')
  const [gradeCustom, setGradeCustom] = useState('')
  const [count, setCount]         = useState('1')
  const [notes, setNotes]         = useState('')

  const tank = data.tanks.find(t => t.id === tankId)
  const morphs = tank?.species === 'caridina' ? CAR_MORPHS : NEO_MORPHS

  const handleAdd = () => {
    if (!tankId) return
    addLog({
      date,
      tankId,
      category: 'grade',
      values: {
        count: parseInt(count) || 1,
        grade,
        gradeCustom: grade === 'custom' ? gradeCustom.trim() : undefined,
      },
      notes: notes.trim() || undefined,
    })
    setCount('1'); setNotes(''); setGradeCustom('')
  }

  const gradeLogs = useMemo(() =>
    data.logs
      .filter(l => l.category === 'grade' && (!tankId || l.tankId === tankId))
      .sort((a, b) => b.date.localeCompare(a.date)),
    [data.logs, tankId]
  )

  const distribution = useMemo(() => {
    const dist: Record<string, number> = {}
    gradeLogs.forEach(l => {
      const key = l.values?.grade === 'custom' ? (l.values.gradeCustom ?? 'custom') : (l.values?.grade ?? '?')
      dist[key] = (dist[key] ?? 0) + (l.values?.count ?? 1)
    })
    return dist
  }, [gradeLogs])

  if (data.tanks.length === 0) {
    return (
      <div>
        <div className="page-header"><h1 className="page-title">Grade Log</h1><p className="page-subtitle">Record and track shrimp quality grades.</p></div>
        <div className="card"><p className="text-sm text-muted">No tanks yet. Add one in Settings.</p></div>
      </div>
    )
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Grade Log</h1>
        <p className="page-subtitle">Track quality grades across your colony over time.</p>
      </div>

      {/* Add */}
      <div className="card mb-2">
        <div className="card-header">Log Grade Assessment</div>
        <div className="grid-3">
          <div>
            <label>Date</label>
            <input className="input" type="date" value={date} onChange={e => setDate(e.target.value)} />
          </div>
          <div>
            <label>Tank</label>
            <select className="select" value={tankId} onChange={e => setTankId(e.target.value)}>
              {data.tanks.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          <div>
            <label>Count</label>
            <input className="input" type="number" min="1" value={count} onChange={e => setCount(e.target.value)} />
          </div>
        </div>

        <div style={{ marginTop: 8 }}>
          <label>Grade</label>
          <div className="flex-row gap-1" style={{ marginTop: 4, flexWrap: 'wrap' }}>
            {GRADES.map(g => (
              <button
                key={g}
                className={`btn btn-sm ${grade === g ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setGrade(g)}
                style={grade !== g && GRADE_COLORS[g] ? { color: GRADE_COLORS[g] } : {}}
              >
                {g !== 'custom' && <Star size={11} style={{ marginRight: 2 }} />}{g.toUpperCase()}
              </button>
            ))}
          </div>
          {grade !== 'custom' && GRADE_TIPS[grade] && (
            <div className="text-xs text-muted" style={{ marginTop: 4 }}>{GRADE_TIPS[grade]}</div>
          )}
          {grade === 'custom' && (
            <input className="input" style={{ marginTop: 6 }} placeholder="Custom grade label (e.g. PFR High Red)" value={gradeCustom} onChange={e => setGradeCustom(e.target.value)} />
          )}
        </div>

        <div style={{ marginTop: 8 }}>
          <label>Notes / morph (optional)</label>
          <input className="input" placeholder={`e.g. ${morphs[0]}, strong back stripe`} value={notes} onChange={e => setNotes(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAdd()} />
        </div>
        <button className="btn btn-primary btn-sm" style={{ marginTop: 8, width: 'fit-content' }} onClick={handleAdd}>
          <Plus size={14} /> Log Grade
        </button>
      </div>

      {/* Distribution */}
      {Object.keys(distribution).length > 0 && (
        <div className="card mb-2">
          <div className="card-header">Grade Distribution — {tank?.name}</div>
          <div className="flex-row gap-1" style={{ flexWrap: 'wrap' }}>
            {Object.entries(distribution).map(([g, n]) => (
              <div key={g} style={{ textAlign: 'center', minWidth: 60 }}>
                <div className="stat-value" style={{ fontSize: '1.4rem', color: GRADE_COLORS[g] ?? 'inherit' }}>{n}</div>
                <div className="stat-label">{g}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Log */}
      <div className="card">
        <div className="card-header">Grade History</div>
        {gradeLogs.length === 0 && <p className="text-sm text-muted">No grade assessments logged yet.</p>}
        {gradeLogs.map(log => {
          const g = log.values?.grade ?? '?'
          const label = g === 'custom' ? (log.values?.gradeCustom ?? 'custom') : g
          const tankN = data.tanks.find(t => t.id === log.tankId)?.name ?? log.tankId
          return (
            <div key={log.id} style={{ padding: '0.6rem 0.75rem', borderBottom: '1px solid var(--color-divider)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontWeight: 700, color: GRADE_COLORS[g] ?? 'inherit', marginRight: 8 }}>{label}</span>
                <span className="text-sm">{log.values?.count && log.values.count > 1 ? `×${log.values.count} shrimp` : '1 shrimp'}</span>
                <div className="text-xs text-muted" style={{ marginTop: 2 }}>{tankN} · {fmtDate(log.date)}{log.notes ? ` · ${log.notes}` : ''}</div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
