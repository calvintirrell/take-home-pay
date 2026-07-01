import type { Bracket, FilingPair, RateTables } from '../engine/types'
import { sanitizeAmount } from '../lib/format'

interface Props {
  rates: RateTables
  onChange: (next: RateTables) => void
  onReset: () => void
  isModified: boolean
}

type BracketTableKey = 'federal' | 'nyState' | 'nycResident' | 'caState'

const BRACKET_TABLES: { key: BracketTableKey; title: string }[] = [
  { key: 'federal', title: 'Federal income tax' },
  { key: 'nyState', title: 'New York State' },
  { key: 'nycResident', title: 'New York City (resident)' },
  { key: 'caState', title: 'California' },
]

// Parameter fields, grouped. `pair` fields differ by filing status; `kind`
// controls whether the value is edited as dollars or a percentage.
type ParamKind = 'money' | 'percent'
type ScalarParamKey =
  | 'ssWageBase'
  | 'ssRate'
  | 'medicareRate'
  | 'addlMedicareRate'
  | 'caSdiRate'
  | 'waCaresRate'
  | 'waPfmlRate'
  | 'waPfmlWageCap'
  | 'nyPflRate'
  | 'nyPflAnnualCap'
type PairParamKey =
  | 'fedStdDeduction'
  | 'nyStdDeduction'
  | 'caStdDeduction'
  | 'caExemptionCredit'
  | 'addlMedicareThreshold'

const PAIR_PARAMS: { key: PairParamKey; label: string; kind: ParamKind }[] = [
  { key: 'fedStdDeduction', label: 'Federal standard deduction', kind: 'money' },
  { key: 'nyStdDeduction', label: 'New York standard deduction', kind: 'money' },
  { key: 'caStdDeduction', label: 'California standard deduction', kind: 'money' },
  { key: 'caExemptionCredit', label: 'California exemption credit', kind: 'money' },
  { key: 'addlMedicareThreshold', label: 'Additional Medicare threshold', kind: 'money' },
]

const SCALAR_PARAMS: { key: ScalarParamKey; label: string; kind: ParamKind }[] = [
  { key: 'ssWageBase', label: 'Social Security wage base', kind: 'money' },
  { key: 'ssRate', label: 'Social Security rate', kind: 'percent' },
  { key: 'medicareRate', label: 'Medicare rate', kind: 'percent' },
  { key: 'addlMedicareRate', label: 'Additional Medicare rate', kind: 'percent' },
  { key: 'caSdiRate', label: 'CA SDI rate (uncapped)', kind: 'percent' },
  { key: 'waCaresRate', label: 'WA Cares rate (uncapped)', kind: 'percent' },
  { key: 'waPfmlRate', label: 'WA PFML employee rate', kind: 'percent' },
  { key: 'waPfmlWageCap', label: 'WA PFML wage cap', kind: 'money' },
  { key: 'nyPflRate', label: 'NY Paid Family Leave rate', kind: 'percent' },
  { key: 'nyPflAnnualCap', label: 'NY Paid Family Leave annual cap', kind: 'money' },
]

/** Parse a percentage typed as "6.2" into the stored fraction 0.062. */
function parsePercent(raw: string): number {
  return sanitizeAmount(raw) / 100
}

/** Show a stored fraction 0.062 as "6.2" without trailing float noise. */
function showPercent(fraction: number): string {
  // 4 decimal places on the percentage covers NYC's 3.078% etc.
  return String(Number((fraction * 100).toFixed(4)))
}

function CompactInput({
  ariaLabel,
  value,
  onCommit,
  prefix,
  suffix,
}: {
  ariaLabel: string
  value: string
  onCommit: (raw: string) => void
  prefix?: string
  suffix?: string
}) {
  return (
    <div className="relative">
      {prefix && (
        <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2 text-xs text-slate-400">
          {prefix}
        </span>
      )}
      <input
        type="text"
        inputMode="decimal"
        aria-label={ariaLabel}
        defaultValue={value}
        key={value}
        onBlur={(e) => onCommit(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') (e.target as HTMLInputElement).blur()
        }}
        className={[
          'w-full rounded border border-slate-300 bg-white py-1 text-right font-mono text-xs text-slate-900 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-200',
          prefix ? 'pl-5' : 'pl-2',
          suffix ? 'pr-5' : 'pr-2',
        ].join(' ')}
      />
      {suffix && (
        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2 text-xs text-slate-400">
          {suffix}
        </span>
      )}
    </div>
  )
}

