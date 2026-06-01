import { useState, useMemo } from 'react'
import { useData } from '../lib/DataContext'
import type { MoltStatus } from '../lib/types'
import { AlertTriangle, CheckCircle, XCircle, Activity, FlaskConical } from 'lucide-react'

const MOLT_STATUS_LABELS: Record<MoltStatus, { label: string; color: string; icon: React.ReactNode; tip: string }> = {
  normal: {
    label: 'Normal',
    color: 'var(--color-success)',
    icon: <CheckCircle size={14} />,
    tip: 'Clean molt, no issues observed.',
  },
  failed: {
    label: 'Failed molt',
    color: 'var(--color-error)',
    icon: <XCircle size={14} />,
    tip: 'Shrimp could not fully exit old shell. Check GH/KH and mineral levels.',
  },
  wrod: {
    label: 'White Ring of Death',
    color: 'var(--color-error)',
    icon: <AlertTriangle size={14} />,
    tip: 'White ring visible at mid-body. Fatal in most cases. Caused by sudden parameter swings or mineral deficiency.',
  },
}

function fmtDate(iso: string) {
  const d = new Date(iso)
  return `${d.getDate().toString().padStart(2,'0')}.${(d.getMonth()+1).toString().padStart(2,'0')}.${d.getFullYear()}`
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

export function MoltTracker() {
  const { data, addLog } = useData()
  const [tankId, setTankId] = useState(data.tanks[0]?.id ?? '')
  const [date, setDate]     = useState(new Date().toISOString().slice(0,10))
  const [status, setStatus] = useState<MoltStatus>('normal')
  const [count, setCount]   = useState('1')
  const [notes, setNotes]   = useState('')

  const handleAdd = () => {
    if (!tankId) return
    addLog({
      date,
      tankId,
      category: 'molt',
      values: { count: parseInt(count) || 1, moltStatus: status },
      notes: notes.trim() || undefined,
    })
    setCount('1'); setNotes('')
  }

  const moltLogs = useMemo(() =>
    data.logs
      .filter(l => l.category === 'molt' && (!tankId || l.tankId === tankId))
      .sort((a, b) => b.date.localeCompare(a.date)),
    [data.logs, tankId]
  )

  const stats = useMemo(() => ({
    total:  moltLogs.reduce((a, l) => a + (l.values?.count ?? 1), 0),
    normal: moltLogs.filter(l => l.values?.moltStatus === 'normal' || !l.values?.moltStatus).reduce((a, l) => a + (l.values?.count ?? 1), 0),
    failed: moltLogs.filter(l => l.values?.moltStatus === 'failed').reduce((a, l) => a + (l.values?.count ?? 1), 0),
    wrod:   moltLogs.filter(l => l.values?.moltStatus === 'wrod').reduce((a, l) => a + (l.values?.count ?? 1), 0),
  }), [moltLogs])

  if (data.tanks.length === 0) {
    return (
      <div>
        <div className="page-header">
          <h1 className="page-title">Molt Tracker</h1>
          <p className="page-subtitle">Log and analyze molting events.</p>
        </div>
        <div className="card">
          <EmptyState
            icon={<FlaskConical size={22} />}
            title="No tanks configured"
            body="Add a tank in Settings to start tracking molt events."
          />
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Molt Tracker</h1>
        <p className="page-subtitle">Log molting events and detect mineral deficiencies.</p>
      </div>

      {/* Add molt */}
      <div className="card mb-2">
        <div className="card-header">Log Molt</div>
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
          <label>Molt status</label>
          <div className="flex-row gap-1" style={{ marginTop: 4, flexWrap: 'wrap' }}>
            {(Object.keys(MOLT_STATUS_LABELS) as MoltStatus[]).map(s => (
              <button
                key={s}
                className={`btn btn-sm ${status === s ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setStatus(s)}
                style={status === s ? {} : { color: MOLT_STATUS_LABELS[s].color }}
              >
                {MOLT_STATUS_LABELS[s].icon}&nbsp;{MOLT_STATUS_LABELS[s].label}
              </button>
            ))}
          </div>
          <div className="text-xs text-muted" style={{ marginTop: 4 }}>{MOLT_STATUS_LABELS[status].tip}</div>
        </div>
        <div style={{ marginTop: 8 }}>
          <label>Notes</label>
          <input className="input" placeholder="Observations…" value={notes} onChange={e => setNotes(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAdd()} />
        </div>
        <button className="btn btn-primary btn-sm" style={{ marginTop: 8, width: 'fit-content' }} onClick={handleAdd}>
          Log Molt
        </button>
      </div>

      {/* Stats */}
      {moltLogs.length > 0 && (
        <div className="card mb-2">
          <div className="card-header">Summary</div>
          <div className="grid-4 text-sm">
            <div><div className="stat-value">{stats.total}</div><div className="stat-label">Total molts</div></div>
            <div><div className="stat-value" style={{ color: 'var(--color-success)' }}>{stats.normal}</div><div className="stat-label">Normal</div></div>
            <div><div className="stat-value" style={{ color: 'var(--color-error)' }}>{stats.failed}</div><div className="stat-label">Failed</div></div>
            <div><div className="stat-value" style={{ color: 'var(--color-error)' }}>{stats.wrod}</div><div className="stat-label">WROD</div></div>
          </div>
          {(stats.failed > 0 || stats.wrod > 0) && (
            <div className="mt-1 text-sm" style={{ color: 'var(--color-error)' }}>
              ⚠ Problematic molts detected. Check GH/KH levels and ensure adequate mineral supplementation.
            </div>
          )}
        </div>
      )}

      {/* Log */}
      <div className="card">
        <div className="card-header">Molt History</div>
        {moltLogs.length === 0 && (
          <EmptyState
            icon={<Activity size={22} />}
            title="No molt events logged yet"
            body="Use the form above to log your first molt. Normal, failed, and WROD events are tracked separately."
          />
        )}
        {moltLogs.map(log => {
          const s = (log.values?.moltStatus ?? 'normal') as MoltStatus
          const meta = MOLT_STATUS_LABELS[s]
          const tank = data.tanks.find(t => t.id === log.tankId)
          return (
            <div key={log.id} style={{ padding: '0.6rem 0.75rem', borderBottom: '1px solid var(--color-divider)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div className="flex-row gap-1" style={{ alignItems: 'center' }}>
                  <span style={{ color: meta.color }}>{meta.icon}</span>
                  <span className="text-sm" style={{ fontWeight: 600, color: meta.color }}>{meta.label}</span>
                  {log.values?.count && log.values.count > 1 && (
                    <span className="badge">×{log.values.count}</span>
                  )}
                </div>
                <div className="text-xs text-muted" style={{ marginTop: 2 }}>
                  {tank?.name} · {fmtDate(log.date)}
                  {log.notes && ` · ${log.notes}`}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
