import { lazy, Suspense, useMemo, useState } from 'react'
import { calculate } from './engine/calc'
import { DEFAULT_INPUTS } from './engine/defaultRates'
import type { Inputs } from './engine/types'
import { InputsPanel } from './components/InputsPanel'
import { ResultsTable } from './components/ResultsTable'
import { RatesEditor } from './components/RatesEditor'
import { PaycheckCard } from './components/PaycheckCard'
import { ShareBar } from './components/ShareBar'
import { NotesPanel } from './components/NotesPanel'
import { useRates } from './state/useRates'
import { decodeInputs } from './lib/shareUrl'

// Recharts is heavy; load it on demand so the initial bundle stays small.
const BreakdownChart = lazy(() =>
  import('./components/BreakdownChart').then((m) => ({ default: m.BreakdownChart })),
)

function ChartFallback() {
  return (
    <div className="flex h-80 items-center justify-center rounded-xl border border-slate-200 bg-white text-sm text-slate-400 shadow-sm">
      Loading chart…
    </div>
  )
}

/** Seed inputs from the URL (shared link) when present, else the defaults. */
function initialInputs(): Inputs {
  const fromUrl = decodeInputs(window.location.search)
  return fromUrl ?? DEFAULT_INPUTS
}

export default function App() {
  const [inputs, setInputs] = useState<Inputs>(initialInputs)
  const { rates, setRates, reset, isModified } = useRates()

  const results = useMemo(() => calculate(inputs, rates), [inputs, rates])

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
          <div className="space-y-6">
            <InputsPanel inputs={inputs} onChange={setInputs} />
            <PaycheckCard results={results} />
          </div>
          <div className="space-y-6">
            <ResultsTable results={results} />
            <Suspense fallback={<ChartFallback />}>
              <BreakdownChart results={results} />
            </Suspense>
          </div>
        </main>

        <div className="mt-6 space-y-6">
          <ShareBar inputs={inputs} />
          <RatesEditor
            rates={rates}
            onChange={setRates}
            onReset={reset}
            isModified={isModified}
          />
          <NotesPanel />
        </div>

        <footer className="mt-10 border-t border-slate-200 pt-6 text-xs text-slate-500">
          <p>
            Estimates for planning only — <span className="font-medium">not tax advice</span>.
            Confirm with a CPA before relying on these figures.
          </p>
        </footer>
      </div>
    </div>
  )
}
