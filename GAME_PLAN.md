# Take-Home Pay Web App — Game Plan

**Source:** `tax_take_home_modeling.xlsx` (2026 tax model, NYC · Seattle · SF Bay Area)
**Stack:** Vite + React + TypeScript + Tailwind CSS · Recharts · Vitest · GitHub Actions → GitHub Pages
**Decisions locked:** Path 2 (React SPA) · Parity + light enhancements · Shareable/deployed (free, GitHub Pages) · Rate tables visible & editable

---

## Guiding principles

1. **Engine first, UI second.** The math is the product. Build it as a pure, framework-free, fully-tested TypeScript module before any pixels. Everything else is a view over it.
2. **Parity is provable, not assumed.** Lock the engine against the Excel's exact output numbers with unit tests (golden values below). No UI work until those pass.
3. **No backend, ever.** 100% client-side. All state lives in the browser (React state + `localStorage`) and the URL (shareable links). This is what makes free static hosting possible.
4. **Faithful, then enhanced.** Recreate the spreadsheet's structure and language first; layer charts/per-paycheck/sharing on top without altering the core numbers.

---

## Architecture at a glance

```
User inputs ─┐
             ├─► [ calc engine (pure TS) ] ─► results object ─► React views (table, charts, memos)
Rate tables ─┘                                                      ▲
   (editable, persisted to localStorage + URL)──────────────────────┘
```

- **Engine** = pure functions: `(inputs, rateTables) → results`. No React, no DOM. Trivially testable.
- **Rate tables** = typed data, default = 2026 values from the Excel, user-overridable, persisted.
- **Views** = dumb components rendering the results object.

### Planned file structure
```
take home pay/
├─ GAME_PLAN.md                 ← this file
├─ index.html
├─ package.json
├─ vite.config.ts              (base: '/take-home-pay/' for GH Pages)
├─ tailwind.config.js
├─ .github/workflows/deploy.yml
├─ src/
│  ├─ engine/
│  │  ├─ types.ts              (Inputs, RateTables, Results, Bracket…)
│  │  ├─ defaultRates.ts       (2026 tables ported from "Rates 2026")
│  │  ├─ calc.ts               (the calculation engine)
│  │  └─ calc.test.ts          (golden tests vs Excel)
│  ├─ state/
│  │  ├─ useRates.ts           (localStorage-persisted editable rates + reset)
│  │  └─ useShareableInputs.ts (URL-encoded inputs)
│  ├─ components/
│  │  ├─ InputsPanel.tsx
│  │  ├─ ResultsTable.tsx
│  │  ├─ RatesEditor.tsx
│  │  ├─ BreakdownChart.tsx
│  │  ├─ PaycheckView.tsx
│  │  ├─ ShareButton.tsx
│  │  └─ NotesPanel.tsx
│  ├─ App.tsx
│  └─ main.tsx
└─ README.md
```

---

## Engine specification (what the math must do — ported from the Excel)

**Inputs:** annual gross salary; filing status (`Single` | `Married Filing Jointly`); contributions: 401(k)/403(b), HSA, Health FSA, Dependent-Care FSA, Traditional IRA, Other pre-tax.

