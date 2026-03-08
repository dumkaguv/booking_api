import { ApiProperty } from '@nestjs/swagger'
import { Exclude, Expose } from 'class-transformer'

@Exclude()
export class ResponseListingUnitDto {
  @ApiProperty({ type: 'integer', readOnly: true })
  @Expose()
  readonly id: number

  @ApiProperty({ type: 'string' })
  @Expose()
  name: string

  @ApiProperty({ type: 'integer' })
  @Expose()
  capacity: number

  @ApiProperty({ type: 'boolean' })
  @Expose()
  isActive: boolean

  @ApiProperty({ type: 'integer' })
  @Expose()
  listingId: number

  @ApiProperty({ type: 'string', format: 'date-time', readOnly: true })
  @Expose()
  readonly createdAt: Date

  @ApiProperty({ type: 'string', format: 'date-time', readOnly: true })
  @Expose()
  readonly updatedAt: Date
}
