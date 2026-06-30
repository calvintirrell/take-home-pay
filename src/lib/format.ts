// Display formatting helpers. Pure presentation — the engine works in exact
// numbers; rounding happens only here, at render time.

/** Format a dollar amount. Defaults to whole dollars for a clean table. */
export function usd(value: number, fractionDigits = 0): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value)
}

/** Format a 0..1 ratio as a percentage. */
export function pct(value: number, fractionDigits = 1): string {
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value)
}

/** Like usd(), but renders an exact zero as an em dash to reduce table noise. */
export function usdOrDash(value: number, fractionDigits = 0): string {
  return value === 0 ? '—' : usd(value, fractionDigits)
}

/** Parse user input into a non-negative number, tolerating $, commas, spaces. */
export function sanitizeAmount(raw: string): number {
  if (raw.trim() === '') return 0
  const n = Number(raw.replace(/[^0-9.]/g, ''))
  return Number.isFinite(n) && n >= 0 ? n : 0
}
