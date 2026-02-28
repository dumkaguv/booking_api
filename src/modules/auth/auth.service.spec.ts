import { UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

import { TokenService } from '@/modules/token/token.service'
import type { CreateUserDto } from '@/modules/user/dto'
import { UserService } from '@/modules/user/user.service'

import { AuthService } from './auth.service'

import type { CreateLoginDto } from './dto'
import type { Request, Response } from 'express'

type ConfigMock = {
  getOrThrow: jest.Mock
}

type UserServiceMock = {
  comparePasswords: jest.Mock
  create: jest.Mock
  findOne: jest.Mock
}

type TokenServiceMock = {
  generate: jest.Mock
  refresh: jest.Mock
  remove: jest.Mock
  save: jest.Mock
}

function createConfigMock(env: 'development' | 'production' = 'development') {
  const values = {
    JWT_REFRESH_TOKEN_TTL: '7d',
    FRONT_URL: 'https://client.example.com',
    NODE_ENV: env
  }

  return {
    getOrThrow: jest.fn((key: string) => values[key as keyof typeof values])
  } as ConfigMock
}

describe('AuthService', () => {
  let configService: ConfigMock
  let service: AuthService
  let tokenService: TokenServiceMock
  let userService: UserServiceMock

  beforeEach(() => {
    configService = createConfigMock()
    userService = {
      comparePasswords: jest.fn(),
      create: jest.fn(),
      findOne: jest.fn()
    }
    tokenService = {
      generate: jest.fn(),
      refresh: jest.fn(),
      remove: jest.fn(),
      save: jest.fn()
    }

    service = new AuthService(
      configService as unknown as ConfigService,
      userService as unknown as UserService,
      tokenService as unknown as TokenService
    )
  })

  it('register creates user and returns access token with user', async () => {
    const dto: CreateUserDto = {
      email: 'john@mail.com',
      username: 'john',
      password: 'Password1!'
    }
    const user = { id: 10, email: dto.email, username: dto.username }
    const res = { cookie: jest.fn() } as unknown as Response

    userService.create.mockResolvedValueOnce({ id: 10 })
    tokenService.generate.mockResolvedValueOnce({
      accessToken: 'access-token',
      refreshToken: 'refresh-token'
    })
    tokenService.save.mockResolvedValueOnce(undefined)
    userService.findOne.mockResolvedValueOnce(user)

    const result = await service.register(res, dto)

    expect(userService.create).toHaveBeenCalledWith(dto)
    expect(tokenService.generate).toHaveBeenCalledWith(10)
    expect(tokenService.save).toHaveBeenCalledWith('refresh-token', 10)
    expect(userService.findOne).toHaveBeenCalledWith(10)
    expect(res.cookie).toHaveBeenCalledWith(
      'refreshToken',
      'refresh-token',
      expect.objectContaining({
        httpOnly: true,
        sameSite: 'lax',
        domain: 'client.example.com',
        secure: false
      })
    )
    expect(result).toEqual({ user, accessToken: 'access-token' })
  })

  it('login validates credentials and returns auth payload', async () => {
    const dto: CreateLoginDto = {
      email: 'john@mail.com',
      password: 'Password1!'
    }
    const user = { id: 3, email: dto.email, username: 'john' }
    const res = { cookie: jest.fn() } as unknown as Response

    userService.comparePasswords.mockResolvedValueOnce(user)
    tokenService.generate.mockResolvedValueOnce({
      accessToken: 'a-token',
      refreshToken: 'r-token'
    })
    tokenService.save.mockResolvedValueOnce(undefined)
    userService.findOne.mockResolvedValueOnce(user)

    const result = await service.login(res, dto)

    expect(userService.comparePasswords).toHaveBeenCalledWith(
      dto.password,
      dto.email
    )
    expect(tokenService.generate).toHaveBeenCalledWith(3)
    expect(result).toEqual({ user, accessToken: 'a-token' })
  })

  it('logout silently returns when refresh token is missing', async () => {
    await service.logout(undefined)

    expect(tokenService.remove).not.toHaveBeenCalled()
  })

  it('logout removes refresh token when provided', async () => {
    tokenService.remove.mockResolvedValueOnce(2)

    await service.logout('refresh-token')

    expect(tokenService.remove).toHaveBeenCalledWith('refresh-token')
  })

  it('refresh throws unauthorized when cookie has no refresh token', async () => {
    const req = { cookies: {} } as unknown as Request
    const res = { cookie: jest.fn() } as unknown as Response

    await expect(service.refresh(req, res)).rejects.toThrow(
      UnauthorizedException
    )
  })

  it('refresh rotates token, sets cookie and returns access token', async () => {
    const req = { cookies: { refreshToken: 'old-token' } } as unknown as Request
    const res = { cookie: jest.fn() } as unknown as Response

    tokenService.refresh.mockResolvedValueOnce({
      user: { id: 5 },
      accessToken: 'new-access',
      refreshToken: 'new-refresh'
    })

    const result = await service.refresh(req, res)

    expect(tokenService.refresh).toHaveBeenCalledWith('old-token')
    expect(res.cookie).toHaveBeenCalledWith(
      'refreshToken',
      'new-refresh',
      expect.objectContaining({
        httpOnly: true,
        sameSite: 'lax',
        domain: 'client.example.com',
        secure: false
      })
    )
    expect(result).toEqual({ accessToken: 'new-access' })
  })

  it('validate delegates lookup to user service', async () => {
    userService.findOne.mockResolvedValueOnce({ id: 6 })

    const result = await service.validate(6)

    expect(userService.findOne).toHaveBeenCalledWith(6)
    expect(result).toEqual({ id: 6 })
  })

  it('setCookie marks cookie as secure outside development', async () => {
    configService = createConfigMock('production')
    service = new AuthService(
      configService as unknown as ConfigService,
      userService as unknown as UserService,
      tokenService as unknown as TokenService
    )
    const res = { cookie: jest.fn() } as unknown as Response
    const user = { id: 9, username: 'john', email: 'john@mail.com' }
    const dto: CreateLoginDto = {
      email: 'john@mail.com',
      password: 'Password1!'
    }

    userService.comparePasswords.mockResolvedValueOnce(user)
    tokenService.generate.mockResolvedValueOnce({
      accessToken: 'a-token',
      refreshToken: 'r-token'
    })
    tokenService.save.mockResolvedValueOnce(undefined)
    userService.findOne.mockResolvedValueOnce(user)

    await service.login(res, dto)

    expect(res.cookie).toHaveBeenCalledWith(
      'refreshToken',
      'r-token',
      expect.objectContaining({ secure: true })
    )
  })
})
