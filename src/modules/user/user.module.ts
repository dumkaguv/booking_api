import { forwardRef, Module } from '@nestjs/common'

import { TokenModule } from '@/modules/token/token.module'

import { UserController } from './user.controller'
import { UserService } from './user.service'

@Module({
  imports: [forwardRef(() => TokenModule)],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService]
})
export class UserModule {}
