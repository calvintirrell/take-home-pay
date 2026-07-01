import type { CalcResults, LocationResult } from '../engine/types'
import { usd, usdOrDash, pct } from '../lib/format'

interface Props {
  results: CalcResults
}

type Accessor = (r: LocationResult) => number
type Variant = 'money' | 'moneyDash' | 'pct'

interface RowSpec {
  label: string
  get: Accessor
  variant?: Variant
  indent?: boolean
  emphasis?: boolean
  muted?: boolean
}

interface SectionSpec {
  heading: string
  subhead?: string
  rows: RowSpec[]
}

const SECTIONS: SectionSpec[] = [
  {
    heading: 'Gross',
    rows: [{ label: 'Gross salary (pre-tax)', get: (r) => r.gross, emphasis: true }],
  },
  {
    heading: 'Pre-tax contributions',
    subhead: 'money you keep — moves into your own accounts',
    rows: [
      { label: '401(k) / 403(b)', get: (r) => r.contributions.contrib401k, variant: 'moneyDash', indent: true },
      { label: 'HSA', get: (r) => r.contributions.hsa, variant: 'moneyDash', indent: true },
      { label: 'Health FSA', get: (r) => r.contributions.healthFsa, variant: 'moneyDash', indent: true },
      { label: 'Dependent Care FSA', get: (r) => r.contributions.dependentCareFsa, variant: 'moneyDash', indent: true },
      { label: 'Traditional IRA', get: (r) => r.contributions.traditionalIra, variant: 'moneyDash', indent: true },
      { label: 'Other pre-tax', get: (r) => r.contributions.otherPreTax, variant: 'moneyDash', indent: true },
      { label: 'Subtotal → into your accounts', get: (r) => r.contributions.subtotal, emphasis: true },
    ],
  },
  {
    heading: 'Taxes',
    subhead: 'money gone',
    rows: [
      { label: 'Federal income tax', get: (r) => r.taxes.federalIncome, variant: 'moneyDash', indent: true },
      { label: 'FICA (Soc. Sec. + Medicare)', get: (r) => r.taxes.fica, variant: 'moneyDash', indent: true },
      { label: 'State income tax', get: (r) => r.taxes.stateIncome, variant: 'moneyDash', indent: true },
      { label: 'City / local income tax', get: (r) => r.taxes.cityLocal, variant: 'moneyDash', indent: true },
      { label: 'State disability (CA SDI)', get: (r) => r.taxes.caSdi, variant: 'moneyDash', indent: true },
      { label: 'WA Cares (long-term care)', get: (r) => r.taxes.waCares, variant: 'moneyDash', indent: true },
      { label: 'WA Paid Family & Medical Leave', get: (r) => r.taxes.waPfml, variant: 'moneyDash', indent: true },
      { label: 'NY Paid Family Leave', get: (r) => r.taxes.nyPfl, variant: 'moneyDash', indent: true },
      { label: 'Subtotal taxes', get: (r) => r.taxes.subtotal, emphasis: true },
    ],
  },
  {
    heading: 'Bottom line',
    rows: [
      { label: 'Cash take-home (spendable now)', get: (r) => r.cashTakeHome, emphasis: true },
      { label: 'Total value retained (cash + accounts)', get: (r) => r.totalValueRetained },
      { label: 'Effective tax rate (taxes ÷ gross)', get: (r) => r.effectiveTaxRate, variant: 'pct' },
      { label: 'Take-home rate (cash ÷ gross)', get: (r) => r.takeHomeRate, variant: 'pct' },
    ],
  },
  {
    heading: 'Memo',
    rows: [
      { label: 'Taxes if $0 contributions', get: (r) => r.taxesIfZeroContrib, variant: 'money', muted: true },
      { label: 'Tax saved by your contributions', get: (r) => r.taxSavedByContrib, variant: 'money', muted: true },
    ],
  },
]

