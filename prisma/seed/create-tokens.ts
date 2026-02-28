import { prisma } from '../prisma-client'

const refreshTokens = [
  'seed-refresh-token-1',
  'seed-refresh-token-2',
  'seed-refresh-token-3',
  'seed-refresh-token-4',
  'seed-refresh-token-5'
]

export const createTokens = async (userIds: number[]) => {
  await prisma.token.createMany({
    data: userIds.map((userId, index) => ({
      userId,
      refreshToken: refreshTokens[index]
    }))
  })
}
