/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { PrismaClient } from '@prisma/client'

import {
  buildWhereWithSearch,
  ensureBatchValues,
  getModelClient,
  getPagination,
  parseOrderBy
} from './paginate.utils'

import type { PaginateOverloads } from './overloads'

import type {
  ModelFindManyArgs,
  ModelRecord,
  PaginateImplParams,
  PrismaModelKey
} from './paginate.types'

async function paginateImpl<
  Key extends PrismaModelKey,
  Select extends ModelFindManyArgs<Key>['select'] = undefined,
  Include extends ModelFindManyArgs<Key>['include'] = undefined,
  Context = undefined
>({
  prisma,
  model,
  page,
  pageSize,
  ordering,
  search,
  select,
  include,
  where: whereParam,
  computed,
  computedBatch,
  context
}: PaginateImplParams<Key, Select, Include, Context>): Promise<{
  data: any[]
  total: number
}> {
  const { skip, take } = getPagination(page, pageSize)
  const orderBy = parseOrderBy(ordering)

  const modelClient = getModelClient<Key, Select, Include>(prisma, model)
  const where = buildWhereWithSearch(model, whereParam, search)

  const [data, total] = await Promise.all([
    modelClient.findMany({
      skip,
      take,
      orderBy,
      where,
      select,
      include
    } as any),
    modelClient.count({ where })
  ])

  if (!computed && !computedBatch) {
    return { data, total }
  }

  const helpers = { prisma, context } as {
    prisma: PrismaClient
    context: Context
  }

  let resultData = data as Record<string, unknown>[]

  if (computedBatch) {
    const rawBatchValues = await computedBatch(data, helpers)
    const batchValues = ensureBatchValues(rawBatchValues, data.length)

    resultData = data.map((record, index) => ({
      ...(record as Record<string, unknown>),
      ...(batchValues[index] ?? {})
    }))
  }

  if (!computed) {
    return { data: resultData, total }
  }

  const computedEntries = Object.entries(computed)

  const resultDataWithComputed = await Promise.all(
    resultData.map(async (record) => {
      const computedValues: Record<string, unknown> = {}

      for (const [key, fn] of computedEntries) {
        computedValues[key] = await fn(
          record as ModelRecord<Key, Select, Include>,
          helpers
        )
      }

      return { ...record, ...computedValues }
    })
  )

  return { data: resultDataWithComputed, total }
}

export const paginate = paginateImpl as PaginateOverloads
