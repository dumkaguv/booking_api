import { BadRequestException } from '@nestjs/common'
import { BookingStatusEnum } from '@prisma/client'

import { paginate } from '@/common/utils'
import { includeReviewWithRelations } from '@/modules/review/constants'
import { PrismaService } from '@/prisma/prisma.service'

import { ReviewsService } from './review.service'

jest.mock('@/common/utils', () => ({
  paginate: jest.fn()
}))

type PrismaMock = {
  booking: {
    findFirstOrThrow: jest.Mock
  }
  review: {
    create: jest.Mock
    delete: jest.Mock
    findFirstOrThrow: jest.Mock
    findUniqueOrThrow: jest.Mock
    update: jest.Mock
  }
}

describe('ReviewsService', () => {
  let prisma: PrismaMock
  let service: ReviewsService
  let paginateMock: jest.MockedFunction<typeof paginate>

  beforeEach(() => {
    prisma = {
      booking: {
        findFirstOrThrow: jest.fn()
      },
      review: {
        create: jest.fn(),
        delete: jest.fn(),
        findFirstOrThrow: jest.fn(),
        findUniqueOrThrow: jest.fn(),
        update: jest.fn()
      }
    }

    service = new ReviewsService(prisma as unknown as PrismaService)
    paginateMock = paginate as jest.MockedFunction<typeof paginate>
    paginateMock.mockReset()
  })

  it('findAll delegates to paginate with review model', async () => {
    const expected = { data: [], total: 0 }
    const query: Parameters<ReviewsService['findAll']>[0] = {
      ordering: '-id',
      page: 2,
      pageSize: 5
    }

    paginateMock.mockResolvedValueOnce(expected)

    const result = await service.findAll(query)

    expect(result).toEqual(expected)
    expect(paginateMock).toHaveBeenCalledWith({
      prisma,
      model: 'review',
      include: includeReviewWithRelations,
      ...query
    })
  })

  it('findOne loads review by id', async () => {
    const expected = { id: 3 }

    prisma.review.findUniqueOrThrow.mockResolvedValueOnce(expected)

    const result = await service.findOne(3)

    expect(result).toEqual(expected)
    expect(prisma.review.findUniqueOrThrow).toHaveBeenCalledWith({
      where: { id: 3 },
      include: includeReviewWithRelations
    })
  })

  it('create validates booking and stores review', async () => {
    prisma.booking.findFirstOrThrow.mockResolvedValueOnce({
      id: 9,
      listingId: 4,
      status: BookingStatusEnum.COMPLETED
    })
    prisma.review.create.mockResolvedValueOnce({
      id: 11,
      bookingId: 9
    })

    const result = await service.create(7, {
      bookingId: 9,
      rating: 5,
      comment: 'Excellent'
    })

    expect(prisma.booking.findFirstOrThrow).toHaveBeenCalledWith({
      where: { id: 9, guestId: 7 },
      select: { id: true, listingId: true, status: true }
    })
    expect(prisma.review.create).toHaveBeenCalledWith({
      data: {
        bookingId: 9,
        listingId: 4,
        authorId: 7,
        rating: 5,
        comment: 'Excellent'
      },
      include: includeReviewWithRelations
    })
    expect(result).toEqual({ id: 11, bookingId: 9 })
  })

  it('create throws when booking is not completed', async () => {
    prisma.booking.findFirstOrThrow.mockResolvedValueOnce({
      id: 10,
      listingId: 4,
      status: BookingStatusEnum.PENDING
    })

    await expect(
      service.create(8, {
        bookingId: 10,
        rating: 4
      })
    ).rejects.toBeInstanceOf(BadRequestException)

    expect(prisma.review.create).not.toHaveBeenCalled()
  })

  it('create throws when booking has no listing', async () => {
    prisma.booking.findFirstOrThrow.mockResolvedValueOnce({
      id: 10,
      listingId: null,
      status: BookingStatusEnum.COMPLETED
    })

    await expect(
      service.create(8, {
        bookingId: 10,
        rating: 4
      })
    ).rejects.toBeInstanceOf(BadRequestException)

    expect(prisma.review.create).not.toHaveBeenCalled()
  })

  it('update checks ownership and updates review by id', async () => {
    prisma.review.findFirstOrThrow.mockResolvedValueOnce({ id: 6 })
    prisma.review.update.mockResolvedValueOnce({ id: 6, rating: 3 })

    const result = await service.update(6, 7, {
      rating: 3,
      comment: 'Updated'
    })

    expect(prisma.review.findFirstOrThrow).toHaveBeenCalledWith({
      where: { id: 6, authorId: 7 },
      select: { id: true }
    })
    expect(prisma.review.update).toHaveBeenCalledWith({
      where: { id: 6 },
      data: { rating: 3, comment: 'Updated' },
      include: includeReviewWithRelations
    })
    expect(result).toEqual({ id: 6, rating: 3 })
  })

  it('remove checks ownership and deletes review by id', async () => {
    prisma.review.findFirstOrThrow.mockResolvedValueOnce({ id: 4 })
    prisma.review.delete.mockResolvedValueOnce({ id: 4 })

    const result = await service.remove(4, 7)

    expect(prisma.review.findFirstOrThrow).toHaveBeenCalledWith({
      where: { id: 4, authorId: 7 },
      select: { id: true }
    })
    expect(prisma.review.delete).toHaveBeenCalledWith({
      where: { id: 4 }
    })
    expect(result).toEqual({ id: 4 })
  })
})
