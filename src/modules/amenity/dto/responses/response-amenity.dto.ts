import { ApiProperty } from '@nestjs/swagger'
import { Exclude, Expose } from 'class-transformer'

@Exclude()
export class ResponseAmenityDto {
  @ApiProperty({ type: 'integer', readOnly: true })
  @Expose()
  readonly id: number

  @ApiProperty({ type: 'string' })
  @Expose()
  code: string

  @ApiProperty({ type: 'string' })
  @Expose()
  name: string

  @ApiProperty({
    type: 'string',
    required: false,
    nullable: true
  })
  @Expose()
  color?: string | null

  @ApiProperty({
    type: 'string',
    format: 'date-time',
    readOnly: true
  })
  @Expose()
  readonly createdAt: Date

  @ApiProperty({
    type: 'string',
    format: 'date-time',
    readOnly: true
  })
  @Expose()
  readonly updatedAt: Date
}
