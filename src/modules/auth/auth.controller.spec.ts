import { EmptyResponseDto } from '@/common/dtos/empty-response.dto'
import type { AuthRequest } from '@/common/types'

import { type CreateUserDto, ResponseUserDto } from '@/modules/user/dto'

import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'

import {
  type CreateLoginDto,
  ResponseLoginDto,
  ResponseRefreshDto,
  ResponseRegisterDto
} from './dto'

import type { Request, Response } from 'express'

type AuthServiceMock = {
  login: jest.Mock
  logout: jest.Mock
  refresh: jest.Mock
  register: jest.Mock
}

describe('AuthController', () => {
  let controller: AuthController
  let service: AuthServiceMock

  beforeEach(() => {
    service = {
      login: jest.fn(),
      logout: jest.fn(),
      refresh: jest.fn(),
      register: jest.fn()
    }

    controller = new AuthController(service as unknown as AuthService)
  })

  it('register delegates to auth service', async () => {
    const dto: CreateUserDto = {
      email: 'john@mail.com',
      username: 'john',
      password: 'Password1!'
    }
    const res = {} as Response

    service.register.mockResolvedValueOnce({
      user: {
        id: 1,
        email: dto.email,
        username: dto.username,
        password: 'hidden',
        internalSecret: 'secret'
      },
      accessToken: 'access-token',
      refreshToken: 'refresh-token'
    })

    const result = await controller.register(res, dto)

    expect(service.register).toHaveBeenCalledWith(res, dto)
    expect(result).toBeInstanceOf(ResponseRegisterDto)
    expect(result.user).toBeInstanceOf(ResponseUserDto)
    expect(result).toMatchObject({ accessToken: 'access-token' })
    expect(
      (result.user as unknown as Record<string, unknown>).password
    ).toBeUndefined()
    expect(
      (result.user as unknown as Record<string, unknown>).internalSecret
    ).toBeUndefined()
    expect(
      (result as unknown as Record<string, unknown>).refreshToken
    ).toBeUndefined()
  })

  it('login delegates to auth service', async () => {
    const dto: CreateLoginDto = {
      email: 'john@mail.com',
      password: 'Password1!'
    }
    const res = {} as Response

    service.login.mockResolvedValueOnce({
      user: { id: 2, email: dto.email, username: 'john', password: 'hidden' },
      accessToken: 'a-token',
      refreshToken: 'refresh-token'
    })

    const result = await controller.login(res, dto)

    expect(service.login).toHaveBeenCalledWith(res, dto)
    expect(result).toBeInstanceOf(ResponseLoginDto)
    expect(result.user).toBeInstanceOf(ResponseUserDto)
    expect(result).toMatchObject({ accessToken: 'a-token' })
    expect(
      (result.user as unknown as Record<string, unknown>).password
    ).toBeUndefined()
    expect(
      (result as unknown as Record<string, unknown>).refreshToken
    ).toBeUndefined()
  })

  it('logout clears cookie and delegates token removal', async () => {
    const req = {
      cookies: {
        refreshToken: 'refresh-token'
      }
    } as unknown as AuthRequest
    const res = {
      clearCookie: jest.fn()
    } as unknown as Response

    service.logout.mockResolvedValueOnce({ internalSecret: 'secret' })

    const result = await controller.logout(req, res)

    expect(res.clearCookie).toHaveBeenCalledWith('refreshToken')
    expect(service.logout).toHaveBeenCalledWith('refresh-token')
    expect(result).toBeInstanceOf(EmptyResponseDto)
    expect(result).toEqual({})
    expect(Object.keys(result as object)).toHaveLength(0)
  })

  it('refresh delegates to auth service', async () => {
    const req = {
      cookies: { refreshToken: 'refresh-token' }
    } as unknown as Request
    const res = {} as Response

    service.refresh.mockResolvedValueOnce({
      accessToken: 'new-access',
      refreshToken: 'refresh-token'
    })

    const result = await controller.refresh(req, res)

    expect(service.refresh).toHaveBeenCalledWith(req, res)
    expect(result).toBeInstanceOf(ResponseRefreshDto)
    expect(result).toEqual({ accessToken: 'new-access' })
    expect(
      (result as unknown as Record<string, unknown>).refreshToken
    ).toBeUndefined()
  })
})
