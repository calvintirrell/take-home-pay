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
- **Pages URL:** _(pending — set after Phase 7)_

---

## Phase status

| Phase | Description | Status | Completed |
|---|---|---|---|
| 0 | Scaffolding & tooling | ✅ Complete | 2026-06-30 |
| 1 | Calculation engine + golden tests ⭐ | ✅ Complete | 2026-06-30 |
| 2 | Core UI (inputs + results table) | ✅ Complete | 2026-06-30 |
| 3 | Editable rates panel | ✅ Complete | 2026-07-01 |
| 4 | Enhancements (charts, paycheck view, sharing, notes) | ⬜ Not started | — |
| 5 | Polish & responsive | ⬜ Not started | — |
| 6 | Final validation | ⬜ Not started | — |
| 7 | Deploy to GitHub Pages | ⬜ Not started | — |

Legend: ⬜ Not started · 🟡 In progress · ✅ Complete

**▶ Resume point (next session trigger: "resume building tax pay calculator"):** Phases 0–3 complete and pushed. Pick up at **Phase 4 — enhancements** (breakdown chart, per-paycheck view, shareable-link URL params, notes/assumptions panel). Awaiting user "proceed" to start Phase 4.

---

## Log

_(Newest entries appended here as phases complete.)_

- **Project kickoff** — Plan approved. Progress tracker created. Awaiting GitHub repo from user before starting Phase 0.
- **Repo connected** — `https://github.com/calvintirrell/take-home-pay` wired to local `origin` via gh CLI (HTTPS). Kickoff commit pushed (GAME_PLAN.md, PROGRESS.md, .gitignore). Starting Phase 0 next.
- **✅ Phase 0 — Scaffolding & tooling (2026-06-30).** Vite 6 + React 19 + TypeScript + Tailwind CSS v4 + Vitest scaffolded by hand (no interactive generator). Configured `vite.config.ts` with `base: '/take-home-pay/'` for GitHub Pages, jsdom test env, Prettier. Added README, placeholder `App.tsx`. Verified: `npm test` green (smoke test), `npm run build` succeeds, built assets correctly prefixed with `/take-home-pay/`, dev server boots → HTTP 200.
- **✅ Phase 1 — Calculation engine + golden tests (2026-06-30).** Pure TS engine in `src/engine/` (`types.ts`, `defaultRates.ts`, `calc.ts`, `calc.test.ts`). Faithful port of the Calculator sheet: three pre-tax bases (income / CA-excl-HSA / FICA-excl-401k&IRA), marginal-rate brackets (fed/NY/NYC/CA), FICA with SS cap + Additional Medicare, four location surcharges (CA SDI / WA Cares / WA PFML / NY PFL), and the $0-contribution baseline → "tax saved" memo. **Parity proven:** a Python oracle reproduced ALL authoritative Single-case Excel outputs to 1e-6, and supplied MFJ reference values. **28 tests pass** — full Single-case parity to the cent, MFJ regression, plus invariants (SS cap, HSA-not-deductible-in-CA, 401k-doesn't-cut-FICA, zero-salary). Typecheck + build clean.
- **✅ Phase 2 — Core UI: inputs + results table (2026-06-30).** `src/lib/format.ts` (usd/pct/sanitize), `src/components/InputsPanel.tsx` (salary, filing-status select, 6 contribution currency fields with 2026-max hints), `src/components/ResultsTable.tsx` (3-location comparison: gross → contributions → taxes → bottom line → memo, section-grouped, mono/tabular numerics), and `App.tsx` wiring inputs → `calculate()` via `useMemo` with a sticky inputs column. Rates fixed to 2026 defaults (editable panel is Phase 3). **Verified error-free:** 32 tests pass (added `App.test.tsx`: renders 3 columns, default $180k cash take-home shows $98,972 / $110,172 / $100,013, recalculates on salary change, switches MFJ brackets), typecheck + build clean, dev server → HTTP 200 with no errors/warnings. **Confirmed working locally in browser (2026-06-30)** — user viewed the running app via `npm run dev`.
- **✅ Phase 3 — Editable rates panel (2026-07-01).** `src/state/useRates.ts` (localStorage-persisted rate tables, key `thp.rates.v1`, structural-clone of defaults so the shared object is never mutated, corrupt-storage fallback, `isModified` flag, `reset`). `src/components/RatesEditor.tsx` — collapsible `<details>` panel exposing all four bracket tables (fed/NY/NYC/CA: Single ≥ / Married ≥ / Rate%) plus the parameters block (standard deductions, exemption credit, Additional Medicare threshold as Single/Married pairs; SS wage base, SS/Medicare/SDI/WA/NY rates & caps). Commit-on-blur inputs, `$`/`%` adornments, "edited" badge + "Reset to 2026 defaults" (disabled when unmodified). Wired into `App.tsx` via `useRates`; edits recalc all three columns live. **Verified error-free:** 42 tests pass (added `useRates.test.ts` ×6: defaults/no-mutation/persist/reload/reset/corrupt-fallback; `RatesEditor.test.tsx` ×4: header+disabled-reset, edit-changes-tax+enables-reset, reset-restores, persist-across-remount), typecheck + build clean, dev server → HTTP 200 no errors. **← REVIEW CHECKPOINT: awaiting sign-off before Phase 4 (enhancements).**
