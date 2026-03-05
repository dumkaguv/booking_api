import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
  Req
} from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'

import { ApiOkResponseWrapped, ApiPaginated } from '@/common/decorators'
import { FindAllQueryDto } from '@/common/dtos'
import type { AuthRequest } from '@/common/types'
import { sendPaginatedResponse, sendResponse } from '@/common/utils'
import { Authorization } from '@/modules/auth/decorators'
import { ResponseFileDto } from '@/modules/file/dto'

import { FilesService } from './file.service'

@Controller('files')
@Authorization()
@ApiTags('Files')
export class FilesController {
  constructor(private readonly fileService: FilesService) {}

  @Get()
  @ApiPaginated(ResponseFileDto)
  public findAll(
    @Req() req: AuthRequest,
    @Query() query: FindAllQueryDto<ResponseFileDto>
  ) {
    return sendPaginatedResponse(
      ResponseFileDto,
      this.fileService.findAllForUser(req.user.id, query)
    )
  }

  @Get(':id')
  @ApiOkResponseWrapped(ResponseFileDto)
  public findOne(
    @Req() req: AuthRequest,
    @Param('id', ParseIntPipe) id: number
  ) {
    return sendResponse(
      ResponseFileDto,
      this.fileService.findOneForUser(id, req.user.id)
    )
  }
}
