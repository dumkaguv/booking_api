import { ApiProperty } from '@nestjs/swagger'

import { UploadMetaDto } from './upload-meta.dto'

export class CreateBulkUploadDto extends UploadMetaDto {
  @ApiProperty({
    type: 'array',
    items: { type: 'string', format: 'binary' }
  })
  files: Express.Multer.File[]
}
