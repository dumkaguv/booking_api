import { UserService } from '@/modules/user/user.service'
import { PrismaService } from '@/prisma/prisma.service'


import { ProfileService } from './profile.service'

type PrismaMock = {
  profile: {
    create: jest.Mock
    findFirstOrThrow: jest.Mock
    update: jest.Mock
  }
}

type UserServiceMock = {
  findOne: jest.Mock
}

describe('ProfileService', () => {
  let prisma: PrismaMock
  let service: ProfileService
  let userService: UserServiceMock

  beforeEach(() => {
    prisma = {
      profile: {
        create: jest.fn(),
        findFirstOrThrow: jest.fn(),
        update: jest.fn()
      }
    }

    userService = {
      findOne: jest.fn()
    }

    service = new ProfileService(
      prisma as unknown as PrismaService,
      userService as unknown as UserService
    )
  })

  it('findOne ensures profile exists and returns user with relations', async () => {
    const user = {
      id: 7,
      username: 'john',
      email: 'john@mail.com'
    }

    prisma.profile.findFirstOrThrow.mockResolvedValueOnce({ id: 70, userId: 7 })
    userService.findOne.mockResolvedValueOnce(user)

    const result = await service.findOne(7)

    expect(prisma.profile.findFirstOrThrow).toHaveBeenCalledWith({
      where: { userId: 7 }
    })
    expect(userService.findOne).toHaveBeenCalledWith(7)
    expect(result).toBe(user)
  })

  it('create stores profile bound to user id', async () => {
    const dto = {
      firstName: 'John',
      lastName: 'Doe',
      phone: '+373000000'
    }
    const created = { id: 1, userId: 3, ...dto }

    prisma.profile.create.mockResolvedValueOnce(created)

    const result = await service.create(3, dto)

    expect(prisma.profile.create).toHaveBeenCalledWith({
      data: { userId: 3, ...dto }
    })
    expect(result).toBe(created)
  })

  it('update patches profile by user id', async () => {
    const dto = {
      biography: 'Hi'
    }
    const updated = { id: 9, userId: 3, ...dto }

    prisma.profile.update.mockResolvedValueOnce(updated)

    const result = await service.update(3, dto)

    expect(prisma.profile.update).toHaveBeenCalledWith({
      data: dto,
      where: { userId: 3 }
    })
    expect(result).toBe(updated)
  })
})
