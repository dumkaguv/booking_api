import { Injectable } from '@nestjs/common'

import { normalizeDateTime } from '@/common/utils'
import { PrismaService } from '@/prisma/prisma.service'

import { CreateProfileDto, UpdateProfileDto } from './dto'
import { includeUserWithRelations } from '../user/constants'

@Injectable()
export class ProfileService {
  constructor(private readonly prisma: PrismaService) {}

  public findOne(userId: number) {
    return this.prisma.profile.findFirst({
      where: { userId },
      include: { user: { include: includeUserWithRelations } }
    })
  }

  public create(userId: number, dto: CreateProfileDto) {
    const birthDay = normalizeDateTime(dto.birthDay)
    const data = birthDay === undefined ? dto : { ...dto, birthDay }

    return this.prisma.profile.create({
      data: { userId, ...data }
    })
  }

  public update(userId: number, dto: UpdateProfileDto) {
    const birthDay = normalizeDateTime(dto.birthDay)
    const data = birthDay === undefined ? dto : { ...dto, birthDay }

    return this.prisma.profile.update({
      data,
      where: { userId }
    })
  }
}
