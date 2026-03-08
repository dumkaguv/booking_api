import { ApiProperty } from '@nestjs/swagger'
import { UnitCalendarDayStateEnum } from '@prisma/client'
import { Exclude, Expose, Type } from 'class-transformer'

import { ResponseListingUnitDto } from '@/modules/listing/dto'

@Exclude()
export class ResponseUnitCalendarDayDto {
  @ApiProperty({ type: 'integer', readOnly: true })
  @Expose()
  readonly id: number

  @ApiProperty({ type: () => ResponseListingUnitDto })
  @Type(() => ResponseListingUnitDto)
  @Expose()
  unit: ResponseListingUnitDto

  @ApiProperty({ type: 'string', format: 'date-time' })
  @Expose()
  date: Date

  @ApiProperty({
    enum: UnitCalendarDayStateEnum,
    enumName: 'UnitCalendarDayStateEnum'
  })
  @Expose()
  state: UnitCalendarDayStateEnum

  @ApiProperty({
    type: 'string',
    required: false,
    nullable: true,
    description: 'Decimal value as string'
  })
  @Expose()
  priceOverride?: string | null

  @ApiProperty({
    type: 'integer',
    required: false,
    nullable: true
  })
  @Expose()
  minNights?: number | null

  @ApiProperty({
    type: 'string',
    required: false,
    nullable: true
  })
  @Expose()
  note?: string | null

  @ApiProperty({ type: 'string', format: 'date-time', readOnly: true })
  @Expose()
  readonly createdAt: Date

  @ApiProperty({ type: 'string', format: 'date-time', readOnly: true })
  @Expose()
  readonly updatedAt: Date
}
