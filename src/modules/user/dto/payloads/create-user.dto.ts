import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsString, Length, Matches, MaxLength } from 'class-validator'

export class CreateUserDto {
  @ApiProperty({ type: 'string' })
  @IsString()
  @IsEmail()
  @MaxLength(100)
  email: string

  @ApiProperty({ type: 'string' })
  @IsString()
  @Length(2, 255)
  username: string

  @ApiProperty({ type: 'string' })
  @IsString()
  @Length(8, 255)
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/,
    {
      message:
        'Password must contain at least 8 symbols, one upper case letter, one lower case letter, one digit and one special symbol'
    }
  )
  password: string
}
