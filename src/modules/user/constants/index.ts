import { Prisma } from '@prisma/client'

export const includeUserWithRelations: Prisma.UserInclude = {
  profile: {
    include: {
      avatarFile: true
    }
  }
} as const
