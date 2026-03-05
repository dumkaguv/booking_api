import { ApiProperty } from '@nestjs/swagger'
import { Exclude, Expose, Type } from 'class-transformer'

import { ResponseFileDto } from '@/modules/file/dto'
import { ResponseUserNoProfileDto } from '@/modules/user/dto'

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

  @ApiProperty({ type: () => ResponseUserNoProfileDto })
  @Type(() => ResponseUserNoProfileDto)
  @Expose()
  user: ResponseUserNoProfileDto

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
    type: () => ResponseFileDto,
    required: false,
    nullable: true
  })
  @Type(() => ResponseFileDto)
  @Expose()
  avatarFile?: ResponseFileDto | null

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
