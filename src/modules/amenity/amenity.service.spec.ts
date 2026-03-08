import { paginate } from '@/common/utils'
import { PrismaService } from '@/prisma/prisma.service'

import { AmenitiesService } from './amenity.service'
import { AmenityCodeEnum } from './constants'

jest.mock('@/common/utils', () => ({
  paginate: jest.fn()
}))

type PrismaMock = {
  amenity: {
    create: jest.Mock
    delete: jest.Mock
    findUniqueOrThrow: jest.Mock
    update: jest.Mock
  }
}

describe('AmenitiesService', () => {
  let prisma: PrismaMock
  let service: AmenitiesService
  let paginateMock: jest.MockedFunction<typeof paginate>

  beforeEach(() => {
    prisma = {
      amenity: {
        create: jest.fn(),
        delete: jest.fn(),
        findUniqueOrThrow: jest.fn(),
        update: jest.fn()
      }
    }

    service = new AmenitiesService(prisma as unknown as PrismaService)
    paginateMock = paginate as jest.MockedFunction<typeof paginate>
    paginateMock.mockReset()
  })

  it('findAll delegates to paginate with amenity model', async () => {
    const expected = { data: [], total: 0 }
    const query: Parameters<AmenitiesService['findAll']>[0] = {
      ordering: '-id',
      page: 2,
      pageSize: 5,
      search: 'wi'
    }

    paginateMock.mockResolvedValueOnce(expected)

    const result = await service.findAll(query)

    expect(result).toEqual(expected)
    expect(paginateMock).toHaveBeenCalledWith({
      prisma,
      model: 'amenity',
      ...query
    })
  })

  it('findOne loads amenity by id', async () => {
    const expected = { id: 1 }

    prisma.amenity.findUniqueOrThrow.mockResolvedValueOnce(expected)

    const result = await service.findOne(1)

    expect(result).toBe(expected)
    expect(prisma.amenity.findUniqueOrThrow).toHaveBeenCalledWith({
      where: { id: 1 }
    })
  })

  it('create stores amenity payload', async () => {
    const dto = {
      code: AmenityCodeEnum.WIFI,
      name: 'Wi-Fi',
      color: '#2563EB'
    }

    prisma.amenity.create.mockResolvedValueOnce({ id: 7, ...dto })

    const result = await service.create(dto)

    expect(result).toEqual({ id: 7, ...dto })
    expect(prisma.amenity.create).toHaveBeenCalledWith({
      data: dto
    })
  })

  it('update modifies amenity by id', async () => {
    const dto = { name: 'Dedicated workspace' }

    prisma.amenity.update.mockResolvedValueOnce({
      id: 9,
      code: AmenityCodeEnum.WORKSPACE,
      name: 'Dedicated workspace'
    })

    const result = await service.update(9, dto)

    expect(result).toEqual({
      id: 9,
      code: AmenityCodeEnum.WORKSPACE,
      name: 'Dedicated workspace'
    })
    expect(prisma.amenity.update).toHaveBeenCalledWith({
      where: { id: 9 },
      data: dto
    })
  })

  it('remove deletes amenity by id', async () => {
    prisma.amenity.delete.mockResolvedValueOnce({ id: 4 })

    const result = await service.remove(4)

    expect(result).toEqual({ id: 4 })
    expect(prisma.amenity.delete).toHaveBeenCalledWith({
      where: { id: 4 }
    })
  })
})
