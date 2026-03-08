import { ApiProperty } from '@nestjs/swagger'
import { UnitCalendarDayStateEnum } from '@prisma/client'
import {
  IsDateString,
  IsDecimal,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min
} from 'class-validator'

export class CreateUnitCalendarDayDto {
  @ApiProperty({ type: 'integer', minimum: 1 })
  @IsInt()
  @Min(1)
  unitId: number

  @ApiProperty({
    type: 'string',
    format: 'date-time',
    description: 'Calendar date (ISO date-time)'
  })
  @IsDateString()
  date: string

  @ApiProperty({
    enum: UnitCalendarDayStateEnum,
    enumName: 'UnitCalendarDayStateEnum',
    required: false
  })
  @IsOptional()
  @IsEnum(UnitCalendarDayStateEnum)
  state?: UnitCalendarDayStateEnum

  @ApiProperty({
    type: 'string',
    required: false,
    nullable: true,
    description: 'Decimal value as string, e.g. 99.99'
  })
  @IsOptional()
  @IsString()
  @IsDecimal()
  priceOverride?: string | null

  @ApiProperty({
    type: 'integer',
    minimum: 1,
    required: false,
    nullable: true
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  minNights?: number | null

  @ApiProperty({
    type: 'string',
    required: false,
    nullable: true,
    maxLength: 1000
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  note?: string | null
}
