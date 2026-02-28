import { ApiProperty } from '@nestjs/swagger'
import { Exclude, Expose } from 'class-transformer'

@Exclude()
export class ResponseRefreshDto {
  @ApiProperty({ type: 'string', readOnly: true })
  @Expose()
  readonly accessToken: string
}
