/* eslint-disable @typescript-eslint/no-redundant-type-constituents */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { Prisma, PrismaClient } from '@prisma/client'

export type PaginateImplParams<
  Key extends PrismaModelKey,
  Select,
  Include,
  Context
> = PaginateBaseParams<Key, Select, Include> & {
  computed?: ComputedMap<Key, Select, Include, Context>
  computedBatch?: ComputedBatchFn<Key, Select, Include, Context>
  context?: Context
}

export type PrismaModelDelegate = {
  findMany: (args?: unknown) => unknown
  count: (args?: unknown) => unknown
}

export type PrismaModelKey = {
  [Key in keyof PrismaClient]: PrismaClient[Key] extends PrismaModelDelegate
    ? Key
    : never
}[keyof PrismaClient]

export type ModelFindManyArgs<Key extends PrismaModelKey> = Prisma.Args<
  PrismaClient[Key],
  'findMany'
>

export type ModelWhere<Key extends PrismaModelKey> =
  ModelFindManyArgs<Key>['where']
export type ModelOrderBy<Key extends PrismaModelKey> =
  ModelFindManyArgs<Key>['orderBy']

type OrderByInput<Key extends PrismaModelKey> =
  NonNullable<ModelOrderBy<Key>> extends (infer Item)[]
    ? Item
    : NonNullable<ModelOrderBy<Key>>

export type OrderByKeys<Key extends PrismaModelKey> = Extract<
  keyof OrderByInput<Key>,
  string
>

type SelectionArgs<Select, Include> = ([Select] extends [undefined | null]
  ? {}
  : { select: Exclude<Select, undefined | null> }) &
  ([Include] extends [undefined | null]
    ? {}
    : { include: Exclude<Include, undefined | null> })

export type ModelRecord<
  Key extends PrismaModelKey,
  Select,
  Include
> = Prisma.Result<
  PrismaClient[Key],
  Prisma.SelectSubset<SelectionArgs<Select, Include>, ModelFindManyArgs<Key>>,
  'findMany'
>[number]

export type PaginateBaseParams<Key extends PrismaModelKey, Select, Include> = {
  prisma: PrismaClient
  model: Key
  page?: number
  pageSize?: number
  ordering?: `${OrderByKeys<Key>}` | `-${OrderByKeys<Key>}` | string
  search?: string
  select?: Select
  include?: Include
  where?: ModelFindManyArgs<Key>['where']
}

export type ComputedFn<Key extends PrismaModelKey, Select, Include, Context> = (
  record: ModelRecord<Key, Select, Include>,
  helpers: { prisma: PrismaClient; context: Context }
) => unknown | Promise<unknown>

export type ComputedMap<
  Key extends PrismaModelKey,
  Select,
  Include,
  Context
> = Record<string, ComputedFn<Key, Select, Include, Context>>

export type ComputedValues<C extends Record<string, (...args: any[]) => any>> =
  {
    [K in keyof C]: Awaited<ReturnType<C[K]>>
  }

export type ComputedBatchFn<
  Key extends PrismaModelKey,
  Select,
  Include,
  Context
> = (
  records: ModelRecord<Key, Select, Include>[],
  helpers: { prisma: PrismaClient; context: Context }
) => Record<string, unknown>[] | Promise<Record<string, unknown>[]>

export type ComputedBatchValues<CB> = CB extends (
  ...args: any[]
) => Promise<infer R>
  ? R extends (infer Item)[]
    ? Item
    : never
  : CB extends (...args: any[]) => infer R
    ? R extends (infer Item)[]
      ? Item
      : never
    : never

export type OptionalComputedValues<C> =
  C extends Record<string, (...args: any[]) => any> ? ComputedValues<C> : {}

export type OptionalComputedBatchValues<CB> = CB extends (...args: any[]) => any
  ? ComputedBatchValues<CB>
  : {}

export type PaginateParams<
  Key extends PrismaModelKey,
  Select,
  Include,
  Context
> = Context extends undefined
  ? PaginateBaseParams<Key, Select, Include> & {
      computed?: ComputedMap<Key, Select, Include, undefined>
      computedBatch?: ComputedBatchFn<Key, Select, Include, undefined>
      context?: undefined
    }
  : PaginateBaseParams<Key, Select, Include> & {
      computed?: ComputedMap<Key, Select, Include, Context>
      computedBatch?: ComputedBatchFn<Key, Select, Include, Context>
      context: Context
    }

export type PaginateRuntimeParams<
  Key extends PrismaModelKey,
  Select,
  Include,
  Context,
  C,
  CB
> = PaginateBaseParams<Key, Select, Include> &
  (Context extends undefined
    ? { context?: undefined }
    : { context: Context }) & {
    computed?: C
    computedBatch?: CB
  }

export type PaginateData<
  Key extends PrismaModelKey,
  Select,
  Include,
  C,
  CB
> = (ModelRecord<Key, Select, Include> &
  OptionalComputedValues<C> &
  OptionalComputedBatchValues<CB>)[]

export type PaginateResult<
  Key extends PrismaModelKey,
  Select,
  Include,
  C,
  CB
> = {
  data: PaginateData<Key, Select, Include, C, CB>
  total: number
}

export type ModelClient<
  Key extends PrismaModelKey,
  Select extends ModelFindManyArgs<Key>['select'],
  Include extends ModelFindManyArgs<Key>['include']
> = {
  findMany(
    args: Prisma.SelectSubset<
      ModelFindManyArgs<Key> & {
        skip?: number
        take?: number
        orderBy?: Record<string, 'asc' | 'desc'>
      },
      ModelFindManyArgs<Key>
    >
  ): Prisma.PrismaPromise<ModelRecord<Key, Select, Include>[]>
  count(args: { where?: ModelWhere<Key> }): Prisma.PrismaPromise<number>
}
