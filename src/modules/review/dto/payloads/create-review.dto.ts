import { ApiProperty } from '@nestjs/swagger'
import {
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min
} from 'class-validator'

export class CreateReviewDto {
  @ApiProperty({ type: 'integer', minimum: 1 })
  @IsInt()
  @Min(1)
  bookingId: number

  @ApiProperty({ type: 'integer', minimum: 1, maximum: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number

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
