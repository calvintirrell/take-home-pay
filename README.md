# Take-Home Pay Calculator (2026)

An interactive web app that models 2026 take-home pay and taxes for a single W-2 earner,
comparing three locations side by side: **New York City**, **Seattle (WA)**, and the
**SF Bay Area (CA)**. It is a faithful recreation of an Excel tax model, rebuilt as a
client-side React app with editable rate tables and added charts/sharing.

> Estimates for planning only — **not tax advice**. Confirm with a CPA before relying on these figures.

## Tech stack

- **Vite + React + TypeScript** — static SPA, no backend
- **Tailwind CSS v4** — styling
- **Recharts** — breakdown charts
- **Vitest** — engine parity tests
- **GitHub Actions → GitHub Pages** — free hosting

## Local development

```bash
npm install      # install dependencies
npm run dev      # start the dev server (http://localhost:5173)
npm test         # run the engine + parity test suite
npm run build    # produce a static production build in dist/
npm run preview  # preview the production build locally
```

## Project status

Built in phases — see [`GAME_PLAN.md`](./GAME_PLAN.md) for the full plan and
[`PROGRESS.md`](./PROGRESS.md) for the current phase and changelog.

## How the model works

All computation is deterministic and runs entirely in the browser. The calculation engine
(`src/engine/`) is a pure, framework-free TypeScript module validated to the cent against the
original spreadsheet. The 2026 rate tables (federal / NY / NYC / CA brackets and parameters)
are editable in the UI and persisted locally.
