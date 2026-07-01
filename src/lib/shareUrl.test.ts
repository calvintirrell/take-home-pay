import { describe, it, expect } from 'vitest'
import { encodeInputs, decodeInputs } from './shareUrl'
import { DEFAULT_INPUTS } from '../engine/defaultRates'
import type { Inputs } from '../engine/types'

describe('shareUrl encode/decode', () => {
  it('round-trips the default inputs', () => {
    const decoded = decodeInputs('?' + encodeInputs(DEFAULT_INPUTS))
    expect(decoded).toEqual(DEFAULT_INPUTS)
  })

  it('round-trips a custom MFJ scenario', () => {
    const inputs: Inputs = {
      grossSalary: 260000,
      filingStatus: 'Married Filing Jointly',
      contrib401k: 24500,
      hsa: 8750,
      healthFsa: 1000,
      dependentCareFsa: 5000,
      traditionalIra: 0,
      otherPreTax: 340,
    }
    expect(decodeInputs('?' + encodeInputs(inputs))).toEqual(inputs)
  })

  it('returns null when no relevant params are present', () => {
    expect(decodeInputs('')).toBeNull()
    expect(decodeInputs('?utm_source=foo')).toBeNull()
  })

  it('fills missing fields from defaults and ignores invalid numbers', () => {
    const decoded = decodeInputs('?g=200000&k=abc')
    expect(decoded).not.toBeNull()
    expect(decoded!.grossSalary).toBe(200000)
    expect(decoded!.contrib401k).toBe(DEFAULT_INPUTS.contrib401k) // "abc" ignored
    expect(decoded!.filingStatus).toBe('Single') // default when fs absent
  })

  it('encodes filing status compactly', () => {
    expect(encodeInputs({ ...DEFAULT_INPUTS, filingStatus: 'Single' })).toContain('fs=s')
    expect(
      encodeInputs({ ...DEFAULT_INPUTS, filingStatus: 'Married Filing Jointly' }),
    ).toContain('fs=m')
  })
})
