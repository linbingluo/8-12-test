import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import DestinationCard from '../DestinationCard'

const defaultProps = {
  id: 1,
  name: 'Paris',
  description: 'City of Light',
  rating: 4,
  country: 'France',
  tags: 'romantic,art',
  status: 'wishlist',
  image_url: '',
  onEdit: jest.fn(),
  onDeleted: jest.fn(),
}

describe('DestinationCard', () => {
  it('renders name, country, and description', () => {
    render(<DestinationCard {...defaultProps} />)
    expect(screen.getByText('Paris')).toBeInTheDocument()
    expect(screen.getAllByText('France').length).toBeGreaterThan(0)
    expect(screen.getByText('City of Light')).toBeInTheDocument()
  })

  it('renders correct star rating for rating=4', () => {
    render(<DestinationCard {...defaultProps} />)
    expect(screen.getByText('★★★★☆')).toBeInTheDocument()
  })

  it('renders tags split by comma', () => {
    render(<DestinationCard {...defaultProps} />)
    expect(screen.getByText('romantic, art')).toBeInTheDocument()
  })

  it('renders empty tag list when tags is empty string', () => {
    render(<DestinationCard {...defaultProps} tags="" />)
    expect(screen.queryByText(/romantic/)).not.toBeInTheDocument()
  })

  it('calls onEdit when Edit button is clicked', () => {
    const onEdit = jest.fn()
    render(<DestinationCard {...defaultProps} onEdit={onEdit} />)
    fireEvent.click(screen.getByText('Edit'))
    expect(onEdit).toHaveBeenCalledTimes(1)
  })

  it('calls onDeleted when Delete button is clicked', () => {
    const onDeleted = jest.fn()
    render(<DestinationCard {...defaultProps} onDeleted={onDeleted} />)
    fireEvent.click(screen.getByText('Delete'))
    expect(onDeleted).toHaveBeenCalledTimes(1)
  })

  it('does not render Favorite button when onFavorite is not provided', () => {
    render(<DestinationCard {...defaultProps} />)
    expect(screen.queryByText('Favorite')).not.toBeInTheDocument()
  })

  it('renders Favorite button when onFavorite is provided', () => {
    render(<DestinationCard {...defaultProps} onFavorite={jest.fn()} />)
    expect(screen.getByText('Favorite')).toBeInTheDocument()
  })

  it('Favorite button is disabled when favoriteDisabled is true', () => {
    render(
      <DestinationCard
        {...defaultProps}
        onFavorite={jest.fn()}
        favoriteDisabled={true}
      />
    )
    expect(screen.getByText('Favorite')).toBeDisabled()
  })

  it('calls onFavorite when Favorite button is clicked', () => {
    const onFavorite = jest.fn()
    render(<DestinationCard {...defaultProps} onFavorite={onFavorite} />)
    fireEvent.click(screen.getByText('Favorite'))
    expect(onFavorite).toHaveBeenCalledTimes(1)
  })
})
