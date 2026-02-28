import { Prisma } from '@prisma/client'

import { prisma } from '../prisma-client'

type SeedProfile = Omit<
  Prisma.ProfileCreateManyInput,
  'createdAt' | 'id' | 'updatedAt' | 'userId'
>

const profiles: SeedProfile[] = [
  {
    firstName: 'Alex',
    lastName: 'Nistor',
    birthDay: new Date('1995-02-12'),
    phone: '+37360000001',
    biography: 'Backend developer and traveler'
  },
  {
    firstName: 'Maria',
    lastName: 'Popa',
    birthDay: new Date('1997-07-01'),
    phone: '+37360000002',
    biography: 'Product manager, coffee enthusiast'
  },
  {
    firstName: 'John',
    lastName: 'Smith',
    birthDay: new Date('1993-09-20'),
    phone: '+37360000003',
    biography: 'Freelance designer'
  },
  {
    firstName: 'Elena',
    lastName: 'Rusu',
    birthDay: new Date('1998-12-05'),
    phone: '+37360000004',
    biography: 'QA engineer and gamer'
  },
  {
    firstName: 'Ivan',
    lastName: 'Ceban',
    birthDay: new Date('1991-04-18'),
    phone: '+37360000005',
    biography: 'DevOps and automation specialist'
  }
]

export const createProfiles = async (userIds: number[]) => {
  await prisma.profile.createMany({
    data: userIds.map((userId, index) => ({
      userId,
      ...profiles[index]
    }))
  })
}
