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

import { CreateListingDto, ResponseListingDto, UpdateListingDto } from '../dto'
import { ListingsService } from '../services'

@Controller('listings')
@Authorization()
@ApiTags('Listings')
export class ListingsController {
  constructor(private readonly listingService: ListingsService) {}

  @Get()
  @ApiPaginated(ResponseListingDto)
  public findAll(@Query() query: FindAllQueryDto<ResponseListingDto>) {
    return sendPaginatedResponse(
      ResponseListingDto,
      this.listingService.findAll(query)
    )
  }

  @Get(':id')
  @ApiOkResponseWrapped(ResponseListingDto)
  public findOne(@Param('id', ParseIntPipe) id: number) {
    return sendResponse(ResponseListingDto, this.listingService.findOne(id))
  }

  @Post()
  @ApiOkResponseWrapped(ResponseListingDto)
  public create(@Req() req: AuthRequest, @Body() dto: CreateListingDto) {
    return sendResponse(
      ResponseListingDto,
      this.listingService.create(req.user.id, dto)
    )
  }

  @Patch(':id')
  @ApiOkResponseWrapped(ResponseListingDto)
  public update(
    @Req() req: AuthRequest,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateListingDto
  ) {
    return sendResponse(
      ResponseListingDto,
      this.listingService.update(id, req.user.id, dto)
    )
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  public remove(
    @Req() req: AuthRequest,
    @Param('id', ParseIntPipe) id: number
  ) {
    return this.listingService.remove(id, req.user.id)
  }
}
