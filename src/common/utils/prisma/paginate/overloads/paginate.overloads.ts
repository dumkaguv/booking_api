import type {
  ComputedBatchFn,
  ComputedBatchValues,
  ComputedMap,
  ComputedValues,
  ModelFindManyArgs,
  ModelRecord,
  PaginateParams,
  PrismaModelKey
} from '../paginate.types'

export type PaginateOverloads = {
  <
    Key extends PrismaModelKey,
    Select extends ModelFindManyArgs<Key>['select'] = undefined,
    Include extends ModelFindManyArgs<Key>['include'] = undefined,
    Context = undefined
  >(
    params: PaginateParams<Key, Select, Include, Context> & {
      computed?: undefined
      computedBatch?: undefined
    }
  ): Promise<{
    data: ModelRecord<Key, Select, Include>[]
    total: number
  }>

  <
    Key extends PrismaModelKey,
    Select extends ModelFindManyArgs<Key>['select'] = undefined,
    Include extends ModelFindManyArgs<Key>['include'] = undefined,
    Context = undefined,
    C extends ComputedMap<Key, Select, Include, Context> = ComputedMap<
      Key,
      Select,
      Include,
      Context
    >
  >(
    params: PaginateParams<Key, Select, Include, Context> & { computed: C }
  ): Promise<{
    data: (ModelRecord<Key, Select, Include> & ComputedValues<C>)[]
    total: number
  }>

  <
    Key extends PrismaModelKey,
    Select extends ModelFindManyArgs<Key>['select'] = undefined,
    Include extends ModelFindManyArgs<Key>['include'] = undefined,
    Context = undefined,
    CB extends ComputedBatchFn<Key, Select, Include, Context> = ComputedBatchFn<
      Key,
      Select,
      Include,
      Context
    >
  >(
    params: PaginateParams<Key, Select, Include, Context> & {
      computed?: undefined
      computedBatch: CB
    }
  ): Promise<{
    data: (ModelRecord<Key, Select, Include> & ComputedBatchValues<CB>)[]
    total: number
  }>

  <
    Key extends PrismaModelKey,
    Select extends ModelFindManyArgs<Key>['select'] = undefined,
    Include extends ModelFindManyArgs<Key>['include'] = undefined,
    Context = undefined,
    C extends ComputedMap<Key, Select, Include, Context> = ComputedMap<
      Key,
      Select,
      Include,
      Context
    >,
    CB extends ComputedBatchFn<Key, Select, Include, Context> = ComputedBatchFn<
      Key,
      Select,
      Include,
      Context
    >
  >(
    params: PaginateParams<Key, Select, Include, Context> & {
      computed: C
      computedBatch: CB
    }
  ): Promise<{
    data: (ModelRecord<Key, Select, Include> &
      ComputedValues<C> &
      ComputedBatchValues<CB>)[]
    total: number
  }>
}
