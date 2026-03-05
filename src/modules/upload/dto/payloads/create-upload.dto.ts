import { ApiProperty } from '@nestjs/swagger'

import { UploadMetaDto } from './upload-meta.dto'

export class CreateUploadDto extends UploadMetaDto {
  @ApiProperty({ type: 'string', format: 'binary' })
  file: Express.Multer.File
}
