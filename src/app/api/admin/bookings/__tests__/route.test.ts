import { NextRequest } from 'next/server'
import { GET } from '../route'

jest.mock('@/lib/supabase/client', () => ({
  createServerClient: jest.fn(),
  createAdminClient: jest.fn(),
}))

jest.mock('next/headers', () => ({
  cookies: jest.fn(() => ({
    get: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
  })),
}))

const { createServerClient, createAdminClient } = jest.requireMock('@/lib/supabase/client') as {
  createServerClient: jest.Mock
  createAdminClient: jest.Mock
}

const mockSession = (session: { user: { id: string } } | null) => ({
  data: { session },
})

const buildProfileQuery = (role: string) => {
  const profileQuery = {
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue({ data: { role } }),
  }
  return profileQuery
}

describe('GET /api/admin/bookings', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns 401 when there is no authenticated session', async () => {
    createServerClient.mockReturnValue({
      auth: {
        getSession: jest.fn().mockResolvedValue(mockSession(null)),
      },
    })

    const response = await GET(new NextRequest('http://localhost/api/admin/bookings'))

    expect(response.status).toBe(401)
    expect(createAdminClient).not.toHaveBeenCalled()
  })

  it('returns 403 when the user is not an admin', async () => {
    const serverSupabase = {
      auth: {
        getSession: jest.fn().mockResolvedValue(mockSession({ user: { id: 'user-1' } })),
      },
      from: jest.fn().mockImplementation((table: string) => {
        if (table === 'profiles') {
          return buildProfileQuery('customer')
        }
        throw new Error(`Unexpected table ${table}`)
      }),
    }

    createServerClient.mockReturnValue(serverSupabase)
    createAdminClient.mockImplementation(() => {
      throw new Error('createAdminClient should not be called for non-admin users')
    })

    const response = await GET(new NextRequest('http://localhost/api/admin/bookings'))

    expect(response.status).toBe(403)
  })

  it('returns normalized bookings data for venue admins', async () => {
    const serverSupabase = {
      auth: {
        getSession: jest.fn().mockResolvedValue(mockSession({ user: { id: 'user-1' } })),
      },
      from: jest.fn().mockImplementation((table: string) => {
        if (table === 'profiles') {
          return buildProfileQuery('venue_admin')
        }
        throw new Error(`Unexpected table ${table}`)
      }),
    }

    createServerClient.mockReturnValue(serverSupabase)

    const venueAssignments = [{ venue_id: 'venue-1' }]
    const courts = [{ id: 'court-1', venue_id: 'venue-1' }]
    const bookings = [
      {
        id: 'booking-1',
        booking_number: 'BK-001',
        status: 'pending',
        start_datetime: '2025-01-01T10:00:00Z',
        end_datetime: '2025-01-01T11:00:00Z',
        total_amount: 120,
        final_amount: 100,
        user: { id: 'user-2', full_name: 'Jane Doe', email: 'jane@example.com' },
        court: {
          id: 'court-1',
          name: 'Central Court',
          venue_id: 'venue-1',
          venue: { id: 'venue-1', name: 'Main Venue' },
        },
        payments: [
          {
            id: 'payment-1',
            payment_status: 'completed',
            amount: 100,
            payment_method: 'stripe',
            created_at: '2024-12-31T23:55:00Z',
          },
        ],
      },
    ]

    const createChainableQuery = <T>(rangeResult: { data: T; error: null; count: number }) => {
      const query: {
        select: jest.Mock
        in: jest.Mock
        order: jest.Mock
        eq: jest.Mock
        ilike: jest.Mock
        range: jest.Mock
      } = {
        select: jest.fn(),
        in: jest.fn(),
        order: jest.fn(),
        eq: jest.fn(),
        ilike: jest.fn(),
        range: jest.fn(),
      }

      query.select.mockReturnValue(query)
      query.in.mockReturnValue(query)
      query.order.mockReturnValue(query)
      query.eq.mockReturnValue(query)
      query.ilike.mockReturnValue(query)
      query.range.mockResolvedValue(rangeResult)

      return query
    }

    const adminClient = {
      from: jest.fn().mockImplementation((table: string) => {
        if (table === 'venue_admins') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockResolvedValue({ data: venueAssignments, error: null }),
            }),
          }
        }

        if (table === 'courts') {
          return {
            select: jest.fn().mockReturnValue({
              in: jest.fn().mockResolvedValue({ data: courts, error: null }),
            }),
          }
        }

        if (table === 'bookings') {
          return createChainableQuery({ data: bookings, error: null, count: bookings.length })
        }

        if (table === 'venues') {
          return {
            select: jest.fn().mockReturnValue({
              in: jest.fn().mockResolvedValue({ data: [{ id: 'venue-1', name: 'Main Venue' }], error: null }),
            }),
          }
        }

        throw new Error(`Unexpected table ${table}`)
      }),
    }

    createAdminClient.mockReturnValue(adminClient)

    const response = await GET(new NextRequest('http://localhost/api/admin/bookings'))

    expect(response.status).toBe(200)
    const payload = await response.json()

    expect(Array.isArray(payload.bookings)).toBe(true)
    expect(payload.bookings).toHaveLength(1)
    expect(payload.bookings[0]).toMatchObject({
      id: 'booking-1',
      bookingNumber: 'BK-001',
      status: 'pending',
      venueName: 'Main Venue',
      court: {
        id: 'court-1',
        name: 'Central Court',
      },
      latestPayment: {
        id: 'payment-1',
        payment_status: 'completed',
      },
    })
    expect(payload.total).toBe(1)
  })
})
