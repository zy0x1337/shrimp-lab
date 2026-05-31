import type { ParameterCheck, TdsCalcResult, SpeciesType } from './types'
import { SPECIES } from './species'

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
