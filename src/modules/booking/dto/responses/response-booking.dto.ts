import { ApiProperty } from '@nestjs/swagger'
import { BookingStatusEnum } from '@prisma/client'
import { Exclude, Expose, Type } from 'class-transformer'

import {
  ResponseListingDto,
  ResponseListingUnitDto
} from '@/modules/listing/dto'
import { ResponseUserNoProfileDto } from '@/modules/user/dto'

@Exclude()
export class ResponseBookingDto {
  @ApiProperty({ type: 'integer', readOnly: true })
  @Expose()
  readonly id: number

  @ApiProperty({ type: () => ResponseListingUnitDto })
  @Type(() => ResponseListingUnitDto)
  @Expose()
  unit: ResponseListingUnitDto

  @ApiProperty({ type: () => ResponseUserNoProfileDto })
  @Type(() => ResponseUserNoProfileDto)
  @Expose()
  guest: ResponseUserNoProfileDto

  @ApiProperty({
    type: () => ResponseListingDto,
    required: false,
    nullable: true
  })
  @Type(() => ResponseListingDto)
  @Expose()
  listing?: ResponseListingDto | null

  @ApiProperty({
    type: 'string',
    format: 'date-time'
  })
  @Expose()
  checkIn: Date

  @ApiProperty({
    type: 'string',
    format: 'date-time'
  })
  @Expose()
  checkOut: Date

  @ApiProperty({ type: 'integer' })
  @Expose()
  guestsCount: number

  @ApiProperty({
    enum: BookingStatusEnum,
    enumName: 'BookingStatusEnum'
  })
  @Expose()
  status: BookingStatusEnum

  @ApiProperty({
    type: 'string',
    description: 'Decimal value as string'
  })
  @Type(() => String)
  @Expose()
  totalAmount: string

  @ApiProperty({ type: 'string', minLength: 3, maxLength: 3 })
  @Expose()
  currency: string

  @ApiProperty({
    type: 'string',
    format: 'date-time',
    required: false,
    nullable: true
  })
  @Expose()
  confirmedAt?: Date | null

  @ApiProperty({
    type: 'string',
    format: 'date-time',
    required: false,
    nullable: true
  })
  @Expose()
  cancelledAt?: Date | null

  @ApiProperty({
    type: 'string',
    required: false,
    nullable: true
  })
  @Expose()
  cancelReason?: string | null

  @ApiProperty({ type: 'string', format: 'date-time', readOnly: true })
  @Expose()
  readonly createdAt: Date

  @ApiProperty({ type: 'string', format: 'date-time', readOnly: true })
  @Expose()
  readonly updatedAt: Date
}
