import { ListingStatusEnum, ListingTypeEnum, Prisma } from '@prisma/client'

import { prisma } from '../prisma-client'

type UserRef = Pick<Prisma.UserCreateInput, 'username'> & { id: number }

type SeedListing = {
  ownerUsername: string
  title: string
  description: string
  status: ListingStatusEnum
  type: ListingTypeEnum
  country: string
  city: string
  addressLine: string
  basePrice: number
  currency: string
  maxGuests: number
  checkInFrom: Date
  checkOutUntil: Date
  instantBook: boolean
  amenityCodes: string[]
}

const listings: SeedListing[] = [
  {
    ownerUsername: 'alex',
    title: 'Central Apartment near Park',
    description: 'Modern apartment in city center, close to public transport.',
    status: ListingStatusEnum.PUBLISHED,
    type: ListingTypeEnum.APARTMENT,
    country: 'Moldova',
    city: 'Chisinau',
    addressLine: 'Stefan cel Mare Blvd 120',
    basePrice: 55,
    currency: 'EUR',
    maxGuests: 3,
    checkInFrom: new Date('2026-06-01T14:00:00.000Z'),
    checkOutUntil: new Date('2026-06-01T11:00:00.000Z'),
    instantBook: true,
    amenityCodes: ['WIFI', 'KITCHEN', 'AIR_CONDITIONING', 'WORKSPACE', 'TV']
  },
  {
    ownerUsername: 'maria',
    title: 'Family House with Garden',
    description: 'Quiet area, private yard and free parking for guests.',
    status: ListingStatusEnum.PUBLISHED,
    type: ListingTypeEnum.HOUSE,
    country: 'Moldova',
    city: 'Balti',
    addressLine: 'Independentei St 45',
    basePrice: 95,
    currency: 'EUR',
    maxGuests: 6,
    checkInFrom: new Date('2026-06-01T15:00:00.000Z'),
    checkOutUntil: new Date('2026-06-01T10:00:00.000Z'),
    instantBook: false,
    amenityCodes: ['WIFI', 'PARKING', 'KITCHEN', 'PET_FRIENDLY', 'SMOKE_ALARM']
  },
  {
    ownerUsername: 'elena',
    title: 'Cozy Old Town Room',
    description: 'Budget room in shared guesthouse with breakfast option.',
    status: ListingStatusEnum.DRAFT,
    type: ListingTypeEnum.ROOM,
    country: 'Moldova',
    city: 'Orhei',
    addressLine: 'Vasile Lupu St 10',
    basePrice: 30,
    currency: 'EUR',
    maxGuests: 2,
    checkInFrom: new Date('2026-06-01T13:00:00.000Z'),
    checkOutUntil: new Date('2026-06-01T11:00:00.000Z'),
    instantBook: true,
    amenityCodes: ['WIFI', 'BREAKFAST', 'SELF_CHECK_IN']
  },
  {
    ownerUsername: 'olga',
    title: 'Palm Villa with Pool',
    description: 'Large villa for groups with private pool and barbecue area.',
    status: ListingStatusEnum.PUBLISHED,
    type: ListingTypeEnum.VILLA,
    country: 'Moldova',
    city: 'Vadul lui Voda',
    addressLine: 'River Road 7',
    basePrice: 220,
    currency: 'EUR',
    maxGuests: 10,
    checkInFrom: new Date('2026-06-01T16:00:00.000Z'),
    checkOutUntil: new Date('2026-06-01T11:00:00.000Z'),
    instantBook: false,
    amenityCodes: ['WIFI', 'POOL', 'BBQ_GRILL', 'PARKING', 'AIR_CONDITIONING']
  },
  {
    ownerUsername: 'daniel',
    title: 'Dacia Business Hotel',
    description:
      'Business-focused hotel with gym, breakfast and airport transfer.',
    status: ListingStatusEnum.PUBLISHED,
    type: ListingTypeEnum.HOTEL,
    country: 'Moldova',
    city: 'Chisinau',
    addressLine: 'Mihai Viteazul St 31',
    basePrice: 120,
    currency: 'EUR',
    maxGuests: 2,
    checkInFrom: new Date('2026-06-01T14:00:00.000Z'),
    checkOutUntil: new Date('2026-06-01T12:00:00.000Z'),
    instantBook: true,
    amenityCodes: ['WIFI', 'GYM', 'BREAKFAST', 'ELEVATOR', 'WORKSPACE']
  },
  {
    ownerUsername: 'sophia',
    title: 'Backpack Hostel Hub',
    description:
      'Affordable hostel in downtown with self check-in and workspace.',
    status: ListingStatusEnum.PUBLISHED,
    type: ListingTypeEnum.HOSTEL,
    country: 'Moldova',
    city: 'Chisinau',
    addressLine: 'Pushkin St 18',
    basePrice: 22,
    currency: 'EUR',
    maxGuests: 1,
    checkInFrom: new Date('2026-06-01T13:00:00.000Z'),
    checkOutUntil: new Date('2026-06-01T10:00:00.000Z'),
    instantBook: true,
    amenityCodes: ['WIFI', 'SELF_CHECK_IN', 'WORKSPACE', 'LUGGAGE_DROP']
  },
  {
    ownerUsername: 'nikita',
    title: 'North Loft Apartment',
    description: 'Minimalist loft with fast Wi-Fi, ideal for remote work.',
    status: ListingStatusEnum.PUBLISHED,
    type: ListingTypeEnum.APARTMENT,
    country: 'Moldova',
    city: 'Bender',
    addressLine: 'Gagarin Ave 9',
    basePrice: 70,
    currency: 'EUR',
    maxGuests: 4,
    checkInFrom: new Date('2026-06-01T14:00:00.000Z'),
    checkOutUntil: new Date('2026-06-01T11:00:00.000Z'),
    instantBook: true,
    amenityCodes: ['WIFI', 'KITCHEN', 'WORKSPACE', 'WASHER', 'BALCONY']
  },
  {
    ownerUsername: 'emma',
    title: 'Lake Cabin Retreat',
    description: 'Cozy wooden cabin by the lake, fireplace and mountain view.',
    status: ListingStatusEnum.PUBLISHED,
    type: ListingTypeEnum.HOUSE,
    country: 'Moldova',
    city: 'Soroca',
    addressLine: 'Lakeview Path 3',
    basePrice: 140,
    currency: 'EUR',
    maxGuests: 5,
    checkInFrom: new Date('2026-06-01T15:00:00.000Z'),
    checkOutUntil: new Date('2026-06-01T11:00:00.000Z'),
    instantBook: false,
    amenityCodes: [
      'WIFI',
      'FIREPLACE',
      'MOUNTAIN_VIEW',
      'PARKING',
      'PET_FRIENDLY'
    ]
  },
  {
    ownerUsername: 'alex',
    title: 'Sea Breeze Apartments',
    description: 'Two-level apartment with balcony and sea view.',
    status: ListingStatusEnum.PUBLISHED,
    type: ListingTypeEnum.APARTMENT,
    country: 'Romania',
    city: 'Constanta',
    addressLine: 'Marina Blvd 44',
    basePrice: 160,
    currency: 'EUR',
    maxGuests: 4,
    checkInFrom: new Date('2026-06-01T15:00:00.000Z'),
    checkOutUntil: new Date('2026-06-01T11:00:00.000Z'),
    instantBook: true,
    amenityCodes: ['WIFI', 'SEA_VIEW', 'BALCONY', 'AIR_CONDITIONING', 'KITCHEN']
  },
  {
    ownerUsername: 'maria',
    title: 'City Nest Studios',
    description: 'Compact studios close to railway station and city center.',
    status: ListingStatusEnum.PUBLISHED,
    type: ListingTypeEnum.APARTMENT,
    country: 'Moldova',
    city: 'Cahul',
    addressLine: 'Station St 22',
    basePrice: 48,
    currency: 'EUR',
    maxGuests: 2,
    checkInFrom: new Date('2026-06-01T14:00:00.000Z'),
    checkOutUntil: new Date('2026-06-01T10:00:00.000Z'),
    instantBook: true,
    amenityCodes: ['WIFI', 'SELF_CHECK_IN', 'KITCHEN', 'SMOKE_ALARM']
  },
  {
    ownerUsername: 'daniel',
    title: 'Mountain View Rooms',
    description: 'Private rooms with shared kitchen near hiking routes.',
    status: ListingStatusEnum.ARCHIVED,
    type: ListingTypeEnum.ROOM,
    country: 'Moldova',
    city: 'Ungheni',
    addressLine: 'Forest Rd 5',
    basePrice: 35,
    currency: 'EUR',
    maxGuests: 2,
    checkInFrom: new Date('2026-06-01T13:00:00.000Z'),
    checkOutUntil: new Date('2026-06-01T11:00:00.000Z'),
    instantBook: false,
    amenityCodes: ['WIFI', 'MOUNTAIN_VIEW', 'PARKING', 'FIRST_AID_KIT']
  }
]

export const createListings = (users: UserRef[]) => {
  const usersByUsername = new Map(users.map((user) => [user.username, user.id]))

  return prisma.$transaction(
    listings.map((listing) => {
      const ownerId = usersByUsername.get(listing.ownerUsername)

      if (!ownerId) {
        throw new Error(
          `Owner "${listing.ownerUsername}" not found for listing seed`
        )
      }

      return prisma.listing.create({
        data: {
          title: listing.title,
          description: listing.description,
          status: listing.status,
          type: listing.type,
          country: listing.country,
          city: listing.city,
          addressLine: listing.addressLine,
          basePrice: listing.basePrice,
          currency: listing.currency,
          maxGuests: listing.maxGuests,
          checkInFrom: listing.checkInFrom,
          checkOutUntil: listing.checkOutUntil,
          instantBook: listing.instantBook,
          owner: { connect: { id: ownerId } },
          amenities: {
            connect: listing.amenityCodes.map((code) => ({ code }))
          }
        }
      })
    })
  )
}
