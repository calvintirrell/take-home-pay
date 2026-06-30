import type { RateTables } from './types'

// 2026 rate tables, ported verbatim from the "Rates 2026" sheet of the source
// workbook. Sources: IRS Rev. Proc. 2025-32 & IR-2025-111; NY Dept. of Taxation
// & Finance (2026 budget rate cuts); NYC Dept. of Finance; California FTB & EDD
// (2026 SDI 1.3%); WA ESD (2026 PFML 1.13% / WA Cares 0.58%). Compiled June 2026.
//
// These are the *defaults*. The UI lets the user override any value (persisted
// locally); see Phase 3. Treat this object as the single source of truth for the
// "factory reset" state.

export const DEFAULT_RATES_2026: RateTables = {
  // Federal income tax (2026, Rev. Proc. 2025-32)
  federal: [
    { singleThreshold: 0, marriedThreshold: 0, rate: 0.1 },
    { singleThreshold: 12400, marriedThreshold: 24800, rate: 0.12 },
    { singleThreshold: 50400, marriedThreshold: 100800, rate: 0.22 },
    { singleThreshold: 105700, marriedThreshold: 211400, rate: 0.24 },
    { singleThreshold: 201775, marriedThreshold: 403550, rate: 0.32 },
    { singleThreshold: 256225, marriedThreshold: 512450, rate: 0.35 },
    { singleThreshold: 640600, marriedThreshold: 768700, rate: 0.37 },
  ],

  // New York State income tax (2026)
  nyState: [
    { singleThreshold: 0, marriedThreshold: 0, rate: 0.039 },
    { singleThreshold: 8500, marriedThreshold: 17150, rate: 0.044 },
    { singleThreshold: 11700, marriedThreshold: 23600, rate: 0.0515 },
    { singleThreshold: 13900, marriedThreshold: 27900, rate: 0.054 },
    { singleThreshold: 80650, marriedThreshold: 161550, rate: 0.059 },
    { singleThreshold: 215400, marriedThreshold: 323200, rate: 0.0685 },
    { singleThreshold: 1077550, marriedThreshold: 2155350, rate: 0.0965 },
    { singleThreshold: 5000000, marriedThreshold: 5000000, rate: 0.103 },
    { singleThreshold: 25000000, marriedThreshold: 25000000, rate: 0.109 },
  ],

  // New York City resident income tax (2026)
  nycResident: [
    { singleThreshold: 0, marriedThreshold: 0, rate: 0.03078 },
    { singleThreshold: 12000, marriedThreshold: 21600, rate: 0.03762 },
    { singleThreshold: 25000, marriedThreshold: 45000, rate: 0.03819 },
    { singleThreshold: 50000, marriedThreshold: 90000, rate: 0.03876 },
  ],

  // California State income tax (2026)
  caState: [
    { singleThreshold: 0, marriedThreshold: 0, rate: 0.01 },
    { singleThreshold: 10756, marriedThreshold: 21512, rate: 0.02 },
    { singleThreshold: 25499, marriedThreshold: 50998, rate: 0.04 },
    { singleThreshold: 40245, marriedThreshold: 80490, rate: 0.06 },
    { singleThreshold: 55866, marriedThreshold: 111732, rate: 0.08 },
    { singleThreshold: 70606, marriedThreshold: 141212, rate: 0.093 },
    { singleThreshold: 360659, marriedThreshold: 721318, rate: 0.103 },
    { singleThreshold: 432787, marriedThreshold: 865574, rate: 0.113 },
    { singleThreshold: 721314, marriedThreshold: 1442628, rate: 0.123 },
  ],

  params: {
    fedStdDeduction: { single: 16100, married: 32200 },
    nyStdDeduction: { single: 8000, married: 16050 },
    caStdDeduction: { single: 5706, married: 11412 },
    caExemptionCredit: { single: 158, married: 316 },
    addlMedicareThreshold: { single: 200000, married: 250000 },
    ssWageBase: 184500,
    ssRate: 0.062,
    medicareRate: 0.0145,
    addlMedicareRate: 0.009,
    caSdiRate: 0.013,
    waCaresRate: 0.0058,
    waPfmlRate: 0.00807,
    waPfmlWageCap: 184500,
    nyPflRate: 0.00388,
    nyPflAnnualCap: 400,
  },
}

/** Default inputs mirroring the source workbook's sample (Single, $180k). */
export const DEFAULT_INPUTS = {
  grossSalary: 180000,
  filingStatus: 'Single' as const,
  contrib401k: 24500,
  hsa: 4400,
  healthFsa: 0,
  dependentCareFsa: 0,
  traditionalIra: 0,
  otherPreTax: 0,
}
