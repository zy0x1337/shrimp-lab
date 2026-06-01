// ── Core types for shrimp-lab ──

export interface TankProfile {
  id: string
  name: string
  species: SpeciesType
  volumeL: number
  substrate?: string
  notes?: string
  createdAt: string
}

export type SpeciesType = 'neocaridina' | 'caridina'

export interface ParameterRange {
  min: number
  max: number
  unit: string
}

export interface SpeciesParams {
  tds: ParameterRange
  gh: ParameterRange
  kh: ParameterRange
  ph: { min: number; max: number; unit: string }
  tempC: ParameterRange
  tempF: ParameterRange
  description: string
  stabilityNote: string
}

export type LogCategory =
  | 'water_test'
  | 'molt'
  | 'death'
  | 'berried'
  | 'shrimplets'
  | 'maintenance'
  | 'feeding'
  | 'note'

export interface LogEntry {
  id: string
  date: string
  tankId: string
  category: LogCategory
  values?: {
    tds?: number
    gh?: number
    kh?: number
    ph?: number
    tempC?: number
    count?: number
    waterChangePct?: number
    // feeding
    foodType?: string
    foodAmountG?: number
  }
  notes?: string
}

export interface BreedingEntry {
  id: string
  tankId: string
  species: SpeciesType
  berriedDate: string
  tempC: number
  notes?: string
}

export interface AppData {
  tanks: TankProfile[]
  logs: LogEntry[]
  breeding: BreedingEntry[]
  settings: AppSettings
}

export interface AppSettings {
  theme: 'light' | 'dark'
  temperatureUnit: 'C' | 'F'
  defaultTankId?: string
}

export interface ParameterCheck {
  param: string
  label: string
  value: number
  range: ParameterRange
  status: 'good' | 'low' | 'high'
  warning?: string
}

export interface TdsCalcResult {
  changePct: number
  changeVolumeL: number
  changeVolumeGal: number
  warning?: string
  valid: boolean
}
