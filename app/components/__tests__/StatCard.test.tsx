import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import StatCard from '../StatCard'

describe('StatCard', () => {
  it('renders the label and value', () => {
    render(<StatCard label="Trips" value={5} color="blue" />)
    expect(screen.getByText('Trips')).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument()
  })

  it('renders with green color', () => {
    render(<StatCard label="Destinations" value={10} color="green" />)
    expect(screen.getByText('Destinations')).toBeInTheDocument()
    expect(screen.getByText('10')).toBeInTheDocument()
  })
})