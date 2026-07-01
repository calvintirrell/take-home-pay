import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'
import App from './App'

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
    const row = screen.getByText('Cash take-home (spendable now)').closest('tr')!
    const cells = within(row).getAllByRole('cell')
    // cells[0] is the label; [1]=NYC, [2]=Seattle, [3]=SF
    expect(cells[1]).toHaveTextContent('$98,972')
    expect(cells[2]).toHaveTextContent('$110,172')
    expect(cells[3]).toHaveTextContent('$100,013')
  })

  it('recalculates when the salary changes', () => {
    render(<App />)
    const salary = screen.getByLabelText('Annual gross salary')
    fireEvent.change(salary, { target: { value: '0' } })
    const row = screen.getByText('Subtotal taxes').closest('tr')!
    const cells = within(row).getAllByRole('cell')
    // Zero wages → zero income/payroll taxes everywhere.
    expect(cells[1]).toHaveTextContent('$0')
    expect(cells[2]).toHaveTextContent('$0')
    expect(cells[3]).toHaveTextContent('$0')
  })

  it('switches to MFJ brackets when filing status changes', () => {
    render(<App />)
    const results = screen.getByRole('region', { name: 'Results by location' })
    const fedTax = () =>
      within(results).getByText('Federal income tax').closest('tr')!.querySelectorAll('td')[1]
        .textContent
    const before = fedTax()
    fireEvent.change(screen.getByLabelText('Filing status'), {
      target: { value: 'Married Filing Jointly' },
    })
    const after = fedTax()
    // MFJ brackets are wider, so federal tax should drop at the same income.
    expect(after).not.toEqual(before)
  })
})
