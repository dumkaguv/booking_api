import { Prisma } from '@prisma/client'

import { prisma } from '../prisma-client'

type ListingRef = Pick<Prisma.ListingCreateInput, 'title'> & { id: number }

type SeedListingUnit = {
  listingIndex: number
  name: string
  capacity: number
  isActive: boolean
}

const listingUnits: SeedListingUnit[] = [
  { listingIndex: 0, name: 'Apartment A1', capacity: 3, isActive: true },
  { listingIndex: 0, name: 'Apartment A2', capacity: 2, isActive: true },
  { listingIndex: 1, name: 'House Main', capacity: 6, isActive: true },
  { listingIndex: 1, name: 'Garden Studio', capacity: 2, isActive: false },
  { listingIndex: 2, name: 'Room 101', capacity: 2, isActive: true },
  { listingIndex: 2, name: 'Room 102', capacity: 2, isActive: true },
  { listingIndex: 3, name: 'Palm Suite', capacity: 4, isActive: true },
  { listingIndex: 3, name: 'Garden Suite', capacity: 3, isActive: true },
  { listingIndex: 4, name: 'Hotel 201', capacity: 2, isActive: true },
  { listingIndex: 4, name: 'Hotel 202', capacity: 2, isActive: true },
  { listingIndex: 5, name: 'Hostel Bed A', capacity: 1, isActive: true },
  { listingIndex: 5, name: 'Hostel Bed B', capacity: 1, isActive: true },
  { listingIndex: 6, name: 'Loft North', capacity: 2, isActive: true },
  { listingIndex: 6, name: 'Loft South', capacity: 2, isActive: true },
  { listingIndex: 7, name: 'Cabin Main', capacity: 3, isActive: true },
  { listingIndex: 7, name: 'Cabin Mini', capacity: 2, isActive: true },
  { listingIndex: 8, name: 'Sea Breeze 1', capacity: 2, isActive: true },
  { listingIndex: 8, name: 'Sea Breeze 2', capacity: 2, isActive: true },
  { listingIndex: 9, name: 'City Nest One', capacity: 2, isActive: true },
  { listingIndex: 9, name: 'City Nest Two', capacity: 2, isActive: false },
  { listingIndex: 10, name: 'Mountain Room A', capacity: 2, isActive: true },
  { listingIndex: 10, name: 'Mountain Room B', capacity: 2, isActive: true }
]

export const createListingUnits = (listings: ListingRef[]) => {
  return prisma.$transaction(
    listingUnits.map((unit) => {
      const listing = listings[unit.listingIndex]

      if (!listing) {
        throw new Error(
          `Listing index "${unit.listingIndex}" not found for unit seed`
        )
      }

      return prisma.listingUnit.create({
        data: {
          name: unit.name,
          capacity: unit.capacity,
          isActive: unit.isActive,
          listingId: listing.id
        }
      })
    })
  )
}
