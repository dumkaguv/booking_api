import {
  BadRequestException,
  UnauthorizedException
} from '@nestjs/common'
import { hashSync } from 'bcrypt'

import { paginate } from '@/common/utils'
import { PrismaService } from '@/prisma/prisma.service'

import { includeUserWithRelations } from './constants'
import { UserService } from './user.service'

jest.mock('@/common/utils', () => ({
  paginate: jest.fn()
}))

type UserModelMock = {
  create: jest.Mock
  delete: jest.Mock
  findFirst: jest.Mock
  findFirstOrThrow: jest.Mock
  findUniqueOrThrow: jest.Mock
  update: jest.Mock
}

type PrismaMock = {
  user: UserModelMock
}

describe('UserService', () => {
  let prisma: PrismaMock
  let service: UserService
  let paginateMock: jest.MockedFunction<typeof paginate>

  beforeEach(() => {
    prisma = {
      user: {
        create: jest.fn(),
        delete: jest.fn(),
        findFirst: jest.fn(),
        findFirstOrThrow: jest.fn(),
        findUniqueOrThrow: jest.fn(),
        update: jest.fn()
      }
    }

    service = new UserService(prisma as unknown as PrismaService)
    paginateMock = paginate as jest.MockedFunction<typeof paginate>
    paginateMock.mockReset()
  })

  it('findAll delegates to paginate with user model defaults', async () => {
    const expected = { data: [], total: 0 }
    const query: Parameters<UserService['findAll']>[0] = {
      ordering: '-id',
      page: 2,
      pageSize: 5,
      search: 'john'
    }

    paginateMock.mockResolvedValueOnce(expected)

    const result = await service.findAll(query)

    expect(result).toEqual(expected)
    expect(paginateMock).toHaveBeenCalledWith({
      prisma,
      model: 'user',
      include: includeUserWithRelations,
      ...query
    })
  })

  it('findOne calls prisma with include relations', async () => {
    const expected = { id: 1 }

    prisma.user.findUniqueOrThrow.mockResolvedValueOnce(expected)

    const result = await service.findOne(1)

    expect(result).toBe(expected)
    expect(prisma.user.findUniqueOrThrow).toHaveBeenCalledWith({
      where: { id: 1 },
      include: includeUserWithRelations
    })
  })

  it('create throws if user with same email or username exists', async () => {
    prisma.user.findFirst.mockResolvedValueOnce({ id: 10 })

    await expect(
      service.create({
        email: 'john@mail.com',
        username: 'john',
        password: 'Password1!'
      })
    ).rejects.toThrow(BadRequestException)

    expect(prisma.user.create).not.toHaveBeenCalled()
  })

  it('create hashes password and persists user', async () => {
    const dto = {
      email: 'john@mail.com',
      username: 'john',
      password: 'Password1!'
    }
    const created = {
      id: 1,
      ...dto,
      password: 'hashed-password'
    }

    prisma.user.findFirst.mockResolvedValueOnce(null)
    prisma.user.create.mockResolvedValueOnce(created)

    const result = await service.create(dto)

    expect(result).toBe(created)
    expect(prisma.user.create).toHaveBeenCalledWith({
      data: {
        email: dto.email,
        username: dto.username,
        password: expect.any(String)
      },
      include: includeUserWithRelations
    })

    const createCallArg = prisma.user.create.mock.calls[0][0] as {
      data: { password: string }
    }

    expect(createCallArg.data.password).not.toBe(dto.password)
  })

  it('update writes data and returns fresh user state', async () => {
    const updatedUser = { id: 2, username: 'next' }

    prisma.user.update.mockResolvedValueOnce(updatedUser)
    prisma.user.findUniqueOrThrow.mockResolvedValueOnce(updatedUser)

    const result = await service.update(2, { username: 'next' })

    expect(result).toBe(updatedUser)
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 2 },
      data: { username: 'next' }
    })
    expect(prisma.user.findUniqueOrThrow).toHaveBeenCalledWith({
      where: { id: 2 },
      include: includeUserWithRelations
    })
  })

  it('remove deletes user by id', async () => {
    prisma.user.delete.mockResolvedValueOnce({ id: 4 })

    const result = await service.remove(4)

    expect(result).toEqual({ id: 4 })
    expect(prisma.user.delete).toHaveBeenCalledWith({
      where: { id: 4 }
    })
  })

  it('comparePasswords throws when email and userId are missing', async () => {
    await expect(service.comparePasswords('Password1!')).rejects.toThrow(
      BadRequestException
    )

    expect(prisma.user.findFirstOrThrow).not.toHaveBeenCalled()
  })

  it('comparePasswords throws for invalid password', async () => {
    prisma.user.findFirstOrThrow.mockResolvedValueOnce({
      id: 2,
      password: hashSync('DifferentPass1!', 10)
    })

    await expect(
      service.comparePasswords('Password1!', 'john@mail.com')
    ).rejects.toThrow(UnauthorizedException)
  })

  it('comparePasswords returns user for valid credentials', async () => {
    const user = {
      id: 3,
      password: hashSync('Password1!', 10)
    }

    prisma.user.findFirstOrThrow.mockResolvedValueOnce(user)

    const result = await service.comparePasswords('Password1!', undefined, 3)

    expect(result).toBe(user)
    expect(prisma.user.findFirstOrThrow).toHaveBeenCalledWith({
      include: includeUserWithRelations,
      where: { OR: [{ id: 3 }] }
    })
  })

  it('changePassword validates old password and updates hash', async () => {
    const compareSpy = jest
      .spyOn(service, 'comparePasswords')
      .mockResolvedValue({ id: 7 } as never)
    const updateSpy = jest
      .spyOn(service, 'update')
      .mockResolvedValue({ id: 7 } as never)
    const hashSpy = jest
      .spyOn(
        service as unknown as { hashPassword: (value: string) => string },
        'hashPassword'
      )
      .mockReturnValue('new-hash')

    await service.changePassword(7, 'OldPass1!', 'NewPass2@')

    expect(compareSpy).toHaveBeenCalledWith('OldPass1!', undefined, 7)
    expect(hashSpy).toHaveBeenCalledWith('NewPass2@')
    expect(updateSpy).toHaveBeenCalledWith(7, { password: 'new-hash' })
  })
})
