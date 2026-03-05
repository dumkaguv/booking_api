import { forwardRef, Module } from '@nestjs/common'

import { TokensModule } from '@/modules/token/token.module'

import { UsersController } from './user.controller'
import { UsersService } from './user.service'

@Module({
  imports: [forwardRef(() => TokensModule)],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService]
})
export class UsersModule {}
