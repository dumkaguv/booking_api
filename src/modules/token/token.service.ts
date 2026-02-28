import { Injectable, UnauthorizedException } from '@nestjs/common'

import { ConfigService } from '@nestjs/config'

import { JwtService } from '@nestjs/jwt'

import { JwtPayload } from '@/common/types'
import { UserService } from '@/modules/user/user.service'
import { PrismaService } from '@/prisma/prisma.service'

@Injectable()
export class TokenService {
  private readonly JWT_REFRESH_SECRET: string
  private readonly JWT_ACCESS_SECRET: string
  private readonly JWT_REFRESH_TTL: string
  private readonly JWT_ACCESS_TTL: string

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly userService: UserService
  ) {
    this.JWT_REFRESH_SECRET =
      configService.getOrThrow<string>('JWT_REFRESH_SECRET')
    this.JWT_ACCESS_SECRET =
      configService.getOrThrow<string>('JWT_ACCESS_SECRET')
    this.JWT_REFRESH_TTL = configService.getOrThrow<string>(
      'JWT_REFRESH_TOKEN_TTL'
    )
    this.JWT_ACCESS_TTL = configService.getOrThrow<string>(
      'JWT_ACCESS_TOKEN_TTL'
    )
  }

  public async generate(userId: number) {
    const payload: JwtPayload = { id: userId }

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.JWT_ACCESS_SECRET,
      expiresIn: this.JWT_ACCESS_TTL as '15m'
    })

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.JWT_REFRESH_SECRET,
      expiresIn: this.JWT_REFRESH_TTL as '7d'
    })

    return { accessToken, refreshToken }
  }

  public async save(refreshToken: string, userId: number) {
    const existing = await this.prisma.token.findUnique({
      where: { userId }
    })

    if (existing) {
      return this.prisma.token.update({
        where: { userId },
        data: { refreshToken }
      })
    }

    return this.prisma.token.create({
      data: { userId, refreshToken }
    })
  }

  public validateRefreshToken(refreshToken: string): Promise<JwtPayload> {
    return this.jwtService.verifyAsync(refreshToken, {
      secret: this.JWT_REFRESH_SECRET
    })
  }

  public validateAccessToken(accessToken: string): Promise<JwtPayload> {
    return this.jwtService.verifyAsync(accessToken, {
      secret: this.JWT_ACCESS_SECRET
    })
  }

  public async remove(refreshToken: string) {
    const { id, userId } = await this.prisma.token.findFirstOrThrow({
      select: { id: true, userId: true },
      where: { refreshToken }
    })

    await this.prisma.token.delete({
      where: { id }
    })

    return userId
  }

  public async refresh(refreshToken: string) {
    const { id } = await this.validateRefreshToken(refreshToken)
    const existingToken = await this.prisma.token.findUnique({
      where: { userId: id }
    })

    if (existingToken?.refreshToken !== refreshToken) {
      throw new UnauthorizedException('Refresh token is not valid')
    }

    const user = await this.userService.findOne(id)

    const tokens = await this.generate(user.id)

    await this.save(tokens.refreshToken, user.id)

    return { ...tokens, user }
  }
}
