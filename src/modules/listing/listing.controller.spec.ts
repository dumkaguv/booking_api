import { ListingTypeEnum } from '@prisma/client'

import type { AuthRequest } from '@/common/types'

import { ResponseListingDto } from './dto'
import { ListingsController } from './listing.controller'
import { ListingsService } from './listing.service'

type ListingServiceMock = {
  create: jest.Mock
  findAll: jest.Mock
  findOne: jest.Mock
  remove: jest.Mock
  update: jest.Mock
}

describe('ListingsController', () => {
  let controller: ListingsController
  let service: ListingServiceMock

  beforeEach(() => {
    service = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      remove: jest.fn(),
      update: jest.fn()
    }

    controller = new ListingsController(service as unknown as ListingsService)
  })

  it('findAll delegates query and maps paginated items to DTO', async () => {
    const query = { page: 1, pageSize: 10, search: 'city' }

    service.findAll.mockResolvedValueOnce({
      data: [
        {
          id: 1,
          title: 'Loft',
          type: 'APARTMENT',
          status: 'PUBLISHED',
          country: 'Moldova',
          city: 'Chisinau',
          addressLine: 'Main 1',
          basePrice: '120.00',
          currency: 'USD',
          maxGuests: 2,
          checkInFrom: new Date('2026-03-08T14:00:00.000Z'),
          checkOutUntil: new Date('2026-03-09T11:00:00.000Z'),
          instantBook: true,
          amenities: [{ id: 1, code: 'WIFI', name: 'Wi-Fi' }],
          owner: {
            id: 7,
            username: 'owner',
            email: 'owner@mail.com',
            password: 'hidden'
          }
        }
      ],
      total: 1
    })

    const result = await controller.findAll(query)

    expect(service.findAll).toHaveBeenCalledWith(query)
    expect(result.total).toBe(1)
    expect(result.data[0]).toBeInstanceOf(ResponseListingDto)
    expect(result.data[0]).toMatchObject({
      id: 1,
      title: 'Loft',
      owner: {
        id: 7,
        username: 'owner',
        email: 'owner@mail.com'
      }
    })
    expect(
      (result.data[0].owner as unknown as Record<string, unknown>).password
    ).toBeUndefined()
  })

  it('findOne delegates to service and maps response to DTO', async () => {
    service.findOne.mockResolvedValueOnce({
      id: 3,
      title: 'Villa',
      type: 'HOUSE',
      country: 'Moldova',
      city: 'Cahul',
      addressLine: 'Lake 7',
      basePrice: '300.00',
      currency: 'EUR',
      maxGuests: 5,
      checkInFrom: new Date('2026-03-08T14:00:00.000Z'),
      checkOutUntil: new Date('2026-03-09T11:00:00.000Z'),
      instantBook: false,
      amenities: [{ id: 2, code: 'PARKING', name: 'Parking' }],
      owner: {
        id: 10,
        username: 'host',
        email: 'host@mail.com',
        password: 'hidden'
      }
    })

    const result = await controller.findOne(3)

    expect(service.findOne).toHaveBeenCalledWith(3)
    expect(result).toBeInstanceOf(ResponseListingDto)
    expect(result).toMatchObject({
      id: 3,
      title: 'Villa',
      owner: { id: 10, username: 'host', email: 'host@mail.com' }
    })
    expect((result.owner as unknown as Record<string, unknown>).password).toBe(
      undefined
    )
  })

  it('create uses current user as owner and delegates payload', async () => {
    const req = { user: { id: 11 } } as AuthRequest
    const dto = {
      title: 'Cabin',
      type: ListingTypeEnum.HOUSE,
      country: 'Moldova',
      city: 'Orhei',
      addressLine: 'Forest 2',
      basePrice: '90.50',
      currency: 'EUR',
      maxGuests: 3,
      checkInFrom: '2026-03-08T14:00:00.000Z',
      checkOutUntil: '2026-03-09T11:00:00.000Z',
      instantBook: true,
      amenityIds: [1, 2]
    }

    service.create.mockResolvedValueOnce({
      id: 77,
      ...dto,
      amenities: [
        { id: 1, code: 'WIFI', name: 'Wi-Fi' },
        { id: 2, code: 'PARKING', name: 'Parking' }
      ]
    })

    const result = await controller.create(req, dto)

    expect(service.create).toHaveBeenCalledWith(11, dto)
    expect(result).toBeInstanceOf(ResponseListingDto)
    expect(result).toMatchObject({ id: 77, title: 'Cabin' })
  })

  it('update delegates to service with listing id and current user', async () => {
    const req = { user: { id: 5 } } as AuthRequest
    const dto = { title: 'Updated title' }

    service.update.mockResolvedValueOnce({
      id: 9,
      title: 'Updated title',
      amenities: [{ id: 3, code: 'KITCHEN', name: 'Kitchen' }],
      owner: { id: 5, username: 'u', email: 'u@mail.com' }
    })

    const result = await controller.update(req, 9, dto)

    expect(service.update).toHaveBeenCalledWith(9, 5, dto)
    expect(result).toBeInstanceOf(ResponseListingDto)
    expect(result).toMatchObject({ id: 9, title: 'Updated title' })
  })

  it('remove delegates to service with listing id and current user', async () => {
    const req = { user: { id: 22 } } as AuthRequest

    service.remove.mockResolvedValueOnce({ id: 4 })

    const result = await controller.remove(req, 4)

    expect(service.remove).toHaveBeenCalledWith(4, 22)
    expect(result).toEqual({ id: 4 })
  })
})
