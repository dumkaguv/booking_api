import { Injectable } from '@nestjs/common'

import { normalizeDateTime } from '@/common/utils'
import { PrismaService } from '@/prisma/prisma.service'

import { CreateProfileDto, UpdateProfileDto } from './dto'
import { includeUserWithRelations } from '../user/constants'

const includeProfileWithRelations = {
  avatarFile: true,
  user: {
    include: includeUserWithRelations
  }
} as const

@Injectable()
export class ProfilesService {
  constructor(private readonly prisma: PrismaService) {}

  public findOne(userId: number) {
    return this.prisma.profile.findFirst({
      where: { userId },
      include: includeProfileWithRelations
    })
  }

  public create(userId: number, dto: CreateProfileDto) {
    const birthDay = normalizeDateTime(dto.birthDay)
    const data = birthDay === undefined ? dto : { ...dto, birthDay }

    return this.prisma.profile.create({
      data: { userId, ...data },
      include: includeProfileWithRelations
    })
  }

  public update(userId: number, dto: UpdateProfileDto) {
    const birthDay = normalizeDateTime(dto.birthDay)
    const data = birthDay === undefined ? dto : { ...dto, birthDay }

    return this.prisma.profile.update({
      data,
      where: { userId },
      include: includeProfileWithRelations
    })
  }
}
