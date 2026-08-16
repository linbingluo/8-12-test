import { getUser, getStats, getRecentTrips, createTrip, deleteTrip, getDestinations } from '../api'

// Replace global fetch with a Jest mock before each test
beforeEach(() => {
  global.fetch = jest.fn()
})

afterEach(() => {
  jest.resetAllMocks()
})

function mockFetch(body: unknown, ok = true, status = 200) {
  ;(global.fetch as jest.Mock).mockResolvedValueOnce({
    ok,
    status,
    json: async () => body,
  })
}

describe('getUser', () => {
  it('returns user data on success', async () => {
    const user = { id: 1, email: 'a@test.com', username: 'alice', home_image_url: '', created_at: '' }
    mockFetch(user)
    const result = await getUser(1)
    expect(result.email).toBe('a@test.com')
    expect(result.username).toBe('alice')
  })

  it('throws an error when response has error field', async () => {
    mockFetch({ error: 'User not found' }, false, 404)
    await expect(getUser(999)).rejects.toThrow('User not found')
  })
})

describe('getStats', () => {
  it('returns stats summary', async () => {
    mockFetch({ total_trips: 3, total_destinations: 5, completed_trips: 1 })
    const stats = await getStats(1)
    expect(stats.total_trips).toBe(3)
    expect(stats.total_destinations).toBe(5)
  })
})

describe('getRecentTrips', () => {
  it('returns list of recent trips', async () => {
    const trips = [
      { id: 1, title: 'Paris', date_range: '2024-01', destinations_count: 2, budget: 1000, rating: 5, status: 'completed' },
    ]
    mockFetch(trips)
    const result = await getRecentTrips(1)
    expect(result).toHaveLength(1)
    expect(result[0].title).toBe('Paris')
  })
})

describe('createTrip', () => {
  it('returns created trip on success', async () => {
    const trip = { id: 10, title: 'New Trip', user_id: 1 }
    mockFetch(trip)
    const result = await createTrip({ title: 'New Trip', user_id: 1 })
    expect(result.id).toBe(10)
  })

  it('throws when response is not ok', async () => {
    mockFetch({}, false, 400)
    await expect(createTrip({ title: '' })).rejects.toThrow('Failed to create trip')
  })
})

describe('deleteTrip', () => {
  it('resolves on successful delete', async () => {
    mockFetch({ message: 'deleted' })
    await expect(deleteTrip(1)).resolves.toEqual({ message: 'deleted' })
  })

  it('throws when delete fails', async () => {
    mockFetch({}, false, 404)
    await expect(deleteTrip(999)).rejects.toThrow('Failed to delete trip')
  })
})

describe('getDestinations', () => {
  it('returns list of destinations', async () => {
    mockFetch([{ id: 1, name: 'Tokyo' }, { id: 2, name: 'London' }])
    const result = await getDestinations()
    expect(result).toHaveLength(2)
    expect(result[0].name).toBe('Tokyo')
  })
})
