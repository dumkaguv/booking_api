import { paginate } from '@/common/utils'
import { PrismaService } from '@/prisma/prisma.service'

import { ListingUnitsService } from './listing-unit.service'

jest.mock('@/common/utils', () => {
  const actual = jest.requireActual('@/common/utils')

  return {
    ...actual,
    paginate: jest.fn()
  }
})

type PrismaMock = {
  listing: {
    findFirstOrThrow: jest.Mock
  }
  listingUnit: {
    create: jest.Mock
    delete: jest.Mock
    findFirstOrThrow: jest.Mock
    update: jest.Mock
  }
}

describe('ListingUnitsService', () => {
  let prisma: PrismaMock
  let service: ListingUnitsService
  let paginateMock: jest.MockedFunction<typeof paginate>

  beforeEach(() => {
    prisma = {
      listing: {
        findFirstOrThrow: jest.fn()
      },
      listingUnit: {
        create: jest.fn(),
        delete: jest.fn(),
        findFirstOrThrow: jest.fn(),
        update: jest.fn()
      }
    }

    service = new ListingUnitsService(prisma as unknown as PrismaService)
    paginateMock = paginate as jest.MockedFunction<typeof paginate>
    paginateMock.mockReset()
  })

  it('findAll delegates to paginate with listingUnit model and listing filter', async () => {
    const expected = { data: [], total: 0 }
    const query: Parameters<ListingUnitsService['findAll']>[1] = {
      ordering: '-id',
      page: 1,
      pageSize: 20
    }

    paginateMock.mockResolvedValueOnce(expected)

    const result = await service.findAll(7, query)

    expect(result).toEqual(expected)
    expect(paginateMock).toHaveBeenCalledWith({
      prisma,
      model: 'listingUnit',
      where: { listingId: 7 },
      ...query
    })
  })

  it('findOne loads unit by listing and unit ids', async () => {
    const expected = { id: 4, listingId: 7 }

    prisma.listingUnit.findFirstOrThrow.mockResolvedValueOnce(expected)

    const result = await service.findOne(7, 4)

    expect(result).toEqual(expected)
    expect(prisma.listingUnit.findFirstOrThrow).toHaveBeenCalledWith({
      where: { id: 4, listingId: 7 }
    })
  })

  it('create checks listing ownership and creates unit', async () => {
    const dto = {
      name: 'Apartment A1',
      capacity: 3,
      isActive: true
    }

    prisma.listing.findFirstOrThrow.mockResolvedValueOnce({ id: 7 })
    prisma.listingUnit.create.mockResolvedValueOnce({
      id: 10,
      listingId: 7,
      ...dto
    })

    const result = await service.create(7, 2, dto)

    expect(prisma.listing.findFirstOrThrow).toHaveBeenCalledWith({
      where: { id: 7, ownerId: 2 },
      select: { id: true }
    })
    expect(prisma.listingUnit.create).toHaveBeenCalledWith({
      data: { ...dto, listingId: 7 }
    })
    expect(result).toEqual({ id: 10, listingId: 7, ...dto })
  })

  it('update checks unit ownership and updates unit', async () => {
    const dto = {
      name: 'Apartment A1 Updated',
      capacity: 4
    }

    prisma.listingUnit.findFirstOrThrow.mockResolvedValueOnce({ id: 10 })
    prisma.listingUnit.update.mockResolvedValueOnce({
      id: 10,
      listingId: 7,
      isActive: true,
      ...dto
    })

    const result = await service.update(7, 10, 2, dto)

    expect(prisma.listingUnit.findFirstOrThrow).toHaveBeenCalledWith({
      where: {
        id: 10,
        listingId: 7,
        listing: { ownerId: 2 }
      },
      select: { id: true }
    })
    expect(prisma.listingUnit.update).toHaveBeenCalledWith({
      where: { id: 10 },
      data: dto
    })
    expect(result).toEqual({
      id: 10,
      listingId: 7,
      isActive: true,
      ...dto
    })
  })

  it('remove checks unit ownership and deletes unit', async () => {
    prisma.listingUnit.findFirstOrThrow.mockResolvedValueOnce({ id: 12 })
    prisma.listingUnit.delete.mockResolvedValueOnce({ id: 12 })

    const result = await service.remove(7, 12, 2)

    expect(prisma.listingUnit.findFirstOrThrow).toHaveBeenCalledWith({
      where: {
        id: 12,
        listingId: 7,
        listing: { ownerId: 2 }
      },
      select: { id: true }
    })
    expect(prisma.listingUnit.delete).toHaveBeenCalledWith({
      where: { id: 12 }
    })
    expect(result).toEqual({ id: 12 })
  })
})