function fmt(value: number, variant: Variant | undefined): string {
  switch (variant) {
    case 'pct':
      return pct(value)
    case 'moneyDash':
      return usdOrDash(value)
    default:
      return usd(value)
  }
}

export function ResultsTable({ results }: Props) {
  const cols: LocationResult[] = [results.nyc, results.seattle, results.sfBay]

  return (
    <section
      aria-label="Results by location"
      className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
    >
      {/* Desktop / tablet: comparison table */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full border-collapse text-sm">
          <caption className="sr-only">
            Take-home pay and taxes by location: New York City, Seattle, and the SF Bay Area.
          </caption>
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th scope="col" className="px-4 py-3 text-left font-semibold text-slate-600">
                Results by location
              </th>
              {cols.map((c) => (
                <th key={c.key} scope="col" className="px-4 py-3 text-right font-semibold text-slate-900">
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {SECTIONS.map((section) => (
              <SectionRows key={section.heading} section={section} cols={cols} />
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile: one stacked card per location */}
      <div className="divide-y divide-slate-200 md:hidden">
        {cols.map((c) => (
          <LocationCard key={c.key} location={c} />
        ))}
      </div>
    </section>
  )
}

function SectionRows({ section, cols }: { section: SectionSpec; cols: LocationResult[] }) {
  return (
    <>
      <tr className="bg-slate-50/70">
        <td colSpan={1 + cols.length} className="px-4 pb-1 pt-4">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {section.heading}
          </span>
          {section.subhead && (
            <span className="ml-2 text-xs font-normal normal-case text-slate-500">
              {section.subhead}
            </span>
          )}
        </td>
      </tr>
      {section.rows.map((row) => (
        <tr key={row.label} className="border-b border-slate-100 last:border-0">
          <th
            scope="row"
            className={[
              'px-4 py-2 text-left font-normal text-slate-700',
              row.indent ? 'pl-8' : '',
              row.emphasis ? 'font-semibold text-slate-900' : '',
              row.muted ? 'italic text-slate-500' : '',
            ].join(' ')}
          >
            {row.label}
          </th>
          {cols.map((c) => (
            <td
              key={c.key}
              className={[
                'px-4 py-2 text-right font-mono tabular-nums',
                row.emphasis ? 'font-semibold text-slate-900' : 'text-slate-700',
                row.muted ? 'text-slate-500' : '',
              ].join(' ')}
            >
              {fmt(row.get(c), row.variant)}
            </td>
          ))}
        </tr>
      ))}
    </>
  )
}

function LocationCard({ location }: { location: LocationResult }) {
  return (
    <div className="p-4">
      <div className="flex items-baseline justify-between">
        <h3 className="text-base font-semibold text-slate-900">{location.label}</h3>
        <span className="font-mono text-sm font-semibold tabular-nums text-sky-700">
          {usd(location.cashTakeHome)} <span className="text-xs font-normal text-slate-500">take-home</span>
        </span>
      </div>
      <dl className="mt-3 space-y-3">
        {SECTIONS.map((section) => (
          <div key={section.heading}>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              {section.heading}
            </p>
            <div className="mt-1 divide-y divide-slate-50">
              {section.rows.map((row) => (
                <div key={row.label} className="flex items-baseline justify-between gap-4 py-1">
                  <dt
                    className={[
                      'text-sm text-slate-700',
                      row.emphasis ? 'font-semibold text-slate-900' : '',
                      row.muted ? 'italic text-slate-500' : '',
                    ].join(' ')}
                  >
                    {row.label}
                  </dt>
                  <dd
                    className={[
                      'shrink-0 font-mono text-sm tabular-nums',
                      row.emphasis ? 'font-semibold text-slate-900' : 'text-slate-700',
                      row.muted ? 'text-slate-500' : '',
                    ].join(' ')}
                  >
                    {fmt(row.get(location), row.variant)}
                  </dd>
                </div>
              ))}
            </div>
          </div>
        ))}
      </dl>
    </div>
  )
}
