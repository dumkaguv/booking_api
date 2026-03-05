import { forwardRef, Module } from '@nestjs/common'

import { AuthModule } from '@/modules/auth/auth.module'

import { UsersModule } from '@/modules/user/user.module'

import { TokensController } from './token.controller'
import { TokensService } from './token.service'

@Module({
  imports: [forwardRef(() => AuthModule), UsersModule],
  controllers: [TokensController],
  providers: [TokensService],
  exports: [TokensService]
})
export class TokensModule {}
