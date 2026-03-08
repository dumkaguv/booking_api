import { Injectable } from '@nestjs/common'

import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'

import { ENV_KEYS } from '@/common/constants'
import type { JwtPayload } from '@/common/types'
import { AuthService } from '@/modules/auth/auth.service'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly authService: AuthService,
    configService: ConfigService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>(ENV_KEYS.JWT_ACCESS_SECRET),
      algorithms: ['HS256']
    })
  }

  public validate(payload: JwtPayload) {
    return this.authService.validate(payload.id)
  }
}
