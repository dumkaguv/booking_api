import { ApiProperty } from '@nestjs/swagger'
import {
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min
} from 'class-validator'

export class UpdateReviewDto {
  @ApiProperty({
    type: 'integer',
    minimum: 1,
    maximum: 5,
    required: false
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  rating?: number

  @ApiProperty({
    type: 'string',
    required: false,
    nullable: true,
    maxLength: 1000
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  comment?: string
}
