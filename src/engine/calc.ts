import type {
  Bracket,
  CalcResults,
  Contributions,
  FilingPair,
  FilingStatus,
  Inputs,
  LocationKey,
  LocationResult,
  RateParams,
  RateTables,
} from './types'

// ---------------------------------------------------------------------------
// Pure calculation engine — a faithful port of the "Calculator" sheet logic.
// Validated to the cent against the source workbook (see calc.test.ts).
//
// Three subtle rules carried over from the spreadsheet:
//   1. Income-tax base (federal & NY) is reduced by ALL pre-tax contributions.
//   2. CA income-tax base is reduced by all contributions EXCEPT the HSA
//      (California does not recognize the HSA deduction).
//   3. The FICA base is reduced ONLY by HSA / FSA / Dependent-Care FSA / Other —
//      NOT by 401(k) or Traditional IRA (those lower income tax but not FICA).
// ---------------------------------------------------------------------------

const isMfj = (fs: FilingStatus): boolean => fs === 'Married Filing Jointly'

/** Pick the value for the active filing status. */
function pick(pair: FilingPair, fs: FilingStatus): number {
  return isMfj(fs) ? pair.married : pair.single
}

/**
 * Progressive tax via the marginal incremental-rate method — equivalent to the
 * Excel `SUMPRODUCT((income>threshold)*(income-threshold)*incrementalRate)`.
 * Brackets must be ordered by ascending threshold with non-decreasing rates.
 */
export function bracketTax(taxable: number, brackets: Bracket[], fs: FilingStatus): number {
  let tax = 0
  let prevRate = 0
  for (const b of brackets) {
    const threshold = isMfj(fs) ? b.marriedThreshold : b.singleThreshold
    const incrementalRate = b.rate - prevRate
    if (taxable > threshold) {
      tax += (taxable - threshold) * incrementalRate
    }
    prevRate = b.rate
  }
  return tax
}

/**
 * FICA = Social Security (capped at the wage base) + Medicare (uncapped)
 * + Additional Medicare above the filing-status threshold. `wage` is the
 * FICA-taxable wage (gross minus the FICA-reducing contributions).
 */
export function ficaTax(wage: number, p: RateParams, fs: FilingStatus): number {
  const socialSecurity = p.ssRate * Math.min(wage, p.ssWageBase)
  const medicare = p.medicareRate * wage
  const additionalMedicare = p.addlMedicareRate * Math.max(0, wage - pick(p.addlMedicareThreshold, fs))
  return socialSecurity + medicare + additionalMedicare
}

/** Safe division that returns 0 instead of NaN/Infinity (mirrors IFERROR). */
function ratio(numerator: number, denominator: number): number {
  return denominator === 0 ? 0 : numerator / denominator
}

const LOCATION_LABELS: Record<LocationKey, string> = {
  nyc: 'New York City',
  seattle: 'Seattle (WA)',
  sfBay: 'SF Bay Area (CA)',
}

/** Internal: assemble one location's full result from its tax components. */
interface LocationTaxes {
  federalIncome: number
  fica: number
  stateIncome: number
  cityLocal: number
  caSdi: number
  waCares: number
  waPfml: number
  nyPfl: number
}

function buildLocation(
  key: LocationKey,
  gross: number,
  contributions: Contributions,
  taxes: LocationTaxes,
  taxesIfZeroContrib: number,
): LocationResult {
  const subtotal =
    taxes.federalIncome +
    taxes.fica +
    taxes.stateIncome +
    taxes.cityLocal +
    taxes.caSdi +
    taxes.waCares +
    taxes.waPfml +
    taxes.nyPfl
  const cashTakeHome = gross - subtotal - contributions.subtotal
  return {
    key,
    label: LOCATION_LABELS[key],
    gross,
    contributions,
    taxes: { ...taxes, subtotal },
    cashTakeHome,
    totalValueRetained: cashTakeHome + contributions.subtotal,
    effectiveTaxRate: ratio(subtotal, gross),
    takeHomeRate: ratio(cashTakeHome, gross),
    taxesIfZeroContrib,
    taxSavedByContrib: taxesIfZeroContrib - subtotal,
  }
}

