import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import FavoriteCard from '../FavoriteCard'

const defaultProps = {
  id: 1,
  name: 'Eiffel Tower',
  city: 'Paris',
  category: 'Landmark',
  rating: 5,
  country: 'France',
  saved_at: '2024-01-15',
  image_url: '',
  onEdit: jest.fn(),
  onDeleted: jest.fn(),
}

describe('FavoriteCard', () => {
  it('renders name, city, category, and country', () => {
    render(<FavoriteCard {...defaultProps} />)
    expect(screen.getByText('Eiffel Tower')).toBeInTheDocument()
    expect(screen.getByText('Paris · Landmark')).toBeInTheDocument()
    expect(screen.getByText('France')).toBeInTheDocument()
  })

  it('renders saved_at date', () => {
    render(<FavoriteCard {...defaultProps} />)
    expect(screen.getByText('Saved on 2024-01-15')).toBeInTheDocument()
  })

  it('renders correct star rating for rating=5', () => {
    render(<FavoriteCard {...defaultProps} />)
    expect(screen.getByText('★★★★★')).toBeInTheDocument()
  })

  it('renders correct star rating for rating=3', () => {
    render(<FavoriteCard {...defaultProps} rating={3} />)
    expect(screen.getByText('★★★☆☆')).toBeInTheDocument()
  })

  it('calls onEdit when Edit button is clicked', () => {
    const onEdit = jest.fn()
    render(<FavoriteCard {...defaultProps} onEdit={onEdit} />)
    fireEvent.click(screen.getByText('Edit'))
    expect(onEdit).toHaveBeenCalledTimes(1)
  })

  it('calls onDeleted when Delete button is clicked', () => {
    const onDeleted = jest.fn()
    render(<FavoriteCard {...defaultProps} onDeleted={onDeleted} />)
    fireEvent.click(screen.getByText('Delete'))
    expect(onDeleted).toHaveBeenCalledTimes(1)
  })

  it('renders Details button', () => {
    render(<FavoriteCard {...defaultProps} />)
    expect(screen.getByText('Details')).toBeInTheDocument()
  })

  it('does not render country badge when country is empty', () => {
    render(<FavoriteCard {...defaultProps} country="" />)
    expect(screen.queryByText('France')).not.toBeInTheDocument()
  })
})
