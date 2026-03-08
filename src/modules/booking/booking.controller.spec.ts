import { BookingStatusEnum } from '@prisma/client'

import type { AuthRequest } from '@/common/types'

import { BookingsController } from './booking.controller'
import { BookingsService } from './booking.service'
import { ResponseBookingDto } from './dto'

type BookingServiceMock = {
  create: jest.Mock
  findAll: jest.Mock
  findOne: jest.Mock
  remove: jest.Mock
  update: jest.Mock
}

describe('BookingsController', () => {
  let controller: BookingsController
  let service: BookingServiceMock

  beforeEach(() => {
    service = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      remove: jest.fn(),
      update: jest.fn()
    }

    controller = new BookingsController(service as unknown as BookingsService)
  })

  it('findAll delegates query and maps paginated items to DTO', async () => {
    const req = { user: { id: 7 } } as AuthRequest
    const query = { page: 1, pageSize: 10 }

    service.findAll.mockResolvedValueOnce({
      data: [
        {
          id: 1,
          unitId: 3,
          guestId: 7,
          listingId: 2,
          unit: {
            id: 3,
            name: 'A1',
            capacity: 2,
            isActive: true,
            listingId: 2
          },
          guest: {
            id: 7,
            username: 'guest',
            email: 'guest@mail.com',
            password: 'hidden'
          },
          listing: {
            id: 2,
            title: 'Loft',
            country: 'Moldova',
            city: 'Chisinau',
            addressLine: 'Main 1',
            basePrice: '120.00',
            currency: 'EUR',
            maxGuests: 2,
            checkInFrom: new Date('2026-03-08T00:00:00.000Z'),
            checkOutUntil: new Date('2026-03-10T00:00:00.000Z'),
            instantBook: true,
            owner: { id: 22, username: 'host', email: 'host@mail.com' },
            amenities: [],
            listingUnits: [{ id: 3, name: 'A1', capacity: 2, isActive: true }]
          },
          checkIn: new Date('2026-03-08T00:00:00.000Z'),
          checkOut: new Date('2026-03-10T00:00:00.000Z'),
          guestsCount: 2,
          status: BookingStatusEnum.PENDING,
          totalAmount: '120.00',
          currency: 'EUR',
          createdAt: new Date('2026-03-08T10:00:00.000Z'),
          updatedAt: new Date('2026-03-08T10:00:00.000Z')
        }
      ],
      total: 1
    })

    const result = await controller.findAll(req, query)

    expect(service.findAll).toHaveBeenCalledWith(7, query)
    expect(result.total).toBe(1)
    expect(result.data[0]).toBeInstanceOf(ResponseBookingDto)
    expect(result.data[0]).toMatchObject({
      id: 1,
      guestId: 7,
      status: BookingStatusEnum.PENDING,
      unit: { id: 3 },
      guest: { id: 7, username: 'guest' }
    })
    expect(
      (result.data[0].guest as unknown as Record<string, unknown>).password
    ).toBeUndefined()
  })

  it('findOne delegates to service and maps response to DTO', async () => {
    const req = { user: { id: 9 } } as AuthRequest

    service.findOne.mockResolvedValueOnce({
      id: 5,
      unitId: 8,
      guestId: 9,
      listingId: 4,
      unit: {
        id: 8,
        name: 'Room 1',
        capacity: 2,
        isActive: true,
        listingId: 4
      },
      guest: {
        id: 9,
        username: 'maria',
        email: 'maria@mail.com',
        password: 'hidden'
      },
      listing: {
        id: 4,
        title: 'Villa',
        country: 'Moldova',
        city: 'Cahul',
        addressLine: 'Lake 7',
        basePrice: '300.00',
        currency: 'EUR',
        maxGuests: 5,
        checkInFrom: new Date('2026-03-08T00:00:00.000Z'),
        checkOutUntil: new Date('2026-03-12T00:00:00.000Z'),
        instantBook: false,
        owner: { id: 10, username: 'host', email: 'host@mail.com' },
        amenities: [],
        listingUnits: [{ id: 8, name: 'Room 1', capacity: 2, isActive: true }]
      },
      checkIn: new Date('2026-03-10T00:00:00.000Z'),
      checkOut: new Date('2026-03-12T00:00:00.000Z'),
      guestsCount: 2,
      status: BookingStatusEnum.CONFIRMED,
      totalAmount: '220.00',
      currency: 'EUR'
    })

    const result = await controller.findOne(req, 5)

    expect(service.findOne).toHaveBeenCalledWith(5, 9)
    expect(result).toBeInstanceOf(ResponseBookingDto)
    expect(result).toMatchObject({
      id: 5,
      status: BookingStatusEnum.CONFIRMED,
      unit: { id: 8 },
      guest: { id: 9, username: 'maria' }
    })
    expect((result.guest as unknown as Record<string, unknown>).password).toBe(
      undefined
    )
  })

  it('create uses current user as guest and delegates payload', async () => {
    const req = { user: { id: 11 } } as AuthRequest
    const dto = {
      unitId: 4,
      checkIn: '2026-03-08',
      checkOut: '2026-03-10',
      guestsCount: 2,
      totalAmount: '150.00',
      currency: 'EUR'
    }

    service.create.mockResolvedValueOnce({
      id: 21,
      guestId: 11,
      ...dto,
      status: BookingStatusEnum.PENDING,
      unit: {
        id: 4,
        name: 'Studio',
        capacity: 2,
        isActive: true,
        listingId: 3
      },
      guest: { id: 11, username: 'u', email: 'u@mail.com' },
      listing: {
        id: 3,
        title: 'Flat',
        country: 'Moldova',
        city: 'Chisinau',
        addressLine: 'Street 10',
        basePrice: '90.00',
        currency: 'EUR',
        maxGuests: 3,
        checkInFrom: new Date('2026-03-08T00:00:00.000Z'),
        checkOutUntil: new Date('2026-03-10T00:00:00.000Z'),
        instantBook: true,
        owner: { id: 4, username: 'host', email: 'host@mail.com' },
        amenities: [],
        listingUnits: [{ id: 4, name: 'Studio', capacity: 2, isActive: true }]
      }
    })

    const result = await controller.create(req, dto)

    expect(service.create).toHaveBeenCalledWith(11, dto)
    expect(result).toBeInstanceOf(ResponseBookingDto)
    expect(result).toMatchObject({
      id: 21,
      guestId: 11,
      status: BookingStatusEnum.PENDING,
      unit: { id: 4 },
      listing: { id: 3 }
    })
  })

  it('update delegates to service with booking id and current user', async () => {
    const req = { user: { id: 7 } } as AuthRequest
    const dto = {
      status: BookingStatusEnum.CANCELLED,
      cancelReason: 'Change of plans'
    }

    service.update.mockResolvedValueOnce({
      id: 6,
      guestId: 7,
      status: BookingStatusEnum.CANCELLED,
      cancelReason: 'Change of plans',
      unit: { id: 3, name: 'A1', capacity: 2, isActive: true, listingId: 2 },
      guest: { id: 7, username: 'guest', email: 'guest@mail.com' },
      listing: {
        id: 2,
        title: 'Loft',
        country: 'Moldova',
        city: 'Chisinau',
        addressLine: 'Main 1',
        basePrice: '120.00',
        currency: 'EUR',
        maxGuests: 2,
        checkInFrom: new Date('2026-03-08T00:00:00.000Z'),
        checkOutUntil: new Date('2026-03-10T00:00:00.000Z'),
        instantBook: true,
        owner: { id: 22, username: 'host', email: 'host@mail.com' },
        amenities: [],
        listingUnits: [{ id: 3, name: 'A1', capacity: 2, isActive: true }]
      }
    })

    const result = await controller.update(req, 6, dto)

    expect(service.update).toHaveBeenCalledWith(6, 7, dto)
    expect(result).toBeInstanceOf(ResponseBookingDto)
    expect(result).toMatchObject({
      id: 6,
      status: BookingStatusEnum.CANCELLED,
      unit: { id: 3 }
    })
  })

  it('remove delegates booking id and current user to service', async () => {
    const req = { user: { id: 12 } } as AuthRequest

    service.remove.mockResolvedValueOnce({ id: 9 })

    const result = await controller.remove(req, 9)

    expect(service.remove).toHaveBeenCalledWith(9, 12)
    expect(result).toEqual({ id: 9 })
  })
})
