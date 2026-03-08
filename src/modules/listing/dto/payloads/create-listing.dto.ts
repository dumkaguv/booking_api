import { ApiProperty } from '@nestjs/swagger'
import { ListingStatusEnum, ListingTypeEnum } from '@prisma/client'
import {
  IsBoolean,
  IsDateString,
  IsDecimal,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Matches,
  MaxLength,
  Min
} from 'class-validator'

export class CreateListingDto {
  @ApiProperty({ type: 'string', maxLength: 255 })
  @IsString()
  @Length(1, 255)
  title: string

  @ApiProperty({
    type: 'string',
    required: false,
    nullable: true,
    maxLength: 255
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string

  @ApiProperty({
    enum: ListingStatusEnum,
    enumName: 'ListingStatusEnum',
    required: false
  })
  @IsOptional()
  @IsEnum(ListingStatusEnum)
  status?: ListingStatusEnum

  @ApiProperty({
    enum: ListingTypeEnum,
    enumName: 'ListingTypeEnum'
  })
  @IsEnum(ListingTypeEnum)
  type: ListingTypeEnum

  @ApiProperty({ type: 'string', maxLength: 255 })
  @IsString()
  @Length(1, 255)
  country: string

  @ApiProperty({ type: 'string', maxLength: 255 })
  @IsString()
  @Length(1, 255)
  city: string

  @ApiProperty({ type: 'string', maxLength: 255 })
  @IsString()
  @Length(1, 255)
  addressLine: string

  @ApiProperty({
    type: 'string',
    description: 'Decimal value as string, e.g. 99.99'
  })
  @IsString()
  @IsDecimal()
  basePrice: string

  @ApiProperty({
    type: 'string',
    minLength: 3,
    maxLength: 3,
    description: 'ISO 4217 currency code'
  })
  @IsString()
  @Length(3, 3)
  @Matches(/^[A-Z]{3}$/)
  currency: string

  @ApiProperty({ type: 'integer', minimum: 1 })
  @IsInt()
  @Min(1)
  maxGuests: number

  @ApiProperty({
    type: 'string',
    format: 'date-time',
    description: 'Check-in start time (ISO date-time)'
  })
  @IsDateString()
  checkInFrom: string

  @ApiProperty({
    type: 'string',
    format: 'date-time',
    description: 'Check-out latest time (ISO date-time)'
  })
  @IsDateString()
  checkOutUntil: string

  @ApiProperty({ type: 'boolean' })
  @IsBoolean()
  instantBook: boolean
}
