import { BadRequestException } from '@nestjs/common'

import { paginate } from '@/common/utils'
import { CloudinaryService } from '@/modules/cloudinary/cloudinary.service'
import { UploadTargetType } from '@/modules/file/constants'
import { PrismaService } from '@/prisma/prisma.service'

import { FilesService } from './file.service'

jest.mock('@/common/utils', () => ({
  paginate: jest.fn()
}))

type PrismaMock = {
  file: {
    create: jest.Mock
    delete: jest.Mock
    findFirstOrThrow: jest.Mock
  }
  listing: {
    findFirstOrThrow: jest.Mock
  }
  listingFile: {
    create: jest.Mock
  }
  profile: {
    update: jest.Mock
  }
  review: {
    findFirstOrThrow: jest.Mock
  }
  reviewFile: {
    create: jest.Mock
  }
}

type CloudinaryServiceMock = {
  delete: jest.Mock
}

describe('FilesService', () => {
  let prisma: PrismaMock
  let cloudinaryService: CloudinaryServiceMock
  let service: FilesService

  beforeEach(() => {
    prisma = {
      file: {
        create: jest.fn(),
        delete: jest.fn(),
        findFirstOrThrow: jest.fn()
      },
      listing: {
        findFirstOrThrow: jest.fn()
      },
      listingFile: {
        create: jest.fn()
      },
      profile: {
        update: jest.fn()
      },
      review: {
        findFirstOrThrow: jest.fn()
      },
      reviewFile: {
        create: jest.fn()
      }
    }
    cloudinaryService = {
      delete: jest.fn()
    }

    service = new FilesService(
      prisma as unknown as PrismaService,
      cloudinaryService as unknown as CloudinaryService
    )
  })

  it('create stores file metadata in db', async () => {
    prisma.file.create.mockResolvedValueOnce({ id: 1 })

    await service.create('pub-id', 'https://cdn/u.png', 'image/png', 10)

    expect(prisma.file.create).toHaveBeenCalledWith({
      data: {
        publicId: 'pub-id',
        type: 'image/png',
        url: 'https://cdn/u.png',
        userId: 10
      }
    })
  })

  it('attachToTarget does nothing when targetType is absent', async () => {
    await service.attachToTarget(1, 10)

    expect(prisma.profile.update).not.toHaveBeenCalled()
    expect(prisma.listingFile.create).not.toHaveBeenCalled()
    expect(prisma.reviewFile.create).not.toHaveBeenCalled()
  })

  it('attachToTarget attaches profile avatar', async () => {
    prisma.profile.update.mockResolvedValueOnce({})

    await service.attachToTarget(7, 10, UploadTargetType.PROFILE_AVATAR)

    expect(prisma.profile.update).toHaveBeenCalledWith({
      where: { userId: 10 },
      data: { avatarFileId: 7 }
    })
  })

  it('attachToTarget throws when targetId is missing for listing/review', async () => {
    await expect(
      service.attachToTarget(7, 10, UploadTargetType.LISTING)
    ).rejects.toThrow(
      new BadRequestException('targetId is required for selected target')
    )
  })

  it('attachToTarget attaches listing file with order', async () => {
    prisma.listing.findFirstOrThrow.mockResolvedValueOnce({ id: 44 })
    prisma.listingFile.create.mockResolvedValueOnce({})

    await service.attachToTarget(7, 10, UploadTargetType.LISTING, 44, 3)

    expect(prisma.listing.findFirstOrThrow).toHaveBeenCalledWith({
      where: { id: 44, ownerId: 10 },
      select: { id: true }
    })
    expect(prisma.listingFile.create).toHaveBeenCalledWith({
      data: {
        fileId: 7,
        listingId: 44,
        order: 3
      }
    })
  })

  it('attachToTarget attaches review file', async () => {
    prisma.review.findFirstOrThrow.mockResolvedValueOnce({ id: 55 })
    prisma.reviewFile.create.mockResolvedValueOnce({})

    await service.attachToTarget(7, 10, UploadTargetType.REVIEW, 55)

    expect(prisma.review.findFirstOrThrow).toHaveBeenCalledWith({
      where: { id: 55, authorId: 10 },
      select: { id: true }
    })
    expect(prisma.reviewFile.create).toHaveBeenCalledWith({
      data: {
        fileId: 7,
        reviewId: 55
      }
    })
  })

  it('deleteForUser deletes db record and cloudinary asset', async () => {
    jest.spyOn(service, 'findOneForUser').mockResolvedValueOnce({
      id: 7,
      publicId: 'pub-7',
      targets: [],
      type: 'image/png'
    } as never)
    prisma.file.delete.mockResolvedValueOnce({})
    cloudinaryService.delete.mockResolvedValueOnce(undefined)

    await service.deleteForUser(7, 10)

    expect(prisma.file.delete).toHaveBeenCalledWith({ where: { id: 7 } })
    expect(cloudinaryService.delete).toHaveBeenCalledWith('pub-7', 'image/png')
  })

  it('deleteBulkForUser removes duplicate ids before deleting', async () => {
    const spy = jest
      .spyOn(service, 'deleteForUser')
      .mockResolvedValue(undefined)

    await service.deleteBulkForUser(10, [1, 1, 2])

    expect(spy).toHaveBeenCalledTimes(2)
    expect(spy).toHaveBeenNthCalledWith(1, 1, 10)
    expect(spy).toHaveBeenNthCalledWith(2, 2, 10)
  })

  it('findAllForUser returns files with mapped targets', async () => {
    ;(paginate as jest.Mock).mockResolvedValueOnce({
      data: [
        {
          id: 1,
          listingFiles: [{ listingId: 101 }],
          profileAvatar: { id: 5 },
          reviewFiles: [{ reviewId: 202 }],
          type: 'image/png',
          uploadedAt: new Date('2026-03-05T00:00:00.000Z'),
          url: 'u-1'
        }
      ],
      total: 1
    })

    const result = await service.findAllForUser(10, {
      page: 1,
      pageSize: 10
    })

    expect(paginate).toHaveBeenCalledWith(
      expect.objectContaining({
        model: 'file',
        prisma,
        where: { userId: 10 }
      })
    )
    expect(result.total).toBe(1)
    expect(result.data[0].targets).toEqual([
      { targetId: 5, targetType: UploadTargetType.PROFILE_AVATAR },
      { targetId: 101, targetType: UploadTargetType.LISTING },
      { targetId: 202, targetType: UploadTargetType.REVIEW }
    ])
  })

  it('findOneForUser returns file with mapped targets', async () => {
    prisma.file.findFirstOrThrow.mockResolvedValueOnce({
      id: 5,
      listingFiles: [{ listingId: 500 }],
      profileAvatar: null,
      reviewFiles: [],
      type: 'image/png',
      uploadedAt: new Date('2026-03-05T00:00:00.000Z'),
      url: 'u-5'
    })

    const result = await service.findOneForUser(5, 10)

    expect(prisma.file.findFirstOrThrow).toHaveBeenCalledWith({
      where: { id: 5, userId: 10 },
      include: {
        profileAvatar: { select: { id: true } },
        listingFiles: { select: { listingId: true } },
        reviewFiles: { select: { reviewId: true } }
      }
    })
    expect(result.targets).toEqual([
      { targetId: 500, targetType: UploadTargetType.LISTING }
    ])
  })
})
