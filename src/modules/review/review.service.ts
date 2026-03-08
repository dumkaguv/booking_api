import { BadRequestException, Injectable } from '@nestjs/common'
import { BookingStatusEnum } from '@prisma/client'

import { FindAllQueryDto } from '@/common/dtos'
import { paginate } from '@/common/utils'
import { includeReviewWithRelations } from '@/modules/review/constants'
import { PrismaService } from '@/prisma/prisma.service'

import { CreateReviewDto, ResponseReviewDto, UpdateReviewDto } from './dto'

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  public findAll(query: FindAllQueryDto<ResponseReviewDto>) {
    return paginate({
      prisma: this.prisma,
      model: 'review',
      include: includeReviewWithRelations,
      ...query
    })
  }

  public findOne(id: number) {
    return this.prisma.review.findUniqueOrThrow({
      where: { id },
      include: includeReviewWithRelations
    })
  }

  public async create(authorId: number, dto: CreateReviewDto) {
    const booking = await this.prisma.booking.findFirstOrThrow({
      where: { id: dto.bookingId, guestId: authorId },
      select: {
        id: true,
        listingId: true,
        status: true
      }
    })

    if (booking.status !== BookingStatusEnum.COMPLETED) {
      throw new BadRequestException(
        'Review is allowed only for completed booking'
      )
    }

    if (booking.listingId === null) {
      throw new BadRequestException('Booking has no listing to review')
    }

    return this.prisma.review.create({
      data: {
        bookingId: booking.id,
        listingId: booking.listingId,
        authorId,
        rating: dto.rating,
        comment: dto.comment
      },
      include: includeReviewWithRelations
    })
  }

  public async update(id: number, authorId: number, dto: UpdateReviewDto) {
    await this.ensureOwnership(id, authorId)

    return this.prisma.review.update({
      where: { id },
      data: dto,
      include: includeReviewWithRelations
    })
  }

  public async remove(id: number, authorId: number) {
    await this.ensureOwnership(id, authorId)

    return this.prisma.review.delete({
      where: { id }
    })
  }

  private async ensureOwnership(id: number, authorId: number) {
    await this.prisma.review.findFirstOrThrow({
      where: { id, authorId },
      select: { id: true }
    })
  }
}
