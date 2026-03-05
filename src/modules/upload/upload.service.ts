import { BadRequestException, Injectable } from '@nestjs/common'

import type { UploadFile } from '@/common/types'
import { CloudinaryService } from '@/modules/cloudinary/cloudinary.service'
import { UploadTargetType } from '@/modules/file/constants'
import { FilesService } from '@/modules/file/file.service'

import { getImageAndVideoFileSizeError } from './config'
import { UploadMetaDto } from './dto'

@Injectable()
export class UploadsService {
  constructor(
    private readonly cloudinaryService: CloudinaryService,
    private readonly fileService: FilesService
  ) {}

  public async upload(file: UploadFile, userId: number, dto: UploadMetaDto) {
    this.validateTarget(dto)
    this.validateFileSize(file)

    const { public_id, secure_url, resource_type, format } =
      await this.cloudinaryService.uploadFromBuffer(file, userId, dto.folder)

    const mimeType = file.mimetype || `${resource_type}/${format}`
    const created = await this.fileService.create(
      public_id,
      secure_url,
      mimeType,
      userId
    )

    try {
      await this.fileService.attachToTarget(
        created.id,
        userId,
        dto.targetType,
        dto.targetId,
        dto.order
      )
    } catch (error) {
      await this.fileService.deleteForUser(created.id, userId)
      throw error
    }

    return { id: created.id, url: created.url, type: created.type }
  }

  public async uploadBulk(
    files: UploadFile[],
    userId: number,
    dto: UploadMetaDto
  ) {
    const uploadedIds: number[] = []
    const results: { id: number; url: string; type: null | string }[] = []

    try {
      for (const file of files) {
        const uploaded = await this.upload(file, userId, dto)

        uploadedIds.push(uploaded.id)
        results.push(uploaded)
      }
    } catch (error) {
      await Promise.allSettled(
        uploadedIds.map((id) => this.fileService.deleteForUser(id, userId))
      )

      throw error
    }

    return results
  }

  public delete(userId: number, id: number) {
    return this.fileService.deleteForUser(id, userId)
  }

  public deleteBulk(userId: number, ids: number[]) {
    return this.fileService.deleteBulkForUser(userId, ids)
  }

  private validateTarget(dto: UploadMetaDto) {
    if (!dto.targetType && dto.targetId) {
      throw new BadRequestException(
        'targetType is required when targetId is provided'
      )
    }

    if (dto.targetType === UploadTargetType.PROFILE_AVATAR && dto.targetId) {
      throw new BadRequestException(
        'targetId must not be provided for PROFILE_AVATAR'
      )
    }

    const requiresTargetId =
      dto.targetType === UploadTargetType.LISTING ||
      dto.targetType === UploadTargetType.REVIEW

    if (requiresTargetId && !dto.targetId) {
      throw new BadRequestException(
        'targetId is required for LISTING and REVIEW targets'
      )
    }
  }

  private validateFileSize(file: UploadFile) {
    const fileSizeError = getImageAndVideoFileSizeError(file)

    if (fileSizeError) {
      throw new BadRequestException(fileSizeError)
    }
  }
}
