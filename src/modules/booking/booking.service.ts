import { BadRequestException, Injectable } from '@nestjs/common'
import {
  BookingStatusEnum,
  Prisma,
  UnitCalendarDayStateEnum
} from '@prisma/client'

import { FindAllQueryDto } from '@/common/dtos'
import { normalizeDateTime, paginate } from '@/common/utils'
import { includeBookingWithRelations } from '@/modules/booking/constants'
import { PrismaService } from '@/prisma/prisma.service'

import { CreateBookingDto, ResponseBookingDto, UpdateBookingDto } from './dto'

const statusesWithBlockedDays = new Set<BookingStatusEnum>([
  BookingStatusEnum.PENDING,
  BookingStatusEnum.CONFIRMED,
  BookingStatusEnum.COMPLETED
])

function toUtcDate(value: Date) {
  return new Date(
    Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate())
  )
}

function addOneUtcDay(value: Date) {
  const result = new Date(value)

  result.setUTCDate(result.getUTCDate() + 1)

  return result
}

function getStayDates(checkIn: Date, checkOut: Date) {
  const dates: Date[] = []
  let current = toUtcDate(checkIn)
  const end = toUtcDate(checkOut)

  while (current < end) {
    dates.push(new Date(current))
    current = addOneUtcDay(current)
  }

  return dates
}

@Injectable()
export class BookingsService {
  constructor(private readonly prisma: PrismaService) {}

  public findAll(guestId: number, query: FindAllQueryDto<ResponseBookingDto>) {
    return paginate({
      prisma: this.prisma,
      model: 'booking',
      include: includeBookingWithRelations,
      where: { guestId },
      ...query
    })
  }

  public findOne(id: number, guestId: number) {
    return this.prisma.booking.findFirstOrThrow({
      where: { id, guestId },
      include: includeBookingWithRelations
    })
  }

  public async create(guestId: number, dto: CreateBookingDto) {
    const unit = await this.getUnitSnapshot(dto.unitId)

    this.ensureGuestsCount(dto.guestsCount, unit.capacity)

    const checkIn = normalizeDateTime(dto.checkIn) as Date
    const checkOut = normalizeDateTime(dto.checkOut) as Date
    const confirmedAt = normalizeDateTime(dto.confirmedAt) as Date | undefined
    const cancelledAt = normalizeDateTime(dto.cancelledAt) as Date | undefined
    const status = dto.status ?? BookingStatusEnum.PENDING

    this.ensureDateRange(checkIn, checkOut)
    await this.ensureUnitIsNotBlockedByCalendar(
      unit.id,
      checkIn,
      checkOut,
      status
    )

    return this.prisma.$transaction(async (tx) => {
      const booking = await tx.booking.create({
        data: {
          unitId: unit.id,
          guestId,
          listingId: unit.listingId,
          checkIn,
          checkOut,
          guestsCount: dto.guestsCount,
          status,
          totalAmount: dto.totalAmount,
          currency: dto.currency,
          confirmedAt,
          cancelledAt,
          cancelReason: dto.cancelReason
        },
        include: includeBookingWithRelations
      })

      await this.syncBookingDays(
        tx,
        booking.id,
        unit.id,
        checkIn,
        checkOut,
        status
      )

      return booking
    })
  }

