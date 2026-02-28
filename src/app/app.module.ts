import { Module } from '@nestjs/common'

import { ConfigModule } from '@nestjs/config'
import { APP_GUARD } from '@nestjs/core'
import { seconds, ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler'

import { AllExceptionsFilter } from '@/common/filters'
import { ResponseInterceptor } from '@/common/interceptors'

import { AuthModule } from '@/modules/auth/auth.module'
import { ProfileModule } from '@/modules/profile/profile.module'
import { TokenModule } from '@/modules/token/token.module'
import { UserModule } from '@/modules/user/user.module'
import { PrismaModule } from '@/prisma/prisma.module'

import { AppController } from './app.controller'

@Module({
  imports: [
    PrismaModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env'
    }),
    ThrottlerModule.forRoot([
      {
        ttl: seconds(60),
        limit: 100
      }
    ]),
    AuthModule,
    TokenModule,
    UserModule,
    ProfileModule
  ],
  controllers: [AppController],
  providers: [
    ResponseInterceptor,
    AllExceptionsFilter,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard
    }
  ]
})
export class AppModule {}
