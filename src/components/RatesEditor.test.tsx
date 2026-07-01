import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'
import App from '../App'

// These exercise the editable rates panel end-to-end through App (which owns the
// useRates state and the engine wiring).
describe('RatesEditor (via App)', () => {
  beforeEach(() => localStorage.clear())

  function federalTaxCell(): HTMLElement {
    // Scope to the results region — "Federal income tax" also titles a bracket
    // table in the editor.
    const results = screen.getByRole('region', { name: 'Results by location' })
    const row = within(results).getByText('Federal income tax').closest('tr')!
    return within(row).getAllByRole('cell')[1] // NYC column
  }

  function openEditor() {
    // The panel lives inside a <details>; open it so its inputs are reachable.
    const details = document.querySelector('details') as HTMLDetailsElement
    details.open = true
  }

  it('renders the panel header and a disabled reset button initially', () => {
    render(<App />)
    expect(screen.getByText('Rate tables · 2026')).toBeInTheDocument()
    const reset = screen.getByRole('button', { name: /reset to 2026 defaults/i })
    expect(reset).toBeDisabled()
  })

  it('editing a federal bracket rate changes the computed tax and enables reset', () => {
    render(<App />)
    const before = federalTaxCell().textContent
    openEditor()

    // Bump the top marginal-ish bracket the $135k taxable falls in (24% bracket).
    const rateInput = screen.getByLabelText('Federal income tax bracket 4 rate')
    fireEvent.change(rateInput, { target: { value: '30' } })
    fireEvent.blur(rateInput)

    expect(federalTaxCell().textContent).not.toEqual(before)
    expect(screen.getByRole('button', { name: /reset to 2026 defaults/i })).toBeEnabled()
    expect(screen.getByText('edited')).toBeInTheDocument()
  })

  it('reset restores the original computed tax', () => {
    render(<App />)
    const original = federalTaxCell().textContent
    openEditor()

    const rateInput = screen.getByLabelText('Federal income tax bracket 4 rate')
    fireEvent.change(rateInput, { target: { value: '30' } })
    fireEvent.blur(rateInput)
    expect(federalTaxCell().textContent).not.toEqual(original)

    fireEvent.click(screen.getByRole('button', { name: /reset to 2026 defaults/i }))
    expect(federalTaxCell().textContent).toEqual(original)
  })

  it('persists edits across a remount', () => {
    const { unmount } = render(<App />)
    openEditor()
    const rateInput = screen.getByLabelText('Social Security rate')
    fireEvent.change(rateInput, { target: { value: '7' } })
    fireEvent.blur(rateInput)
    unmount()

    render(<App />)
    expect(screen.getByText('edited')).toBeInTheDocument()
    openEditor()
    expect(screen.getByLabelText('Social Security rate')).toHaveValue('7')
  })
})
