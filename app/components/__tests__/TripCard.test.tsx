import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import TripCard from '../TripCard'

// Mock the deleteTrip API call so tests don't make real network requests
jest.mock('../../lib/api', () => ({
  deleteTrip: jest.fn().mockResolvedValue({}),
}))

const defaultProps = {
  id: 1,
  title: 'Japan Adventure',
  dateRange: '2024-03-01 to 2024-03-10',
  destinations: 3,
  budget: 5000,
  rating: 4,
  status: 'planned' as const,
  onDeleted: jest.fn(),
  onEdit: jest.fn(),
}

describe('TripCard', () => {
  it('renders title and dateRange', () => {
    render(<TripCard {...defaultProps} />)
    expect(screen.getByText('Japan Adventure')).toBeInTheDocument()
    expect(screen.getByText('2024-03-01 to 2024-03-10')).toBeInTheDocument()
  })

  it('renders destinations count', () => {
    render(<TripCard {...defaultProps} />)
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('renders budget formatted with £ sign', () => {
    render(<TripCard {...defaultProps} />)
    expect(screen.getByText('£5,000')).toBeInTheDocument()
  })

  it('renders correct star rating for rating=4', () => {
    render(<TripCard {...defaultProps} />)
    expect(screen.getByText('★★★★')).toBeInTheDocument()
  })

  it('renders Draft status badge', () => {
    render(<TripCard {...defaultProps} status="draft" />)
    expect(screen.getByText('Draft')).toBeInTheDocument()
  })

  it('renders Ongoing status badge', () => {
    render(<TripCard {...defaultProps} status="ongoing" />)
    expect(screen.getByText('Ongoing')).toBeInTheDocument()
  })

  it('renders Completed status badge', () => {
    render(<TripCard {...defaultProps} status="completed" />)
    expect(screen.getByText('Completed')).toBeInTheDocument()
  })

  it('calls onEdit when Edit button is clicked', () => {
    const onEdit = jest.fn()
    render(<TripCard {...defaultProps} onEdit={onEdit} />)
    fireEvent.click(screen.getByTitle('Edit'))
    expect(onEdit).toHaveBeenCalledTimes(1)
  })

  it('shows checkbox in select mode', () => {
    render(<TripCard {...defaultProps} isSelectMode={true} />)
    expect(screen.getByRole('checkbox')).toBeInTheDocument()
  })

  it('does not show checkbox when not in select mode', () => {
    render(<TripCard {...defaultProps} isSelectMode={false} />)
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument()
  })

  it('checkbox reflects isSelected prop', () => {
    render(<TripCard {...defaultProps} isSelectMode={true} isSelected={true} />)
    expect(screen.getByRole('checkbox')).toBeChecked()
  })

  it('calls onSelectionChange when checkbox is toggled', () => {
    const onSelectionChange = jest.fn()
    render(
      <TripCard
        {...defaultProps}
        isSelectMode={true}
        isSelected={false}
        onSelectionChange={onSelectionChange}
      />
    )
    fireEvent.click(screen.getByRole('checkbox'))
    expect(onSelectionChange).toHaveBeenCalledWith(true)
  })

  it('hides Edit/Delete buttons in select mode', () => {
    render(<TripCard {...defaultProps} isSelectMode={true} />)
    expect(screen.queryByTitle('Edit')).not.toBeInTheDocument()
    expect(screen.queryByTitle('Delete')).not.toBeInTheDocument()
  })
})
