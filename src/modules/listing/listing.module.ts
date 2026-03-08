import { Module } from '@nestjs/common'

import { ListingsController, ListingUnitsController } from './controllers'
import { ListingsService, ListingUnitsService } from './services'

@Module({
  controllers: [ListingsController, ListingUnitsController],
  providers: [ListingsService, ListingUnitsService]
})
export class ListingsModule {}
