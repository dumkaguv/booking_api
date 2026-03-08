import { includeBookingWithRelations } from '@/modules/booking/constants'

export const includeReviewWithRelations = {
  booking: {
    include: includeBookingWithRelations
  },
  author: true
} as const
