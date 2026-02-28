import { Prisma, PrismaClient } from '@prisma/client'

import {
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE
} from '@/common/constants'

import type {
  ModelClient,
  ModelFindManyArgs,
  ModelWhere,
  PrismaModelKey
} from './paginate.types'

export function getPagination(page?: number, pageSize?: number) {
  const safePageSize = Math.min(
    Math.max(1, pageSize ?? DEFAULT_PAGE_SIZE),
    MAX_PAGE_SIZE
  )
  const safePage = Math.max(1, page ?? DEFAULT_PAGE)

  return {
    skip: (safePage - 1) * safePageSize,
    take: safePageSize
  }
}

export function parseOrderBy(ordering?: string) {
  if (!ordering) {
    return undefined
  }

  const direction = ordering.startsWith('-') ? 'desc' : 'asc'
  const field = ordering.replace(/^-/, '')

  return { [field]: direction } as Record<string, 'asc' | 'desc'>
}

export function getModelClient<
  Key extends PrismaModelKey,
  Select extends ModelFindManyArgs<Key>['select'],
  Include extends ModelFindManyArgs<Key>['include']
>(prisma: PrismaClient, model: Key): ModelClient<Key, Select, Include> {
  const delegateMap = prisma as unknown as Record<
    PrismaModelKey,
    ModelClient<Key, Select, Include>
  >

  return delegateMap[model]
}

function toPrismaModelName(model: string) {
  return model[0].toUpperCase() + model.slice(1).toLowerCase()
}

export function buildWhereWithSearch<Key extends PrismaModelKey>(
  model: Key,
  whereParam?: ModelWhere<Key>,
  search?: string
): ModelWhere<Key> | undefined {
  let where = whereParam

  if (!search) {
    return where
  }

  const prismaModel = Prisma.dmmf.datamodel.models.find(
    ({ name }) => name === toPrismaModelName(String(model))
  )

  if (!prismaModel) {
    return where
  }

  const stringFields = prismaModel.fields
    .filter(({ type }) => type === 'String')
    .map(({ name }) => name)

  if (stringFields.length === 0) {
    return where
  }

  const searchWhere = {
    OR: stringFields.map((field) => ({
      [field]: { contains: search, mode: Prisma.QueryMode.insensitive }
    }))
  } as ModelWhere<Key>

  if (!whereParam) {
    return searchWhere
  }

  where = { AND: [whereParam, searchWhere] } as ModelWhere<Key>

  return where
}

export function ensureBatchValues(
  batchValues: unknown,
  expectedLength: number
): Record<string, unknown>[] {
  if (!Array.isArray(batchValues)) {
    throw new Error('computedBatch must return an array')
  }

  if (batchValues.length !== expectedLength) {
    throw new Error(
      'computedBatch result length must match the number of records'
    )
  }

  return batchValues as Record<string, unknown>[]
}
