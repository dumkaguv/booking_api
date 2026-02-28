import { ApiProperty } from '@nestjs/swagger'

import { Exclude, Expose, Type } from 'class-transformer'

import { ResponseUserDto } from '@/modules/user/dto'

@Exclude()
export class ResponseLoginDto {
  @ApiProperty({ type: () => ResponseUserDto })
  @Type(() => ResponseUserDto)
  @Expose()
  user: ResponseUserDto

  @ApiProperty({ type: 'string', readOnly: true })
  @Expose()
  readonly accessToken: string
}
