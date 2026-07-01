import { describe, it, expect } from 'vitest'
import { calculate } from './calc'
import { DEFAULT_RATES_2026 } from './defaultRates'
import type { FilingStatus, Inputs } from './types'

// Cross-validation across a spread of scenarios. Expected values come from an
// independently-written Python oracle that reproduces the source workbook's
// authoritative outputs to the cent — so agreement here catches transcription
// or logic bugs in either implementation. Covers: income below the standard
// deduction, the Social Security cap, Additional Medicare, top brackets, family
// contributions, and MFJ.

interface Expected {
  taxes: number
  cash: number
  saved: number
}
interface Scenario {
  name: string
  input: Omit<Inputs, 'filingStatus'> & { mfj: boolean }
  nyc: Expected
  seattle: Expected
  sf: Expected
}

const mk = (
  gross: number,
  mfj: boolean,
  k: number,
  hsa: number,
  hfsa: number,
  dc: number,
  ira: number,
  other: number,
): Scenario['input'] => ({
  grossSalary: gross,
  mfj,
  contrib401k: k,
  hsa,
  healthFsa: hfsa,
  dependentCareFsa: dc,
  traditionalIra: ira,
  otherPreTax: other,
})

const SCENARIOS: Scenario[] = [
  {
    name: '$40k Single',
    input: mk(40000, false, 0, 0, 0, 0, 0, 0),
    nyc: { taxes: 8523.95, cash: 31476.05, saved: 0 },
    seattle: { taxes: 6234.8, cash: 33765.2, saved: 0 },
    sf: { taxes: 6796.22, cash: 33203.78, saved: 0 },
  },
  {
    name: '$10k Single (below standard deduction)',
    input: mk(10000, false, 0, 0, 0, 0, 0, 0),
    nyc: { taxes: 943.36, cash: 9056.64, saved: 0 },
    seattle: { taxes: 903.7, cash: 9096.3, saved: 0 },
    sf: { taxes: 895.0, cash: 9105.0, saved: 0 },
  },
  {
    name: '$80k Single, modest contributions',
    input: mk(80000, false, 8000, 2000, 1000, 0, 0, 1000),
    nyc: { taxes: 17530.17, cash: 50469.83, saved: 4059.12 },
    seattle: { taxes: 13053.6, cash: 54946.4, saved: 2946.0 },
    sf: { taxes: 15429.76, cash: 52570.24, saved: 3793.94 },
  },
  {
    name: '$180k Single (default)',
    input: mk(180000, false, 24500, 4400, 0, 0, 0, 0),
    nyc: { taxes: 52127.78, cash: 98972.22, saved: 10097.86 },
    seattle: { taxes: 40928.0, cash: 110172.0, saved: 7272.6 },
    sf: { taxes: 51086.6, cash: 100013.4, saved: 9551.1 },
  },
  {
    name: '$500k Single (SS cap, Additional Medicare)',
    input: mk(500000, false, 23500, 4400, 0, 0, 0, 3000),
    nyc: { taxes: 195652.56, cash: 273447.44, saved: 14303.23 },
    seattle: { taxes: 152923.27, cash: 316176.73, saved: 10988.9 },
    sf: { taxes: 196344.97, cash: 272755.03, saved: 13983.4 },
  },
  {
    name: '$1M Single (top brackets)',
    input: mk(1000000, false, 23500, 4400, 0, 0, 0, 0),
    nyc: { taxes: 443782.84, cash: 528317.16, saved: 13418.95 },
    seattle: { taxes: 350001.76, cash: 622098.24, saved: 10426.4 },
    sf: { taxes: 456357.27, cash: 515742.73, saved: 13316.9 },
  },
  {
    name: '$150k MFJ, family contributions',
    input: mk(150000, true, 15000, 8750, 0, 5000, 0, 3000),
    nyc: { taxes: 29346.5, cash: 88903.5, saved: 9736.51 },
    seattle: { taxes: 22104.12, cash: 96145.88, saved: 6791.38 },
    sf: { taxes: 25825.15, cash: 92424.85, saved: 8631.38 },
  },
  {
    name: '$260k MFJ',
    input: mk(260000, true, 24500, 8750, 0, 5000, 0, 0),
    nyc: { taxes: 65278.91, cash: 156471.09, saved: 12771.7 },
    seattle: { taxes: 49131.54, cash: 172618.46, saved: 9032.38 },
    sf: { taxes: 62658.53, cash: 159091.47, saved: 11775.88 },
  },
  {
    name: '$600k MFJ (SS cap + Additional Medicare)',
    input: mk(600000, true, 23500, 8750, 3400, 0, 0, 0),
    nyc: { taxes: 201569.79, cash: 362780.21, saved: 16586.84 },
    seattle: { taxes: 151763.39, cash: 412586.61, saved: 12763.02 },
    sf: { taxes: 199600.18, cash: 364749.82, saved: 15264.72 },
  },
]

// Oracle values are rounded to the cent; assert within a penny.
const near = (got: number, expected: number) => expect(Math.abs(got - expected)).toBeLessThanOrEqual(0.01)

describe('engine cross-validation vs oracle (Excel-faithful) — 9 scenarios', () => {
  for (const s of SCENARIOS) {
    it(s.name, () => {
      const inputs: Inputs = {
        ...s.input,
        filingStatus: (s.input.mfj ? 'Married Filing Jointly' : 'Single') as FilingStatus,
      }
      const r = calculate(inputs, DEFAULT_RATES_2026)
      for (const [key, exp] of [
        ['nyc', s.nyc],
        ['seattle', s.seattle],
        ['sf', s.sf],
      ] as const) {
        const loc = key === 'sf' ? r.sfBay : r[key]
        near(loc.taxes.subtotal, exp.taxes)
        near(loc.cashTakeHome, exp.cash)
        near(loc.taxSavedByContrib, exp.saved)
      }
    })
  }

  it('Seattle yields the most cash at $40k+ (no state/local income tax)', () => {
    // At very low incomes WA’s uncapped Cares + PFML can exceed CA’s SDI while
    // CA income tax is ~$0, so SF can edge out Seattle — verified in the $10k
    // scenario above. From $40k up, Washington’s no-income-tax advantage wins.
    for (const s of SCENARIOS.filter((s) => s.input.grossSalary >= 40000)) {
      const inputs: Inputs = {
        ...s.input,
        filingStatus: s.input.mfj ? 'Married Filing Jointly' : 'Single',
      }
      const r = calculate(inputs, DEFAULT_RATES_2026)
      expect(r.seattle.cashTakeHome).toBeGreaterThanOrEqual(r.nyc.cashTakeHome)
      expect(r.seattle.cashTakeHome).toBeGreaterThanOrEqual(r.sfBay.cashTakeHome)
    }
  })

  it('at $10k, SF edges out Seattle (WA’s uncapped payroll > CA SDI when CA tax ≈ 0)', () => {
    const r = calculate(
      { ...mk(10000, false, 0, 0, 0, 0, 0, 0), filingStatus: 'Single' },
      DEFAULT_RATES_2026,
    )
    expect(r.sfBay.cashTakeHome).toBeGreaterThan(r.seattle.cashTakeHome)
  })
})
