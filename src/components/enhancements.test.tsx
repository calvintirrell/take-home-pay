import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'
import App from '../App'

describe('Phase 4 enhancements (via App)', () => {
  beforeEach(() => localStorage.clear())

  it('renders the per-paycheck card and divides by pay frequency', () => {
    render(<App />)
    const card = screen.getByRole('region', { name: 'Take-home per paycheck' })
    // Default frequency is bi-weekly (26). NYC annual cash take-home is $98,972.
    // Per check ≈ 98972 / 26 = $3,807.
    expect(within(card).getByText('New York City')).toBeInTheDocument()
    expect(within(card).getByText('$3,807')).toBeInTheDocument()

    // Switch to Monthly (12): 98972 / 12 ≈ $8,248.
    fireEvent.change(within(card).getByLabelText('Pay frequency'), { target: { value: '12' } })
    expect(within(card).getByText('$8,248')).toBeInTheDocument()
  })

  it('renders the breakdown chart with a mode toggle', async () => {
    render(<App />)
    // Chart is lazy-loaded — wait for it to resolve.
    expect(await screen.findByText('Where your money goes')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Tax detail' }))
    expect(screen.getByText('Tax breakdown')).toBeInTheDocument()
  })

  it('renders the share bar and notes panel', () => {
    render(<App />)
    expect(screen.getByRole('button', { name: /copy shareable link/i })).toBeInTheDocument()
    expect(screen.getByText('Notes & assumptions')).toBeInTheDocument()
  })

  it('seeds inputs from a shared URL', () => {
    // jsdom lets us set the search string before rendering.
    window.history.replaceState({}, '', '/take-home-pay/?g=120000&fs=s&k=0&hsa=0')
    render(<App />)
    const salary = screen.getByLabelText('Annual gross salary') as HTMLInputElement
    expect(salary.value).toBe('120,000')
    // Reset URL so it doesn't leak into other tests.
    window.history.replaceState({}, '', '/take-home-pay/')
  })
})
