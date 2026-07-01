// Assumptions, caveats, and sources — ported from the "Notes & assumptions"
// sheet of the source workbook.

interface NoteGroup {
  heading: string
  items: string[]
}

const GROUPS: NoteGroup[] = [
  {
    heading: 'What this model does',
    items: [
      'Computes 2026 federal, state, local, and payroll deductions for one wage-earner in three locations: New York City (NY state + NYC tax), Seattle (Washington — no income tax), and the SF Bay Area (California).',
      'Change any input and every number updates.',
    ],
  },
  {
    heading: 'How to read it',
    items: [
      'Pre-tax contributions are NOT lost — they move into your own 401(k)/HSA/etc. and lower your taxable income.',
      '“Cash take-home” is what hits your bank now. “Total value retained” = cash + the money in your accounts.',
      'The gap between those two is exactly the tax your contributions saved (see the memo line).',
    ],
  },
  {
    heading: 'Key assumptions',
    items: [
      'Standard deduction (federal, NY, and CA) — no itemizing modeled.',
      'Single-wage-earner household. For Married Filing Jointly the model switches to the joint brackets, standard deductions, and the $250k Additional-Medicare threshold, but still treats the salary as ONE earner’s wage for the Social Security cap. Two earners splitting the income would pay slightly less Social Security.',
      '401(k) and deductible IRA lower income tax but NOT FICA. HSA / FSA / Dependent-Care FSA / other pre-tax lower income tax AND FICA (assumed run through payroll).',
      'California does NOT allow the HSA deduction, so the CA column shields the HSA from federal tax and FICA only.',
      'CA SDI (1.3%), WA Cares (0.58%), and WA PFML (0.807%) are charged on GROSS wages and are not reduced by pre-tax contributions.',
    ],
  },
  {
    heading: 'Precision caveats',
    items: [
      'New York applies a “tax-benefit recapture” above ~$107,650 of income that gradually claws back the value of its lower brackets. This model uses the straight bracket method, so the real NY state figure can run a few hundred dollars higher at these income levels.',
      'NY Paid Family Leave is approximated (0.388% of wages, capped). Bracket thresholds are 2026 figures; CA brackets/standard deduction use the latest published inflation-indexed values.',
      'Estimates for planning only — not tax advice. Confirm with a CPA before relying on these for filing.',
      'Traditional IRA: the deduction phases out for a single filer covered by a workplace plan between $81k–$91k of income (and is unavailable above), so most people at these salaries should leave it at $0 and use a backdoor Roth.',
    ],
  },
]

const SOURCES =
  'Sources: IRS Rev. Proc. 2025-32 & IR-2025-111; NY Dept. of Taxation & Finance (2026 budget rate cuts); NYC Dept. of Finance; California FTB & EDD (2026 SDI 1.3%); WA ESD (2026 PFML 1.13% / WA Cares 0.58%). Compiled June 2026.'

export function NotesPanel() {
  return (
    <section
      aria-label="Notes and assumptions"
      className="rounded-xl border border-slate-200 bg-white shadow-sm"
    >
      <details>
        <summary className="cursor-pointer list-none px-5 py-4">
          <span className="text-xs font-semibold uppercase tracking-widest text-sky-600">
            Notes &amp; assumptions
          </span>
          <span className="ml-2 text-xs text-slate-500">methodology, caveats, sources — click to expand</span>
        </summary>
        <div className="space-y-6 border-t border-slate-100 px-5 py-6">
          {GROUPS.map((g) => (
            <div key={g.heading}>
              <h4 className="text-sm font-semibold text-slate-800">{g.heading}</h4>
              <ul className="mt-2 space-y-1.5">
                {g.items.map((item, i) => (
                  <li key={i} className="flex gap-2 text-sm text-slate-600">
                    <span className="mt-1.5 h-1 w-1 flex-none rounded-full bg-slate-300" aria-hidden />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <p className="border-t border-slate-100 pt-4 text-xs text-slate-400">{SOURCES}</p>
        </div>
      </details>
    </section>
  )
}