/** Run the full model. Pure: no side effects, no I/O. */
export function calculate(inputs: Inputs, rates: RateTables): CalcResults {
  const gross = inputs.grossSalary
  const fs = inputs.filingStatus
  const p = rates.params

  const { contrib401k, hsa, healthFsa, dependentCareFsa, traditionalIra, otherPreTax } = inputs

  // --- Three distinct pre-tax bases (see header comment) ---
  const incomeBaseReduction =
    contrib401k + hsa + healthFsa + dependentCareFsa + traditionalIra + otherPreTax
  const caBaseReduction =
    contrib401k + healthFsa + dependentCareFsa + traditionalIra + otherPreTax // excl HSA
  const ficaBaseReduction = hsa + healthFsa + dependentCareFsa + otherPreTax // excl 401k & IRA

  const contributions: Contributions = {
    contrib401k,
    hsa,
    healthFsa,
    dependentCareFsa,
    traditionalIra,
    otherPreTax,
    subtotal: incomeBaseReduction,
  }

  // --- Taxable bases ---
  const fedTaxable = Math.max(0, gross - incomeBaseReduction - pick(p.fedStdDeduction, fs))
  const nyTaxable = Math.max(0, gross - incomeBaseReduction - pick(p.nyStdDeduction, fs))
  const caTaxable = Math.max(0, gross - caBaseReduction - pick(p.caStdDeduction, fs))
  const ficaWage = Math.max(0, gross - ficaBaseReduction)

  // --- Actual taxes ---
  const fedTax = bracketTax(fedTaxable, rates.federal, fs)
  const fica = ficaTax(ficaWage, p, fs)
  const nyTax = bracketTax(nyTaxable, rates.nyState, fs)
  const nycTax = bracketTax(nyTaxable, rates.nycResident, fs)
  const caTax = Math.max(0, bracketTax(caTaxable, rates.caState, fs) - pick(p.caExemptionCredit, fs))

  // Location surcharges — charged on GROSS, unaffected by contributions.
  const caSdi = p.caSdiRate * gross
  const waCares = p.waCaresRate * gross
  const waPfml = p.waPfmlRate * Math.min(gross, p.waPfmlWageCap)
  const nyPfl = Math.min(p.nyPflRate * gross, p.nyPflAnnualCap)

  // --- Baseline ($0 contributions) — powers the "tax saved" memo ---
  const fedTaxZero = bracketTax(Math.max(0, gross - pick(p.fedStdDeduction, fs)), rates.federal, fs)
  const ficaZero = ficaTax(gross, p, fs)
  const nyTaxZero = bracketTax(Math.max(0, gross - pick(p.nyStdDeduction, fs)), rates.nyState, fs)
  const nycTaxZero = bracketTax(Math.max(0, gross - pick(p.nyStdDeduction, fs)), rates.nycResident, fs)
  const caTaxZero = Math.max(
    0,
    bracketTax(Math.max(0, gross - pick(p.caStdDeduction, fs)), rates.caState, fs) -
      pick(p.caExemptionCredit, fs),
  )

  const nyc = buildLocation(
    'nyc',
    gross,
    contributions,
    {
      federalIncome: fedTax,
      fica,
      stateIncome: nyTax,
      cityLocal: nycTax,
      caSdi: 0,
      waCares: 0,
      waPfml: 0,
      nyPfl,
    },
    fedTaxZero + ficaZero + nyTaxZero + nycTaxZero + nyPfl,
  )

  const seattle = buildLocation(
    'seattle',
    gross,
    contributions,
    {
      federalIncome: fedTax,
      fica,
      stateIncome: 0,
      cityLocal: 0,
      caSdi: 0,
      waCares,
      waPfml,
      nyPfl: 0,
    },
    fedTaxZero + ficaZero + waCares + waPfml,
  )

  const sfBay = buildLocation(
    'sfBay',
    gross,
    contributions,
    {
      federalIncome: fedTax,
      fica,
      stateIncome: caTax,
      cityLocal: 0,
      caSdi,
      waCares: 0,
      waPfml: 0,
      nyPfl: 0,
    },
    fedTaxZero + ficaZero + caTaxZero + caSdi,
  )

  return { nyc, seattle, sfBay }
}
