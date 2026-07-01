import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'
import App from './App'

// The results component renders BOTH a desktop table and mobile cards (same
// labels). Scope queries to the table so text isn't ambiguous, and remember the
// row label is a <th scope="row"> — so the 3 value <td>s index 0=NYC/1=Seattle/2=SF.
function resultsTable() {
  const region = screen.getByRole('region', { name: 'Results by location' })
  return within(region).getByRole('table')
}

function rowCells(rowLabel: string): HTMLElement[] {
  const row = within(resultsTable()).getByText(rowLabel).closest('tr')!
  return within(row).getAllByRole('cell') // value cells only (label is a rowheader)
}

describe('App — wiring inputs to the engine', () => {
  it('renders the three location columns', () => {
    render(<App />)
    // Scope to column headers — "New York City" also appears in the intro copy.
    expect(screen.getByRole('columnheader', { name: 'New York City' })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Seattle (WA)' })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'SF Bay Area (CA)' })).toBeInTheDocument()
  })

  it('shows the default $180k cash take-home for each location', () => {
    render(<App />)
    const cells = rowCells('Cash take-home (spendable now)')
    expect(cells[0]).toHaveTextContent('$98,972') // NYC
    expect(cells[1]).toHaveTextContent('$110,172') // Seattle
    expect(cells[2]).toHaveTextContent('$100,013') // SF
  })

  it('recalculates when the salary changes', () => {
    render(<App />)
    fireEvent.change(screen.getByLabelText('Annual gross salary'), { target: { value: '0' } })
    const cells = rowCells('Subtotal taxes')
    // Zero wages → zero income/payroll taxes everywhere.
    expect(cells[0]).toHaveTextContent('$0')
    expect(cells[1]).toHaveTextContent('$0')
    expect(cells[2]).toHaveTextContent('$0')
  })

  it('switches to MFJ brackets when filing status changes', () => {
    render(<App />)
    const before = rowCells('Federal income tax')[0].textContent
    fireEvent.change(screen.getByLabelText('Filing status'), {
      target: { value: 'Married Filing Jointly' },
    })
    const after = rowCells('Federal income tax')[0].textContent
    // MFJ brackets are wider, so federal tax should change at the same income.
    expect(after).not.toEqual(before)
  })
})
