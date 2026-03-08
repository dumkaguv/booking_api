import { UnitCalendarDayStateEnum } from '@prisma/client'

import { paginate } from '@/common/utils'
import { includeUnitCalendarDayWithRelations } from '@/modules/unit-calendar-day/constants'
import { PrismaService } from '@/prisma/prisma.service'

import { UnitCalendarDaysService } from './unit-calendar-day.service'

jest.mock('@/common/utils', () => {
  const actual = jest.requireActual('@/common/utils')

  return {
    ...actual,
    paginate: jest.fn()
  }
})

type PrismaMock = {
  listingUnit: {
    findFirstOrThrow: jest.Mock
  }
  unitCalendarDay: {
    create: jest.Mock
    delete: jest.Mock
    findFirstOrThrow: jest.Mock
    update: jest.Mock
  }
}

describe('UnitCalendarDaysService', () => {
  let prisma: PrismaMock
  let service: UnitCalendarDaysService
  let paginateMock: jest.MockedFunction<typeof paginate>

  beforeEach(() => {
    prisma = {
      listingUnit: {
        findFirstOrThrow: jest.fn()
      },
      unitCalendarDay: {
        create: jest.fn(),
        delete: jest.fn(),
        findFirstOrThrow: jest.fn(),
        update: jest.fn()
      }
    }

    service = new UnitCalendarDaysService(prisma as unknown as PrismaService)
    paginateMock = paginate as jest.MockedFunction<typeof paginate>
    paginateMock.mockReset()
  })

  it('findAll delegates to paginate with owner scope', async () => {
    const expected = { data: [], total: 0 }
    const query: Parameters<UnitCalendarDaysService['findAll']>[1] = {
      ordering: '-id',
      page: 1,
      pageSize: 20
    }

    paginateMock.mockResolvedValueOnce(expected)

    const result = await service.findAll(7, query)

    expect(result).toEqual(expected)
    expect(paginateMock).toHaveBeenCalledWith({
      prisma,
      model: 'unitCalendarDay',
      include: includeUnitCalendarDayWithRelations,
      where: {
        unit: {
          listing: {
            ownerId: 7
          }
        }
      },
      ...query
    })
  })

  it('findOne loads calendar day with owner scope', async () => {
    const expected = { id: 4, unit: { id: 2 } }

    prisma.unitCalendarDay.findFirstOrThrow.mockResolvedValueOnce(expected)

    const result = await service.findOne(4, 7)

    expect(result).toEqual(expected)
    expect(prisma.unitCalendarDay.findFirstOrThrow).toHaveBeenCalledWith({
      where: {
        id: 4,
        unit: {
          listing: { ownerId: 7 }
        }
      },
      include: includeUnitCalendarDayWithRelations
    })
  })

  it('create checks unit ownership and creates calendar day', async () => {
    prisma.listingUnit.findFirstOrThrow.mockResolvedValueOnce({ id: 3 })
    prisma.unitCalendarDay.create.mockResolvedValueOnce({ id: 9 })

    const result = await service.create(7, {
      unitId: 3,
      date: '2026-06-20',
      state: UnitCalendarDayStateEnum.BLOCKED,
      priceOverride: '140.00',
      minNights: 2,
      note: 'Maintenance'
    })

    expect(prisma.listingUnit.findFirstOrThrow).toHaveBeenCalledWith({
      where: {
        id: 3,
        listing: { ownerId: 7 }
      },
      select: { id: true }
    })
    expect(prisma.unitCalendarDay.create).toHaveBeenCalledWith({
      data: {
        unitId: 3,
        date: new Date('2026-06-20T00:00:00.000Z'),
        state: UnitCalendarDayStateEnum.BLOCKED,
        priceOverride: '140.00',
        minNights: 2,
        note: 'Maintenance'
      },
      include: includeUnitCalendarDayWithRelations
    })
    expect(result).toEqual({ id: 9 })
  })

  it('update checks ownership and updates calendar day', async () => {
    prisma.unitCalendarDay.findFirstOrThrow.mockResolvedValueOnce({
      id: 5,
      unitId: 2
    })
    prisma.listingUnit.findFirstOrThrow.mockResolvedValueOnce({ id: 4 })
    prisma.unitCalendarDay.update.mockResolvedValueOnce({ id: 5 })

    const result = await service.update(5, 7, {
      unitId: 4,
      date: '2026-06-22',
      state: UnitCalendarDayStateEnum.AVAILABLE,
      minNights: 3
    })

    expect(prisma.unitCalendarDay.findFirstOrThrow).toHaveBeenCalledWith({
      where: {
        id: 5,
        unit: {
          listing: { ownerId: 7 }
        }
      },
      select: { id: true, unitId: true }
    })
    expect(prisma.listingUnit.findFirstOrThrow).toHaveBeenCalledWith({
      where: {
        id: 4,
        listing: { ownerId: 7 }
      },
      select: { id: true }
    })
    expect(prisma.unitCalendarDay.update).toHaveBeenCalledWith({
      where: { id: 5 },
      data: {
        unitId: 4,
        date: new Date('2026-06-22T00:00:00.000Z'),
        state: UnitCalendarDayStateEnum.AVAILABLE,
        minNights: 3
      },
      include: includeUnitCalendarDayWithRelations
    })
    expect(result).toEqual({ id: 5 })
  })

  it('remove checks ownership and deletes calendar day', async () => {
    prisma.unitCalendarDay.findFirstOrThrow.mockResolvedValueOnce({ id: 8 })
    prisma.unitCalendarDay.delete.mockResolvedValueOnce({ id: 8 })

    const result = await service.remove(8, 7)

    expect(prisma.unitCalendarDay.findFirstOrThrow).toHaveBeenCalledWith({
      where: {
        id: 8,
        unit: {
          listing: { ownerId: 7 }
        }
      },
      select: { id: true }
    })
    expect(prisma.unitCalendarDay.delete).toHaveBeenCalledWith({
      where: { id: 8 }
    })
    expect(result).toEqual({ id: 8 })
  })
})
