import type { AuthRequest } from '@/common/types'

import type { CreateUserDto } from '@/modules/user/dto'

import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'

import type { CreateLoginDto } from './dto'

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
      user: { id: 1, email: dto.email, username: dto.username },
      accessToken: 'access-token'
    })

    const result = await controller.register(res, dto)

    expect(service.register).toHaveBeenCalledWith(res, dto)
    expect(result).toMatchObject({ accessToken: 'access-token' })
  })

  it('login delegates to auth service', async () => {
    const dto: CreateLoginDto = {
      email: 'john@mail.com',
      password: 'Password1!'
    }
    const res = {} as Response

    service.login.mockResolvedValueOnce({
      user: { id: 2, email: dto.email },
      accessToken: 'a-token'
    })

    const result = await controller.login(res, dto)

    expect(service.login).toHaveBeenCalledWith(res, dto)
    expect(result).toMatchObject({ accessToken: 'a-token' })
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

    service.logout.mockResolvedValueOnce(undefined)

    const result = await controller.logout(req, res)

    expect(res.clearCookie).toHaveBeenCalledWith('refreshToken')
    expect(service.logout).toHaveBeenCalledWith('refresh-token')
    expect(result).toBeUndefined()
  })

  it('refresh delegates to auth service', async () => {
    const req = {
      cookies: { refreshToken: 'refresh-token' }
    } as unknown as Request
    const res = {} as Response

    service.refresh.mockResolvedValueOnce({ accessToken: 'new-access' })

    const result = await controller.refresh(req, res)

    expect(service.refresh).toHaveBeenCalledWith(req, res)
    expect(result).toEqual({ accessToken: 'new-access' })
  })
})
