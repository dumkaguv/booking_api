import { Controller } from '@nestjs/common'

import { ApiExcludeController } from '@nestjs/swagger'

@Controller('tokens')
@ApiExcludeController()
export class TokenController {}
