import { UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'

import { UserService } from '@/modules/user/user.service'
import { PrismaService } from '@/prisma/prisma.service'


import { TokenService } from './token.service'

type ConfigMock = {
  getOrThrow: jest.Mock
}

type PrismaMock = {
  token: {
    create: jest.Mock
    delete: jest.Mock
    findFirstOrThrow: jest.Mock
    findUnique: jest.Mock
    update: jest.Mock
  }
}

type JwtServiceMock = {
  signAsync: jest.Mock
  verifyAsync: jest.Mock
}

type UserServiceMock = {
  findOne: jest.Mock
}

function createConfigMock() {
  const values = {
    JWT_REFRESH_SECRET: 'refresh-secret',
    JWT_ACCESS_SECRET: 'access-secret',
    JWT_REFRESH_TOKEN_TTL: '7d',
    JWT_ACCESS_TOKEN_TTL: '15m'
  }

  return {
    getOrThrow: jest.fn((key: string) => values[key as keyof typeof values])
  } as ConfigMock
}

describe('TokenService', () => {
  let configService: ConfigMock
  let jwtService: JwtServiceMock
  let prisma: PrismaMock
  let service: TokenService
  let userService: UserServiceMock

  beforeEach(() => {
    prisma = {
      token: {
        create: jest.fn(),
        delete: jest.fn(),
        findFirstOrThrow: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn()
      }
    }
    configService = createConfigMock()
    jwtService = {
      signAsync: jest.fn(),
      verifyAsync: jest.fn()
    }
    userService = {
      findOne: jest.fn()
    }

    service = new TokenService(
      prisma as unknown as PrismaService,
      configService as unknown as ConfigService,
      jwtService as unknown as JwtService,
      userService as unknown as UserService
    )
  })

  it('generate creates access and refresh tokens with dedicated secrets', async () => {
    jwtService.signAsync.mockResolvedValueOnce('access-token')
    jwtService.signAsync.mockResolvedValueOnce('refresh-token')

    const result = await service.generate(5)

    expect(jwtService.signAsync).toHaveBeenNthCalledWith(
      1,
      { id: 5 },
      {
        secret: 'access-secret',
        expiresIn: '15m'
      }
    )
    expect(jwtService.signAsync).toHaveBeenNthCalledWith(
      2,
      { id: 5 },
      {
        secret: 'refresh-secret',
        expiresIn: '7d'
      }
    )
    expect(result).toEqual({
      accessToken: 'access-token',
      refreshToken: 'refresh-token'
    })
  })

  it('save updates existing refresh token for user', async () => {
    prisma.token.findUnique.mockResolvedValueOnce({ userId: 3, id: 33 })
    prisma.token.update.mockResolvedValueOnce({ userId: 3, id: 33 })

    const result = await service.save('new-refresh', 3)

    expect(prisma.token.findUnique).toHaveBeenCalledWith({
      where: { userId: 3 }
    })
    expect(prisma.token.update).toHaveBeenCalledWith({
      where: { userId: 3 },
      data: { refreshToken: 'new-refresh' }
    })
    expect(prisma.token.create).not.toHaveBeenCalled()
    expect(result).toEqual({ userId: 3, id: 33 })
  })

  it('save creates token row when user has no existing token', async () => {
    prisma.token.findUnique.mockResolvedValueOnce(null)
    prisma.token.create.mockResolvedValueOnce({ userId: 8, id: 80 })

    const result = await service.save('refresh-8', 8)

    expect(prisma.token.create).toHaveBeenCalledWith({
      data: { userId: 8, refreshToken: 'refresh-8' }
    })
    expect(prisma.token.update).not.toHaveBeenCalled()
    expect(result).toEqual({ userId: 8, id: 80 })
  })

  it('validateRefreshToken verifies token with refresh secret', async () => {
    jwtService.verifyAsync.mockResolvedValueOnce({ id: 9 })

    const result = await service.validateRefreshToken('rt')

    expect(jwtService.verifyAsync).toHaveBeenCalledWith('rt', {
      secret: 'refresh-secret'
    })
    expect(result).toEqual({ id: 9 })
  })

  it('validateAccessToken verifies token with access secret', async () => {
    jwtService.verifyAsync.mockResolvedValueOnce({ id: 9 })

    const result = await service.validateAccessToken('at')

    expect(jwtService.verifyAsync).toHaveBeenCalledWith('at', {
      secret: 'access-secret'
    })
    expect(result).toEqual({ id: 9 })
  })

  it('remove deletes refresh token row and returns user id', async () => {
    prisma.token.findFirstOrThrow.mockResolvedValueOnce({ id: 100, userId: 10 })
    prisma.token.delete.mockResolvedValueOnce({ id: 100 })

    const result = await service.remove('refresh-token')

    expect(prisma.token.findFirstOrThrow).toHaveBeenCalledWith({
      select: { id: true, userId: true },
      where: { refreshToken: 'refresh-token' }
    })
    expect(prisma.token.delete).toHaveBeenCalledWith({
      where: { id: 100 }
    })
    expect(result).toBe(10)
  })

  it('refresh throws when provided token does not match stored token', async () => {
    const validateSpy = jest
      .spyOn(service, 'validateRefreshToken')
      .mockResolvedValueOnce({ id: 12 })

    prisma.token.findUnique.mockResolvedValueOnce({
      userId: 12,
      refreshToken: 'another-token'
    })

    await expect(service.refresh('current-token')).rejects.toThrow(
      UnauthorizedException
    )
    expect(validateSpy).toHaveBeenCalledWith('current-token')
  })

  it('refresh rotates tokens and returns user payload', async () => {
    jest.spyOn(service, 'validateRefreshToken').mockResolvedValueOnce({ id: 4 })

    prisma.token.findUnique.mockResolvedValueOnce({
      userId: 4,
      refreshToken: 'old-refresh'
    })
    userService.findOne.mockResolvedValueOnce({
      id: 4,
      username: 'john',
      email: 'john@mail.com'
    })
    const generateSpy = jest.spyOn(service, 'generate').mockResolvedValueOnce({
      accessToken: 'new-access',
      refreshToken: 'new-refresh'
    })
    const saveSpy = jest.spyOn(service, 'save').mockResolvedValueOnce({
      id: 1
    } as never)

    const result = await service.refresh('old-refresh')

    expect(generateSpy).toHaveBeenCalledWith(4)
    expect(saveSpy).toHaveBeenCalledWith('new-refresh', 4)
    expect(result).toEqual({
      accessToken: 'new-access',
      refreshToken: 'new-refresh',
      user: {
        id: 4,
        username: 'john',
        email: 'john@mail.com'
      }
    })
  })
})
