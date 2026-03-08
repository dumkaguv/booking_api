import { ApiProperty } from '@nestjs/swagger'
import { Exclude, Expose, Type } from 'class-transformer'

import { ResponseBookingDto } from '@/modules/booking/dto'
import { ResponseListingDto } from '@/modules/listing/dto'
import { ResponseUserNoProfileDto } from '@/modules/user/dto'

@Exclude()
export class ResponseReviewDto {
  @ApiProperty({ type: 'integer', readOnly: true })
  @Expose()
  readonly id: number

  @ApiProperty({ type: () => ResponseBookingDto })
  @Type(() => ResponseBookingDto)
  @Expose()
  booking: ResponseBookingDto

  @ApiProperty({ type: () => ResponseListingDto })
  @Type(() => ResponseListingDto)
  @Expose()
  listing: ResponseListingDto

  @ApiProperty({ type: () => ResponseUserNoProfileDto })
  @Type(() => ResponseUserNoProfileDto)
  @Expose()
  author: ResponseUserNoProfileDto

  @ApiProperty({ type: 'integer' })
  @Expose()
  rating: number

  @ApiProperty({
    type: 'string',
    required: false,
    nullable: true
  })
  @Expose()
  comment?: string | null

  @ApiProperty({ type: 'string', format: 'date-time', readOnly: true })
  @Expose()
  readonly createdAt: Date

  @ApiProperty({ type: 'string', format: 'date-time', readOnly: true })
  @Expose()
  readonly updatedAt: Date
}
