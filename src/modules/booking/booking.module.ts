import { Module } from '@nestjs/common'

import { BookingsController } from './booking.controller'
import { BookingsService } from './booking.service'

@Module({
  controllers: [BookingsController],
  providers: [BookingsService]
})
export class BookingsModule {}