**Three distinct pre-tax bases (the subtle part):**
- **Income-tax base reduction (federal & NY):** 401k + HSA + FSA + DCFSA + IRA + Other  (everything)
- **CA income-tax base reduction:** same **but excludes HSA** (California doesn't allow the HSA deduction)
- **FICA base reduction:** HSA + FSA + DCFSA + Other  (**not** 401k or IRA)

**Per-jurisdiction taxable income** = `max(0, gross − applicable base reduction − standard deduction)`.

**Progressive tax** = marginal incremental-rate method: `Σ over brackets of max(0, taxable − threshold) × incremental_rate`, with the active threshold column chosen by filing status (Single vs MFJ).

**Taxes computed:**
- Federal income tax (7 brackets)
- FICA = Social Security 6.2% up to wage base ($184,500) + Medicare 1.45% + Additional Medicare 0.9% above threshold ($200k single / $250k MFJ)
- NY state (9 brackets) + NYC resident (4 brackets) — NYC column only
- CA state (9 brackets) **net of CA exemption credit** — SF column only
- Location surcharges: CA SDI 1.3% (SF), WA Cares 0.58% + WA PFML 0.807% capped (Seattle), NY PFL 0.388% capped at $400 (NYC) — all charged on **gross**, not reduced by contributions

**Three location result columns:**
| Location | Income taxes applied |
|---|---|
| **NYC** | Federal + FICA + NY state + NYC + NY PFL |
| **Seattle (WA)** | Federal + FICA + WA Cares + WA PFML (no state/local income tax) |
| **SF Bay (CA)** | Federal + FICA + CA state (net credit) + CA SDI |

**Outputs per location:** gross, itemized contributions + subtotal, itemized taxes + subtotal, **cash take-home** (`gross − taxes − contributions`), **total value retained** (`cash + contributions`), **effective tax rate** (`taxes ÷ gross`), **take-home rate** (`cash ÷ gross`), and the **$0-contribution baseline** → **"tax saved by your contributions"** memo.

### Golden test values (must match exactly — salary $180,000, Single, default 2026 rates)
| Metric | NYC | Seattle | SF Bay |
|---|---:|---:|---:|
| Contributions subtotal | 28,900 | 28,900 | 28,900 |
| Federal income tax | 24,998 | 24,998 | 24,998 |
| FICA | 13,433.40 | 13,433.40 | 13,433.40 |
| State income tax | 7,874.65 | 0 | 10,315.20 |
| City/local | 5,421.73 | 0 | 0 |
| Location surcharges | 400 (PFL) | 1,044 + 1,452.60 | 2,340 (SDI) |
| Subtotal taxes | 52,127.78 | 40,928 | 51,086.60 |
| **Cash take-home** | **98,972.22** | **110,172** | **100,013.40** |
| Total value retained | 127,872.22 | 139,072 | 128,913.40 |
| Effective tax rate | 28.96% | 22.74% | 28.38% |
| Tax saved by contributions | 10,097.86 | 7,272.60 | 9,551.10 |

(Plus a second golden case for Married Filing Jointly to lock the filing-status branch.)

---

## Phased build plan

### Phase 0 — Scaffolding & tooling  *(checkpoint: app boots to a blank styled page)*
- `npm create vite` (React + TS), install Tailwind, Recharts, Vitest.
- Configure `vite.config.ts` `base` for the GH Pages subpath; set up Prettier; `git init`.
- Verify dev server runs and Tailwind classes apply.

### Phase 1 — Calculation engine  *(checkpoint: all golden tests green)*  ← **the critical phase**
- Define types (`Inputs`, `Bracket`, `RateTables`, `Results`).
- Port the 2026 rate tables into `defaultRates.ts`.
- Implement `calc.ts`: bracket math, the three pre-tax bases, FICA, per-location assembly, $0 baseline.
- Write `calc.test.ts` with the golden table above + an MFJ case. **Do not proceed until exact match.**

### Phase 2 — Core UI (inputs + results)  *(checkpoint: live calculator matching Excel on screen)*
- `InputsPanel` (salary, filing-status toggle, 6 contribution fields, helper captions + 2026 max hints).
- `ResultsTable` (3-location comparison: contributions, taxes, take-home, rates, memo).
- Wire React state → engine → table; everything recalculates on input change.

### Phase 3 — Editable rates panel  *(checkpoint: edit a bracket, numbers move, survives refresh)*
- `RatesEditor`: federal/NY/NYC/CA brackets + parameters, editable.
- `useRates` persists overrides to `localStorage`; "Reset to 2026 defaults" button.

### Phase 4 — Enhancements  *(checkpoint: charts, per-paycheck, sharing all work)*
- `BreakdownChart` (Recharts): tax composition + take-home comparison across the 3 locations.
- `PaycheckView`: annual ÷ selectable pay frequency (weekly/bi-weekly/semi-monthly/monthly).
- `ShareButton`: encode inputs in URL; `useShareableInputs` reads them on load.
- `NotesPanel`: render assumptions/caveats/sources from the Notes sheet + "not tax advice" disclaimer.

### Phase 5 — Polish & responsive  *(checkpoint: looks good on phone + desktop)*
- Layout, spacing, number formatting (currency + %), mono numerics, color accents.
- Mobile-responsive (results table → stacked cards on narrow screens); basic a11y (labels, contrast, keyboard).

### Phase 6 — Final validation  *(checkpoint: green build, parity re-confirmed)*
- Full `vitest` run; manual cross-check of several salary/filing scenarios against the Excel.
- `npm run build` produces a clean static bundle; preview it locally.

### Phase 7 — Deploy to GitHub Pages  *(checkpoint: live public URL)*
- Add `.github/workflows/deploy.yml` (build on push to `main` → publish to Pages).
- I prepare everything; **you** create the repo + enable Pages (needs your GitHub account). I'll give exact commands or run the `gh` steps with you.
- Verify the live URL works from a fresh browser/phone.

---

## Review checkpoints (where I'll pause for you)
- ✅ After **Phase 1** — confirm the engine output matches the Excel before any UI investment.
- ✅ After **Phase 2** — confirm the core UX/layout direction before adding enhancements.
- ✅ Before **Phase 7** — confirm you're ready to make it public, then walk the GitHub steps together.
(Between these, I'll work phase-to-phase without gating.)

---

## Risks & mitigations
- **Floating-point drift vs. Excel** → match the spreadsheet's straight-bracket method exactly; assert to the cent in tests; format (not compute) rounded.
- **Known Excel approximations** (NY tax-benefit recapture, approximated NY PFL) → reproduce as-is for parity; surface them in the Notes panel. (Accuracy improvements were explicitly deferred.)
- **GH Pages subpath asset breakage** → set Vite `base` correctly; verify on the live URL, not just locally.
- **Rate-table edits corrupting state** → validate inputs, keep immutable defaults, one-click reset.

---

## Out of scope (this round)
Accounts/login, server-side persistence, multi-year history, additional locations/states, itemized deductions, capital-gains/RSU/bonus modeling, and accuracy fixes beyond the Excel (e.g. NY recapture). All are natural future phases if wanted.
