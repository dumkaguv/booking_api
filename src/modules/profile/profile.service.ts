import { Injectable } from '@nestjs/common'

import { UserService } from '@/modules/user/user.service'
import { PrismaService } from '@/prisma/prisma.service'

import { CreateProfileDto, UpdateProfileDto } from './dto'

@Injectable()
export class ProfileService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userService: UserService
  ) {}

  public async findOne(userId: number) {
    await this.prisma.profile.findFirstOrThrow({
      where: { userId }
    })

    return this.userService.findOne(userId)
  }

  public create(userId: number, dto: CreateProfileDto) {
    return this.prisma.profile.create({
      data: { userId, ...dto }
    })
  }

  public update(userId: number, dto: UpdateProfileDto) {
    return this.prisma.profile.update({
      data: dto,
      where: { userId }
    })
  }
}
