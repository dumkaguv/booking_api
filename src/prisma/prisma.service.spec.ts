import { ConfigService } from '@nestjs/config'

import { ENV_KEYS } from '@/common/constants'

import { PrismaService } from './prisma.service'

type ConfigServiceMock = {
  getOrThrow: jest.Mock
}

describe('PrismaService', () => {
  let config: ConfigServiceMock
  let service: PrismaService

  beforeEach(() => {
    config = {
      getOrThrow: jest
        .fn()
        .mockReturnValue(
          'postgresql://myuser:mypassword@localhost:5432/mydatabase'
        )
    }

    service = new PrismaService(config as unknown as ConfigService)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('reads database url from config using ENV_KEYS', () => {
    expect(config.getOrThrow).toHaveBeenCalledWith(ENV_KEYS.DATABASE_URL)
  })

  it('calls $connect in onModuleInit', async () => {
    const connectSpy = jest
      .spyOn(service, '$connect')
      .mockResolvedValue(undefined as never)

    await service.onModuleInit()

    expect(connectSpy).toHaveBeenCalledTimes(1)
  })

  it('calls $disconnect in onModuleDestroy', async () => {
    const disconnectSpy = jest
      .spyOn(service, '$disconnect')
      .mockResolvedValue(undefined as never)

    await service.onModuleDestroy()

    expect(disconnectSpy).toHaveBeenCalledTimes(1)
  })
})
