import { firstValueFrom, of } from 'rxjs'

import {
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE
} from '@/common/constants'

import { ResponseInterceptor } from './response.interceptor'

import type { CallHandler, ExecutionContext } from '@nestjs/common'
import type { Reflector } from '@nestjs/core'

function createContext(query: Record<string, unknown>): ExecutionContext {
  return {
    getHandler: () => 'handler',
    switchToHttp: () => ({
      getRequest: () => ({ query })
    })
  } as unknown as ExecutionContext
}

function createCallHandler(data: unknown): CallHandler {
  return {
    handle: () => of(data)
  }
}

describe('ResponseInterceptor', () => {
  it('wraps non-paginated response with default message', async () => {
    const reflector = {
      get: jest.fn(() => undefined)
    } as unknown as Reflector
    const interceptor = new ResponseInterceptor(reflector)

    const result = await firstValueFrom(
      interceptor.intercept(
        createContext({}),
        createCallHandler({ id: 1, title: 'test' })
      )
    )

    expect(result).toEqual({
      success: true,
      message: 'Success',
      data: { id: 1, title: 'test' }
    })
  })

  it('uses custom response message metadata', async () => {
    const reflector = {
      get: jest.fn((key: string) => {
        if (key === 'responseMessage') {
          return 'Created'
        }

        return undefined
      })
    } as unknown as Reflector
    const interceptor = new ResponseInterceptor(reflector)

    const result = await firstValueFrom(
      interceptor.intercept(createContext({}), createCallHandler({ id: 11 }))
    )

    expect(result).toEqual({
      success: true,
      message: 'Created',
      data: { id: 11 }
    })
  })

  it('builds paginated envelope and computes navigation values', async () => {
    const reflector = {
      get: jest.fn((key: string) => {
        if (key === 'responseMessage') {
          return 'Fetched'
        }

        if (key === 'usePagination') {
          return true
        }

        return undefined
      })
    } as unknown as Reflector
    const interceptor = new ResponseInterceptor(reflector)

    const result = await firstValueFrom(
      interceptor.intercept(
        createContext({ page: '2', pageSize: '2' }),
        createCallHandler({ data: [{ id: 1 }, { id: 2 }], total: 5 })
      )
    )

    expect(result).toEqual({
      success: true,
      message: 'Fetched',
      data: [{ id: 1 }, { id: 2 }],
      total: 5,
      page: 2,
      totalPages: 3,
      pageSize: 2,
      nextPage: 3,
      prevPage: 1
    })
  })

  it('falls back to defaults and clamps invalid pagination query values', async () => {
    const reflector = {
      get: jest.fn((key: string) => {
        if (key === 'usePagination') {
          return true
        }

        return undefined
      })
    } as unknown as Reflector
    const interceptor = new ResponseInterceptor(reflector)

    const result = await firstValueFrom(
      interceptor.intercept(
        createContext({ page: '-20', pageSize: String(MAX_PAGE_SIZE + 1000) }),
        createCallHandler({ data: [], total: Number.NaN })
      )
    )

    expect(result).toEqual({
      success: true,
      message: 'Success',
      data: [],
      total: 0,
      page: DEFAULT_PAGE,
      totalPages: 0,
      pageSize: MAX_PAGE_SIZE,
      nextPage: null,
      prevPage: null
    })

    const noValuesResult = await firstValueFrom(
      interceptor.intercept(
        createContext({ page: 'abc', pageSize: '0' }),
        createCallHandler({ data: [], total: 1 })
      )
    )

    expect(noValuesResult).toEqual({
      success: true,
      message: 'Success',
      data: [],
      total: 1,
      page: DEFAULT_PAGE,
      totalPages: 1,
      pageSize: DEFAULT_PAGE_SIZE,
      nextPage: null,
      prevPage: null
    })
  })
})
