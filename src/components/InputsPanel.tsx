import type { Inputs, FilingStatus } from '../engine/types'
import { sanitizeAmount } from '../lib/format'

interface Props {
  inputs: Inputs
  onChange: (next: Inputs) => void
}

const CONTRIB_FIELDS: {
  key: keyof Inputs
  label: string
  hint: string
}[] = [
  { key: 'contrib401k', label: '401(k) / 403(b)', hint: '2026 max $24,500 (+$8,000 if 50+)' },
  { key: 'hsa', label: 'HSA contribution', hint: '2026 max $4,400 self / $8,750 family' },
  { key: 'healthFsa', label: 'Health FSA', hint: '2026 max $3,400' },
  { key: 'dependentCareFsa', label: 'Dependent Care FSA', hint: '2026 max $5,000 ($2,500 if MFS)' },
  { key: 'traditionalIra', label: 'Traditional IRA (deductible)', hint: 'Max $7,500 — only if eligible*' },
  { key: 'otherPreTax', label: 'Other pre-tax (commuter, premiums)', hint: 'e.g. transit up to $340/mo' },
]

/** A labeled currency input with a $ adornment and helper hint. */
function CurrencyField({
  id,
  label,
  hint,
  value,
  onChange,
}: {
  id: string
  label: string
  hint: string
  value: number
  onChange: (n: number) => void
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-slate-700">
        {label}
      </label>
      <div className="relative mt-1">
        <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
          $
        </span>
        <input
          id={id}
          type="text"
          inputMode="numeric"
          value={value === 0 ? '' : value.toLocaleString('en-US')}
          placeholder="0"
          onChange={(e) => onChange(sanitizeAmount(e.target.value))}
          className="w-full rounded-md border border-slate-300 bg-white py-2 pl-7 pr-3 text-right font-mono text-slate-900 shadow-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
        />
      </div>
      <p className="mt-1 text-xs text-slate-500">{hint}</p>
    </div>
  )
}

export function InputsPanel({ inputs, onChange }: Props) {
  const set = <K extends keyof Inputs>(key: K, value: Inputs[K]) =>
    onChange({ ...inputs, [key]: value })

  return (
    <section
      aria-label="Inputs"
      className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
    >
      <h2 className="text-xs font-semibold uppercase tracking-widest text-sky-600">Inputs</h2>
      <p className="mt-1 text-xs text-slate-500">
        Edit any field — every number recalculates instantly.
      </p>

      <div className="mt-5 space-y-5">
        <CurrencyField
          id="grossSalary"
          label="Annual gross salary"
          hint="Your total W-2 wages"
          value={inputs.grossSalary}
          onChange={(n) => set('grossSalary', n)}
        />

        <div>
          <label htmlFor="filingStatus" className="block text-sm font-medium text-slate-700">
            Filing status
          </label>
          <select
            id="filingStatus"
            value={inputs.filingStatus}
            onChange={(e) => set('filingStatus', e.target.value as FilingStatus)}
            className="mt-1 w-full rounded-md border border-slate-300 bg-white py-2 px-3 text-slate-900 shadow-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
          >
            <option value="Single">Single</option>
            <option value="Married Filing Jointly">Married Filing Jointly</option>
          </select>
          <p className="mt-1 text-xs text-slate-500">Single or Married Filing Jointly</p>
        </div>

        <div className="border-t border-slate-100 pt-4">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Pre-tax contributions
          </h3>
          <div className="mt-4 space-y-5">
            {CONTRIB_FIELDS.map((f) => (
              <CurrencyField
                key={f.key}
                id={f.key}
                label={f.label}
                hint={f.hint}
                value={inputs[f.key] as number}
                onChange={(n) => set(f.key, n as Inputs[typeof f.key])}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
