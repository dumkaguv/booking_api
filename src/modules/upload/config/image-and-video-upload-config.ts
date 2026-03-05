import type { Request } from 'express'

const ONE_MB = 1024 * 1024

export const MAX_IMAGE_FILE_SIZE = 10 * ONE_MB
export const MAX_VIDEO_FILE_SIZE = 100 * ONE_MB

export function imageAndVideoFileFilter(
  _req: Request,
  file: Express.Multer.File,
  cb: (error: Error | null, acceptFile: boolean) => void
) {
  if (
    !file.mimetype.startsWith('image/') &&
    !file.mimetype.startsWith('video/')
  ) {
    return cb(new Error('Only images and videos are allowed'), false)
  }

  cb(null, true)
}

export function getImageAndVideoFileSizeError(
  file: Pick<Express.Multer.File, 'buffer' | 'mimetype'> & { size?: number }
): null | string {
  let maxAllowedSize: null | number = null

  if (file.mimetype.startsWith('image/')) {
    maxAllowedSize = MAX_IMAGE_FILE_SIZE
  } else if (file.mimetype.startsWith('video/')) {
    maxAllowedSize = MAX_VIDEO_FILE_SIZE
  }

  if (!maxAllowedSize) {
    return null
  }

  const fileSize = file.size ?? file.buffer.length

  if (fileSize <= maxAllowedSize) {
    return null
  }

  const maxSizeMb = maxAllowedSize / ONE_MB
  const fileKind = file.mimetype.startsWith('image/') ? 'Image' : 'Video'

  return `${fileKind} size must be less than or equal to ${maxSizeMb}MB`
}
