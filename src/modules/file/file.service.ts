import { BadRequestException, Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'

import { FindAllQueryDto } from '@/common/dtos'
import { paginate } from '@/common/utils'
import { CloudinaryService } from '@/modules/cloudinary/cloudinary.service'
import { UploadTargetType } from '@/modules/file/constants'
import {
  ResponseFileDto,
  ResponseFileTargetDto
} from '@/modules/file/dto/responses/response-file.dto'
import { PrismaService } from '@/prisma/prisma.service'

const includeFileTargets = {
  profileAvatar: { select: { id: true } },
  listingFiles: { select: { listingId: true } },
  reviewFiles: { select: { reviewId: true } }
} as const

type FileWithTargets = {
  profileAvatar?: { id: number } | null
  listingFiles?: { listingId: number }[]
  reviewFiles?: { reviewId: number }[]
} & Prisma.FileGetPayload<{
  include: typeof includeFileTargets
}>

@Injectable()
export class FilesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService
  ) {}

  public create(
    publicId: string,
    url: string,
    mimeType: string,
    userId: number
  ) {
    return this.prisma.file.create({
      data: { publicId, url, type: mimeType, userId }
    })
  }

  public async attachToTarget(
    fileId: number,
    userId: number,
    targetType?: UploadTargetType,
    targetId?: number,
    order?: number
  ) {
    if (!targetType) {
      return
    }

    if (targetType === UploadTargetType.PROFILE_AVATAR) {
      await this.prisma.profile.update({
        where: { userId },
        data: { avatarFileId: fileId }
      })

      return
    }

    if (!targetId) {
      throw new BadRequestException('targetId is required for selected target')
    }

    if (targetType === UploadTargetType.LISTING) {
      await this.prisma.listing.findFirstOrThrow({
        where: { id: targetId, ownerId: userId },
        select: { id: true }
      })

      await this.prisma.listingFile.create({
        data: {
          fileId,
          listingId: targetId,
          order
        }
      })

      return
    }

    if (targetType === UploadTargetType.REVIEW) {
      await this.prisma.review.findFirstOrThrow({
        where: { id: targetId, authorId: userId },
        select: { id: true }
      })

      await this.prisma.reviewFile.create({
        data: {
          fileId,
          reviewId: targetId
        }
      })
    }
  }

  public async deleteForUser(id: number, userId: number) {
    const { publicId, type } = await this.findOneForUser(id, userId)

    await this.prisma.file.delete({ where: { id } })
    await this.cloudinaryService.delete(publicId, type ?? undefined)
  }

  public async deleteBulkForUser(userId: number, ids: number[]) {
    const uniqueIds = [...new Set(ids)]

    for (const id of uniqueIds) {
      await this.deleteForUser(id, userId)
    }
  }

  public async findAllForUser(
    userId: number,
    query: FindAllQueryDto<ResponseFileDto>
  ) {
    const { data, total } = await paginate({
      prisma: this.prisma,
      model: 'file',
      where: { userId },
      include: includeFileTargets,
      ...query
    })

    return {
      data: data.map((file) => this.withTargets(file as FileWithTargets)),
      total
    }
  }

  public async findOneForUser(id: number, userId: number) {
    const file = await this.prisma.file.findFirstOrThrow({
      where: { id, userId },
      include: includeFileTargets
    })

    return this.withTargets(file as FileWithTargets)
  }

  private withTargets(file: FileWithTargets) {
    const targets: ResponseFileTargetDto[] = []

    if (file.profileAvatar) {
      targets.push({
        targetType: UploadTargetType.PROFILE_AVATAR,
        targetId: file.profileAvatar.id
      })
    }

    for (const listingFile of file.listingFiles ?? []) {
      targets.push({
        targetType: UploadTargetType.LISTING,
        targetId: listingFile.listingId
      })
    }

    for (const reviewFile of file.reviewFiles ?? []) {
      targets.push({
        targetType: UploadTargetType.REVIEW,
        targetId: reviewFile.reviewId
      })
    }

    return { ...file, targets }
  }
}
