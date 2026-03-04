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
  },
  {
    username: 'olga',
    email: 'olga@example.com',
    password: hashedPassword,
    isActivated: true,
    activationLink: null,
    activatedAt: new Date('2026-01-13T09:00:00.000Z')
  },
  {
    username: 'daniel',
    email: 'daniel@example.com',
    password: hashedPassword,
    isActivated: true,
    activationLink: null,
    activatedAt: new Date('2026-01-14T09:00:00.000Z')
  },
  {
    username: 'sophia',
    email: 'sophia@example.com',
    password: hashedPassword,
    isActivated: false,
    activationLink: 'activation-sophia-2026',
    activatedAt: null
  },
  {
    username: 'nikita',
    email: 'nikita@example.com',
    password: hashedPassword,
    isActivated: true,
    activationLink: null,
    activatedAt: new Date('2026-01-15T09:00:00.000Z')
  },
  {
    username: 'emma',
    email: 'emma@example.com',
    password: hashedPassword,
    isActivated: true,
    activationLink: null,
    activatedAt: new Date('2026-01-16T09:00:00.000Z')
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
