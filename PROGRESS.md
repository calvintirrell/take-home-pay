# Progress Tracker — Take-Home Pay Web App

This file records the last completed phase. Updated at every phase boundary, immediately before a git commit + push.

**See `GAME_PLAN.md` for the full plan, engine spec, and golden test values.**

---

## Workflow rule (per user, locked)
After completing each phase, in order:
1. **Test for errors** — run tests/typecheck/build; fix and **repeat the build→test cycle until the whole project works with zero errors**.
2. Update this tracker with the phase just finished.
3. Secret-scan, then `git commit` + `git push` to the GitHub repo.
4. **Wait for the user's explicit approval before starting the next phase** (applies to every phase, not just the plan's named checkpoints).

## GitHub repo
- **URL:** https://github.com/calvintirrell/take-home-pay
- **Remote:** `origin` (HTTPS, gh-authenticated as calvintirrell)
- **Pages URL:** https://calvintirrell.github.io/take-home-pay/ (Pages enabled, source: GitHub Actions)

---

## Phase status

| Phase | Description | Status | Completed |
|---|---|---|---|
| 0 | Scaffolding & tooling | ✅ Complete | 2026-06-30 |
| 1 | Calculation engine + golden tests ⭐ | ✅ Complete | 2026-06-30 |
| 2 | Core UI (inputs + results table) | ✅ Complete | 2026-06-30 |
| 3 | Editable rates panel | ✅ Complete | 2026-07-01 |
| 4 | Enhancements (charts, paycheck view, sharing, notes) | ✅ Complete | 2026-07-01 |
| 5 | Polish & responsive | ✅ Complete | 2026-07-01 |
| 6 | Final validation | ✅ Complete | 2026-07-01 |
| 7 | Deploy to GitHub Pages | ✅ Complete | 2026-07-01 |

Legend: ⬜ Not started · 🟡 In progress · ✅ Complete

**🎉 PROJECT COMPLETE — all 7 phases shipped (2026-07-01).** Live at **https://calvintirrell.github.io/take-home-pay/**. Every push to `main` auto-builds (tests + build) and redeploys via GitHub Actions. Future work is optional (see GAME_PLAN "Out of scope": accounts/persistence, more locations, NY recapture accuracy, etc.).

---

## Log

_(Newest entries appended here as phases complete.)_

