import { JwtModuleOptions } from '@nestjs/jwt'

export function getJwtConfig(): JwtModuleOptions {
  return {
    signOptions: {
      algorithm: 'HS256'
    },
    verifyOptions: {
      algorithms: ['HS256'],
      ignoreExpiration: false
    }
  }
}
