import type { ParameterCheck, TdsCalcResult, SpeciesType, LogEntry } from './types'
import { SPECIES, CATEGORY_LABELS } from './species'

// ── Parameter Checker ──────────────────────────────────────────

export function checkParameters(
  species: SpeciesType,
  values: { tds?: number; gh?: number; kh?: number; ph?: number; tempC?: number }
): ParameterCheck[] {
  const params = SPECIES[species]
  const checks: ParameterCheck[] = []

  const add = (
    param: string, label: string, value: number | undefined,
    range: { min: number; max: number; unit: string }, warnings?: Partial<Record<string, string>>
  ) => {
    if (value === undefined || value === null) return
    let status: 'good' | 'low' | 'high' = 'good'
    if (value < range.min) status = 'low'
    else if (value > range.max) status = 'high'

    const check: ParameterCheck = { param, label, value, range, status }
    const warnVal = warnings?.[status]
    if (warnVal) check.warning = warnVal
    checks.push(check)
  }

  add('tds', 'TDS', values.tds, params.tds, {
    high: 'Hoher TDS kann auf Mineralienansammlung hindeuten. Ursache prüfen.',
    low:  'Niedriger TDS kann Molting-Probleme verursachen. Mineralien prüfen.',
  })
  add('gh', 'GH', values.gh, params.gh, {
    high: species === 'caridina' ? 'Hoher GH blockiert aktive Substrate schneller.' : undefined,
    low:  'Niedriger GH kann zu Häutungsproblemen führen (Mineralmangel).',
  })
  add('kh', 'KH', values.kh, params.kh, {
    high: species === 'caridina'
      ? 'Hoher KH ist gefährlich für Caridina — kann pH-Puffer überlasten und Häutungsprobleme verursachen.'
      : undefined,
    low: 'Niedriger KH reduziert pH-Stabilität. Bei 0 KH auf pH-Schwankungen achten.',
  })
  add('ph', 'pH', values.ph, params.ph, {
    high: 'Hoher pH kann Stress verursachen. Langsam anpassen — keine schnellen Änderungen.',
    low:  'Niedriger pH kann Häutungsprobleme verursachen. Stabilität > exakter Wert.',
  })
  add('tempC', 'Temperatur', values.tempC, params.tempC, {
    high: 'Hohe Temperatur erhöht Stoffwechsel und Stress. Kann Algen fördern und Sauerstoff reduzieren.',
    low:  'Niedrige Temperatur verlangsamt Stoffwechsel und Fortpflanzung.',
  })

  return checks
}

// ── TDS Water Change Calculator ─────────────────────────────────

export function calcTdsWaterChange(
  tankVolumeL: number,
  currentTds: number,
  targetTds: number,
  replacementTds: number
): TdsCalcResult {
  if (tankVolumeL <= 0 || currentTds <= 0 || targetTds <= 0) {
    return { changePct: 0, changeVolumeL: 0, changeVolumeGal: 0, valid: false, warning: 'Alle Werte müssen > 0 sein.' }
  }

  if (currentTds === targetTds) {
    return { changePct: 0, changeVolumeL: 0, changeVolumeGal: 0, valid: true, warning: 'TDS ist bereits auf Zielwert.' }
  }

  const sameDirection = (currentTds > targetTds && replacementTds > currentTds) ||
                        (currentTds < targetTds && replacementTds < currentTds)

  if (sameDirection) {
    return {
      changePct: 0, changeVolumeL: 0, changeVolumeGal: 0, valid: false,
      warning: 'Wechselwasser-TDS geht in die falsche Richtung. Zielwert mit diesem Wasser nicht erreichbar.',
    }
  }

  if (currentTds === replacementTds) {
    return { changePct: 0, changeVolumeL: 0, changeVolumeGal: 0, valid: false, warning: 'Wechselwasser-TDS = aktueller TDS — keine Veränderung möglich.' }
  }

  const diff = currentTds - replacementTds
  const ratio = (currentTds - targetTds) / diff
  const pct = Math.round(ratio * 100)

  if (pct < 0) {
    return { changePct: 0, changeVolumeL: 0, changeVolumeGal: 0, valid: false, warning: 'Zielwert mit diesen Parametern nicht erreichbar.' }
  }

  const volumeL = Math.round((pct / 100) * tankVolumeL)
  const volumeGal = Math.round(volumeL * 0.26417 * 10) / 10

  let warning: string | undefined
  if (pct > 50) warning = 'Großer Wasserwechsel nötig. Auf 2–3 kleinere Wechsel über mehrere Tage verteilen.'
  else if (pct > 30) warning = 'Mittlerer Wasserwechsel. Langsam durchführen, Temperatur und TDS angleichen.'

  return { changePct: pct, changeVolumeL: volumeL, changeVolumeGal: volumeGal, warning, valid: true }
}

// ── Berried / Hatch Timeline ────────────────────────────────────

export interface HatchEstimate {
  daysMin: number
  daysMax: number
  hatchStart: Date
  hatchEnd: Date
  daysElapsed: number
  daysRemaining: number
  note: string
}

