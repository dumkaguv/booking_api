import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  type ResourceType,
  type UploadApiResponse,
  v2 as cloudinary
} from 'cloudinary'
import streamifier from 'streamifier'

import type { UploadFile } from '@/common/types'

@Injectable()
export class CloudinaryService {
  private readonly DEFAULT_FOLDER = 'shared'

  constructor(private readonly configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.getOrThrow<string>(
        'CLOUDINARY_CLOUD_NAME'
      ),
      api_key: this.configService.getOrThrow<string>('CLOUDINARY_API_KEY'),
      api_secret: this.configService.getOrThrow<string>('CLOUDINARY_API_SECRET')
    })
  }

  public uploadFromBuffer(
    file: UploadFile,
    userId: number,
    folder: string = this.DEFAULT_FOLDER
  ): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      const folderName = `${this.normalizeFolder(folder)}/user-${userId}`

      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: folderName,
          resource_type: 'auto'
        },
        (error, result) => {
          if (error || !result) {
            return reject(this.toError(error, 'Cloudinary upload failed'))
          }

          resolve(result)
        }
      )

      streamifier.createReadStream(file.buffer).pipe(uploadStream)
    })
  }

  public delete(publicId: string, mimeType?: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const resourceType = this.resolveResourceType(mimeType)

      void cloudinary.uploader.destroy(
        publicId,
        { resource_type: resourceType },
        (error, result) => {
          if (error) {
            return reject(this.toError(error, 'Cloudinary delete failed'))
          }

          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          if (result?.result !== 'ok' && result?.result !== 'not found') {
            return reject(new Error(`Failed to delete file: ${publicId}`))
          }

          resolve()
        }
      )
    })
  }

  private normalizeFolder(folder: string): string {
    return folder.trim().replace(/^\/+|\/+$/g, '') || 'shared'
  }

  private resolveResourceType(mimeType?: string): ResourceType {
    if (!mimeType) {
      return 'image'
    }

    if (mimeType.startsWith('video/')) {
      return 'video'
    }

    if (mimeType.startsWith('image/')) {
      return 'image'
    }

    return 'raw'
  }

  private toError(err: unknown, fallback: string): Error {
    if (err instanceof Error) {
      return err
    }

    if (typeof err === 'string') {
      return new Error(err)
    }

    return new Error(fallback)
  }
}
