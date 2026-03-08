import { Module } from '@nestjs/common'

import { ListingsController } from './listing.controller'
import { ListingsService } from './listing.service'

@Module({
  controllers: [ListingsController],
  providers: [ListingsService]
})
export class ListingsModule {}
