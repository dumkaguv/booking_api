import { ApiProperty } from '@nestjs/swagger'
import {
  IsOptional,
  IsString,
  Length,
  Matches,
  MaxLength
} from 'class-validator'

export class CreateAmenityDto {
  @ApiProperty({
    type: 'string',
    maxLength: 50,
    description: 'Unique amenity code in UPPER_SNAKE_CASE format'
  })
  @IsString()
  @Length(1, 50)
  @Matches(/^[A-Z0-9_]+$/)
  code: string

  @ApiProperty({ type: 'string', maxLength: 255 })
  @IsString()
  @Length(1, 255)
  name: string

  @ApiProperty({
    type: 'string',
    required: false,
    nullable: true,
    maxLength: 255,
    description: 'Hex color code (e.g. #2563EB)'
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  @Matches(/^#(?:[A-Fa-f0-9]{3}|[A-Fa-f0-9]{6})$/)
  color?: string | null
}
