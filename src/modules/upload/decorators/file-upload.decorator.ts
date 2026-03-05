import { applyDecorators, UseInterceptors } from '@nestjs/common'
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express'
import { memoryStorage } from 'multer'

import {
  imageAndVideoFileFilter,
  MAX_VIDEO_FILE_SIZE
} from '@/modules/upload/config'

const DEFAULT_BULK_MAX_COUNT = 20

export function FileUpload(fieldName: string) {
  return applyDecorators(
    UseInterceptors(
      FileInterceptor(fieldName, {
        storage: memoryStorage(),
        limits: { fileSize: MAX_VIDEO_FILE_SIZE },
        fileFilter: imageAndVideoFileFilter
      })
    )
  )
}

export function FilesUpload(
  fieldName: string,
  maxCount = DEFAULT_BULK_MAX_COUNT
) {
  return applyDecorators(
    UseInterceptors(
      FilesInterceptor(fieldName, maxCount, {
        storage: memoryStorage(),
        limits: { fileSize: MAX_VIDEO_FILE_SIZE },
        fileFilter: imageAndVideoFileFilter
      })
    )
  )
}
