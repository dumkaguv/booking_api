import { Prisma, UnitCalendarDayStateEnum } from '@prisma/client'

import { prisma } from '../prisma-client'

type UnitRef = Pick<Prisma.ListingUnitCreateInput, 'name'> & { id: number }

type SeedUnitCalendarDay = {
  unitIndex: number
  date: Date
  state: UnitCalendarDayStateEnum
  priceOverride?: number
  minNights?: number
  note?: string
}

const unitCalendarDays: SeedUnitCalendarDay[] = [
  {
    unitIndex: 0,
    date: new Date('2026-06-20'),
    state: UnitCalendarDayStateEnum.BLOCKED,
    note: 'Maintenance day'
  },
  {
    unitIndex: 0,
    date: new Date('2026-06-21'),
    state: UnitCalendarDayStateEnum.BLOCKED,
    note: 'Maintenance day'
  },
  {
    unitIndex: 2,
    date: new Date('2026-06-25'),
    state: UnitCalendarDayStateEnum.AVAILABLE,
    priceOverride: 120,
    minNights: 2,
    note: 'Weekend pricing'
  },
  {
    unitIndex: 4,
    date: new Date('2026-06-28'),
    state: UnitCalendarDayStateEnum.AVAILABLE,
    priceOverride: 35,
    minNights: 1
  },
  {
    unitIndex: 6,
    date: new Date('2026-08-05'),
    state: UnitCalendarDayStateEnum.AVAILABLE,
    priceOverride: 250,
    minNights: 3,
    note: 'Peak season pricing'
  },
  {
    unitIndex: 7,
    date: new Date('2026-08-06'),
    state: UnitCalendarDayStateEnum.BLOCKED,
    note: 'Private event'
  },
  {
    unitIndex: 8,
    date: new Date('2026-03-19'),
    state: UnitCalendarDayStateEnum.AVAILABLE,
    priceOverride: 140,
    minNights: 1
  },
  {
    unitIndex: 9,
    date: new Date('2026-03-21'),
    state: UnitCalendarDayStateEnum.BLOCKED,
    note: 'Renovation'
  },
  {
    unitIndex: 10,
    date: new Date('2026-06-08'),
    state: UnitCalendarDayStateEnum.AVAILABLE,
    priceOverride: 20,
    minNights: 1
  },
  {
    unitIndex: 11,
    date: new Date('2026-06-13'),
    state: UnitCalendarDayStateEnum.BLOCKED,
    note: 'Deep cleaning'
  },
  {
    unitIndex: 12,
    date: new Date('2026-07-19'),
    state: UnitCalendarDayStateEnum.AVAILABLE,
    priceOverride: 78,
    minNights: 2
  },
  {
    unitIndex: 13,
    date: new Date('2026-07-21'),
    state: UnitCalendarDayStateEnum.BLOCKED,
    note: 'Owner stay'
  },
  {
    unitIndex: 14,
    date: new Date('2026-09-09'),
    state: UnitCalendarDayStateEnum.AVAILABLE,
    priceOverride: 155,
    minNights: 2
  },
  {
    unitIndex: 15,
    date: new Date('2026-10-02'),
    state: UnitCalendarDayStateEnum.BLOCKED,
    note: 'Utilities maintenance'
  },
  {
    unitIndex: 16,
    date: new Date('2026-05-24'),
    state: UnitCalendarDayStateEnum.AVAILABLE,
    priceOverride: 170,
    minNights: 2
  },
  {
    unitIndex: 17,
    date: new Date('2026-06-29'),
    state: UnitCalendarDayStateEnum.AVAILABLE,
    priceOverride: 165,
    minNights: 2
  },
  {
    unitIndex: 18,
    date: new Date('2026-11-10'),
    state: UnitCalendarDayStateEnum.AVAILABLE,
    priceOverride: 50,
    minNights: 1
  },
  {
    unitIndex: 19,
    date: new Date('2026-11-16'),
    state: UnitCalendarDayStateEnum.BLOCKED,
    note: 'Painting walls'
  },
  {
    unitIndex: 20,
    date: new Date('2026-12-03'),
    state: UnitCalendarDayStateEnum.AVAILABLE,
    priceOverride: 44,
    minNights: 1
  },
  {
    unitIndex: 21,
    date: new Date('2026-12-04'),
    state: UnitCalendarDayStateEnum.BLOCKED,
    note: 'Heating system service'
  }
]

export const createUnitCalendarDays = async (units: UnitRef[]) => {
  await prisma.$transaction(
    unitCalendarDays.map((day) => {
      const unit = units[day.unitIndex]

      if (!unit) {
        throw new Error(
          `Unit index "${day.unitIndex}" not found for calendar day seed`
        )
      }

      return prisma.unitCalendarDay.create({
        data: {
          unitId: unit.id,
          date: day.date,
          state: day.state,
          priceOverride: day.priceOverride,
          minNights: day.minNights,
          note: day.note
        }
      })
    })
  )
}
