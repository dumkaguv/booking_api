import { Injectable } from '@nestjs/common'

import { FindAllQueryDto } from '@/common/dtos'
import { paginate } from '@/common/utils'
import { PrismaService } from '@/prisma/prisma.service'

import {
  CreateListingUnitDto,
  ResponseListingUnitDto,
  UpdateListingUnitDto
} from '../dto'

@Injectable()
export class ListingUnitsService {
  constructor(private readonly prisma: PrismaService) {}

  public findAll(
    listingId: number,
    query: FindAllQueryDto<ResponseListingUnitDto>
  ) {
    return paginate({
      prisma: this.prisma,
      model: 'listingUnit',
      where: { listingId },
      ...query
    })
  }

  public findOne(listingId: number, unitId: number) {
    return this.prisma.listingUnit.findFirstOrThrow({
      where: { id: unitId, listingId }
    })
  }

  public async create(
    listingId: number,
    ownerId: number,
    dto: CreateListingUnitDto
  ) {
    await this.ensureListingOwnership(listingId, ownerId)

    return this.prisma.listingUnit.create({
      data: {
        ...dto,
        listingId
      }
    })
  }

  public async update(
    listingId: number,
    unitId: number,
    ownerId: number,
    dto: UpdateListingUnitDto
  ) {
    await this.ensureUnitOwnership(unitId, listingId, ownerId)

    return this.prisma.listingUnit.update({
      where: { id: unitId },
      data: dto
    })
  }

  public async remove(listingId: number, unitId: number, ownerId: number) {
    await this.ensureUnitOwnership(unitId, listingId, ownerId)

    return this.prisma.listingUnit.delete({
      where: { id: unitId }
    })
  }

  private async ensureListingOwnership(listingId: number, ownerId: number) {
    await this.prisma.listing.findFirstOrThrow({
      where: { id: listingId, ownerId },
      select: { id: true }
    })
  }

  private async ensureUnitOwnership(
    unitId: number,
    listingId: number,
    ownerId: number
  ) {
    await this.prisma.listingUnit.findFirstOrThrow({
      where: {
        id: unitId,
        listingId,
        listing: { ownerId }
      },
      select: { id: true }
    })
  }
}
