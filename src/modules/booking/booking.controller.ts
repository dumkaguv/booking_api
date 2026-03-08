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

import { BookingsService } from './booking.service'
import { CreateBookingDto, ResponseBookingDto, UpdateBookingDto } from './dto'

@Controller('bookings')
@Authorization()
@ApiTags('Bookings')
export class BookingsController {
  constructor(private readonly bookingService: BookingsService) {}

  @Get()
  @ApiPaginated(ResponseBookingDto)
  public findAll(
    @Req() req: AuthRequest,
    @Query() query: FindAllQueryDto<ResponseBookingDto>
  ) {
    return sendPaginatedResponse(
      ResponseBookingDto,
      this.bookingService.findAll(req.user.id, query)
    )
  }

  @Get(':id')
  @ApiOkResponseWrapped(ResponseBookingDto)
  public findOne(
    @Req() req: AuthRequest,
    @Param('id', ParseIntPipe) id: number
  ) {
    return sendResponse(
      ResponseBookingDto,
      this.bookingService.findOne(id, req.user.id)
    )
  }

  @Post()
  @ApiOkResponseWrapped(ResponseBookingDto)
  public create(@Req() req: AuthRequest, @Body() dto: CreateBookingDto) {
    return sendResponse(
      ResponseBookingDto,
      this.bookingService.create(req.user.id, dto)
    )
  }

  @Patch(':id')
  @ApiOkResponseWrapped(ResponseBookingDto)
  public update(
    @Req() req: AuthRequest,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateBookingDto
  ) {
    return sendResponse(
      ResponseBookingDto,
      this.bookingService.update(id, req.user.id, dto)
    )
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  public remove(
    @Req() req: AuthRequest,
    @Param('id', ParseIntPipe) id: number
  ) {
    return this.bookingService.remove(id, req.user.id)
  }
}
