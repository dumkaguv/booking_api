import { includeListingWithRelations } from '@/modules/listing/constants'

export const includeBookingWithRelations = {
  unit: true,
  guest: true,
  listing: {
    include: includeListingWithRelations
  }
} as const
