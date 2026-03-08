import { PartialType } from '@nestjs/swagger'

import { CreateUnitCalendarDayDto } from './create-unit-calendar-day.dto'

export class UpdateUnitCalendarDayDto extends PartialType(
  CreateUnitCalendarDayDto
) {}
