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
  },
  {
    firstName: 'Olga',
    lastName: 'Sava',
    birthDay: new Date('1994-03-10'),
    phone: '+37360000006',
    biography: 'Travel blogger and host'
  },
  {
    firstName: 'Daniel',
    lastName: 'Muntean',
    birthDay: new Date('1990-06-22'),
    phone: '+37360000007',
    biography: 'Sales manager and mountain lover'
  },
  {
    firstName: 'Sophia',
    lastName: 'Ionescu',
    birthDay: new Date('1999-01-15'),
    phone: '+37360000008',
    biography: 'UI designer, remote worker'
  },
  {
    firstName: 'Nikita',
    lastName: 'Petrov',
    birthDay: new Date('1992-11-09'),
    phone: '+37360000009',
    biography: 'Data analyst and weekend traveler'
  },
  {
    firstName: 'Emma',
    lastName: 'Hart',
    birthDay: new Date('1996-05-30'),
    phone: '+37360000010',
    biography: 'Photographer exploring Eastern Europe'
  }
]

export const createProfiles = async (userIds: number[]) => {
  if (userIds.length > profiles.length) {
    throw new Error('Not enough profile seed records for all users')
  }

  await prisma.profile.createMany({
    data: userIds.map((userId, index) => ({
      userId,
      ...profiles[index]
    }))
  })
}
