import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import type { AppData, TankProfile, LogEntry, BreedingEntry, AppSettings } from '../lib/types'
import {
  loadData, addTank, updateTank, deleteTank, addLog, deleteLog,
  addBreeding, deleteBreeding, updateSettings, importData,
} from '../lib/db'

interface DataCtx {
  data: AppData
  setData: (d: AppData) => void
  addTank: (t: Omit<TankProfile, 'id' | 'createdAt'>) => void
  updateTank: (id: string, p: Partial<TankProfile>) => void
  deleteTank: (id: string) => void
  addLog: (e: Omit<LogEntry, 'id'>) => void
  deleteLog: (id: string) => void
  addBreeding: (e: Omit<BreedingEntry, 'id'>) => void
  deleteBreeding: (id: string) => void
  updateSettings: (p: Partial<AppSettings>) => void
  importData: (j: string) => boolean
}

const Ctx = createContext<DataCtx | null>(null)

export function DataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(loadData)

  useEffect(() => {
    if (data.settings.theme === 'dark') {
      document.documentElement.removeAttribute('data-theme')
    } else {
      document.documentElement.setAttribute('data-theme', 'light')
    }
  }, [data.settings.theme])

  const ctx: DataCtx = {
    data,
    setData,
    addTank: useCallback((t) => setData(d => addTank(d, t)), []),
    updateTank: useCallback((id, p) => setData(d => updateTank(d, id, p)), []),
    deleteTank: useCallback((id) => setData(d => deleteTank(d, id)), []),
    addLog: useCallback((e) => setData(d => addLog(d, e)), []),
    deleteLog: useCallback((id) => setData(d => deleteLog(d, id)), []),
    addBreeding: useCallback((e) => setData(d => addBreeding(d, e)), []),
    deleteBreeding: useCallback((id) => setData(d => deleteBreeding(d, id)), []),
    updateSettings: useCallback((p) => setData(d => updateSettings(d, p)), []),
    importData: useCallback((j: string) => {
      const imported = importData(j)
      if (imported) { setData(imported); return true }
      return false
    }, []),
  }

  return <Ctx.Provider value={ctx}>{children}</Ctx.Provider>
}

export function useData() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useData must be inside DataProvider')
  return ctx
}
