import { BookingStatusEnum } from '@prisma/client'

import { prisma } from '../prisma-client'

type UserRef = { id: number; username: string }
type UnitRef = { id: number }
type ListingRef = { id: number }

type SeedBooking = {
  unitIndex: number
  guestUsername: string
  listingIndex?: number
  checkIn: Date
  checkOut: Date
  guestsCount: number
  status: BookingStatusEnum
  totalAmount: number
  currency: string
  confirmedAt?: Date
  cancelledAt?: Date
  cancelReason?: string
}

const bookings: SeedBooking[] = [
  {
    unitIndex: 0,
    guestUsername: 'maria',
    listingIndex: 0,
    checkIn: new Date('2026-06-15'),
    checkOut: new Date('2026-06-18'),
    guestsCount: 2,
    status: BookingStatusEnum.CONFIRMED,
    totalAmount: 165,
    currency: 'EUR',
    confirmedAt: new Date('2026-06-01T10:30:00.000Z')
  },
  {
    unitIndex: 2,
    guestUsername: 'john',
    listingIndex: 1,
    checkIn: new Date('2026-05-10'),
    checkOut: new Date('2026-05-13'),
    guestsCount: 4,
    status: BookingStatusEnum.COMPLETED,
    totalAmount: 285,
    currency: 'EUR',
    confirmedAt: new Date('2026-05-01T09:15:00.000Z')
  },
  {
    unitIndex: 4,
    guestUsername: 'ivan',
    listingIndex: 2,
    checkIn: new Date('2026-07-02'),
    checkOut: new Date('2026-07-05'),
    guestsCount: 1,
    status: BookingStatusEnum.CANCELLED,
    totalAmount: 90,
    currency: 'EUR',
    cancelledAt: new Date('2026-06-25T08:00:00.000Z'),
    cancelReason: 'Guest changed travel plans'
  },
  {
    unitIndex: 0,
    guestUsername: 'john',
    listingIndex: 0,
    checkIn: new Date('2026-05-01'),
    checkOut: new Date('2026-05-04'),
    guestsCount: 2,
    status: BookingStatusEnum.COMPLETED,
    totalAmount: 150,
    currency: 'EUR',
    confirmedAt: new Date('2026-04-20T10:00:00.000Z')
  },
  {
    unitIndex: 1,
    guestUsername: 'elena',
    listingIndex: 0,
    checkIn: new Date('2026-06-20'),
    checkOut: new Date('2026-06-22'),
    guestsCount: 2,
    status: BookingStatusEnum.PENDING,
    totalAmount: 100,
    currency: 'EUR'
  },
  {
    unitIndex: 2,
    guestUsername: 'olga',
    listingIndex: 1,
    checkIn: new Date('2026-07-01'),
    checkOut: new Date('2026-07-05'),
    guestsCount: 5,
    status: BookingStatusEnum.CONFIRMED,
    totalAmount: 420,
    currency: 'EUR',
    confirmedAt: new Date('2026-06-10T09:45:00.000Z')
  },
  {
    unitIndex: 3,
    guestUsername: 'ivan',
    listingIndex: 1,
    checkIn: new Date('2026-07-15'),
    checkOut: new Date('2026-07-18'),
    guestsCount: 2,
    status: BookingStatusEnum.CANCELLED,
    totalAmount: 210,
    currency: 'EUR',
    cancelledAt: new Date('2026-07-01T08:00:00.000Z'),
    cancelReason: 'Payment failed'
  },
  {
    unitIndex: 5,
    guestUsername: 'emma',
    listingIndex: 2,
    checkIn: new Date('2026-04-11'),
    checkOut: new Date('2026-04-14'),
    guestsCount: 1,
    status: BookingStatusEnum.COMPLETED,
    totalAmount: 84,
    currency: 'EUR',
    confirmedAt: new Date('2026-04-01T09:00:00.000Z')
  },
  {
    unitIndex: 6,
    guestUsername: 'nikita',
    listingIndex: 3,
    checkIn: new Date('2026-08-03'),
    checkOut: new Date('2026-08-08'),
    guestsCount: 4,
    status: BookingStatusEnum.CONFIRMED,
    totalAmount: 1100,
    currency: 'EUR',
    confirmedAt: new Date('2026-07-10T11:00:00.000Z')
  },
  {
    unitIndex: 7,
    guestUsername: 'maria',
    listingIndex: 3,
    checkIn: new Date('2026-08-10'),
    checkOut: new Date('2026-08-12'),
    guestsCount: 3,
    status: BookingStatusEnum.PENDING,
    totalAmount: 440,
    currency: 'EUR'
  },
  {
    unitIndex: 8,
    guestUsername: 'daniel',
    listingIndex: 4,
    checkIn: new Date('2026-03-20'),
    checkOut: new Date('2026-03-23'),
    guestsCount: 2,
    status: BookingStatusEnum.COMPLETED,
    totalAmount: 360,
    currency: 'EUR',
    confirmedAt: new Date('2026-03-01T12:00:00.000Z')
  },
  {
    unitIndex: 9,
    guestUsername: 'sophia',
    listingIndex: 4,
    checkIn: new Date('2026-09-01'),
    checkOut: new Date('2026-09-03'),
    guestsCount: 1,
    status: BookingStatusEnum.EXPIRED,
    totalAmount: 240,
    currency: 'EUR'
  },
  {
    unitIndex: 10,
    guestUsername: 'alex',
    listingIndex: 5,
    checkIn: new Date('2026-06-05'),
    checkOut: new Date('2026-06-09'),
    guestsCount: 1,
    status: BookingStatusEnum.CONFIRMED,
    totalAmount: 88,
    currency: 'EUR',
    confirmedAt: new Date('2026-06-01T07:30:00.000Z')
  },
  {
    unitIndex: 11,
    guestUsername: 'elena',
    listingIndex: 5,
    checkIn: new Date('2026-06-12'),
    checkOut: new Date('2026-06-14'),
    guestsCount: 1,
    status: BookingStatusEnum.PENDING,
    totalAmount: 44,
    currency: 'EUR'
  },
  {
    unitIndex: 12,
    guestUsername: 'ivan',
    listingIndex: 6,
    checkIn: new Date('2026-07-20'),
    checkOut: new Date('2026-07-22'),
    guestsCount: 2,
    status: BookingStatusEnum.COMPLETED,
    totalAmount: 140,
    currency: 'EUR',
    confirmedAt: new Date('2026-07-01T10:10:00.000Z')
  },
  {
    unitIndex: 13,
    guestUsername: 'john',
    listingIndex: 6,
    checkIn: new Date('2026-07-20'),
    checkOut: new Date('2026-07-24'),
    guestsCount: 2,
    status: BookingStatusEnum.CANCELLED,
    totalAmount: 280,
    currency: 'EUR',
    cancelledAt: new Date('2026-07-18T16:30:00.000Z'),
    cancelReason: 'Host unavailable'
  },
  {
    unitIndex: 14,
    guestUsername: 'emma',
    listingIndex: 7,
    checkIn: new Date('2026-09-10'),
    checkOut: new Date('2026-09-15'),
    guestsCount: 3,
    status: BookingStatusEnum.CONFIRMED,
    totalAmount: 700,
    currency: 'EUR',
    confirmedAt: new Date('2026-08-20T15:00:00.000Z')
  },
  {
    unitIndex: 15,
    guestUsername: 'maria',
    listingIndex: 7,
    checkIn: new Date('2026-10-01'),
    checkOut: new Date('2026-10-04'),
    guestsCount: 2,
    status: BookingStatusEnum.COMPLETED,
    totalAmount: 360,
    currency: 'EUR',
    confirmedAt: new Date('2026-09-15T09:00:00.000Z')
  },
  {
    unitIndex: 16,
    guestUsername: 'olga',
    listingIndex: 8,
    checkIn: new Date('2026-05-25'),
    checkOut: new Date('2026-05-28'),
    guestsCount: 2,
    status: BookingStatusEnum.PENDING,
    totalAmount: 480,
    currency: 'EUR'
  },
  {
    unitIndex: 17,
    guestUsername: 'daniel',
    listingIndex: 8,
    checkIn: new Date('2026-06-30'),
    checkOut: new Date('2026-07-03'),
    guestsCount: 2,
    status: BookingStatusEnum.COMPLETED,
    totalAmount: 510,
    currency: 'EUR',
    confirmedAt: new Date('2026-06-01T12:15:00.000Z')
  },
  {
    unitIndex: 18,
    guestUsername: 'sophia',
    listingIndex: 9,
    checkIn: new Date('2026-11-11'),
    checkOut: new Date('2026-11-13'),
    guestsCount: 2,
    status: BookingStatusEnum.CONFIRMED,
    totalAmount: 96,
    currency: 'EUR',
    confirmedAt: new Date('2026-10-20T08:45:00.000Z')
  },
  {
    unitIndex: 19,
    guestUsername: 'nikita',
    listingIndex: 9,
    checkIn: new Date('2026-11-15'),
    checkOut: new Date('2026-11-17'),
    guestsCount: 2,
    status: BookingStatusEnum.CANCELLED,
    totalAmount: 92,
    currency: 'EUR',
    cancelledAt: new Date('2026-11-01T09:30:00.000Z'),
    cancelReason: 'Visa issue'
  },
  {
    unitIndex: 20,
    guestUsername: 'maria',
    listingIndex: 10,
    checkIn: new Date('2026-12-05'),
    checkOut: new Date('2026-12-08'),
    guestsCount: 2,
    status: BookingStatusEnum.CONFIRMED,
    totalAmount: 132,
    currency: 'EUR',
    confirmedAt: new Date('2026-11-20T09:00:00.000Z')
  },
  {
    unitIndex: 21,
    guestUsername: 'olga',
    listingIndex: 10,
    checkIn: new Date('2026-12-12'),
    checkOut: new Date('2026-12-14'),
    guestsCount: 2,
    status: BookingStatusEnum.COMPLETED,
    totalAmount: 88,
    currency: 'EUR',
    confirmedAt: new Date('2026-11-28T14:00:00.000Z')
  }
]

