import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsString, MaxLength } from 'class-validator'

export class CreateLoginDto {
  @ApiProperty({ type: 'string' })
  @IsString()
  @IsEmail()
  @MaxLength(100)
  email: string

  @ApiProperty({ type: 'string' })
  @IsString()
  password: string
}
