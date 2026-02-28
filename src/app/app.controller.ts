import { Controller } from '@nestjs/common'

import { ApiExcludeController } from '@nestjs/swagger'

@Controller()
@ApiExcludeController()
export class AppController {}
