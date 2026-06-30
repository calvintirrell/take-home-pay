import { useMemo, useState } from 'react'
import { calculate } from './engine/calc'
import { DEFAULT_INPUTS, DEFAULT_RATES_2026 } from './engine/defaultRates'
import type { Inputs } from './engine/types'
import { InputsPanel } from './components/InputsPanel'
import { ResultsTable } from './components/ResultsTable'

export default function App() {
  const [inputs, setInputs] = useState<Inputs>(DEFAULT_INPUTS)

  // Rate tables are fixed to the 2026 defaults for now; Phase 3 makes them editable.
  const results = useMemo(() => calculate(inputs, DEFAULT_RATES_2026), [inputs])

  return (
    <div className="min-h-full bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:py-14">
        <header>
          <p className="text-xs font-semibold uppercase tracking-widest text-sky-600">
            2026 Tax Model
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Take-Home Pay Calculator
          </h1>
          <p className="mt-3 max-w-2xl text-slate-600">
            Compare 2026 federal, state, local, and payroll deductions across{' '}
            <span className="font-medium text-slate-900">New York City</span>,{' '}
            <span className="font-medium text-slate-900">Seattle</span>, and the{' '}
            <span className="font-medium text-slate-900">SF Bay Area</span>. Pre-tax
            contributions aren&rsquo;t lost — they move into your own accounts and lower your
            taxable income.
          </p>
        </header>

        <main className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[360px_1fr]">
          <div className="lg:sticky lg:top-6 lg:self-start">
            <InputsPanel inputs={inputs} onChange={setInputs} />
          </div>
          <ResultsTable results={results} />
        </main>

        <footer className="mt-10 border-t border-slate-200 pt-6 text-xs text-slate-500">
          <p>
            Estimates for planning only — <span className="font-medium">not tax advice</span>.
            Confirm with a CPA before relying on these figures. Full assumptions &amp; sources
            arrive with the Notes panel in a later phase.
          </p>
        </footer>
      </div>
    </div>
  )
}
