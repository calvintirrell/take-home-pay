// Core domain types for the take-home pay calculation engine.
// The engine is a pure function: (Inputs, RateTables) -> CalcResults.

export type FilingStatus = 'Single' | 'Married Filing Jointly'

/** One progressive tax bracket. `rate` is the marginal rate at/above the threshold. */
export interface Bracket {
  /** Lower bound of this bracket for a Single filer. */
  singleThreshold: number
  /** Lower bound of this bracket for Married Filing Jointly. */
  marriedThreshold: number
  /** Marginal tax rate applied within this bracket (e.g. 0.22 for 22%). */
  rate: number
}

/** A value that differs by filing status. */
export interface FilingPair {
  single: number
  married: number
}

/** Scalar parameters and rates feeding the engine (the "Rates 2026 · Parameters" block). */
export interface RateParams {
  fedStdDeduction: FilingPair
  nyStdDeduction: FilingPair
  caStdDeduction: FilingPair
  caExemptionCredit: FilingPair
  /** Income above which the Additional Medicare rate applies. */
  addlMedicareThreshold: FilingPair
  /** Social Security wage base (cap on SS-taxable wages). */
  ssWageBase: number
  ssRate: number
  medicareRate: number
  addlMedicareRate: number
  /** CA State Disability Insurance rate (uncapped, on gross). */
  caSdiRate: number
  /** WA Cares long-term-care rate (uncapped, on gross). */
  waCaresRate: number
  /** WA Paid Family & Medical Leave employee rate. */
  waPfmlRate: number
  /** Wage cap for WA PFML. */
  waPfmlWageCap: number
  /** NY Paid Family Leave rate (on gross). */
  nyPflRate: number
  /** Annual dollar cap for NY PFL. */
  nyPflAnnualCap: number
}

/** The full editable rate-table set. */
export interface RateTables {
  federal: Bracket[]
  nyState: Bracket[]
  nycResident: Bracket[]
  caState: Bracket[]
  params: RateParams
}

/** User-editable inputs (the Excel's yellow cells). */
export interface Inputs {
  grossSalary: number
  filingStatus: FilingStatus
  contrib401k: number
  hsa: number
  healthFsa: number
  dependentCareFsa: number
  traditionalIra: number
  otherPreTax: number
}

/** Itemized pre-tax contributions plus their subtotal. */
export interface Contributions {
  contrib401k: number
  hsa: number
  healthFsa: number
  dependentCareFsa: number
  traditionalIra: number
  otherPreTax: number
  subtotal: number
}

/** Itemized taxes for one location plus their subtotal. */
export interface TaxBreakdown {
  federalIncome: number
  fica: number
  stateIncome: number
  cityLocal: number
  caSdi: number
  waCares: number
  waPfml: number
  nyPfl: number
  subtotal: number
}

/** Full result set for a single location column. */
export interface LocationResult {
  /** Stable key: 'nyc' | 'seattle' | 'sfBay'. */
  key: LocationKey
  /** Human-readable label, e.g. "New York City". */
  label: string
  gross: number
  contributions: Contributions
  taxes: TaxBreakdown
  /** Gross minus taxes minus contributions — what hits your bank. */
  cashTakeHome: number
  /** Cash take-home plus contributions (money still yours, in accounts). */
  totalValueRetained: number
  /** Taxes / gross. */
  effectiveTaxRate: number
  /** Cash take-home / gross. */
  takeHomeRate: number
  /** Total taxes if contributions had been $0 (baseline). */
  taxesIfZeroContrib: number
  /** Tax saved by the contributions (baseline minus actual). */
  taxSavedByContrib: number
}

export type LocationKey = 'nyc' | 'seattle' | 'sfBay'

/** Engine output: one result per location. */
export interface CalcResults {
  nyc: LocationResult
  seattle: LocationResult
  sfBay: LocationResult
}
