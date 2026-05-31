import type { SpeciesParams, SpeciesType } from './types'

export const SPECIES: Record<SpeciesType, SpeciesParams> = {
  neocaridina: {
    tds:   { min: 150, max: 250, unit: 'ppm' },
    gh:    { min: 6,   max: 8,   unit: '°dGH' },
    kh:    { min: 2,   max: 5,   unit: '°dKH' },
    ph:    { min: 6.5, max: 7.8, unit: '' },
    tempC: { min: 20,  max: 24,  unit: '°C' },
    tempF: { min: 68,  max: 75,  unit: '°F' },
    description:
      'Neocaridina (Cherry Shrimp, Blue Dream, Yellow, etc.) are the hardiest ornamental shrimp. ' +
      'They tolerate a wider range of parameters and are ideal for beginners.',
    stabilityNote:
      'Neocaridina thrive in stable, mature tanks. Sudden parameter swings harm them ' +
      'more than being slightly outside ideal ranges. Drip-acclimate all new shrimp.',
  },
  caridina: {
    tds:   { min: 100, max: 180, unit: 'ppm' },
    gh:    { min: 4,   max: 6,   unit: '°dGH' },
    kh:    { min: 0,   max: 1,   unit: '°dKH' },
    ph:    { min: 5.8, max: 6.8, unit: '' },
    tempC: { min: 20,  max: 24,  unit: '°C' },
    tempF: { min: 68,  max: 75,  unit: '°F' },
    description:
      'Caridina (Crystal Red, Bee, Taiwan Bee, etc.) require softer, more acidic water. ' +
      'They are more sensitive than Neocaridina and need active buffering substrate.',
    stabilityNote:
      'Caridina need VERY stable parameters. Use active soil (ADA Amazonia, etc.) to buffer pH. ' +
      'KH must stay near 0 — any KH spike can be lethal. RO/DI water + remineralizer is standard.',
  },
}

export const CATEGORY_LABELS: Record<string, string> = {
  water_test:  'Wassertest',
  molt:        'Häutung',
  death:       'Todesfall',
  berried:     'Tragend',
  shrimplets:  'Jungtiere',
  maintenance: 'Wartung',
  note:        'Notiz',
}

export const CATEGORY_ICONS: Record<string, string> = {
  water_test:  '🧪',
  molt:        '🦐',
  death:       '💀',
  berried:     '🥚',
  shrimplets:  '👶',
  maintenance: '🔧',
  note:        '📝',
}

export function formatSpecies(type: SpeciesType): string {
  return type === 'neocaridina' ? 'Neocaridina' : 'Caridina'
}

export function formatParam(value: number, unit: string): string {
  return `${value} ${unit}`
}

export function formatRange(range: { min: number; max: number; unit: string }): string {
  return `${range.min}–${range.max} ${range.unit}`
}
