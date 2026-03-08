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
  Query
} from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'

import { ApiOkResponseWrapped, ApiPaginated } from '@/common/decorators'
import { FindAllQueryDto } from '@/common/dtos'
import { sendPaginatedResponse, sendResponse } from '@/common/utils'
import { Authorization } from '@/modules/auth/decorators'

import { AmenitiesService } from './amenity.service'
import { CreateAmenityDto, ResponseAmenityDto, UpdateAmenityDto } from './dto'

@Controller('amenities')
@Authorization()
@ApiTags('Amenities')
export class AmenitiesController {
  constructor(private readonly amenityService: AmenitiesService) {}

  @Get()
  @ApiPaginated(ResponseAmenityDto)
  public findAll(@Query() query: FindAllQueryDto<ResponseAmenityDto>) {
    return sendPaginatedResponse(
      ResponseAmenityDto,
      this.amenityService.findAll(query)
    )
  }

  @Get(':id')
  @ApiOkResponseWrapped(ResponseAmenityDto)
  public findOne(@Param('id', ParseIntPipe) id: number) {
    return sendResponse(ResponseAmenityDto, this.amenityService.findOne(id))
  }

  @Post()
  @ApiOkResponseWrapped(ResponseAmenityDto)
  public create(@Body() dto: CreateAmenityDto) {
    return sendResponse(ResponseAmenityDto, this.amenityService.create(dto))
  }

  @Patch(':id')
  @ApiOkResponseWrapped(ResponseAmenityDto)
  public update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAmenityDto
  ) {
    return sendResponse(ResponseAmenityDto, this.amenityService.update(id, dto))
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  public remove(@Param('id', ParseIntPipe) id: number) {
    return this.amenityService.remove(id)
  }
}
