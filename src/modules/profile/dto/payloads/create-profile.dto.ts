import { ApiProperty } from '@nestjs/swagger'
import { IsDateString, IsOptional, IsString, MinLength } from 'class-validator'

export class CreateProfileDto {
  @ApiProperty({ type: 'string' })
  @IsString()
  @MinLength(2)
  firstName: string

  @ApiProperty({ type: 'string' })
  @IsString()
  @MinLength(2)
  lastName: string

  @ApiProperty({ type: 'string', required: false, nullable: true })
  @IsOptional()
  @IsString()
  phone?: string | null

  @ApiProperty({ type: 'string', required: false, nullable: true })
  @IsOptional()
  @IsString()
  biography?: string | null

  @ApiProperty({
    type: 'string',
    format: 'date',
    required: false,
    nullable: true
  })
  @IsOptional()
  @IsDateString()
  birthDay?: string | null
}
