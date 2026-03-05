import { ApiProperty } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator'

import { UploadTargetType } from '@/modules/file/constants'

function toOptionalNumber({ value }: { value: unknown }): number | undefined {
  if (value === null || value === undefined) {
    return undefined
  }

  if (typeof value === 'string') {
    const normalizedValue = value.trim().toLowerCase()

    if (
      normalizedValue === '' ||
      normalizedValue === 'null' ||
      normalizedValue === 'undefined'
    ) {
      return undefined
    }
  }

  return Number(value)
}

export class UploadMetaDto {
  @ApiProperty({
    type: 'string',
    required: false,
    nullable: true,
    description: 'Target Cloudinary folder. If omitted, defaults to "shared".'
  })
  @IsOptional()
  @IsString()
  folder?: string

  @ApiProperty({
    enum: UploadTargetType,
    enumName: 'UploadTargetType',
    required: false,
    nullable: true,
    description:
      'Entity type to attach uploaded file to (PROFILE_AVATAR, LISTING, REVIEW).'
  })
  @IsOptional()
  @IsEnum(UploadTargetType)
  targetType?: UploadTargetType

  @ApiProperty({
    type: 'integer',
    required: false,
    nullable: true,
    description:
      'Target entity id. Required for LISTING and REVIEW, must be omitted for PROFILE_AVATAR.'
  })
  @IsOptional()
  @Transform(toOptionalNumber)
  @IsInt()
  @Min(1)
  targetId?: number

  @ApiProperty({
    type: 'integer',
    required: false,
    nullable: true,
    description:
      'Display order for file within target collection (0-based, used for listing images).'
  })
  @IsOptional()
  @Transform(toOptionalNumber)
  @IsInt()
  @Min(0)
  order?: number
}