- **Project kickoff** — Plan approved. Progress tracker created. Awaiting GitHub repo from user before starting Phase 0.
- **Repo connected** — `https://github.com/calvintirrell/take-home-pay` wired to local `origin` via gh CLI (HTTPS). Kickoff commit pushed (GAME_PLAN.md, PROGRESS.md, .gitignore). Starting Phase 0 next.
- **✅ Phase 0 — Scaffolding & tooling (2026-06-30).** Vite 6 + React 19 + TypeScript + Tailwind CSS v4 + Vitest scaffolded by hand (no interactive generator). Configured `vite.config.ts` with `base: '/take-home-pay/'` for GitHub Pages, jsdom test env, Prettier. Added README, placeholder `App.tsx`. Verified: `npm test` green (smoke test), `npm run build` succeeds, built assets correctly prefixed with `/take-home-pay/`, dev server boots → HTTP 200.
- **✅ Phase 1 — Calculation engine + golden tests (2026-06-30).** Pure TS engine in `src/engine/` (`types.ts`, `defaultRates.ts`, `calc.ts`, `calc.test.ts`). Faithful port of the Calculator sheet: three pre-tax bases (income / CA-excl-HSA / FICA-excl-401k&IRA), marginal-rate brackets (fed/NY/NYC/CA), FICA with SS cap + Additional Medicare, four location surcharges (CA SDI / WA Cares / WA PFML / NY PFL), and the $0-contribution baseline → "tax saved" memo. **Parity proven:** a Python oracle reproduced ALL authoritative Single-case Excel outputs to 1e-6, and supplied MFJ reference values. **28 tests pass** — full Single-case parity to the cent, MFJ regression, plus invariants (SS cap, HSA-not-deductible-in-CA, 401k-doesn't-cut-FICA, zero-salary). Typecheck + build clean.
- **✅ Phase 2 — Core UI: inputs + results table (2026-06-30).** `src/lib/format.ts` (usd/pct/sanitize), `src/components/InputsPanel.tsx` (salary, filing-status select, 6 contribution currency fields with 2026-max hints), `src/components/ResultsTable.tsx` (3-location comparison: gross → contributions → taxes → bottom line → memo, section-grouped, mono/tabular numerics), and `App.tsx` wiring inputs → `calculate()` via `useMemo` with a sticky inputs column. Rates fixed to 2026 defaults (editable panel is Phase 3). **Verified error-free:** 32 tests pass (added `App.test.tsx`: renders 3 columns, default $180k cash take-home shows $98,972 / $110,172 / $100,013, recalculates on salary change, switches MFJ brackets), typecheck + build clean, dev server → HTTP 200 with no errors/warnings. **Confirmed working locally in browser (2026-06-30)** — user viewed the running app via `npm run dev`.
- **✅ Phase 3 — Editable rates panel (2026-07-01).** `src/state/useRates.ts` (localStorage-persisted rate tables, key `thp.rates.v1`, structural-clone of defaults so the shared object is never mutated, corrupt-storage fallback, `isModified` flag, `reset`). `src/components/RatesEditor.tsx` — collapsible `<details>` panel exposing all four bracket tables (fed/NY/NYC/CA: Single ≥ / Married ≥ / Rate%) plus the parameters block (standard deductions, exemption credit, Additional Medicare threshold as Single/Married pairs; SS wage base, SS/Medicare/SDI/WA/NY rates & caps). Commit-on-blur inputs, `$`/`%` adornments, "edited" badge + "Reset to 2026 defaults" (disabled when unmodified). Wired into `App.tsx` via `useRates`; edits recalc all three columns live. **Verified error-free:** 42 tests pass (added `useRates.test.ts` ×6: defaults/no-mutation/persist/reload/reset/corrupt-fallback; `RatesEditor.test.tsx` ×4: header+disabled-reset, edit-changes-tax+enables-reset, reset-restores, persist-across-remount), typecheck + build clean, dev server → HTTP 200 no errors. **← REVIEW CHECKPOINT: awaiting sign-off before Phase 4 (enhancements).**
- **✅ Phase 4 — Enhancements (2026-07-01).** Four additions: (1) **BreakdownChart** (`recharts` upgraded v2→**v3.9.1**) — stacked bar chart with a "Money split" (cash / into-accounts / taxes) vs "Tax detail" (federal / FICA / state / city / other-payroll) toggle; **lazy-loaded** via `React.lazy`+`Suspense` so recharts is a separate on-demand chunk (main bundle 70 kB gzip, chart chunk 110 kB gzip). (2) **PaycheckCard** — pay-frequency selector (annual/monthly/semi-monthly/bi-weekly/weekly) showing per-check cash take-home per location. (3) **Share links** — `src/lib/shareUrl.ts` encodes inputs into short URL params; `ShareBar` copies the link (clipboard API + textarea fallback); `App` seeds inputs from the URL on load. (4) **NotesPanel** — collapsible assumptions/caveats/sources ported from the Notes sheet. Test infra: `ResizeObserver` stub + targeted recharts-warning filter in `setup.ts`. **Verified error-free:** 51 tests pass (added `shareUrl.test.ts` ×5 encode/decode round-trips + `enhancements.test.tsx` ×4 paycheck division/chart toggle/share+notes render/URL-seed), typecheck + build clean (code-split, no chunk warning), dev server → HTTP 200 for root and a shared-link URL, no errors. **← REVIEW CHECKPOINT: awaiting sign-off before Phase 5 (polish & responsive).**
- **✅ Phase 5 — Polish & responsive (2026-07-01).** `ResultsTable` now renders **two views**: the desktop comparison table (hidden on mobile) plus **stacked per-location cards** (`md:hidden`) so narrow screens get a readable card each for NYC/Seattle/SF instead of a horizontal-scroll table. A11y: table `<caption>` (sr-only) + `<th scope="col/row">` header semantics; **screen-reader summary** of the chart (values as text) with the visual container marked `aria-hidden`; contrast bumps (helper text slate-400→slate-500 to meet WCAG AA in PaycheckCard/RatesEditor/NotesPanel). Layout: left input column made `lg:sticky`. **Verified error-free:** 53 tests pass (added `responsive.test.tsx` ×2: per-location mobile card headings, chart SR-summary; updated App/RatesEditor selectors for the new `<th>`/dual-view DOM), typecheck + build clean (code-split preserved), dev server → HTTP 200 no errors. **← REVIEW CHECKPOINT: awaiting sign-off before Phase 6 (final validation).**
- **✅ Phase 6 — Final validation (2026-07-01).** Added `src/engine/scenarios.test.ts` — data-driven cross-validation of the TS engine vs the independent Python oracle (Excel-faithful) across **9 diverse scenarios**: $10k (below std deduction), $40k/$80k/$180k Single, $500k & $1M (SS cap + Additional Medicare + top brackets), $150k/$260k/$600k MFJ with family contributions. Engine matches taxes/cash/tax-saved **to within $0.01** on all. Surfaced a real model behavior (not a bug): at $10k, SF cash > Seattle because WA's uncapped Cares+PFML exceed CA SDI while CA income tax ≈ $0 — invariant test corrected to "Seattle wins at $40k+". **64 tests pass, stable across 2 consecutive runs** (fixed lazy-chart `findByText` flakiness with a 5s timeout). Clean production build (code-split: 70 kB gzip main + 110 kB chart chunk); **preview server serves the built artifact** at HTTP 200 for root + shared-link with `/take-home-pay/` base path baked in. **← REVIEW CHECKPOINT: awaiting sign-off before Phase 7 (deploy to GitHub Pages — needs user to enable Pages).**
- **✅ Phase 7 — Deploy to GitHub Pages (2026-07-01).** Added `.github/workflows/deploy.yml` (on push to `main` + manual dispatch: `npm ci` → `npm test` → `npm run build` → upload `dist/` → `actions/deploy-pages@v4`; permissions pages:write + id-token:write; concurrency group). Enabled Pages via API with `build_type=workflow`. First run **succeeded** (build+test job 25s, deploy job 23s). **Live site verified HTTP 200** at https://calvintirrell.github.io/take-home-pay/ with `/take-home-pay/` base-path assets reachable. (Benign annotation: GitHub Node-20→24 runtime deprecation for v4 actions — GitHub-side, no action needed.) **PROJECT COMPLETE.**
