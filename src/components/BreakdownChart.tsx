import { useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { CalcResults, LocationResult } from '../engine/types'
import { usd } from '../lib/format'

interface Props {
  results: CalcResults
}

type Mode = 'split' | 'tax'

// Series definitions per mode: label + color + how to pull the value.
const SPLIT_SERIES: { key: string; color: string; get: (r: LocationResult) => number }[] = [
  { key: 'Cash take-home', color: '#0284c7', get: (r) => r.cashTakeHome },
  { key: 'Into accounts', color: '#22c55e', get: (r) => r.contributions.subtotal },
  { key: 'Taxes', color: '#f97316', get: (r) => r.taxes.subtotal },
]

const TAX_SERIES: { key: string; color: string; get: (r: LocationResult) => number }[] = [
  { key: 'Federal', color: '#f97316', get: (r) => r.taxes.federalIncome },
  { key: 'FICA', color: '#fb923c', get: (r) => r.taxes.fica },
  { key: 'State', color: '#a855f7', get: (r) => r.taxes.stateIncome },
  { key: 'City / local', color: '#c084fc', get: (r) => r.taxes.cityLocal },
  {
    key: 'Other payroll',
    color: '#64748b',
    get: (r) => r.taxes.caSdi + r.taxes.waCares + r.taxes.waPfml + r.taxes.nyPfl,
  },
]

function buildData(
  cols: LocationResult[],
  series: { key: string; get: (r: LocationResult) => number }[],
) {
  return cols.map((c) => {
    const row: Record<string, string | number> = { name: c.label }
    for (const s of series) row[s.key] = Math.round(s.get(c))
    return row
  })
}

export function BreakdownChart({ results }: Props) {
  const [mode, setMode] = useState<Mode>('split')
  const cols: LocationResult[] = [results.nyc, results.seattle, results.sfBay]
  const series = mode === 'split' ? SPLIT_SERIES : TAX_SERIES
  const data = buildData(cols, series)

  return (
    <section
      aria-label="Breakdown chart"
      className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-sky-600">
          {mode === 'split' ? 'Where your money goes' : 'Tax breakdown'}
        </h2>
        <div className="inline-flex rounded-md border border-slate-300 p-0.5 text-xs">
          <button
            type="button"
            onClick={() => setMode('split')}
            aria-pressed={mode === 'split'}
            className={`rounded px-3 py-1 font-medium ${
              mode === 'split' ? 'bg-sky-600 text-white' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            Money split
          </button>
          <button
            type="button"
            onClick={() => setMode('tax')}
            aria-pressed={mode === 'tax'}
            className={`rounded px-3 py-1 font-medium ${
              mode === 'tax' ? 'bg-sky-600 text-white' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            Tax detail
          </button>
        </div>
      </div>

      <div className="mt-4 h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#475569' }} />
            <YAxis
              tickFormatter={(v: number) => `$${Math.round(v / 1000)}k`}
              tick={{ fontSize: 12, fill: '#475569' }}
              width={48}
            />
            <Tooltip
              formatter={(value) => usd(Number(value ?? 0))}
              labelStyle={{ fontWeight: 600 }}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            {series.map((s) => (
              <Bar key={s.key} dataKey={s.key} stackId="a" fill={s.color} maxBarSize={90} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}
