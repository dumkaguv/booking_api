import { ApiProperty } from '@nestjs/swagger'
import { BookingStatusEnum } from '@prisma/client'
import {
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

export class CreateBookingDto {
  @ApiProperty({ type: 'integer', minimum: 1 })
  @IsInt()
  @Min(1)
  unitId: number

  @ApiProperty({
    type: 'string',
    format: 'date-time',
    description: 'Check-in date (ISO date-time)'
  })
  @IsDateString()
  checkIn: string

  @ApiProperty({
    type: 'string',
    format: 'date-time',
    description: 'Check-out date (ISO date-time)'
  })
  @IsDateString()
  checkOut: string

  @ApiProperty({ type: 'integer', minimum: 1 })
  @IsInt()
  @Min(1)
  guestsCount: number

  @ApiProperty({
    enum: BookingStatusEnum,
    enumName: 'BookingStatusEnum',
    required: false
  })
  @IsOptional()
  @IsEnum(BookingStatusEnum)
  status?: BookingStatusEnum

  @ApiProperty({
    type: 'string',
    description: 'Decimal value as string, e.g. 199.99'
  })
  @IsString()
  @IsDecimal()
  totalAmount: string

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

  @ApiProperty({
    type: 'string',
    format: 'date-time',
    required: false,
    nullable: true
  })
  @IsOptional()
  @IsDateString()
  confirmedAt?: string

  @ApiProperty({
    type: 'string',
    format: 'date-time',
    required: false,
    nullable: true
  })
  @IsOptional()
  @IsDateString()
  cancelledAt?: string

  @ApiProperty({
    type: 'string',
    required: false,
    nullable: true,
    maxLength: 255
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  cancelReason?: string
}
