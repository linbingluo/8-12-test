import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'

// Mock next/navigation since Navbar uses useRouter
jest.mock('next/navigation', () => ({
  useRouter: () => ({ replace: jest.fn() }),
}))

// Mock next/link
jest.mock('next/link', () => {
  const Link = ({ href, children, onClick }: { href: string; children: React.ReactNode; onClick?: () => void }) => (
    <a href={href} onClick={onClick}>{children}</a>
  )
  Link.displayName = 'Link'
  return Link
})

import Navbar from '../Navbar'

describe('Navbar', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('renders the search input', () => {
    render(<Navbar />)
    expect(screen.getByPlaceholderText(/search trips/i)).toBeInTheDocument()
  })

  it('shows "Not logged in" when no user in localStorage', () => {
    render(<Navbar />)
    // Open dropdown first
    fireEvent.click(screen.getByTitle ? document.querySelector('button[title]') || screen.getAllByRole('button')[1] : screen.getAllByRole('button')[1])
    expect(screen.getByText(/not logged in/i)).toBeInTheDocument()
  })

  it('shows username and email when user is in localStorage', () => {
    localStorage.setItem('user', JSON.stringify({ username: 'Alice', email: 'alice@example.com' }))
    render(<Navbar />)
    // Open the user dropdown (second button: 👤)
    fireEvent.click(screen.getAllByRole('button')[1])
    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.getByText('alice@example.com')).toBeInTheDocument()
  })

  it('toggles dropdown open and closed on avatar button click', () => {
    render(<Navbar />)
    const avatarBtn = screen.getAllByRole('button')[1]

    // Dropdown should not be visible initially
    expect(screen.queryByText(/not logged in/i)).not.toBeInTheDocument()

    // Click to open
    fireEvent.click(avatarBtn)
    expect(screen.getByText(/not logged in/i)).toBeInTheDocument()

    // Click again to close
    fireEvent.click(avatarBtn)
    expect(screen.queryByText(/not logged in/i)).not.toBeInTheDocument()
  })

  it('clears localStorage on Logout click', () => {
    localStorage.setItem('user', JSON.stringify({ username: 'Alice', email: 'alice@example.com' }))
    render(<Navbar />)
    fireEvent.click(screen.getAllByRole('button')[1])
    fireEvent.click(screen.getByText(/logout/i))
    expect(localStorage.getItem('user')).toBeNull()
  })

  it('renders Profile link in dropdown', () => {
    render(<Navbar />)
    fireEvent.click(screen.getAllByRole('button')[1])
    expect(screen.getByText(/profile/i)).toBeInTheDocument()
  })
})
