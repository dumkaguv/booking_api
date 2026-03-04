import { ForbiddenException } from '@nestjs/common'

import { EmptyResponseDto } from '@/common/dtos/empty-response.dto'
import type { AuthRequest } from '@/common/types'
import { ResponseUserDto } from '@/modules/user/dto'

import { UserController } from './user.controller'
import { UserService } from './user.service'

type UserServiceMock = {
  changePassword: jest.Mock
  findAll: jest.Mock
  findOne: jest.Mock
  remove: jest.Mock
  update: jest.Mock
}

describe('UserController', () => {
  let controller: UserController
  let service: UserServiceMock

  beforeEach(() => {
    service = {
      changePassword: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      remove: jest.fn(),
      update: jest.fn()
    }

    controller = new UserController(service as unknown as UserService)
  })

  it('findAll forwards query and wraps paginated response', async () => {
    service.findAll.mockResolvedValueOnce({
      data: [
        {
          id: 1,
          username: 'john',
          email: 'john@mail.com',
          password: 'hidden',
          internalSecret: 'secret'
        }
      ],
      total: 1
    })
    const query = { page: 1, pageSize: 10 }

    const result = await controller.findAll(query)

    expect(service.findAll).toHaveBeenCalledWith(query)
    expect(result.total).toBe(1)
    expect(result.data[0]).toBeInstanceOf(ResponseUserDto)
    expect(result.data[0]).toMatchObject({
      id: 1,
      username: 'john',
      email: 'john@mail.com'
    })
    expect(
      (result.data[0] as unknown as Record<string, unknown>).password
    ).toBeUndefined()
    expect(
      (result.data[0] as unknown as Record<string, unknown>).internalSecret
    ).toBeUndefined()
  })

  it('findOne parses id and delegates to service', async () => {
    service.findOne.mockResolvedValueOnce({
      id: 4,
      username: 'mike',
      email: 'mike@mail.com',
      password: 'hidden'
    })

    const result = await controller.findOne('4')

    expect(service.findOne).toHaveBeenCalledWith(4)
    expect(result).toBeInstanceOf(ResponseUserDto)
    expect(result).toMatchObject({
      id: 4,
      username: 'mike',
      email: 'mike@mail.com'
    })
    expect(
      (result as unknown as Record<string, unknown>).password
    ).toBeUndefined()
  })

  it('update throws if requester id and path id differ', () => {
    const req = { user: { id: 10 } } as AuthRequest

    expect(() => controller.update(req, '2', { username: 'john' })).toThrow(
      ForbiddenException
    )
  })

  it('update delegates when requester edits own profile', async () => {
    const req = { user: { id: 2 } } as AuthRequest
    const dto = { username: 'next-name' }

    service.update.mockResolvedValueOnce({
      id: 2,
      username: 'next-name',
      email: 'john@mail.com',
      password: 'hidden'
    })

    const result = await controller.update(req, '2', dto)

    expect(service.update).toHaveBeenCalledWith(2, dto)
    expect(result).toBeInstanceOf(ResponseUserDto)
    expect(result).toMatchObject({ id: 2, username: 'next-name' })
    expect(
      (result as unknown as Record<string, unknown>).password
    ).toBeUndefined()
  })

  it('changePassword throws if requester id and path id differ', () => {
    const req = { user: { id: 10 } } as AuthRequest

    expect(() =>
      controller.changePassword(req, '2', {
        oldPassword: 'OldPass1!',
        newPassword: 'NewPass2@'
      })
    ).toThrow(ForbiddenException)
  })

  it('changePassword delegates to service for own account', async () => {
    const req = { user: { id: 3 } } as AuthRequest

    service.changePassword.mockResolvedValueOnce({
      id: 3,
      username: 'john',
      email: 'john@mail.com',
      password: 'hidden'
    })

    const result = await controller.changePassword(req, '3', {
      oldPassword: 'OldPass1!',
      newPassword: 'NewPass2@'
    })

    expect(service.changePassword).toHaveBeenCalledWith(
      3,
      'OldPass1!',
      'NewPass2@'
    )
    expect(result).toBeInstanceOf(EmptyResponseDto)
    expect(result).toEqual({})
    expect(Object.keys(result as object)).toHaveLength(0)
  })

  it('remove throws if requester id and path id differ', () => {
    const req = { user: { id: 10 } } as AuthRequest

    expect(() => controller.remove(req, '2')).toThrow(ForbiddenException)
  })

  it('remove delegates when requester deletes own account', async () => {
    const req = { user: { id: 5 } } as AuthRequest

    service.remove.mockResolvedValueOnce({ id: 5 })

    const result = await controller.remove(req, '5')

    expect(service.remove).toHaveBeenCalledWith(5)
    expect(result).toEqual({ id: 5 })
  })
})
