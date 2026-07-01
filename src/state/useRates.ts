import { useCallback, useEffect, useMemo, useState } from 'react'
import type { RateTables } from '../engine/types'
import { DEFAULT_RATES_2026 } from '../engine/defaultRates'

// Persists user-edited rate tables to localStorage so edits survive a refresh.
// Bump the version suffix if the RateTables shape ever changes incompatibly.
const STORAGE_KEY = 'thp.rates.v1'

/** A structural clone of the 2026 defaults — never hands out the shared module object. */
function freshDefaults(): RateTables {
  return structuredClone(DEFAULT_RATES_2026)
}

/** Minimal shape check so a corrupt/old payload falls back to defaults instead of crashing. */
function isRateTablesish(value: unknown): value is RateTables {
  if (typeof value !== 'object' || value === null) return false
  const v = value as Record<string, unknown>
  return (
    Array.isArray(v.federal) &&
    Array.isArray(v.nyState) &&
    Array.isArray(v.nycResident) &&
    Array.isArray(v.caState) &&
    typeof v.params === 'object' &&
    v.params !== null
  )
}

function loadRates(): RateTables {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return freshDefaults()
    const parsed = JSON.parse(raw)
    if (isRateTablesish(parsed)) return parsed
  } catch {
    // ignore malformed storage / unavailable localStorage
  }
  return freshDefaults()
}

export interface UseRates {
  rates: RateTables
  setRates: (next: RateTables) => void
  reset: () => void
  /** True when the current rates differ from the 2026 defaults. */
  isModified: boolean
}

export function useRates(): UseRates {
  const [rates, setRates] = useState<RateTables>(loadRates)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(rates))
    } catch {
      // ignore quota / unavailable localStorage
    }
  }, [rates])

  const reset = useCallback(() => setRates(freshDefaults()), [])

  const isModified = useMemo(
    () => JSON.stringify(rates) !== JSON.stringify(DEFAULT_RATES_2026),
    [rates],
  )

  return { rates, setRates, reset, isModified }
}
