import type { AppData, TankProfile, LogEntry, BreedingEntry, AppSettings } from './types'

const STORAGE_KEY = 'shrimp-lab-data'

function getDefaultSettings(): AppSettings {
  return { theme: 'dark', temperatureUnit: 'C' }
}

function getDefaultData(): AppData {
  return { tanks: [], logs: [], breeding: [], settings: getDefaultSettings() }
}

export function loadData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return getDefaultData()
    const data = JSON.parse(raw) as AppData
    return {
      tanks: data.tanks ?? [],
      logs: data.logs ?? [],
      breeding: data.breeding ?? [],
      settings: { ...getDefaultSettings(), ...data.settings },
    }
  } catch {
    return getDefaultData()
  }
}

export function saveData(data: AppData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

function uid(): string { return Date.now().toString(36) + Math.random().toString(36).slice(2, 8) }

// Tanks
export function addTank(data: AppData, tank: Omit<TankProfile, 'id' | 'createdAt'>): AppData {
  const updated = { ...data, tanks: [...data.tanks, { ...tank, id: uid(), createdAt: new Date().toISOString() }] }
  saveData(updated)
  return updated
}

export function updateTank(data: AppData, id: string, patch: Partial<TankProfile>): AppData {
  const updated = { ...data, tanks: data.tanks.map(t => t.id === id ? { ...t, ...patch } : t) }
  saveData(updated)
  return updated
}

export function deleteTank(data: AppData, id: string): AppData {
  const updated = { ...data, tanks: data.tanks.filter(t => t.id !== id) }
  saveData(updated)
  return updated
}

// Logs
export function addLog(data: AppData, entry: Omit<LogEntry, 'id'>): AppData {
  const updated = { ...data, logs: [...data.logs, { ...entry, id: uid() }] }
  saveData(updated)
  return updated
}

export function updateLog(data: AppData, id: string, patch: Partial<LogEntry>): AppData {
  const updated = { ...data, logs: data.logs.map(l => l.id === id ? { ...l, ...patch } : l) }
  saveData(updated)
  return updated
}

export function deleteLog(data: AppData, id: string): AppData {
  const updated = { ...data, logs: data.logs.filter(l => l.id !== id) }
  saveData(updated)
  return updated
}

// Breeding
export function addBreeding(data: AppData, entry: Omit<BreedingEntry, 'id'>): AppData {
  const updated = { ...data, breeding: [...data.breeding, { ...entry, id: uid() }] }
  saveData(updated)
  return updated
}

export function deleteBreeding(data: AppData, id: string): AppData {
  const updated = { ...data, breeding: data.breeding.filter(b => b.id !== id) }
  saveData(updated)
  return updated
}

// Settings
export function updateSettings(data: AppData, patch: Partial<AppSettings>): AppData {
  const updated = { ...data, settings: { ...data.settings, ...patch } }
  saveData(updated)
  return updated
}

// Import / Export
export function exportData(data: AppData): string {
  return JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), ...data }, null, 2)
}

export function importData(json: string): AppData | null {
  try {
    const parsed = JSON.parse(json)
    if (!parsed.tanks || !parsed.logs || !parsed.breeding) return null
    const data: AppData = {
      tanks: parsed.tanks ?? [],
      logs: parsed.logs ?? [],
      breeding: parsed.breeding ?? [],
      settings: { ...getDefaultSettings(), ...parsed.settings },
    }
    saveData(data)
    return data
  } catch {
    return null
  }
}
