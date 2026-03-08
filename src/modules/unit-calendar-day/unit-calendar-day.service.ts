import { Injectable } from '@nestjs/common'
import { UnitCalendarDayStateEnum } from '@prisma/client'

import { FindAllQueryDto } from '@/common/dtos'
import { normalizeDateTime, paginate } from '@/common/utils'
import { includeUnitCalendarDayWithRelations } from '@/modules/unit-calendar-day/constants'
import { PrismaService } from '@/prisma/prisma.service'

import {
  CreateUnitCalendarDayDto,
  ResponseUnitCalendarDayDto,
  UpdateUnitCalendarDayDto
} from './dto'

@Injectable()
export class UnitCalendarDaysService {
  constructor(private readonly prisma: PrismaService) {}

  public findAll(
    ownerId: number,
    query: FindAllQueryDto<ResponseUnitCalendarDayDto>
  ) {
    return paginate({
      prisma: this.prisma,
      model: 'unitCalendarDay',
      include: includeUnitCalendarDayWithRelations,
      where: {
        unit: {
          listing: {
            ownerId
          }
        }
      },
      ...query
    })
  }

  public findOne(id: number, ownerId: number) {
    return this.prisma.unitCalendarDay.findFirstOrThrow({
      where: {
        id,
        unit: {
          listing: { ownerId }
        }
      },
      include: includeUnitCalendarDayWithRelations
    })
  }

  public async create(ownerId: number, dto: CreateUnitCalendarDayDto) {
    await this.ensureUnitOwnership(dto.unitId, ownerId)

    const date = normalizeDateTime(dto.date) as Date

    return this.prisma.unitCalendarDay.create({
      data: {
        unitId: dto.unitId,
        date,
        state: dto.state ?? UnitCalendarDayStateEnum.AVAILABLE,
        priceOverride: dto.priceOverride,
        minNights: dto.minNights,
        note: dto.note
      },
      include: includeUnitCalendarDayWithRelations
    })
  }

  public async update(
    id: number,
    ownerId: number,
    dto: UpdateUnitCalendarDayDto
  ) {
    const current = await this.prisma.unitCalendarDay.findFirstOrThrow({
      where: {
        id,
        unit: {
          listing: { ownerId }
        }
      },
      select: {
        id: true,
        unitId: true
      }
    })

    const targetUnitId = dto.unitId ?? current.unitId

    if (targetUnitId !== current.unitId) {
      await this.ensureUnitOwnership(targetUnitId, ownerId)
    }

    const date =
      dto.date === undefined ? undefined : (normalizeDateTime(dto.date) as Date)

    return this.prisma.unitCalendarDay.update({
      where: { id },
      data: {
        ...(dto.unitId === undefined ? {} : { unitId: targetUnitId }),
        ...(dto.date === undefined ? {} : { date }),
        ...(dto.state === undefined ? {} : { state: dto.state }),
        ...(dto.priceOverride === undefined
          ? {}
          : { priceOverride: dto.priceOverride }),
        ...(dto.minNights === undefined ? {} : { minNights: dto.minNights }),
        ...(dto.note === undefined ? {} : { note: dto.note })
      },
      include: includeUnitCalendarDayWithRelations
    })
  }

  public async remove(id: number, ownerId: number) {
    await this.prisma.unitCalendarDay.findFirstOrThrow({
      where: {
        id,
        unit: {
          listing: { ownerId }
        }
      },
      select: { id: true }
    })

    return this.prisma.unitCalendarDay.delete({
      where: { id }
    })
  }

  private async ensureUnitOwnership(unitId: number, ownerId: number) {
    await this.prisma.listingUnit.findFirstOrThrow({
      where: {
        id: unitId,
        listing: { ownerId }
      },
      select: { id: true }
    })
  }
}
