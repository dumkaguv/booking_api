import type { AuthRequest } from '@/common/types'

import { ProfileController } from './profile.controller'
import { ProfileService } from './profile.service'

type ProfileServiceMock = {
  create: jest.Mock
  findOne: jest.Mock
  update: jest.Mock
}

describe('ProfileController', () => {
  let controller: ProfileController
  let service: ProfileServiceMock

  beforeEach(() => {
    service = {
      create: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn()
    }

    controller = new ProfileController(service as unknown as ProfileService)
  })

  it('me returns current user profile', async () => {
    const req = { user: { id: 11 } } as AuthRequest

    service.findOne.mockResolvedValueOnce({
      id: 4,
      firstName: 'John',
      lastName: 'Doe',
      user: {
        id: 11,
        username: 'john',
        email: 'john@mail.com',
        password: 'hidden'
      }
    })

    const result = await controller.me(req)

    expect(service.findOne).toHaveBeenCalledWith(11)
    expect(result).toMatchObject({
      id: 4,
      firstName: 'John',
      user: { id: 11, username: 'john', email: 'john@mail.com' }
    })
    expect(
      (result.user as unknown as Record<string, unknown>).password
    ).toBeUndefined()
  })

  it('create stores profile for current user', async () => {
    const req = { user: { id: 5 } } as AuthRequest
    const dto = {
      firstName: 'Jane',
      lastName: 'Smith',
      biography: 'About me'
    }

    service.create.mockResolvedValueOnce({
      id: 1,
      userId: 5,
      ...dto
    })

    const result = await controller.create(req, dto)

    expect(service.create).toHaveBeenCalledWith(5, dto)
    expect(result).toMatchObject({ id: 1, firstName: 'Jane', lastName: 'Smith' })
  })

  it('update patches current user profile', async () => {
    const req = { user: { id: 5 } } as AuthRequest
    const dto = {
      biography: 'Updated bio'
    }

    service.update.mockResolvedValueOnce({
      id: 2,
      userId: 5,
      ...dto
    })

    const result = await controller.update(req, dto)

    expect(service.update).toHaveBeenCalledWith(5, dto)
    expect(result).toMatchObject({ id: 2, biography: 'Updated bio' })
  })
})
