import { BadRequestException } from '@nestjs/common'

import type { UploadFile } from '@/common/types'
import { CloudinaryService } from '@/modules/cloudinary/cloudinary.service'
import { UploadTargetType } from '@/modules/file/constants'
import { FilesService } from '@/modules/file/file.service'

import {
  MAX_IMAGE_FILE_SIZE,
  MAX_VIDEO_FILE_SIZE
} from './config/image-and-video-upload-config'
import { UploadsService } from './upload.service'

type CloudinaryServiceMock = {
  uploadFromBuffer: jest.Mock
}

type FilesServiceMock = {
  attachToTarget: jest.Mock
  create: jest.Mock
  deleteBulkForUser: jest.Mock
  deleteForUser: jest.Mock
}

const BASE_FILE: UploadFile = {
  buffer: Buffer.from('file'),
  mimetype: 'image/png',
  size: 4
}

describe('UploadsService', () => {
  let cloudinaryService: CloudinaryServiceMock
  let fileService: FilesServiceMock
  let service: UploadsService

  beforeEach(() => {
    cloudinaryService = {
      uploadFromBuffer: jest.fn()
    }

    fileService = {
      attachToTarget: jest.fn(),
      create: jest.fn(),
      deleteBulkForUser: jest.fn(),
      deleteForUser: jest.fn()
    }

    service = new UploadsService(
      cloudinaryService as unknown as CloudinaryService,
      fileService as unknown as FilesService
    )
  })

  it('upload stores file, attaches it and returns response payload', async () => {
    cloudinaryService.uploadFromBuffer.mockResolvedValueOnce({
      format: 'png',
      public_id: 'cloudinary-public-id',
      resource_type: 'image',
      secure_url: 'https://cdn.example.com/1.png'
    })
    fileService.create.mockResolvedValueOnce({
      id: 1,
      type: 'image/png',
      url: 'https://cdn.example.com/1.png'
    })
    fileService.attachToTarget.mockResolvedValueOnce(undefined)

    const result = await service.upload(BASE_FILE, 7, {
      folder: 'avatars',
      targetType: UploadTargetType.PROFILE_AVATAR
    })

    expect(cloudinaryService.uploadFromBuffer).toHaveBeenCalledWith(
      BASE_FILE,
      7,
      'avatars'
    )
    expect(fileService.create).toHaveBeenCalledWith(
      'cloudinary-public-id',
      'https://cdn.example.com/1.png',
      'image/png',
      7
    )
    expect(fileService.attachToTarget).toHaveBeenCalledWith(
      1,
      7,
      UploadTargetType.PROFILE_AVATAR,
      undefined,
      undefined
    )
    expect(result).toEqual({
      id: 1,
      type: 'image/png',
      url: 'https://cdn.example.com/1.png'
    })
  })

  it('upload validates that targetType is present when targetId is provided', async () => {
    await expect(service.upload(BASE_FILE, 7, { targetId: 9 })).rejects.toThrow(
      new BadRequestException(
        'targetType is required when targetId is provided'
      )
    )
  })

  it('upload validates PROFILE_AVATAR target cannot have targetId', async () => {
    await expect(
      service.upload(BASE_FILE, 7, {
        targetId: 1,
        targetType: UploadTargetType.PROFILE_AVATAR
      })
    ).rejects.toThrow(
      new BadRequestException(
        'targetId must not be provided for PROFILE_AVATAR'
      )
    )
  })

  it('upload validates LISTING/REVIEW targets require targetId', async () => {
    await expect(
      service.upload(BASE_FILE, 7, { targetType: UploadTargetType.LISTING })
    ).rejects.toThrow(
      new BadRequestException(
        'targetId is required for LISTING and REVIEW targets'
      )
    )
  })

  it('upload rejects when image file size exceeds 10MB', async () => {
    const hugeImage: UploadFile = {
      buffer: Buffer.alloc(1),
      mimetype: 'image/jpeg',
      size: MAX_IMAGE_FILE_SIZE + 1
    }

    await expect(service.upload(hugeImage, 1, {})).rejects.toThrow(
      new BadRequestException('Image size must be less than or equal to 10MB')
    )
  })

  it('upload rejects when video file size exceeds 100MB', async () => {
    const hugeVideo: UploadFile = {
      buffer: Buffer.alloc(1),
      mimetype: 'video/mp4',
      size: MAX_VIDEO_FILE_SIZE + 1
    }

    await expect(service.upload(hugeVideo, 1, {})).rejects.toThrow(
      new BadRequestException('Video size must be less than or equal to 100MB')
    )
  })

  it('upload removes created file when attachToTarget fails', async () => {
    const fail = new Error('attach failed')

    cloudinaryService.uploadFromBuffer.mockResolvedValueOnce({
      format: 'png',
      public_id: 'cloudinary-public-id',
      resource_type: 'image',
      secure_url: 'https://cdn.example.com/1.png'
    })
    fileService.create.mockResolvedValueOnce({
      id: 5,
      type: 'image/png',
      url: 'https://cdn.example.com/1.png'
    })
    fileService.attachToTarget.mockRejectedValueOnce(fail)
    fileService.deleteForUser.mockResolvedValueOnce(undefined)

    await expect(service.upload(BASE_FILE, 7, {})).rejects.toThrow(fail)
    expect(fileService.deleteForUser).toHaveBeenCalledWith(5, 7)
  })

  it('uploadBulk uploads all files and returns collected payloads', async () => {
    const spy = jest.spyOn(service, 'upload')

    spy
      .mockResolvedValueOnce({ id: 1, type: 'image/png', url: 'u-1' })
      .mockResolvedValueOnce({ id: 2, type: 'image/png', url: 'u-2' })

    const result = await service.uploadBulk([BASE_FILE, BASE_FILE], 7, {})

    expect(result).toEqual([
      { id: 1, type: 'image/png', url: 'u-1' },
      { id: 2, type: 'image/png', url: 'u-2' }
    ])
  })

  it('uploadBulk rolls back already uploaded files when a later upload fails', async () => {
    const spy = jest.spyOn(service, 'upload')
    const fail = new Error('upload failed')

    spy
      .mockResolvedValueOnce({ id: 101, type: 'image/png', url: 'u-101' })
      .mockRejectedValueOnce(fail)
    fileService.deleteForUser.mockResolvedValueOnce(undefined)

    await expect(
      service.uploadBulk([BASE_FILE, BASE_FILE], 77, {})
    ).rejects.toThrow(fail)
    expect(fileService.deleteForUser).toHaveBeenCalledWith(101, 77)
  })

  it('delete delegates to FilesService', async () => {
    fileService.deleteForUser.mockResolvedValueOnce(undefined)

    await service.delete(3, 11)

    expect(fileService.deleteForUser).toHaveBeenCalledWith(11, 3)
  })

  it('deleteBulk delegates to FilesService', async () => {
    fileService.deleteBulkForUser.mockResolvedValueOnce(undefined)

    await service.deleteBulk(3, [11, 12])

    expect(fileService.deleteBulkForUser).toHaveBeenCalledWith(3, [11, 12])
  })
})
