import { ApiProperty } from '@nestjs/swagger'
import { Exclude, Expose, Type } from 'class-transformer'

import { ResponseUserDto } from '@/modules/user/dto'

@Exclude()
export class ResponseProfileDto {
  @ApiProperty({ type: 'integer', readOnly: true })
  @Expose()
  readonly id: number

  @ApiProperty({ type: 'string', required: false, nullable: true })
  @Expose()
  firstName?: string | null

  @ApiProperty({ type: 'string', required: false, nullable: true })
  @Expose()
  lastName?: string | null

  @ApiProperty({ type: () => ResponseUserDto })
  @Type(() => ResponseUserDto)
  @Expose()
  user: ResponseUserDto

  @ApiProperty({
    type: 'string',
    format: 'date',
    required: false,
    nullable: true
  })
  @Expose()
  birthDay?: Date | null

  @ApiProperty({ type: 'string', nullable: true, required: false })
  @Expose()
  phone?: string | null

  @ApiProperty({ type: 'string', nullable: true, required: false })
  @Expose()
  biography?: string | null

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
