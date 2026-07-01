import type { Inputs } from '../engine/types'
import { DEFAULT_INPUTS } from '../engine/defaultRates'

// Encodes/decodes the user inputs into short URL query params so a scenario can
// be shared by copying the link. Only inputs travel in the URL; edited rate
// tables stay in localStorage (they would bloat the link).

const SHORT = {
  grossSalary: 'g',
  filingStatus: 'fs',
  contrib401k: 'k',
  hsa: 'hsa',
  healthFsa: 'fsa',
  dependentCareFsa: 'dc',
  traditionalIra: 'ira',
  otherPreTax: 'o',
} as const

const NUMERIC_KEYS: (keyof typeof SHORT)[] = [
  'grossSalary',
  'contrib401k',
  'hsa',
  'healthFsa',
  'dependentCareFsa',
  'traditionalIra',
  'otherPreTax',
]

/** Serialize inputs into a query string (no leading "?"). */
export function encodeInputs(inputs: Inputs): string {
  const p = new URLSearchParams()
  for (const key of NUMERIC_KEYS) {
    p.set(SHORT[key], String(inputs[key]))
  }
  p.set(SHORT.filingStatus, inputs.filingStatus === 'Married Filing Jointly' ? 'm' : 's')
  return p.toString()
}

/**
 * Parse inputs from a query string. Returns null when none of our params are
 * present (so the app falls back to defaults). Missing individual fields fall
 * back to the default value; invalid numbers are ignored.
 */
export function decodeInputs(search: string): Inputs | null {
  const p = new URLSearchParams(search)
  const hasAny = Object.values(SHORT).some((short) => p.has(short))
  if (!hasAny) return null

  const num = (key: keyof typeof SHORT, fallback: number): number => {
    const raw = p.get(SHORT[key])
    if (raw === null) return fallback
    const n = Number(raw)
    return Number.isFinite(n) && n >= 0 ? n : fallback
  }

  return {
    grossSalary: num('grossSalary', DEFAULT_INPUTS.grossSalary),
    filingStatus: p.get(SHORT.filingStatus) === 'm' ? 'Married Filing Jointly' : 'Single',
    contrib401k: num('contrib401k', DEFAULT_INPUTS.contrib401k),
    hsa: num('hsa', DEFAULT_INPUTS.hsa),
    healthFsa: num('healthFsa', DEFAULT_INPUTS.healthFsa),
    dependentCareFsa: num('dependentCareFsa', DEFAULT_INPUTS.dependentCareFsa),
    traditionalIra: num('traditionalIra', DEFAULT_INPUTS.traditionalIra),
    otherPreTax: num('otherPreTax', DEFAULT_INPUTS.otherPreTax),
  }
}

/** Build an absolute shareable URL for the given inputs, based on the current page. */
export function buildShareUrl(inputs: Inputs): string {
  const { origin, pathname } = window.location
  return `${origin}${pathname}?${encodeInputs(inputs)}`
}
