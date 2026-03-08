import { Injectable } from '@nestjs/common'

import { FindAllQueryDto } from '@/common/dtos'
import { normalizeDateTime, paginate } from '@/common/utils'
import { PrismaService } from '@/prisma/prisma.service'

import { CreateListingDto, ResponseListingDto, UpdateListingDto } from './dto'

const includeListingWithRelations = {
  owner: true,
  amenities: true
} as const

@Injectable()
export class ListingsService {
  constructor(private readonly prisma: PrismaService) {}

  public findAll(query: FindAllQueryDto<ResponseListingDto>) {
    return paginate({
      prisma: this.prisma,
      model: 'listing',
      include: includeListingWithRelations,
      ...query
    })
  }

  public findOne(id: number) {
    return this.prisma.listing.findUniqueOrThrow({
      where: { id },
      include: includeListingWithRelations
    })
  }

  public create(ownerId: number, dto: CreateListingDto) {
    const { amenityIds, checkInFrom, checkOutUntil, ...rest } = dto
    const normalizedCheckInFrom = normalizeDateTime(checkInFrom) as Date
    const normalizedCheckOutUntil = normalizeDateTime(checkOutUntil) as Date

    return this.prisma.listing.create({
      data: {
        ...rest,
        ownerId,
        checkInFrom: normalizedCheckInFrom,
        checkOutUntil: normalizedCheckOutUntil,
        ...(amenityIds === undefined
          ? {}
          : {
              amenities: {
                connect: amenityIds.map((amenityId) => ({ id: amenityId }))
              }
            })
      },
      include: includeListingWithRelations
    })
  }

  public async update(id: number, ownerId: number, dto: UpdateListingDto) {
    await this.ensureOwnership(id, ownerId)

    const { amenityIds, checkInFrom, checkOutUntil, ...rest } = dto
    const normalizedCheckInFrom =
      checkInFrom === undefined
        ? undefined
        : (normalizeDateTime(checkInFrom) as Date)
    const normalizedCheckOutUntil =
      checkOutUntil === undefined
        ? undefined
        : (normalizeDateTime(checkOutUntil) as Date)

    return this.prisma.listing.update({
      where: { id },
      data: {
        ...rest,
        ...(normalizedCheckInFrom === undefined
          ? {}
          : { checkInFrom: normalizedCheckInFrom }),
        ...(normalizedCheckOutUntil === undefined
          ? {}
          : { checkOutUntil: normalizedCheckOutUntil }),
        ...(amenityIds === undefined
          ? {}
          : {
              amenities: {
                set: amenityIds.map((amenityId) => ({ id: amenityId }))
              }
            })
      },
      include: includeListingWithRelations
    })
  }

  public async remove(id: number, ownerId: number) {
    await this.ensureOwnership(id, ownerId)

    return this.prisma.listing.delete({
      where: { id }
    })
  }

  private async ensureOwnership(id: number, ownerId: number) {
    await this.prisma.listing.findFirstOrThrow({
      where: { id, ownerId },
      select: { id: true }
    })
  }
}
