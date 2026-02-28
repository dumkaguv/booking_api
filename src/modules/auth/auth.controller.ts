import { Body, Controller, Post, Req, Res } from '@nestjs/common'

import { ApiOperation } from '@nestjs/swagger'

import { ApiOkResponseWrapped } from '@/common/decorators'
import { EmptyResponseDto } from '@/common/dtos'
import type { AuthRequest } from '@/common/types'
import { sendResponse } from '@/common/utils'
import { CreateUserDto } from '@/modules/user/dto'

import { AuthService } from './auth.service'
import {
  CreateLoginDto,
  ResponseLoginDto,
  ResponseRefreshDto,
  ResponseRegisterDto
} from './dto'

import type { Request, Response } from 'express'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOkResponseWrapped(ResponseRegisterDto)
  @ApiOperation({
    description: `Validation pattern for password:
    \`/^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*()_+\\-=\\[\\]{};':"\\\\|,.<>/?]).{8,}$/\``
  })
  public register(
    @Res({ passthrough: true }) res: Response,
    @Body() dto: CreateUserDto
  ) {
    return sendResponse(
      ResponseRegisterDto,
      this.authService.register(res, dto)
    )
  }

  @Post('login')
  @ApiOkResponseWrapped(ResponseLoginDto)
  public login(
    @Res({ passthrough: true }) res: Response,
    @Body() dto: CreateLoginDto
  ) {
    return sendResponse(ResponseLoginDto, this.authService.login(res, dto))
  }

  @Post('logout')
  @ApiOkResponseWrapped(EmptyResponseDto)
  public logout(
    @Req() req: AuthRequest,
    @Res({ passthrough: true }) res: Response
  ) {
    const { refreshToken } = req.cookies

    res.clearCookie('refreshToken')

    return sendResponse(
      EmptyResponseDto,
      this.authService.logout(refreshToken as string)
    )
  }

  @Post('refresh')
  @ApiOkResponseWrapped(ResponseRefreshDto)
  public refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response
  ) {
    return sendResponse(ResponseRefreshDto, this.authService.refresh(req, res))
  }
}
