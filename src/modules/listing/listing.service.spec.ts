import { ListingTypeEnum } from '@prisma/client'

import { paginate } from '@/common/utils'
import { PrismaService } from '@/prisma/prisma.service'

import { ListingsService } from './listing.service'

jest.mock('@/common/utils', () => {
  const actual = jest.requireActual('@/common/utils')

  return {
    ...actual,
    paginate: jest.fn()
  }
})

type PrismaMock = {
  listing: {
    create: jest.Mock
    delete: jest.Mock
    findFirstOrThrow: jest.Mock
    findUniqueOrThrow: jest.Mock
    update: jest.Mock
  }
}

describe('ListingsService', () => {
  let prisma: PrismaMock
  let service: ListingsService
  let paginateMock: jest.MockedFunction<typeof paginate>

  beforeEach(() => {
    prisma = {
      listing: {
        create: jest.fn(),
        delete: jest.fn(),
        findFirstOrThrow: jest.fn(),
        findUniqueOrThrow: jest.fn(),
        update: jest.fn()
      }
    }

    service = new ListingsService(prisma as unknown as PrismaService)
    paginateMock = paginate as jest.MockedFunction<typeof paginate>
    paginateMock.mockReset()
  })

  it('findAll delegates to paginate with listing defaults', async () => {
    const expected = { data: [], total: 0 }
    const query: Parameters<ListingsService['findAll']>[0] = {
      ordering: '-id',
      page: 2,
      pageSize: 5,
      search: 'chisinau'
    }

    paginateMock.mockResolvedValueOnce(expected)

    const result = await service.findAll(query)

    expect(result).toEqual(expected)
    expect(paginateMock).toHaveBeenCalledWith({
      prisma,
      model: 'listing',
      include: { owner: true, amenities: true },
      ...query
    })
  })

  it('findOne calls prisma with include owner and amenities relations', async () => {
    const expected = { id: 1 }

    prisma.listing.findUniqueOrThrow.mockResolvedValueOnce(expected)

    const result = await service.findOne(1)

    expect(result).toBe(expected)
    expect(prisma.listing.findUniqueOrThrow).toHaveBeenCalledWith({
      where: { id: 1 },
      include: { owner: true, amenities: true }
    })
  })

  it('create normalizes dates and stores listing with owner and amenities', async () => {
    const dto = {
      title: 'Loft',
      type: ListingTypeEnum.APARTMENT,
      country: 'Moldova',
      city: 'Chisinau',
      addressLine: 'Main 1',
      basePrice: '120.00',
      currency: 'USD',
      maxGuests: 2,
      checkInFrom: '2026-03-08',
      checkOutUntil: '2026-03-09',
      instantBook: true,
      amenityIds: [1, 2]
    }

    prisma.listing.create.mockResolvedValueOnce({ id: 9, ...dto })

    const result = await service.create(7, dto)

    expect(result).toEqual({ id: 9, ...dto })
    expect(prisma.listing.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        ownerId: 7,
        title: 'Loft',
        checkInFrom: new Date('2026-03-08T00:00:00.000Z'),
        checkOutUntil: new Date('2026-03-09T00:00:00.000Z'),
        amenities: {
          connect: [{ id: 1 }, { id: 2 }]
        }
      }),
      include: { owner: true, amenities: true }
    })
  })

  it('update checks ownership, normalizes provided dates and updates amenities', async () => {
    prisma.listing.findFirstOrThrow.mockResolvedValueOnce({ id: 5 })
    prisma.listing.update.mockResolvedValueOnce({ id: 5 })

    await service.update(5, 3, {
      title: 'Updated',
      checkInFrom: '2026-03-10',
      checkOutUntil: '2026-03-12',
      amenityIds: [3, 5]
    })

    expect(prisma.listing.findFirstOrThrow).toHaveBeenCalledWith({
      where: { id: 5, ownerId: 3 },
      select: { id: true }
    })
    expect(prisma.listing.update).toHaveBeenCalledWith({
      where: { id: 5 },
      data: {
        title: 'Updated',
        checkInFrom: new Date('2026-03-10T00:00:00.000Z'),
        checkOutUntil: new Date('2026-03-12T00:00:00.000Z'),
        amenities: {
          set: [{ id: 3 }, { id: 5 }]
        }
      },
      include: { owner: true, amenities: true }
    })
  })

  it('update sends partial payload without date fields when absent', async () => {
    prisma.listing.findFirstOrThrow.mockResolvedValueOnce({ id: 6 })
    prisma.listing.update.mockResolvedValueOnce({ id: 6 })

    await service.update(6, 4, {
      title: 'Only title'
    })

    expect(prisma.listing.update).toHaveBeenCalledWith({
      where: { id: 6 },
      data: {
        title: 'Only title'
      },
      include: { owner: true, amenities: true }
    })
  })

  it('update can clear amenities when empty amenityIds are provided', async () => {
    prisma.listing.findFirstOrThrow.mockResolvedValueOnce({ id: 11 })
    prisma.listing.update.mockResolvedValueOnce({ id: 11 })

    await service.update(11, 4, {
      amenityIds: []
    })

    expect(prisma.listing.update).toHaveBeenCalledWith({
      where: { id: 11 },
      data: {
        amenities: {
          set: []
        }
      },
      include: { owner: true, amenities: true }
    })
  })

  it('remove checks ownership and deletes listing', async () => {
    prisma.listing.findFirstOrThrow.mockResolvedValueOnce({ id: 8 })
    prisma.listing.delete.mockResolvedValueOnce({ id: 8 })

    const result = await service.remove(8, 2)

    expect(prisma.listing.findFirstOrThrow).toHaveBeenCalledWith({
      where: { id: 8, ownerId: 2 },
      select: { id: true }
    })
    expect(prisma.listing.delete).toHaveBeenCalledWith({
      where: { id: 8 }
    })
    expect(result).toEqual({ id: 8 })
  })
})
