import { Injectable } from '@nestjs/common'

import { FindAllQueryDto } from '@/common/dtos'
import { paginate } from '@/common/utils'
import { PrismaService } from '@/prisma/prisma.service'

import { CreateAmenityDto, ResponseAmenityDto, UpdateAmenityDto } from './dto'

@Injectable()
export class AmenitiesService {
  constructor(private readonly prisma: PrismaService) {}

  public findAll(query: FindAllQueryDto<ResponseAmenityDto>) {
    return paginate({
      prisma: this.prisma,
      model: 'amenity',
      ...query
    })
  }

  public findOne(id: number) {
    return this.prisma.amenity.findUniqueOrThrow({
      where: { id }
    })
  }

  public create(dto: CreateAmenityDto) {
    return this.prisma.amenity.create({
      data: dto
    })
  }

  public update(id: number, dto: UpdateAmenityDto) {
    return this.prisma.amenity.update({
      where: { id },
      data: dto
    })
  }

  public remove(id: number) {
    return this.prisma.amenity.delete({
      where: { id }
    })
  }
}
