import { ApiProperty } from '@nestjs/swagger'
import { IsBoolean, IsInt, IsString, Length, Min } from 'class-validator'

export class CreateListingUnitDto {
  @ApiProperty({ type: 'string', maxLength: 255 })
  @IsString()
  @Length(1, 255)
  name: string

  @ApiProperty({ type: 'integer', minimum: 1 })
  @IsInt()
  @Min(1)
  capacity: number

  @ApiProperty({ type: 'boolean' })
  @IsBoolean()
  isActive: boolean
}
