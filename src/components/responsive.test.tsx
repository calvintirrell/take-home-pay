import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from '../App'

// Phase 5: the results render as a desktop table AND mobile stacked cards.
// (Media-query visibility isn't applied in jsdom, so both are in the DOM; we
// assert the mobile-card structure exists — the location headings.)
describe('responsive results + a11y', () => {
  beforeEach(() => localStorage.clear())

  it('renders a mobile card heading per location', () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: 'New York City', level: 3 })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Seattle (WA)', level: 3 })).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'SF Bay Area (CA)', level: 3 }),
    ).toBeInTheDocument()
  })

  it('exposes a screen-reader summary of the chart', async () => {
    render(<App />)
    await screen.findByText('Where your money goes', {}, { timeout: 5000 }) // lazy chart
    expect(screen.getByText(/Money split by location/)).toBeInTheDocument()
  })
})
