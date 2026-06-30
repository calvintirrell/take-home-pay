export default function App() {
  return (
    <div className="min-h-full bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-5xl px-6 py-16">
        <p className="text-xs font-semibold uppercase tracking-widest text-sky-600">
          2026 Tax Model
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
          Take-Home Pay Calculator
        </h1>
        <p className="mt-3 max-w-2xl text-slate-600">
          Compare federal, state, local, and payroll deductions across{' '}
          <span className="font-medium text-slate-900">New York City</span>,{' '}
          <span className="font-medium text-slate-900">Seattle</span>, and the{' '}
          <span className="font-medium text-slate-900">SF Bay Area</span>.
        </p>

        <div className="mt-10 rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center">
          <p className="text-sm font-medium text-slate-500">
            Phase 0 complete — scaffolding is live. The calculator engine and UI land in the
            next phases.
          </p>
        </div>
      </div>
    </div>
  )
}
