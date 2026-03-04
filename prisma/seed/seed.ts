import { prisma } from '../prisma-client'

import { createAmenities } from './create-amenities'
import { createBookingDays } from './create-booking-days'
import { createBookings } from './create-bookings'
import { createListingUnits } from './create-listing-units'
import { createListings } from './create-listings'
import { createProfiles } from './create-profiles'
import { createReviews } from './create-reviews'
import { createRoles } from './create-roles'
import { createTokens } from './create-tokens'
import { createUnitCalendarDays } from './create-unit-calendar-days'
import { createUsers } from './create-users'

const up = async () => {
  await createRoles()

  const createdUsers = await createUsers()
  const userIds = createdUsers.map(({ id }) => id)

  await createProfiles(userIds)
  await createTokens(userIds)

  await createAmenities()

  const createdListings = await createListings(createdUsers)
  const createdListingUnits = await createListingUnits(createdListings)

  await createUnitCalendarDays(createdListingUnits)

  const createdBookings = await createBookings(
    createdUsers,
    createdListingUnits,
    createdListings
  )

  await createBookingDays(createdBookings)
  await createReviews(createdBookings)
}

const down = async () => {
  const tables = await prisma.$queryRaw<
    { tablename: string }[]
  >`SELECT tablename FROM pg_tables WHERE schemaname='public'`

  for (const { tablename } of tables) {
    if (tablename === '_prisma_migrations') {
      continue
    }

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
    throw error
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
