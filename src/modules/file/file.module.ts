import { Module } from '@nestjs/common'

import { CloudinaryModule } from '@/modules/cloudinary/cloudinary.module'

import { FilesController } from './file.controller'
import { FilesService } from './file.service'

@Module({
  imports: [CloudinaryModule],
  controllers: [FilesController],
  providers: [FilesService],
  exports: [FilesService]
})
export class FilesModule {}
