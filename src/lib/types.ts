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
  | 'grade'
  | 'note'

export type MoltStatus = 'normal' | 'failed' | 'wrod'

export type ShrimpGrade = 'S' | 'SS' | 'SSS' | 'SSSS' | 'custom'

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
    // molt
    moltStatus?: MoltStatus
    // grade
    grade?: ShrimpGrade
    gradeCustom?: string
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

// ── v0.3: Breeding Pair ──────────────────────────────────────────────────────
export interface BreedingPair {
  id: string
  name: string           // e.g. "Pair A — SSS × SS"
  tankId: string
  species: SpeciesType
  maleName?: string
  maleGrade?: ShrimpGrade
  femaleName?: string
  femaleGrade?: ShrimpGrade
  startDate: string
  endDate?: string       // set when pair is retired
  notes?: string
  litterIds: string[]    // BreedingEntry IDs produced by this pair
  createdAt: string
}

// ── v0.3: Breeding Line ──────────────────────────────────────────────────────
export interface BreedingLine {
  id: string
  name: string           // e.g. "Shadow Panda F3"
  species: SpeciesType
  targetGrade: string
  parentLineIds: string[] // other BreedingLine IDs
  pairIds: string[]       // BreedingPair IDs in this line
  notes?: string
  createdAt: string
}

export interface AppData {
  tanks: TankProfile[]
  logs: LogEntry[]
  breeding: BreedingEntry[]
  breedingPairs: BreedingPair[]
  breedingLines: BreedingLine[]
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
