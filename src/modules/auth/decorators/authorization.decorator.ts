import { applyDecorators, UseGuards } from '@nestjs/common'

import { ApiBearerAuth } from '@nestjs/swagger'

import { JwtGuard } from '@/modules/auth/guards'

export function Authorization() {
  return applyDecorators(UseGuards(JwtGuard), ApiBearerAuth())
}