export const createBookings = (
  users: UserRef[],
  units: UnitRef[],
  listings: ListingRef[]
) => {
  const usersByUsername = new Map(users.map((user) => [user.username, user.id]))

  return prisma.$transaction(
    bookings.map((booking) => {
      const guestId = usersByUsername.get(booking.guestUsername)
      const unit = units[booking.unitIndex]
      const listing =
        typeof booking.listingIndex === 'number'
          ? listings[booking.listingIndex]
          : undefined

      if (!guestId) {
        throw new Error(
          `Guest "${booking.guestUsername}" not found for booking seed`
        )
      }

      if (!unit) {
        throw new Error(
          `Unit index "${booking.unitIndex}" not found for booking seed`
        )
      }

      if (typeof booking.listingIndex === 'number' && !listing) {
        throw new Error(
          `Listing index "${booking.listingIndex}" not found for booking seed`
        )
      }

      return prisma.booking.create({
        data: {
          unitId: unit.id,
          guestId,
          listingId: listing?.id,
          checkIn: booking.checkIn,
          checkOut: booking.checkOut,
          guestsCount: booking.guestsCount,
          status: booking.status,
          totalAmount: booking.totalAmount,
          currency: booking.currency,
          confirmedAt: booking.confirmedAt,
          cancelledAt: booking.cancelledAt,
          cancelReason: booking.cancelReason
        }
      })
    })
  )
}
