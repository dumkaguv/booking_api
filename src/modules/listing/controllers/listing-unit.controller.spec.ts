import type { AuthRequest } from '@/common/types'

import { ResponseListingUnitDto } from '../dto'
import { ListingUnitsService } from '../services'
import { ListingUnitsController } from './listing-unit.controller'

type ListingUnitServiceMock = {
  create: jest.Mock
  findAll: jest.Mock
  findOne: jest.Mock
  remove: jest.Mock
  update: jest.Mock
}

describe('ListingUnitsController', () => {
  let controller: ListingUnitsController
  let service: ListingUnitServiceMock

  beforeEach(() => {
    service = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      remove: jest.fn(),
      update: jest.fn()
    }

    controller = new ListingUnitsController(
      service as unknown as ListingUnitsService
    )
  })

  it('findAll delegates query and maps paginated items to DTO', async () => {
    const query = { page: 1, pageSize: 10 }

    service.findAll.mockResolvedValueOnce({
      data: [
        {
          id: 1,
          name: 'Apartment A1',
          capacity: 3,
          isActive: true,
          listingId: 7,
          createdAt: new Date('2026-03-08T10:00:00.000Z'),
          updatedAt: new Date('2026-03-08T10:00:00.000Z')
        }
      ],
      total: 1
    })

    const result = await controller.findAll(7, query)

    expect(service.findAll).toHaveBeenCalledWith(7, query)
    expect(result.total).toBe(1)
    expect(result.data[0]).toBeInstanceOf(ResponseListingUnitDto)
    expect(result.data[0]).toMatchObject({
      id: 1,
      name: 'Apartment A1'
    })
    expect(
      (result.data[0] as unknown as Record<string, unknown>).listingId
    ).toBeUndefined()
  })

  it('findOne delegates to service and maps response to DTO', async () => {
    service.findOne.mockResolvedValueOnce({
      id: 5,
      name: 'Room 101',
      capacity: 2,
      isActive: true,
      listingId: 3,
      createdAt: new Date('2026-03-08T10:00:00.000Z'),
      updatedAt: new Date('2026-03-08T10:00:00.000Z')
    })

    const result = await controller.findOne(3, 5)

    expect(service.findOne).toHaveBeenCalledWith(3, 5)
    expect(result).toBeInstanceOf(ResponseListingUnitDto)
    expect(result).toMatchObject({
      id: 5,
      name: 'Room 101'
    })
    expect(
      (result as unknown as Record<string, unknown>).listingId
    ).toBeUndefined()
  })

  it('create uses current user as owner and delegates payload', async () => {
    const req = { user: { id: 9 } } as AuthRequest
    const dto = {
      name: 'Garden Studio',
      capacity: 2,
      isActive: false
    }

    service.create.mockResolvedValueOnce({
      id: 12,
      listingId: 4,
      ...dto
    })

    const result = await controller.create(req, 4, dto)

    expect(service.create).toHaveBeenCalledWith(4, 9, dto)
    expect(result).toBeInstanceOf(ResponseListingUnitDto)
    expect(result).toMatchObject({
      id: 12,
      name: 'Garden Studio'
    })
    expect(
      (result as unknown as Record<string, unknown>).listingId
    ).toBeUndefined()
  })

  it('update delegates to service with listing id, unit id and current user', async () => {
    const req = { user: { id: 9 } } as AuthRequest
    const dto = { isActive: true }

    service.update.mockResolvedValueOnce({
      id: 12,
      listingId: 4,
      name: 'Garden Studio',
      capacity: 2,
      isActive: true
    })

    const result = await controller.update(req, 4, 12, dto)

    expect(service.update).toHaveBeenCalledWith(4, 12, 9, dto)
    expect(result).toBeInstanceOf(ResponseListingUnitDto)
    expect(result).toMatchObject({
      id: 12,
      isActive: true
    })
    expect(
      (result as unknown as Record<string, unknown>).listingId
    ).toBeUndefined()
  })

  it('remove delegates to service with listing id, unit id and current user', async () => {
    const req = { user: { id: 15 } } as AuthRequest

    service.remove.mockResolvedValueOnce({ id: 3 })

    const result = await controller.remove(req, 8, 3)

    expect(service.remove).toHaveBeenCalledWith(8, 3, 15)
    expect(result).toEqual({ id: 3 })
  })
})
