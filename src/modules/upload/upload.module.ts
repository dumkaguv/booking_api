import { Module } from '@nestjs/common'

import { CloudinaryModule } from '@/modules/cloudinary/cloudinary.module'
import { FilesModule } from '@/modules/file/file.module'

import { UploadsController } from './upload.controller'
import { UploadsService } from './upload.service'

@Module({
  imports: [CloudinaryModule, FilesModule],
  controllers: [UploadsController],
  providers: [UploadsService]
})
export class UploadsModule {}