export function RatesEditor({ rates, onChange, onReset, isModified }: Props) {
  const updateBracket = (
    table: BracketTableKey,
    index: number,
    field: keyof Bracket,
    value: number,
  ) => {
    onChange({
      ...rates,
      [table]: rates[table].map((b, i) => (i === index ? { ...b, [field]: value } : b)),
    })
  }

  const updateScalar = (key: ScalarParamKey, value: number) => {
    onChange({ ...rates, params: { ...rates.params, [key]: value } })
  }

  const updatePair = (key: PairParamKey, side: keyof FilingPair, value: number) => {
    onChange({
      ...rates,
      params: { ...rates.params, [key]: { ...rates.params[key], [side]: value } },
    })
  }

  return (
    <section
      aria-label="Rate tables"
      className="rounded-xl border border-slate-200 bg-white shadow-sm"
    >
      <details>
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4">
          <span>
            <span className="text-xs font-semibold uppercase tracking-widest text-sky-600">
              Rate tables · 2026
            </span>
            <span className="ml-2 text-xs text-slate-500">
              edit a value only if a law/rate changes — click to expand
            </span>
          </span>
          <span className="flex items-center gap-3">
            {isModified && (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                edited
              </span>
            )}
            <button
              type="button"
              disabled={!isModified}
              onClick={(e) => {
                e.preventDefault()
                onReset()
              }}
              className="rounded-md border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 enabled:hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Reset to 2026 defaults
            </button>
          </span>
        </summary>

        <div className="space-y-8 border-t border-slate-100 px-5 py-6">
          {/* Bracket tables */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {BRACKET_TABLES.map(({ key, title }) => (
              <div key={key}>
                <h4 className="mb-2 text-sm font-semibold text-slate-800">{title}</h4>
                <table className="w-full border-collapse text-xs">
                  <thead>
                    <tr className="text-slate-500">
                      <th className="pb-1 text-left font-medium">Single ≥</th>
                      <th className="pb-1 text-left font-medium">Married ≥</th>
                      <th className="pb-1 text-left font-medium">Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rates[key].map((b, i) => (
                      <tr key={i}>
                        <td className="py-0.5 pr-1">
                          <CompactInput
                            ariaLabel={`${title} bracket ${i + 1} single threshold`}
                            prefix="$"
                            value={String(b.singleThreshold)}
                            onCommit={(raw) =>
                              updateBracket(key, i, 'singleThreshold', sanitizeAmount(raw))
                            }
                          />
                        </td>
                        <td className="py-0.5 pr-1">
                          <CompactInput
                            ariaLabel={`${title} bracket ${i + 1} married threshold`}
                            prefix="$"
                            value={String(b.marriedThreshold)}
                            onCommit={(raw) =>
                              updateBracket(key, i, 'marriedThreshold', sanitizeAmount(raw))
                            }
                          />
                        </td>
                        <td className="py-0.5">
                          <CompactInput
                            ariaLabel={`${title} bracket ${i + 1} rate`}
                            suffix="%"
                            value={showPercent(b.rate)}
                            onCommit={(raw) => updateBracket(key, i, 'rate', parsePercent(raw))}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>

          {/* Parameters */}
          <div>
            <h4 className="mb-3 text-sm font-semibold text-slate-800">Parameters</h4>
            <div className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
              {PAIR_PARAMS.map(({ key, label, kind }) => (
                <div key={key} className="flex items-center justify-between gap-2">
                  <span className="text-xs text-slate-600">{label}</span>
                  <div className="flex w-44 gap-1">
                    <PairSide
                      label={`${label} (single)`}
                      kind={kind}
                      value={rates.params[key].single}
                      onCommit={(n) => updatePair(key, 'single', n)}
                    />
                    <PairSide
                      label={`${label} (married)`}
                      kind={kind}
                      value={rates.params[key].married}
                      onCommit={(n) => updatePair(key, 'married', n)}
                    />
                  </div>
                </div>
              ))}
              {SCALAR_PARAMS.map(({ key, label, kind }) => (
                <div key={key} className="flex items-center justify-between gap-2">
                  <span className="text-xs text-slate-600">{label}</span>
                  <div className="w-44">
                    <ParamField
                      label={label}
                      kind={kind}
                      value={rates.params[key] as number}
                      onCommit={(n) => updateScalar(key, n)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </details>
    </section>
  )
}

function fieldProps(kind: ParamKind, value: number) {
  return kind === 'percent'
    ? { suffix: '%', display: showPercent(value), parse: parsePercent }
    : { prefix: '$', display: String(value), parse: sanitizeAmount }
}

function ParamField({
  label,
  kind,
  value,
  onCommit,
}: {
  label: string
  kind: ParamKind
  value: number
  onCommit: (n: number) => void
}) {
  const p = fieldProps(kind, value)
  return (
    <CompactInput
      ariaLabel={label}
      prefix={p.prefix}
      suffix={p.suffix}
      value={p.display}
      onCommit={(raw) => onCommit(p.parse(raw))}
    />
  )
}

function PairSide({
  label,
  kind,
  value,
  onCommit,
}: {
  label: string
  kind: ParamKind
  value: number
  onCommit: (n: number) => void
}) {
  const p = fieldProps(kind, value)
  return (
    <CompactInput
      ariaLabel={label}
      prefix={p.prefix}
      suffix={p.suffix}
      value={p.display}
      onCommit={(raw) => onCommit(p.parse(raw))}
    />
  )
}
