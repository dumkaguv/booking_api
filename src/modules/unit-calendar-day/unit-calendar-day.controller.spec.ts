import type { AuthRequest } from '@/common/types'

import { ResponseUnitCalendarDayDto } from './dto'
import { UnitCalendarDaysController } from './unit-calendar-day.controller'
import { UnitCalendarDaysService } from './unit-calendar-day.service'

type UnitCalendarDayServiceMock = {
  create: jest.Mock
  findAll: jest.Mock
  findOne: jest.Mock
  remove: jest.Mock
  update: jest.Mock
}

describe('UnitCalendarDaysController', () => {
  let controller: UnitCalendarDaysController
  let service: UnitCalendarDayServiceMock

  beforeEach(() => {
    service = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      remove: jest.fn(),
      update: jest.fn()
    }

    controller = new UnitCalendarDaysController(
      service as unknown as UnitCalendarDaysService
    )
  })

  it('findAll delegates query and maps paginated items to DTO', async () => {
    const req = { user: { id: 9 } } as AuthRequest
    const query = { page: 1, pageSize: 10 }

    service.findAll.mockResolvedValueOnce({
      data: [
        {
          id: 1,
          unit: {
            id: 3,
            name: 'A1',
            capacity: 2,
            isActive: true,
            listingId: 7
          },
          date: new Date('2026-06-20T00:00:00.000Z'),
          state: 'BLOCKED',
          priceOverride: '150.00',
          minNights: 2,
          note: 'Maintenance',
          createdAt: new Date('2026-03-08T10:00:00.000Z'),
          updatedAt: new Date('2026-03-08T10:00:00.000Z')
        }
      ],
      total: 1
    })

    const result = await controller.findAll(req, query)

    expect(service.findAll).toHaveBeenCalledWith(9, query)
    expect(result.total).toBe(1)
    expect(result.data[0]).toBeInstanceOf(ResponseUnitCalendarDayDto)
    expect(result.data[0]).toMatchObject({
      id: 1,
      unit: { id: 3, name: 'A1' },
      state: 'BLOCKED'
    })
    expect(
      (result.data[0] as unknown as Record<string, unknown>).unitId
    ).toBeUndefined()
    expect(
      (result.data[0].unit as unknown as Record<string, unknown>).listingId
    ).toBeUndefined()
  })

  it('findOne delegates to service and maps response to DTO', async () => {
    const req = { user: { id: 9 } } as AuthRequest

    service.findOne.mockResolvedValueOnce({
      id: 4,
      unit: {
        id: 8,
        name: 'Room 1',
        capacity: 2,
        isActive: true,
        listingId: 3
      },
      date: new Date('2026-06-25T00:00:00.000Z'),
      state: 'AVAILABLE'
    })

    const result = await controller.findOne(req, 4)

    expect(service.findOne).toHaveBeenCalledWith(4, 9)
    expect(result).toBeInstanceOf(ResponseUnitCalendarDayDto)
    expect(result).toMatchObject({
      id: 4,
      unit: { id: 8, name: 'Room 1' }
    })
    expect(
      (result as unknown as Record<string, unknown>).unitId
    ).toBeUndefined()
    expect(
      (result.unit as unknown as Record<string, unknown>).listingId
    ).toBeUndefined()
  })

  it('create uses current user and delegates payload', async () => {
    const req = { user: { id: 11 } } as AuthRequest
    const dto = {
      unitId: 5,
      date: '2026-07-05',
      state: 'AVAILABLE' as const,
      priceOverride: '120.00',
      minNights: 2
    }

    service.create.mockResolvedValueOnce({
      id: 7,
      date: dto.date,
      state: dto.state,
      priceOverride: dto.priceOverride,
      minNights: dto.minNights,
      unit: {
        id: 5,
        name: 'Studio',
        capacity: 2,
        isActive: true,
        listingId: 4
      }
    })

    const result = await controller.create(req, dto)

    expect(service.create).toHaveBeenCalledWith(11, dto)
    expect(result).toBeInstanceOf(ResponseUnitCalendarDayDto)
    expect(result).toMatchObject({
      id: 7,
      unit: { id: 5, name: 'Studio' }
    })
    expect(
      (result as unknown as Record<string, unknown>).unitId
    ).toBeUndefined()
    expect(
      (result.unit as unknown as Record<string, unknown>).listingId
    ).toBeUndefined()
  })

  it('update delegates to service with id and current user', async () => {
    const req = { user: { id: 6 } } as AuthRequest
    const dto = {
      state: 'BLOCKED' as const,
      note: 'Reserved for owner'
    }

    service.update.mockResolvedValueOnce({
      id: 8,
      unit: {
        id: 2,
        name: 'A2',
        capacity: 3,
        isActive: true,
        listingId: 5
      },
      ...dto
    })

    const result = await controller.update(req, 8, dto)

    expect(service.update).toHaveBeenCalledWith(8, 6, dto)
    expect(result).toBeInstanceOf(ResponseUnitCalendarDayDto)
    expect(result).toMatchObject({
      id: 8,
      state: 'BLOCKED',
      unit: { id: 2, name: 'A2' }
    })
    expect(
      (result as unknown as Record<string, unknown>).unitId
    ).toBeUndefined()
    expect(
      (result.unit as unknown as Record<string, unknown>).listingId
    ).toBeUndefined()
  })

  it('remove delegates id and current user to service', async () => {
    const req = { user: { id: 12 } } as AuthRequest

    service.remove.mockResolvedValueOnce({ id: 3 })

    const result = await controller.remove(req, 3)

    expect(service.remove).toHaveBeenCalledWith(3, 12)
    expect(result).toEqual({ id: 3 })
  })
})
