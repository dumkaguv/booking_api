import { ApiProperty } from '@nestjs/swagger'
import { Exclude, Expose, Type } from 'class-transformer'

import { ResponseUploadDto } from './response-upload.dto'

@Exclude()
export class ResponseUploadBulkDto {
  @ApiProperty({
    type: () => [ResponseUploadDto]
  })
  @Type(() => ResponseUploadDto)
  @Expose()
  items: ResponseUploadDto[]
}
