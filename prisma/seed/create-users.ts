import { Prisma, RolesEnum } from '@prisma/client'
import { hashSync } from 'bcrypt'

import { prisma } from '../prisma-client'

type SeedUser = Omit<Prisma.UserCreateInput, 'role'> & { role?: RolesEnum }

const defaultPassword = '11111'
const hashedPassword = hashSync(defaultPassword, 10)

const users: SeedUser[] = [
  {
    username: 'alex',
    email: 'alex@example.com',
    password: hashedPassword,
    isActivated: true,
    activationLink: null,
    activatedAt: new Date('2026-01-10T09:00:00.000Z'),
    role: RolesEnum.ADMIN
  },
  {
    username: 'maria',
    email: 'maria@example.com',
    password: hashedPassword,
    isActivated: true,
    activationLink: null,
    activatedAt: new Date('2026-01-11T09:00:00.000Z')
  },
  {
    username: 'john',
    email: 'john@example.com',
    password: hashedPassword,
    isActivated: false,
    activationLink: 'activation-john-2026',
    activatedAt: null
  },
  {
    username: 'elena',
    email: 'elena@example.com',
    password: hashedPassword,
    isActivated: true,
    activationLink: null,
    activatedAt: new Date('2026-01-12T09:00:00.000Z')
  },
  {
    username: 'ivan',
    email: 'ivan@example.com',
    password: hashedPassword,
    isActivated: false,
    activationLink: 'activation-ivan-2026',
    activatedAt: null
  }
]

export const createUsers = () => {
  return prisma.$transaction(
    users.map(({ role, ...user }) =>
      prisma.user.create({
        data: {
          ...user,
          role: { connect: { code: role ?? RolesEnum.USER } }
        }
      })
    )
  )
}
