import { Module } from '@nestjs/common'

import { AmenitiesController } from './amenity.controller'
import { AmenitiesService } from './amenity.service'

@Module({
  controllers: [AmenitiesController],
  providers: [AmenitiesService]
})
export class AmenitiesModule {}
