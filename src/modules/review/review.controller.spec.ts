import type { AuthRequest } from '@/common/types'

import { ResponseReviewDto } from './dto'
import { ReviewsController } from './review.controller'
import { ReviewsService } from './review.service'

type ReviewServiceMock = {
  create: jest.Mock
  findAll: jest.Mock
  findOne: jest.Mock
  remove: jest.Mock
  update: jest.Mock
}

describe('ReviewsController', () => {
  let controller: ReviewsController
  let service: ReviewServiceMock

  beforeEach(() => {
    service = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      remove: jest.fn(),
      update: jest.fn()
    }

    controller = new ReviewsController(service as unknown as ReviewsService)
  })

  it('findAll delegates query and maps paginated items to DTO', async () => {
    const query = { page: 1, pageSize: 10 }

    service.findAll.mockResolvedValueOnce({
      data: [
        {
          id: 1,
          booking: {
            id: 3,
            unitId: 5,
            guestId: 7,
            listingId: 2,
            unit: {
              id: 5,
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
              basePrice: '100.00',
              currency: 'EUR',
              maxGuests: 2,
              checkInFrom: new Date('2026-03-08T00:00:00.000Z'),
              checkOutUntil: new Date('2026-03-10T00:00:00.000Z'),
              instantBook: true,
              owner: { id: 20, username: 'host', email: 'host@mail.com' },
              amenities: [],
              listingUnits: [{ id: 5, name: 'A1', capacity: 2, isActive: true }]
            }
          },
          listing: {
            id: 2,
            title: 'Loft',
            country: 'Moldova',
            city: 'Chisinau',
            addressLine: 'Main 1',
            basePrice: '100.00',
            currency: 'EUR',
            maxGuests: 2,
            checkInFrom: new Date('2026-03-08T00:00:00.000Z'),
            checkOutUntil: new Date('2026-03-10T00:00:00.000Z'),
            instantBook: true,
            owner: { id: 20, username: 'host', email: 'host@mail.com' },
            amenities: [],
            listingUnits: [{ id: 5, name: 'A1', capacity: 2, isActive: true }]
          },
          author: {
            id: 7,
            username: 'guest',
            email: 'guest@mail.com',
            password: 'hidden'
          },
          rating: 5,
          comment: 'Great stay',
          createdAt: new Date('2026-03-08T10:00:00.000Z'),
          updatedAt: new Date('2026-03-08T10:00:00.000Z')
        }
      ],
      total: 1
    })

    const result = await controller.findAll(query)

    expect(service.findAll).toHaveBeenCalledWith(query)
    expect(result.total).toBe(1)
    expect(result.data[0]).toBeInstanceOf(ResponseReviewDto)
    expect(result.data[0]).toMatchObject({
      id: 1,
      rating: 5,
      booking: { id: 3 },
      author: { id: 7, username: 'guest' }
    })
    expect(
      (result.data[0] as unknown as Record<string, unknown>).bookingId
    ).toBeUndefined()
    expect(
      (result.data[0] as unknown as Record<string, unknown>).listingId
    ).toBeUndefined()
    expect(
      (result.data[0] as unknown as Record<string, unknown>).authorId
    ).toBeUndefined()
    expect(
      (result.data[0].author as unknown as Record<string, unknown>).password
    ).toBeUndefined()
  })

  it('findOne delegates to service and maps response to DTO', async () => {
    service.findOne.mockResolvedValueOnce({
      id: 2,
      booking: {
        id: 5,
        unitId: 8,
        guestId: 8,
        listingId: 4,
        unit: {
          id: 8,
          name: 'Room 1',
          capacity: 2,
          isActive: true,
          listingId: 4
        },
        guest: {
          id: 8,
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
          basePrice: '250.00',
          currency: 'EUR',
          maxGuests: 5,
          checkInFrom: new Date('2026-03-08T00:00:00.000Z'),
          checkOutUntil: new Date('2026-03-12T00:00:00.000Z'),
          instantBook: false,
          owner: { id: 10, username: 'host', email: 'host@mail.com' },
          amenities: [],
          listingUnits: [{ id: 8, name: 'Room 1', capacity: 2, isActive: true }]
        }
      },
      listing: {
        id: 4,
        title: 'Villa',
        country: 'Moldova',
        city: 'Cahul',
        addressLine: 'Lake 7',
        basePrice: '250.00',
        currency: 'EUR',
        maxGuests: 5,
        checkInFrom: new Date('2026-03-08T00:00:00.000Z'),
        checkOutUntil: new Date('2026-03-12T00:00:00.000Z'),
        instantBook: false,
        owner: { id: 10, username: 'host', email: 'host@mail.com' },
        amenities: [],
        listingUnits: [{ id: 8, name: 'Room 1', capacity: 2, isActive: true }]
      },
      author: {
        id: 8,
        username: 'maria',
        email: 'maria@mail.com',
        password: 'hidden'
      },
      rating: 4,
      comment: 'Nice host'
    })

    const result = await controller.findOne(2)

    expect(service.findOne).toHaveBeenCalledWith(2)
    expect(result).toBeInstanceOf(ResponseReviewDto)
    expect(result).toMatchObject({
      id: 2,
      booking: { id: 5 },
      author: { id: 8, username: 'maria' }
    })
    expect(
      (result as unknown as Record<string, unknown>).bookingId
    ).toBeUndefined()
    expect(
      (result as unknown as Record<string, unknown>).listingId
    ).toBeUndefined()
    expect(
      (result as unknown as Record<string, unknown>).authorId
    ).toBeUndefined()
    expect(
      (result.author as unknown as Record<string, unknown>).password
    ).toBeUndefined()
  })

  it('create uses current user as author and delegates payload', async () => {
    const req = { user: { id: 11 } } as AuthRequest
    const dto = {
      bookingId: 9,
      rating: 5,
      comment: 'Perfect'
    }

    service.create.mockResolvedValueOnce({
      id: 7,
      rating: dto.rating,
      comment: dto.comment,
      booking: {
        id: 9,
        unitId: 4,
        guestId: 11,
        listingId: 3,
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
      },
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
      },
      author: { id: 11, username: 'u', email: 'u@mail.com' }
    })

    const result = await controller.create(req, dto)

    expect(service.create).toHaveBeenCalledWith(11, dto)
    expect(result).toBeInstanceOf(ResponseReviewDto)
    expect(result).toMatchObject({
      id: 7,
      author: { id: 11, username: 'u' }
    })
    expect(
      (result as unknown as Record<string, unknown>).authorId
    ).toBeUndefined()
  })

  it('update delegates to service with review id and current user', async () => {
    const req = { user: { id: 7 } } as AuthRequest
    const dto = {
      rating: 3,
      comment: 'Updated'
    }

    service.update.mockResolvedValueOnce({
      id: 5,
      rating: dto.rating,
      comment: dto.comment,
      booking: {
        id: 3,
        unitId: 5,
        guestId: 7,
        listingId: 2,
        unit: { id: 5, name: 'A1', capacity: 2, isActive: true, listingId: 2 },
        guest: { id: 7, username: 'guest', email: 'guest@mail.com' },
        listing: {
          id: 2,
          title: 'Loft',
          country: 'Moldova',
          city: 'Chisinau',
          addressLine: 'Main 1',
          basePrice: '100.00',
          currency: 'EUR',
          maxGuests: 2,
          checkInFrom: new Date('2026-03-08T00:00:00.000Z'),
          checkOutUntil: new Date('2026-03-10T00:00:00.000Z'),
          instantBook: true,
          owner: { id: 20, username: 'host', email: 'host@mail.com' },
          amenities: [],
          listingUnits: [{ id: 5, name: 'A1', capacity: 2, isActive: true }]
        }
      },
      listing: {
        id: 2,
        title: 'Loft',
        country: 'Moldova',
        city: 'Chisinau',
        addressLine: 'Main 1',
        basePrice: '100.00',
        currency: 'EUR',
        maxGuests: 2,
        checkInFrom: new Date('2026-03-08T00:00:00.000Z'),
        checkOutUntil: new Date('2026-03-10T00:00:00.000Z'),
        instantBook: true,
        owner: { id: 20, username: 'host', email: 'host@mail.com' },
        amenities: [],
        listingUnits: [{ id: 5, name: 'A1', capacity: 2, isActive: true }]
      },
      author: { id: 7, username: 'guest', email: 'guest@mail.com' }
    })

    const result = await controller.update(req, 5, dto)

    expect(service.update).toHaveBeenCalledWith(5, 7, dto)
    expect(result).toBeInstanceOf(ResponseReviewDto)
    expect(result).toMatchObject({
      id: 5,
      rating: 3,
      author: { id: 7, username: 'guest' }
    })
    expect(
      (result as unknown as Record<string, unknown>).authorId
    ).toBeUndefined()
  })

  it('remove delegates review id and current user to service', async () => {
    const req = { user: { id: 4 } } as AuthRequest

    service.remove.mockResolvedValueOnce({ id: 3 })

    const result = await controller.remove(req, 3)

    expect(service.remove).toHaveBeenCalledWith(3, 4)
    expect(result).toEqual({ id: 3 })
  })
})
