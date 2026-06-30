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
| 2 | Core UI (inputs + results table) | ⬜ Not started | — |
| 3 | Editable rates panel | ⬜ Not started | — |
| 4 | Enhancements (charts, paycheck view, sharing, notes) | ⬜ Not started | — |
| 5 | Polish & responsive | ⬜ Not started | — |
| 6 | Final validation | ⬜ Not started | — |
| 7 | Deploy to GitHub Pages | ⬜ Not started | — |

Legend: ⬜ Not started · 🟡 In progress · ✅ Complete

---

## Log

_(Newest entries appended here as phases complete.)_

- **Project kickoff** — Plan approved. Progress tracker created. Awaiting GitHub repo from user before starting Phase 0.
- **Repo connected** — `https://github.com/calvintirrell/take-home-pay` wired to local `origin` via gh CLI (HTTPS). Kickoff commit pushed (GAME_PLAN.md, PROGRESS.md, .gitignore). Starting Phase 0 next.
- **✅ Phase 0 — Scaffolding & tooling (2026-06-30).** Vite 6 + React 19 + TypeScript + Tailwind CSS v4 + Vitest scaffolded by hand (no interactive generator). Configured `vite.config.ts` with `base: '/take-home-pay/'` for GitHub Pages, jsdom test env, Prettier. Added README, placeholder `App.tsx`. Verified: `npm test` green (smoke test), `npm run build` succeeds, built assets correctly prefixed with `/take-home-pay/`, dev server boots → HTTP 200.
- **✅ Phase 1 — Calculation engine + golden tests (2026-06-30).** Pure TS engine in `src/engine/` (`types.ts`, `defaultRates.ts`, `calc.ts`, `calc.test.ts`). Faithful port of the Calculator sheet: three pre-tax bases (income / CA-excl-HSA / FICA-excl-401k&IRA), marginal-rate brackets (fed/NY/NYC/CA), FICA with SS cap + Additional Medicare, four location surcharges (CA SDI / WA Cares / WA PFML / NY PFL), and the $0-contribution baseline → "tax saved" memo. **Parity proven:** a Python oracle reproduced ALL authoritative Single-case Excel outputs to 1e-6, and supplied MFJ reference values. **28 tests pass** — full Single-case parity to the cent, MFJ regression, plus invariants (SS cap, HSA-not-deductible-in-CA, 401k-doesn't-cut-FICA, zero-salary). Typecheck + build clean. **← REVIEW CHECKPOINT: awaiting sign-off before Phase 2 (UI).**
