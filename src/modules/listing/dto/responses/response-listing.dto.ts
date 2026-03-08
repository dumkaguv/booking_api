import { ApiProperty } from '@nestjs/swagger'
import { ListingStatusEnum, ListingTypeEnum } from '@prisma/client'
import { Exclude, Expose, Type } from 'class-transformer'

import { ResponseAmenityDto } from '@/modules/amenity/dto'
import { ResponseUserNoProfileDto } from '@/modules/user/dto'

@Exclude()
export class ResponseListingDto {
  @ApiProperty({ type: 'integer', readOnly: true })
  @Expose()
  readonly id: number

  @ApiProperty({ type: 'string' })
  @Expose()
  title: string

  @ApiProperty({ type: 'string', required: false, nullable: true })
  @Expose()
  description?: string | null

  @ApiProperty({
    enum: ListingStatusEnum,
    enumName: 'ListingStatusEnum',
    required: false,
    nullable: true
  })
  @Expose()
  status?: ListingStatusEnum | null

  @ApiProperty({
    enum: ListingTypeEnum,
    enumName: 'ListingTypeEnum'
  })
  @Expose()
  type: ListingTypeEnum

  @ApiProperty({ type: 'string' })
  @Expose()
  country: string

  @ApiProperty({ type: 'string' })
  @Expose()
  city: string

  @ApiProperty({ type: 'string' })
  @Expose()
  addressLine: string

  @ApiProperty({
    type: 'string',
    description: 'Decimal value as string'
  })
  @Type(() => String)
  @Expose()
  basePrice: string

  @ApiProperty({ type: 'string', minLength: 3, maxLength: 3 })
  @Expose()
  currency: string

  @ApiProperty({ type: 'integer' })
  @Expose()
  maxGuests: number

  @ApiProperty({ type: 'string', format: 'date-time' })
  @Expose()
  checkInFrom: Date

  @ApiProperty({ type: 'string', format: 'date-time' })
  @Expose()
  checkOutUntil: Date

  @ApiProperty({ type: 'boolean' })
  @Expose()
  instantBook: boolean

  @ApiProperty({
    type: () => ResponseAmenityDto,
    isArray: true
  })
  @Type(() => ResponseAmenityDto)
  @Expose()
  amenities: ResponseAmenityDto[]

  @ApiProperty({
    type: () => ResponseUserNoProfileDto
  })
  @Type(() => ResponseUserNoProfileDto)
  @Expose()
  owner: ResponseUserNoProfileDto

  @ApiProperty({ type: 'string', format: 'date-time', readOnly: true })
  @Expose()
  readonly createdAt: Date

  @ApiProperty({ type: 'string', format: 'date-time', readOnly: true })
  @Expose()
  readonly updatedAt: Date
}
