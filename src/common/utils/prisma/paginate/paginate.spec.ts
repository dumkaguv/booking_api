import { paginate } from './paginate'

import type { PrismaClient } from '@prisma/client'

type PrismaMock = {
  count: jest.Mock
  findMany: jest.Mock
  prisma: PrismaClient
}

function createPrismaMock(data: unknown[], total: number): PrismaMock {
  const findMany = jest.fn().mockResolvedValue(data)
  const count = jest.fn().mockResolvedValue(total)
  const prisma = {
    user: {
      findMany,
      count
    }
  } as unknown as PrismaClient

  return { prisma, findMany, count }
}

describe('paginate', () => {
  it('queries findMany/count with pagination and returns raw result', async () => {
    const records = [{ id: 1, email: 'alex@example.com' }]
    const { prisma, findMany, count } = createPrismaMock(records, 12)

    const result = await paginate({
      prisma,
      model: 'user',
      page: 2,
      pageSize: 3,
      ordering: '-id',
      where: { isActivated: true },
      search: 'alex',
      select: { id: true, email: true }
    } as never)

    expect(result).toEqual({
      data: records,
      total: 12
    })

    const findManyArgs = findMany.mock.calls[0][0] as Record<string, unknown>

    expect(findMany).toHaveBeenCalledTimes(1)
    expect(findManyArgs.skip).toBe(3)
    expect(findManyArgs.take).toBe(3)
    expect(findManyArgs.orderBy).toEqual({ id: 'desc' })
    expect(findManyArgs.select).toEqual({ id: true, email: true })
    expect(findManyArgs).toHaveProperty('where.AND')

    const mergedWhere = findManyArgs.where as {
      AND: [Record<string, unknown>, Record<string, unknown>]
    }

    expect(mergedWhere.AND[0]).toEqual({ isActivated: true })
    expect(count).toHaveBeenCalledWith({ where: findManyArgs.where })
  })

  it('applies computedBatch and computed values', async () => {
    const records = [
      { id: 1, email: 'a@example.com' },
      { id: 2, email: 'b@example.com' }
    ]
    const { prisma } = createPrismaMock(records, 2)
    const computedBatch = jest
      .fn()
      .mockResolvedValue([{ rank: 10 }, { rank: 20 }])
    const computed = {
      label: jest.fn((record: { id: number; rank: number }, helpers) => {
        return `${helpers.context.prefix}-${record.id}-${record.rank}`
      })
    }

    const result = await paginate({
      prisma,
      model: 'user',
      computedBatch,
      computed,
      context: { prefix: 'usr' }
    } as never)

    expect(computedBatch).toHaveBeenCalledWith(
      records,
      expect.objectContaining({
        context: { prefix: 'usr' }
      })
    )

    expect(result).toEqual({
      data: [
        {
          id: 1,
          email: 'a@example.com',
          rank: 10,
          label: 'usr-1-10'
        },
        {
          id: 2,
          email: 'b@example.com',
          rank: 20,
          label: 'usr-2-20'
        }
      ],
      total: 2
    })
  })

  it('throws when computedBatch does not return an array', async () => {
    const records = [{ id: 1 }]
    const { prisma } = createPrismaMock(records, 1)

    await expect(
      paginate({
        prisma,
        model: 'user',
        computedBatch: jest.fn().mockResolvedValue({ invalid: true })
      } as never)
    ).rejects.toThrow('computedBatch must return an array')
  })

  it('throws when computedBatch length mismatches records length', async () => {
    const records = [{ id: 1 }, { id: 2 }]
    const { prisma } = createPrismaMock(records, 2)

    await expect(
      paginate({
        prisma,
        model: 'user',
        computedBatch: jest.fn().mockResolvedValue([{ score: 1 }])
      } as never)
    ).rejects.toThrow(
      'computedBatch result length must match the number of records'
    )
  })
})
