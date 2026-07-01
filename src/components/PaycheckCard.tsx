import { useState } from 'react'
import type { CalcResults, LocationResult } from '../engine/types'
import { usd } from '../lib/format'

interface Props {
  results: CalcResults
}

const FREQUENCIES: { label: string; periods: number }[] = [
  { label: 'Annual', periods: 1 },
  { label: 'Monthly', periods: 12 },
  { label: 'Semi-monthly (24/yr)', periods: 24 },
  { label: 'Bi-weekly (26/yr)', periods: 26 },
  { label: 'Weekly', periods: 52 },
]

export function PaycheckCard({ results }: Props) {
  const [periods, setPeriods] = useState(26) // bi-weekly is the common default
  const cols: LocationResult[] = [results.nyc, results.seattle, results.sfBay]

  return (
    <section
      aria-label="Take-home per paycheck"
      className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
    >
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-sky-600">
          Cash per paycheck
        </h2>
        <select
          aria-label="Pay frequency"
          value={periods}
          onChange={(e) => setPeriods(Number(e.target.value))}
          className="rounded-md border border-slate-300 bg-white py-1 px-2 text-xs text-slate-900 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
        >
          {FREQUENCIES.map((f) => (
            <option key={f.periods} value={f.periods}>
              {f.label}
            </option>
          ))}
        </select>
      </div>

      <dl className="mt-4 space-y-2">
        {cols.map((c) => (
          <div key={c.key} className="flex items-baseline justify-between">
            <dt className="text-sm text-slate-600">{c.label}</dt>
            <dd className="font-mono text-sm font-semibold tabular-nums text-slate-900">
              {usd(c.cashTakeHome / periods)}
            </dd>
          </div>
        ))}
      </dl>
      <p className="mt-3 text-xs text-slate-400">
        Cash take-home ÷ pay periods. A rough per-check estimate — real checks vary with
        withholding elections.
      </p>
    </section>
  )
}
