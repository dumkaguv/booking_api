import { BookingStatusEnum } from '@prisma/client'

import { prisma } from '../prisma-client'

type BookingRef = {
  id: number
  unitId: number
  checkIn: Date
  checkOut: Date
  status: BookingStatusEnum
}

const statusesWithBlockedDays = new Set<BookingStatusEnum>([
  BookingStatusEnum.PENDING,
  BookingStatusEnum.CONFIRMED,
  BookingStatusEnum.COMPLETED
])

const toUtcDate = (value: Date) =>
  new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()))

const addOneUtcDay = (value: Date) => {
  const result = new Date(value)
  result.setUTCDate(result.getUTCDate() + 1)
  return result
}

const getStayDates = (checkIn: Date, checkOut: Date) => {
  const dates: Date[] = []
  let current = toUtcDate(checkIn)
  const end = toUtcDate(checkOut)

  while (current < end) {
    dates.push(new Date(current))
    current = addOneUtcDay(current)
  }

  return dates
}

export const createBookingDays = async (bookings: BookingRef[]) => {
  const bookingDays = bookings
    .filter((booking) => statusesWithBlockedDays.has(booking.status))
    .flatMap((booking) =>
      getStayDates(booking.checkIn, booking.checkOut).map((date) => ({
        bookingId: booking.id,
        unitId: booking.unitId,
        date
      }))
    )

  if (bookingDays.length === 0) {
    return
  }

  await prisma.bookingDay.createMany({
    data: bookingDays
  })
}
