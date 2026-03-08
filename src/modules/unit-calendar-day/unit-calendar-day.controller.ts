import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req
} from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'

import { ApiOkResponseWrapped, ApiPaginated } from '@/common/decorators'
import { FindAllQueryDto } from '@/common/dtos'
import type { AuthRequest } from '@/common/types'
import { sendPaginatedResponse, sendResponse } from '@/common/utils'
import { Authorization } from '@/modules/auth/decorators'

import {
  CreateUnitCalendarDayDto,
  ResponseUnitCalendarDayDto,
  UpdateUnitCalendarDayDto
} from './dto'
import { UnitCalendarDaysService } from './unit-calendar-day.service'

@Controller('unit-calendar-days')
@Authorization()
@ApiTags('Unit Calendar Days')
export class UnitCalendarDaysController {
  constructor(
    private readonly unitCalendarDayService: UnitCalendarDaysService
  ) {}

  @Get()
  @ApiPaginated(ResponseUnitCalendarDayDto)
  public findAll(
    @Req() req: AuthRequest,
    @Query() query: FindAllQueryDto<ResponseUnitCalendarDayDto>
  ) {
    return sendPaginatedResponse(
      ResponseUnitCalendarDayDto,
      this.unitCalendarDayService.findAll(req.user.id, query)
    )
  }

  @Get(':id')
  @ApiOkResponseWrapped(ResponseUnitCalendarDayDto)
  public findOne(
    @Req() req: AuthRequest,
    @Param('id', ParseIntPipe) id: number
  ) {
    return sendResponse(
      ResponseUnitCalendarDayDto,
      this.unitCalendarDayService.findOne(id, req.user.id)
    )
  }

  @Post()
  @ApiOkResponseWrapped(ResponseUnitCalendarDayDto)
  public create(
    @Req() req: AuthRequest,
    @Body() dto: CreateUnitCalendarDayDto
  ) {
    return sendResponse(
      ResponseUnitCalendarDayDto,
      this.unitCalendarDayService.create(req.user.id, dto)
    )
  }

  @Patch(':id')
  @ApiOkResponseWrapped(ResponseUnitCalendarDayDto)
  public update(
    @Req() req: AuthRequest,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUnitCalendarDayDto
  ) {
    return sendResponse(
      ResponseUnitCalendarDayDto,
      this.unitCalendarDayService.update(id, req.user.id, dto)
    )
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  public remove(
    @Req() req: AuthRequest,
    @Param('id', ParseIntPipe) id: number
  ) {
    return this.unitCalendarDayService.remove(id, req.user.id)
  }
}
