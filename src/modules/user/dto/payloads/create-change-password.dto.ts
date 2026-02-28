import { ApiProperty } from '@nestjs/swagger'
import { IsString } from 'class-validator'

export class CreateChangePasswordDto {
  @ApiProperty({ type: 'string' })
  @IsString()
  oldPassword: string

  @ApiProperty({ type: 'string' })
  @IsString()
  newPassword: string
}
