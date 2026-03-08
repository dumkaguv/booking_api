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
  CreateListingUnitDto,
  ResponseListingUnitDto,
  UpdateListingUnitDto
} from '../dto'
import { ListingUnitsService } from '../services'

@Controller('listings/:listingId/units')
@Authorization()
@ApiTags('Listing Units')
export class ListingUnitsController {
  constructor(private readonly listingUnitService: ListingUnitsService) {}

  @Get()
  @ApiPaginated(ResponseListingUnitDto)
  public findAll(
    @Param('listingId', ParseIntPipe) listingId: number,
    @Query() query: FindAllQueryDto<ResponseListingUnitDto>
  ) {
    return sendPaginatedResponse(
      ResponseListingUnitDto,
      this.listingUnitService.findAll(listingId, query)
    )
  }

  @Get(':unitId')
  @ApiOkResponseWrapped(ResponseListingUnitDto)
  public findOne(
    @Param('listingId', ParseIntPipe) listingId: number,
    @Param('unitId', ParseIntPipe) unitId: number
  ) {
    return sendResponse(
      ResponseListingUnitDto,
      this.listingUnitService.findOne(listingId, unitId)
    )
  }

  @Post()
  @ApiOkResponseWrapped(ResponseListingUnitDto)
  public create(
    @Req() req: AuthRequest,
    @Param('listingId', ParseIntPipe) listingId: number,
    @Body() dto: CreateListingUnitDto
  ) {
    return sendResponse(
      ResponseListingUnitDto,
      this.listingUnitService.create(listingId, req.user.id, dto)
    )
  }

  @Patch(':unitId')
  @ApiOkResponseWrapped(ResponseListingUnitDto)
  public update(
    @Req() req: AuthRequest,
    @Param('listingId', ParseIntPipe) listingId: number,
    @Param('unitId', ParseIntPipe) unitId: number,
    @Body() dto: UpdateListingUnitDto
  ) {
    return sendResponse(
      ResponseListingUnitDto,
      this.listingUnitService.update(listingId, unitId, req.user.id, dto)
    )
  }

  @Delete(':unitId')
  @HttpCode(HttpStatus.NO_CONTENT)
  public remove(
    @Req() req: AuthRequest,
    @Param('listingId', ParseIntPipe) listingId: number,
    @Param('unitId', ParseIntPipe) unitId: number
  ) {
    return this.listingUnitService.remove(listingId, unitId, req.user.id)
  }
}
