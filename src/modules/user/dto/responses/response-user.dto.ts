import { ApiProperty } from '@nestjs/swagger'
import { Exclude, Expose } from 'class-transformer'

@Exclude()
export class ResponseUserDto {
  @ApiProperty({ type: 'integer', readOnly: true })
  @Expose()
  readonly id: number

  @ApiProperty({ type: 'string' })
  @Expose()
  username: string

  @ApiProperty({ type: 'string' })
  @Expose()
  email: string

  @ApiProperty({
    type: 'string',
    required: false,
    nullable: true,
    readOnly: true
  })
  @Expose()
  readonly activationLink?: string | null

  @ApiProperty({ type: 'boolean', readOnly: true })
  @Expose()
  readonly isActivated: boolean

  @ApiProperty({ type: 'string', format: 'date-time', readOnly: true })
  @Expose()
  readonly createdAt: Date

  @ApiProperty({ type: 'string', format: 'date-time', readOnly: true })
  @Expose()
  readonly updatedAt: Date
}
