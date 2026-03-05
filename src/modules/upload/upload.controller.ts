import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UploadedFile,
  UploadedFiles
} from '@nestjs/common'

import { ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger'

import { ApiOkResponseWrapped } from '@/common/decorators'
import type { AuthRequest } from '@/common/types'
import { sendResponse } from '@/common/utils'
import { Authorization } from '@/modules/auth/decorators'

import { FilesUpload, FileUpload } from './decorators'
import {
  CreateBulkUploadDto,
  CreateUploadDto,
  DeleteBulkUploadDto,
  ResponseUploadBulkDto,
  ResponseUploadDto
} from './dto'
import { UploadsService } from './upload.service'

@Controller('uploads')
@Authorization()
@ApiTags('Uploads')
export class UploadsController {
  constructor(private readonly uploadService: UploadsService) {}

  @Post()
  @FileUpload('file')
  @ApiOkResponseWrapped(ResponseUploadDto)
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreateUploadDto })
  public upload(
    @Req() req: AuthRequest,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: CreateUploadDto
  ) {
    if (!file) {
      throw new BadRequestException('file is required')
    }

    return sendResponse(
      ResponseUploadDto,
      this.uploadService.upload(file, req.user.id, dto)
    )
  }

  @Post('bulk')
  @FilesUpload('files')
  @ApiOkResponseWrapped(ResponseUploadBulkDto)
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreateBulkUploadDto })
  public uploadBulk(
    @Req() req: AuthRequest,
    @UploadedFiles() files: Express.Multer.File[],
    @Body() dto: CreateBulkUploadDto
  ) {
    if (!files?.length) {
      throw new BadRequestException('files are required')
    }

    return sendResponse(
      ResponseUploadBulkDto,
      this.uploadService
        .uploadBulk(files, req.user.id, dto)
        .then((items) => ({ items }))
    )
  }

  @Delete('bulk')
  @HttpCode(HttpStatus.NO_CONTENT)
  public deleteBulk(@Req() req: AuthRequest, @Body() dto: DeleteBulkUploadDto) {
    return this.uploadService.deleteBulk(req.user.id, dto.ids)
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  public delete(
    @Req() req: AuthRequest,
    @Param('id', ParseIntPipe) id: number
  ) {
    return this.uploadService.delete(req.user.id, id)
  }
}
