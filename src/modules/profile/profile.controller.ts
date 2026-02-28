import { Body, Controller, Get, Patch, Post, Req } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'

import { ApiOkResponseWrapped } from '@/common/decorators'

import type { AuthRequest } from '@/common/types'
import { sendResponse } from '@/common/utils'
import { Authorization } from '@/modules/auth/decorators'

import { CreateProfileDto, ResponseProfileDto, UpdateProfileDto } from './dto'

import { ProfileService } from './profile.service'

@Controller('profile')
@Authorization()
@ApiTags('Profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get('me')
  @ApiOkResponseWrapped(ResponseProfileDto)
  public me(@Req() req: AuthRequest) {
    return sendResponse(
      ResponseProfileDto,
      this.profileService.findOne(req.user.id)
    )
  }

  @Post()
  @ApiOkResponseWrapped(ResponseProfileDto)
  public create(@Req() req: AuthRequest, @Body() dto: CreateProfileDto) {
    return sendResponse(
      ResponseProfileDto,
      this.profileService.create(req.user.id, dto)
    )
  }

  @Patch()
  @ApiOkResponseWrapped(ResponseProfileDto)
  public update(@Req() req: AuthRequest, @Body() dto: UpdateProfileDto) {
    return sendResponse(
      ResponseProfileDto,
      this.profileService.update(req.user.id, dto)
    )
  }
}
