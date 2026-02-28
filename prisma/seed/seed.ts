import { prisma } from '../prisma-client'

import { createProfiles } from './create-profiles'
import { createTokens } from './create-tokens'
import { createUsers } from './create-users'

const up = async () => {
  const createdUsers = await createUsers()
  const userIds = createdUsers.map((user) => user.id)

  await createProfiles(userIds)
  await createTokens(userIds)
}

const down = async () => {
  const tables = await prisma.$queryRaw<
    { tablename: string }[]
  >`SELECT tablename FROM pg_tables WHERE schemaname='public'`

  for (const { tablename } of tables) {
    await prisma.$executeRawUnsafe(
      `TRUNCATE TABLE "${tablename}" RESTART IDENTITY CASCADE`
    )
  }
}

const main = async () => {
  try {
    console.warn('seed down...')
    await down()
    console.warn('seed up...')
    await up()
  } catch (error) {
    console.error(error)
  }
}

main()
  .then(async () => {
    await prisma.$disconnect()
    process.exit(0)
  })
  .catch(async (error) => {
    console.error(error)
    await prisma.$disconnect()
    process.exit(1)
  })
  .finally(async () => await prisma.$disconnect())
