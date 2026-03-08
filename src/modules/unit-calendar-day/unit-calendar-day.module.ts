import { Module } from '@nestjs/common'

import { UnitCalendarDaysController } from './unit-calendar-day.controller'
import { UnitCalendarDaysService } from './unit-calendar-day.service'

@Module({
  controllers: [UnitCalendarDaysController],
  providers: [UnitCalendarDaysService]
})
export class UnitCalendarDaysModule {}
