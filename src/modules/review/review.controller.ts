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

import { CreateReviewDto, ResponseReviewDto, UpdateReviewDto } from './dto'
import { ReviewsService } from './review.service'

@Controller('reviews')
@Authorization()
@ApiTags('Reviews')
export class ReviewsController {
  constructor(private readonly reviewService: ReviewsService) {}

  @Get()
  @ApiPaginated(ResponseReviewDto)
  public findAll(@Query() query: FindAllQueryDto<ResponseReviewDto>) {
    return sendPaginatedResponse(
      ResponseReviewDto,
      this.reviewService.findAll(query)
    )
  }

  @Get(':id')
  @ApiOkResponseWrapped(ResponseReviewDto)
  public findOne(@Param('id', ParseIntPipe) id: number) {
    return sendResponse(ResponseReviewDto, this.reviewService.findOne(id))
  }

  @Post()
  @ApiOkResponseWrapped(ResponseReviewDto)
  public create(@Req() req: AuthRequest, @Body() dto: CreateReviewDto) {
    return sendResponse(
      ResponseReviewDto,
      this.reviewService.create(req.user.id, dto)
    )
  }

  @Patch(':id')
  @ApiOkResponseWrapped(ResponseReviewDto)
  public update(
    @Req() req: AuthRequest,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateReviewDto
  ) {
    return sendResponse(
      ResponseReviewDto,
      this.reviewService.update(id, req.user.id, dto)
    )
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  public remove(
    @Req() req: AuthRequest,
    @Param('id', ParseIntPipe) id: number
  ) {
    return this.reviewService.remove(id, req.user.id)
  }
}