export function estimateHatch(
  berriedDate: string,
  tempC: number,
): HatchEstimate {
  const berried = new Date(berriedDate)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  berried.setHours(0, 0, 0, 0)

  // Base: 21–28 days at ~22°C. Warmer = faster, cooler = slower.
  // Rough adjustment: ±1 day per 1°C from 22°C
  const tempDelta = Math.round(22 - tempC)
  const daysMin = Math.max(18, 21 + tempDelta)
  const daysMax = Math.max(23, 28 + tempDelta)

  const hatchStart = new Date(berried)
  hatchStart.setDate(hatchStart.getDate() + daysMin)
  const hatchEnd = new Date(berried)
  hatchEnd.setDate(hatchEnd.getDate() + daysMax)

  const daysElapsed = Math.floor((today.getTime() - berried.getTime()) / 86400000)
  const daysRemaining = Math.max(0, daysMin - daysElapsed)

  let note = ''
  if (daysElapsed < 0) {
    note = 'Datum liegt in der Zukunft.'
  } else if (daysRemaining === 0 && daysElapsed <= daysMax) {
    note = '🦐 Schlupf-Fenster ist jetzt! Täglich nach Jungtieren ausschau halten.'
  } else if (daysElapsed > daysMax) {
    note = 'Fenster überschritten. Weibchen könnte die Eier abgeworfen haben oder Jungtiere sind bereits geschlüpft und versteckt.'
  } else {
    const midPoint = Math.round((daysMin + daysMax) / 2)
    if (daysElapsed < midPoint) note = 'Frühe Phase. Eier entwickeln sich.'
    else note = 'Späte Phase. Bald schlüpfen Jungtiere.'
  }

  return { daysMin, daysMax, hatchStart, hatchEnd, daysElapsed, daysRemaining, note }
}

// ── Temperature conversion ─────────────────────────────────────

export function cToF(c: number): number { return Math.round((c * 9 / 5 + 32) * 10) / 10 }
export function fToC(f: number): number { return Math.round(((f - 32) * 5 / 9) * 10) / 10 }

// ── Remineralization Planner ───────────────────────────────────

export interface ReminResult {
  /** Grams of remineralizer to add */
  gramsGh: number
  /** Approximate resulting TDS */
  estimatedTds: number
  /** Teaspoons (rough, assuming ~5g per level tsp) */
  tsp: number
  valid: boolean
  warning?: string
}

const REMIN_PRESETS: Record<string, { label: string; gPerGhPer10L: number; tdsPerDegGh: number }> = {
  'salty-shrimp-gh': { label: 'Salty Shrimp GH+', gPerGhPer10L: 0.3, tdsPerDegGh: 25 },
  'salty-shrimp-ghkh': { label: 'Salty Shrimp GH/KH+', gPerGhPer10L: 0.35, tdsPerDegGh: 30 },
  'dennerle-shrimp-king': { label: 'Dennerle Shrimp King', gPerGhPer10L: 0.25, tdsPerDegGh: 22 },
  'seachem-equilibrium': { label: 'Seachem Equilibrium', gPerGhPer10L: 0.5, tdsPerDegGh: 35 },
  'custom': { label: 'Custom / Manual', gPerGhPer10L: 0, tdsPerDegGh: 0 },
}

export function getReminPresets() { return REMIN_PRESETS }

export function calcRemineralization(
  targetGh: number,
  targetTds: number,
  volumeL: number,
  presetKey: string,
  customGramsPerGhPer10L?: number,
  customTdsPerGh?: number,
  sourceTds?: number, // TDS of source RO/DI water (default 0)
): ReminResult {
  if (targetGh <= 0 || targetTds <= 0 || volumeL <= 0) {
    return { gramsGh: 0, estimatedTds: 0, tsp: 0, valid: false, warning: 'Alle Werte müssen > 0 sein.' }
  }

  const preset = REMIN_PRESETS[presetKey]
  if (!preset) return { gramsGh: 0, estimatedTds: 0, tsp: 0, valid: false, warning: 'Unbekanntes Produkt.' }

  let gPerGhPer10L = preset.gPerGhPer10L
  let tdsPerDegGh = preset.tdsPerDegGh

  if (presetKey === 'custom') {
    if (!customGramsPerGhPer10L || customGramsPerGhPer10L <= 0) {
      return { gramsGh: 0, estimatedTds: 0, tsp: 0, valid: false, warning: 'Bitte g/°dGH pro 10L eingeben.' }
    }
    gPerGhPer10L = customGramsPerGhPer10L
    tdsPerDegGh = customTdsPerGh ?? 25
  }

  const gramsGh = Math.round((gPerGhPer10L * targetGh * (volumeL / 10)) * 100) / 100
  const estimatedTds = Math.round(((sourceTds ?? 0) + (targetGh * tdsPerDegGh)) * 10) / 10
  const tsp = Math.round((gramsGh / 5) * 100) / 100

  let warning: string | undefined
  if (estimatedTds > 300) warning = 'Geschätzter TDS ist sehr hoch. Weniger Remineralizer verwenden oder Ziel-GH reduzieren.'
  else if (estimatedTds < 50 && targetGh > 2) warning = 'Geschätzter TDS ist sehr niedrig. Produkt und Werte prüfen.'

  return { gramsGh, estimatedTds, tsp, valid: true, warning }
}

// ── CSV Export ─────────────────────────────────────────────────

export function exportLogsCsv(logs: LogEntry[], tankNames: Record<string, string>): string {
  const headers = ['Date', 'Tank', 'Category', 'TDS', 'GH', 'KH', 'pH', 'Temp (°C)', 'Count', 'WC %', 'Notes']
  const rows = logs.map(log => {
    const tank = tankNames[log.tankId] ?? 'Unknown'
    return [
      log.date,
      tank,
      CATEGORY_LABELS[log.category] ?? log.category,
      log.values?.tds ?? '',
      log.values?.gh ?? '',
      log.values?.kh ?? '',
      log.values?.ph ?? '',
      log.values?.tempC ?? '',
      log.values?.count ?? '',
      log.values?.waterChangePct ?? '',
      (log.notes ?? '').replace(/"/g, '""'),
    ].map(v => `"${v}"`).join(',')
  })
  return [headers.join(','), ...rows].join('\n')
}
