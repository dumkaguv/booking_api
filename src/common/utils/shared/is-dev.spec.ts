import { ConfigService } from '@nestjs/config'

import { isDev } from './is-dev'

describe('isDev', () => {
  it('returns true for development NODE_ENV', () => {
    const config = {
      getOrThrow: jest.fn(() => 'development')
    } as unknown as ConfigService

    expect(isDev(config)).toBe(true)
  })

  it('returns false for non-development NODE_ENV', () => {
    const config = {
      getOrThrow: jest.fn(() => 'production')
    } as unknown as ConfigService

    expect(isDev(config)).toBe(false)
  })
})