  public async update(id: number, guestId: number, dto: UpdateBookingDto) {
    const current = await this.prisma.booking.findFirstOrThrow({
      where: { id, guestId },
      select: {
        id: true,
        unitId: true,
        checkIn: true,
        checkOut: true,
        guestsCount: true,
        status: true
      }
    })

    const targetUnitId = dto.unitId ?? current.unitId
    const unit = await this.getUnitSnapshot(targetUnitId)

    const nextGuestsCount = dto.guestsCount ?? current.guestsCount

    this.ensureGuestsCount(nextGuestsCount, unit.capacity)

    const normalizedCheckIn =
      dto.checkIn === undefined
        ? undefined
        : (normalizeDateTime(dto.checkIn) as Date)
    const normalizedCheckOut =
      dto.checkOut === undefined
        ? undefined
        : (normalizeDateTime(dto.checkOut) as Date)
    const normalizedConfirmedAt =
      dto.confirmedAt === undefined
        ? undefined
        : (normalizeDateTime(dto.confirmedAt) as Date)
    const normalizedCancelledAt =
      dto.cancelledAt === undefined
        ? undefined
        : (normalizeDateTime(dto.cancelledAt) as Date)

    const nextCheckIn = normalizedCheckIn ?? current.checkIn
    const nextCheckOut = normalizedCheckOut ?? current.checkOut
    const nextStatus = dto.status ?? current.status

    this.ensureDateRange(nextCheckIn, nextCheckOut)
    await this.ensureUnitIsNotBlockedByCalendar(
      targetUnitId,
      nextCheckIn,
      nextCheckOut,
      nextStatus
    )

    return this.prisma.$transaction(async (tx) => {
      const booking = await tx.booking.update({
        where: { id },
        data: {
          ...(dto.unitId === undefined
            ? {}
            : {
                unitId: unit.id,
                listingId: unit.listingId
              }),
          ...(dto.checkIn === undefined ? {} : { checkIn: normalizedCheckIn }),
          ...(dto.checkOut === undefined
            ? {}
            : { checkOut: normalizedCheckOut }),
          ...(dto.guestsCount === undefined
            ? {}
            : { guestsCount: dto.guestsCount }),
          ...(dto.status === undefined ? {} : { status: dto.status }),
          ...(dto.totalAmount === undefined
            ? {}
            : { totalAmount: dto.totalAmount }),
          ...(dto.currency === undefined ? {} : { currency: dto.currency }),
          ...(dto.confirmedAt === undefined
            ? {}
            : { confirmedAt: normalizedConfirmedAt }),
          ...(dto.cancelledAt === undefined
            ? {}
            : { cancelledAt: normalizedCancelledAt }),
          ...(dto.cancelReason === undefined
            ? {}
            : { cancelReason: dto.cancelReason })
        },
        include: includeBookingWithRelations
      })

      await tx.bookingDay.deleteMany({
        where: { bookingId: id }
      })

      await this.syncBookingDays(
        tx,
        id,
        targetUnitId,
        nextCheckIn,
        nextCheckOut,
        nextStatus
      )

      return booking
    })
  }

  public async remove(id: number, guestId: number) {
    await this.prisma.booking.findFirstOrThrow({
      where: { id, guestId },
      select: { id: true }
    })

    return this.prisma.booking.delete({
      where: { id }
    })
  }

  private getUnitSnapshot(unitId: number) {
    return this.prisma.listingUnit.findUniqueOrThrow({
      where: { id: unitId },
      select: {
        id: true,
        capacity: true,
        listingId: true
      }
    })
  }

  private async syncBookingDays(
    tx: Prisma.TransactionClient,
    bookingId: number,
    unitId: number,
    checkIn: Date,
    checkOut: Date,
    status: BookingStatusEnum
  ) {
    if (!statusesWithBlockedDays.has(status)) {
      return
    }

    const stayDates = getStayDates(checkIn, checkOut)

    if (stayDates.length === 0) {
      return
    }

    await tx.bookingDay.createMany({
      data: stayDates.map((date) => ({
        bookingId,
        unitId,
        date
      }))
    })
  }

  private ensureDateRange(checkIn: Date, checkOut: Date) {
    if (toUtcDate(checkOut) <= toUtcDate(checkIn)) {
      throw new BadRequestException('checkOut must be later than checkIn')
    }
  }

  private ensureGuestsCount(guestsCount: number, capacity: number) {
    if (guestsCount > capacity) {
      throw new BadRequestException('guestsCount exceeds unit capacity')
    }
  }

  private async ensureUnitIsNotBlockedByCalendar(
    unitId: number,
    checkIn: Date,
    checkOut: Date,
    status: BookingStatusEnum
  ) {
    if (!statusesWithBlockedDays.has(status)) {
      return
    }

    const stayDates = getStayDates(checkIn, checkOut)

    if (stayDates.length === 0) {
      return
    }

    const blockedDay = await this.prisma.unitCalendarDay.findFirst({
      where: {
        unitId,
        state: UnitCalendarDayStateEnum.BLOCKED,
        date: { in: stayDates }
      },
      select: { id: true }
    })

    if (blockedDay) {
      throw new BadRequestException(
        'Selected date range is blocked by unit calendar'
      )
    }
  }
}
