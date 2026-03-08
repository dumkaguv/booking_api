import { ConfigService } from '@nestjs/config'

import { APPLICATION_STAGES, ENV_KEYS } from '@/common/constants'

export function isDev(configService: ConfigService) {
  return (
    configService.getOrThrow<string>(ENV_KEYS.NODE_ENV) ===
    APPLICATION_STAGES.DEVELOPMENT
  )
}
