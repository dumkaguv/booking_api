import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { ArrayNotEmpty, IsArray, IsInt, Min } from 'class-validator'

export class DeleteBulkUploadDto {
  @ApiProperty({
    type: 'array',
    items: { type: 'integer' },
    minItems: 1
  })
  @IsArray()
  @ArrayNotEmpty()
  @Type(() => Number)
  @IsInt({ each: true })
  @Min(1, { each: true })
  ids: number[]
}
