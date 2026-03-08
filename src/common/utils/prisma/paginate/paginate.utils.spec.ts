import { Prisma, PrismaClient } from '@prisma/client'

import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from '@/common/constants'

import {
  buildWhereWithSearch,
  ensureBatchValues,
  getModelClient,
  getPagination,
  parseOrderBy
} from './paginate.utils'

describe('paginate.utils', () => {
  describe('getPagination', () => {
    it('uses defaults when no arguments provided', () => {
      expect(getPagination()).toEqual({
        skip: 0,
        take: DEFAULT_PAGE_SIZE
      })
    })

    it('clamps invalid and over-limit values', () => {
      expect(getPagination(-10, MAX_PAGE_SIZE + 500)).toEqual({
        skip: 0,
        take: MAX_PAGE_SIZE
      })
    })

    it('calculates skip and take for valid input', () => {
      expect(getPagination(3, 5)).toEqual({
        skip: 10,
        take: 5
      })
    })
  })

  describe('parseOrderBy', () => {
    it('returns undefined for empty ordering', () => {
      expect(parseOrderBy(undefined)).toBeUndefined()
    })

    it('parses ascending order', () => {
      expect(parseOrderBy('createdAt')).toEqual({ createdAt: 'asc' })
    })

    it('parses descending order', () => {
      expect(parseOrderBy('-createdAt')).toEqual({ createdAt: 'desc' })
    })
  })

  describe('getModelClient', () => {
    it('returns model delegate from prisma client', () => {
      const userClient = {
        findMany: jest.fn(),
        count: jest.fn()
      }
      const prisma = { user: userClient } as unknown as PrismaClient

      const modelClient = getModelClient(prisma, 'user' as never)

      expect(modelClient).toBe(userClient)
    })
  })

  describe('buildWhereWithSearch', () => {
    it('returns original where when search is not provided', () => {
      const where = { id: 1 }

      expect(buildWhereWithSearch('user' as never, where as never)).toBe(where)
    })

    it('builds OR contains conditions for string fields', () => {
      const where = buildWhereWithSearch(
        'user' as never,
        undefined,
        'alex'
      ) as Record<string, unknown>

      expect(where).toHaveProperty('OR')
      const orConditions = where.OR as Record<string, unknown>[]

      expect(orConditions.length).toBeGreaterThan(0)

      const firstCondition = orConditions[0]
      const firstField = Object.keys(firstCondition)[0]

      expect(firstCondition[firstField]).toEqual({
        contains: 'alex',
        mode: Prisma.QueryMode.insensitive
      })
    })

    it('merges existing where via AND when search is provided', () => {
      const baseWhere = { id: 99 } as Record<string, unknown>
      const where = buildWhereWithSearch(
        'user' as never,
        baseWhere as never,
        'alex'
      ) as Record<string, unknown>

      expect(where).toHaveProperty('AND')
      const andParts = where.AND as unknown[]

      expect(andParts).toHaveLength(2)
      expect(andParts[0]).toEqual(baseWhere)
    })

    it('returns original where when model is not found in prisma dmmf', () => {
      const where = { id: 1 }

      expect(
        buildWhereWithSearch('notExistingModel' as never, where as never, 'x')
      ).toBe(where)
    })
  })

  describe('ensureBatchValues', () => {
    it('returns array when shape and length are valid', () => {
      const batch = [{ a: 1 }, { b: 2 }]

      expect(ensureBatchValues(batch, 2)).toBe(batch)
    })

    it('throws when batch value is not an array', () => {
      expect(() => ensureBatchValues({} as never, 1)).toThrow(
        'computedBatch must return an array'
      )
    })

    it('throws when batch length mismatches records length', () => {
      expect(() => ensureBatchValues([{ a: 1 }], 2)).toThrow(
        'computedBatch result length must match the number of records'
      )
    })
  })
})
