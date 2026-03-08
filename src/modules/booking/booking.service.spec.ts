import { BadRequestException } from '@nestjs/common'
import { BookingStatusEnum } from '@prisma/client'

import { paginate } from '@/common/utils'
import { includeBookingWithRelations } from '@/modules/booking/constants'
import { PrismaService } from '@/prisma/prisma.service'

import { BookingsService } from './booking.service'

jest.mock('@/common/utils', () => {
  const actual = jest.requireActual('@/common/utils')

  return {
    ...actual,
    paginate: jest.fn()
  }
})

type PrismaMock = {
  $transaction: jest.Mock
  booking: {
    create: jest.Mock
    delete: jest.Mock
    findFirstOrThrow: jest.Mock
    update: jest.Mock
  }
  bookingDay: {
    createMany: jest.Mock
    deleteMany: jest.Mock
  }
  listingUnit: {
    findUniqueOrThrow: jest.Mock
  }
  unitCalendarDay: {
    findFirst: jest.Mock
  }
}

describe('BookingsService', () => {
  let prisma: PrismaMock
  let service: BookingsService
  let paginateMock: jest.MockedFunction<typeof paginate>

  beforeEach(() => {
    prisma = {
      $transaction: jest.fn(),
      booking: {
        create: jest.fn(),
        delete: jest.fn(),
        findFirstOrThrow: jest.fn(),
        update: jest.fn()
      },
      bookingDay: {
        createMany: jest.fn(),
        deleteMany: jest.fn()
      },
      listingUnit: {
        findUniqueOrThrow: jest.fn()
      },
      unitCalendarDay: {
        findFirst: jest.fn()
      }
    }

    prisma.$transaction.mockImplementation(
      (callback: (tx: PrismaMock) => Promise<unknown>) => callback(prisma)
    )

    service = new BookingsService(prisma as unknown as PrismaService)
    paginateMock = paginate as jest.MockedFunction<typeof paginate>
    paginateMock.mockReset()
  })

  it('findAll delegates to paginate with booking model and guest filter', async () => {
    const expected = { data: [], total: 0 }
    const query: Parameters<BookingsService['findAll']>[1] = {
      ordering: '-id',
      page: 1,
      pageSize: 20
    }

    paginateMock.mockResolvedValueOnce(expected)

    const result = await service.findAll(7, query)

    expect(result).toEqual(expected)
    expect(paginateMock).toHaveBeenCalledWith({
      prisma,
      model: 'booking',
      include: includeBookingWithRelations,
      where: { guestId: 7 },
      ...query
    })
  })

  it('findOne loads booking by booking id and guest id', async () => {
    const expected = { id: 4, guestId: 7 }

    prisma.booking.findFirstOrThrow.mockResolvedValueOnce(expected)

    const result = await service.findOne(4, 7)

    expect(result).toEqual(expected)
    expect(prisma.booking.findFirstOrThrow).toHaveBeenCalledWith({
      where: { id: 4, guestId: 7 },
      include: includeBookingWithRelations
    })
  })

  it('create validates unit capacity and creates booking with booking days', async () => {
    const dto = {
      unitId: 8,
      checkIn: '2026-03-08',
      checkOut: '2026-03-10',
      guestsCount: 2,
      totalAmount: '240.00',
      currency: 'EUR'
    }

    prisma.listingUnit.findUniqueOrThrow.mockResolvedValueOnce({
      id: 8,
      capacity: 3,
      listingId: 5
    })
    prisma.unitCalendarDay.findFirst.mockResolvedValueOnce(null)
    prisma.booking.create.mockResolvedValueOnce({ id: 12 })

    const result = await service.create(7, dto)

    expect(prisma.listingUnit.findUniqueOrThrow).toHaveBeenCalledWith({
      where: { id: 8 },
      select: { id: true, capacity: true, listingId: true }
    })
    expect(prisma.booking.create).toHaveBeenCalledWith({
      data: {
        unitId: 8,
        guestId: 7,
        listingId: 5,
        checkIn: new Date('2026-03-08T00:00:00.000Z'),
        checkOut: new Date('2026-03-10T00:00:00.000Z'),
        guestsCount: 2,
        status: BookingStatusEnum.PENDING,
        totalAmount: '240.00',
        currency: 'EUR',
        confirmedAt: undefined,
        cancelledAt: undefined,
        cancelReason: undefined
      },
      include: includeBookingWithRelations
    })
    expect(prisma.bookingDay.createMany).toHaveBeenCalledWith({
      data: [
        {
          bookingId: 12,
          unitId: 8,
          date: new Date('2026-03-08T00:00:00.000Z')
        },
        {
          bookingId: 12,
          unitId: 8,
          date: new Date('2026-03-09T00:00:00.000Z')
        }
      ]
    })
    expect(result).toEqual({ id: 12 })
  })

  it('create throws when guestsCount exceeds unit capacity', async () => {
    prisma.listingUnit.findUniqueOrThrow.mockResolvedValueOnce({
      id: 3,
      capacity: 1,
      listingId: 2
    })

    await expect(
      service.create(5, {
        unitId: 3,
        checkIn: '2026-03-08',
        checkOut: '2026-03-09',
        guestsCount: 2,
        totalAmount: '99.00',
        currency: 'EUR'
      })
    ).rejects.toBeInstanceOf(BadRequestException)

    expect(prisma.booking.create).not.toHaveBeenCalled()
  })

  it('create throws when date range is blocked by unit calendar', async () => {
    prisma.listingUnit.findUniqueOrThrow.mockResolvedValueOnce({
      id: 8,
      capacity: 3,
      listingId: 5
    })
    prisma.unitCalendarDay.findFirst.mockResolvedValueOnce({ id: 17 })

    await expect(
      service.create(7, {
        unitId: 8,
        checkIn: '2026-03-08',
        checkOut: '2026-03-10',
        guestsCount: 2,
        totalAmount: '240.00',
        currency: 'EUR'
      })
    ).rejects.toBeInstanceOf(BadRequestException)

    expect(prisma.booking.create).not.toHaveBeenCalled()
  })

  it('update checks ownership, updates booking and refreshes booking days', async () => {
    prisma.booking.findFirstOrThrow.mockResolvedValueOnce({
      id: 5,
      unitId: 8,
      checkIn: new Date('2026-03-08T00:00:00.000Z'),
      checkOut: new Date('2026-03-10T00:00:00.000Z'),
      guestsCount: 2,
      status: BookingStatusEnum.PENDING
    })
    prisma.listingUnit.findUniqueOrThrow.mockResolvedValueOnce({
      id: 9,
      capacity: 4,
      listingId: 7
    })
    prisma.unitCalendarDay.findFirst.mockResolvedValueOnce(null)
    prisma.booking.update.mockResolvedValueOnce({ id: 5 })

    const result = await service.update(5, 3, {
      unitId: 9,
      checkIn: '2026-03-10',
      checkOut: '2026-03-12',
      guestsCount: 3,
      status: BookingStatusEnum.CONFIRMED
    })

    expect(prisma.booking.findFirstOrThrow).toHaveBeenCalledWith({
      where: { id: 5, guestId: 3 },
      select: {
        id: true,
        unitId: true,
        checkIn: true,
        checkOut: true,
        guestsCount: true,
        status: true
      }
    })
    expect(prisma.booking.update).toHaveBeenCalledWith({
      where: { id: 5 },
      data: {
        unitId: 9,
        listingId: 7,
        checkIn: new Date('2026-03-10T00:00:00.000Z'),
        checkOut: new Date('2026-03-12T00:00:00.000Z'),
        guestsCount: 3,
        status: BookingStatusEnum.CONFIRMED
      },
      include: includeBookingWithRelations
    })
    expect(prisma.bookingDay.deleteMany).toHaveBeenCalledWith({
      where: { bookingId: 5 }
    })
    expect(prisma.bookingDay.createMany).toHaveBeenCalledWith({
      data: [
        {
          bookingId: 5,
          unitId: 9,
          date: new Date('2026-03-10T00:00:00.000Z')
        },
        {
          bookingId: 5,
          unitId: 9,
          date: new Date('2026-03-11T00:00:00.000Z')
        }
      ]
    })
    expect(result).toEqual({ id: 5 })
  })

  it('update removes booking days and skips re-create for cancelled status', async () => {
    prisma.booking.findFirstOrThrow.mockResolvedValueOnce({
      id: 6,
      unitId: 8,
      checkIn: new Date('2026-03-08T00:00:00.000Z'),
      checkOut: new Date('2026-03-10T00:00:00.000Z'),
      guestsCount: 2,
      status: BookingStatusEnum.CONFIRMED
    })
    prisma.listingUnit.findUniqueOrThrow.mockResolvedValueOnce({
      id: 8,
      capacity: 3,
      listingId: 5
    })
    prisma.unitCalendarDay.findFirst.mockResolvedValueOnce(null)
    prisma.booking.update.mockResolvedValueOnce({ id: 6 })

    await service.update(6, 2, {
      status: BookingStatusEnum.CANCELLED,
      cancelledAt: '2026-03-08T11:00:00.000Z'
    })

    expect(prisma.bookingDay.deleteMany).toHaveBeenCalledWith({
      where: { bookingId: 6 }
    })
    expect(prisma.bookingDay.createMany).not.toHaveBeenCalled()
  })

  it('remove checks ownership and deletes booking', async () => {
    prisma.booking.findFirstOrThrow.mockResolvedValueOnce({ id: 4 })
    prisma.booking.delete.mockResolvedValueOnce({ id: 4 })

    const result = await service.remove(4, 7)

    expect(prisma.booking.findFirstOrThrow).toHaveBeenCalledWith({
      where: { id: 4, guestId: 7 },
      select: { id: true }
    })
    expect(prisma.booking.delete).toHaveBeenCalledWith({
      where: { id: 4 }
    })
    expect(result).toEqual({ id: 4 })
  })
})
