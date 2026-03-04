import { PrismaService } from '@/prisma/prisma.service'

import { ProfileService } from './profile.service'

type PrismaMock = {
  profile: {
    create: jest.Mock
    findFirst: jest.Mock
    update: jest.Mock
  }
}

describe('ProfileService', () => {
  let prisma: PrismaMock
  let service: ProfileService

  beforeEach(() => {
    prisma = {
      profile: {
        create: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn()
      }
    }

    service = new ProfileService(prisma as unknown as PrismaService)
  })

  it('findOne returns profile with nested user relations', async () => {
    const profile = {
      id: 70,
      userId: 7,
      user: { id: 7, username: 'john', email: 'john@mail.com' }
    }

    prisma.profile.findFirst.mockResolvedValueOnce(profile)

    const result = await service.findOne(7)

    expect(prisma.profile.findFirst).toHaveBeenCalledWith({
      include: { user: { include: { profile: true } } },
      where: { userId: 7 }
    })
    expect(result).toBe(profile)
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

  it('create normalizes date-only birthDay to Date', async () => {
    const dto = {
      firstName: 'John',
      lastName: 'Doe',
      birthDay: '2026-03-02'
    }

    prisma.profile.create.mockResolvedValueOnce({ id: 1, userId: 3, ...dto })

    await service.create(3, dto)

    expect(prisma.profile.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: 3,
        firstName: 'John',
        lastName: 'Doe',
        birthDay: new Date('2026-03-02T00:00:00.000Z')
      })
    })
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

  it('update normalizes date-only birthDay to Date', async () => {
    const dto = {
      birthDay: '2026-03-02'
    }

    prisma.profile.update.mockResolvedValueOnce({ id: 9, userId: 3 })

    await service.update(3, dto)

    expect(prisma.profile.update).toHaveBeenCalledWith({
      data: {
        birthDay: new Date('2026-03-02T00:00:00.000Z')
      },
      where: { userId: 3 }
    })
  })
})
