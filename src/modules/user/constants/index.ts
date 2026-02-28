import { Prisma } from '@prisma/client'

export const includeUserWithRelations: Prisma.UserInclude = {
  profile: true
} as const
