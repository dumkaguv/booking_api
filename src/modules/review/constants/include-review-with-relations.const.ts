import { includeBookingWithRelations } from '@/modules/booking/constants'
import { includeListingWithRelations } from '@/modules/listing/constants'

export const includeReviewWithRelations = {
  booking: {
    include: includeBookingWithRelations
  },
  listing: {
    include: includeListingWithRelations
  },
  author: true
} as const
