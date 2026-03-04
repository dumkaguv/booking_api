import { prisma } from '../prisma-client'

export const createTokens = async (userIds: number[]) => {
  await prisma.token.createMany({
    data: userIds.map((userId, index) => ({
      userId,
      refreshToken: `seed-refresh-token-${index + 1}`
    }))
  })
}
