import { ApiProperty } from '@nestjs/swagger'
import { Exclude, Expose, Type } from 'class-transformer'

import { UploadTargetType } from '@/modules/file/constants'

@Exclude()
export class ResponseFileTargetDto {
  @ApiProperty({
    enum: UploadTargetType,
    enumName: 'UploadTargetType'
  })
  @Expose()
  targetType: UploadTargetType

  @ApiProperty({ type: 'integer' })
  @Expose()
  targetId: number
}

@Exclude()
export class ResponseFileDto {
  @ApiProperty({ type: 'integer', readOnly: true })
  @Expose()
  readonly id: number

  @ApiProperty({ type: 'string' })
  @Expose()
  url: string

  @ApiProperty({ type: 'string', required: false, nullable: true })
  @Expose()
  type?: string | null

  @ApiProperty({
    type: 'string',
    format: 'date-time',
    readOnly: true
  })
  @Expose()
  readonly uploadedAt: Date

  @ApiProperty({
    type: () => ResponseFileTargetDto,
    isArray: true,
    description: 'Entities this file is attached to.'
  })
  @Type(() => ResponseFileTargetDto)
  @Expose()
  targets: ResponseFileTargetDto[]
}
