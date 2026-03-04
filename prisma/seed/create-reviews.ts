import { BookingStatusEnum } from '@prisma/client'

import { prisma } from '../prisma-client'

type BookingRef = {
  id: number
  listingId: number | null
  guestId: number
  status: BookingStatusEnum
}

export const createReviews = async (bookings: BookingRef[]) => {
  const reviewSources = bookings.filter(
    (booking): booking is BookingRef & { listingId: number } =>
      booking.status === BookingStatusEnum.COMPLETED &&
      typeof booking.listingId === 'number'
  )

  if (reviewSources.length === 0) {
    return
  }

  await prisma.review.createMany({
    data: reviewSources.map((booking, index) => ({
      bookingId: booking.id,
      listingId: booking.listingId,
      authorId: booking.guestId,
      rating: index % 2 === 0 ? 5 : 4,
      comment:
        index % 2 === 0
          ? 'Great stay, clean place and fast communication.'
          : 'Good location and value for money.'
    }))
  })
}
