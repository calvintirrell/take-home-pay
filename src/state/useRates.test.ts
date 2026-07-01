import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useRates } from './useRates'
import { DEFAULT_RATES_2026 } from '../engine/defaultRates'

describe('useRates', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('starts from the 2026 defaults and reports not-modified', () => {
    const { result } = renderHook(() => useRates())
    expect(result.current.isModified).toBe(false)
    expect(result.current.rates.params.ssRate).toBe(DEFAULT_RATES_2026.params.ssRate)
  })

  it('does not hand out the shared defaults object (edits cannot mutate it)', () => {
    const { result } = renderHook(() => useRates())
    expect(result.current.rates).not.toBe(DEFAULT_RATES_2026)
    expect(result.current.rates.federal).not.toBe(DEFAULT_RATES_2026.federal)
  })

  it('marks modified after a change and persists to localStorage', () => {
    const { result } = renderHook(() => useRates())
    act(() => {
      result.current.setRates({
        ...result.current.rates,
        params: { ...result.current.rates.params, ssRate: 0.07 },
      })
    })
    expect(result.current.isModified).toBe(true)
    expect(localStorage.getItem('thp.rates.v1')).toContain('0.07')
  })

  it('reloads persisted edits on a fresh mount', () => {
    const first = renderHook(() => useRates())
    act(() => {
      first.result.current.setRates({
        ...first.result.current.rates,
        params: { ...first.result.current.rates.params, medicareRate: 0.02 },
      })
    })
    first.unmount()

    const second = renderHook(() => useRates())
    expect(second.result.current.rates.params.medicareRate).toBe(0.02)
    expect(second.result.current.isModified).toBe(true)
  })

  it('reset restores the defaults and clears the modified flag', () => {
    const { result } = renderHook(() => useRates())
    act(() => {
      result.current.setRates({
        ...result.current.rates,
        params: { ...result.current.rates.params, ssRate: 0.09 },
      })
    })
    expect(result.current.isModified).toBe(true)
    act(() => result.current.reset())
    expect(result.current.isModified).toBe(false)
    expect(result.current.rates.params.ssRate).toBe(DEFAULT_RATES_2026.params.ssRate)
  })

  it('falls back to defaults on corrupt storage', () => {
    localStorage.setItem('thp.rates.v1', '{ not valid json')
    const { result } = renderHook(() => useRates())
    expect(result.current.isModified).toBe(false)
    expect(result.current.rates.params.ssRate).toBe(DEFAULT_RATES_2026.params.ssRate)
  })
})
