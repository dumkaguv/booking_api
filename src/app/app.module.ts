import { Module } from '@nestjs/common'

import { ConfigModule } from '@nestjs/config'
import { APP_GUARD } from '@nestjs/core'
import { seconds, ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler'

import { AllExceptionsFilter } from '@/common/filters'
import { ResponseInterceptor } from '@/common/interceptors'

import { AuthModule } from '@/modules/auth/auth.module'
import { ListingsModule } from '@/modules/listing/listing.module'
import { ProfilesModule } from '@/modules/profile/profile.module'
import { TokensModule } from '@/modules/token/token.module'
import { UploadsModule } from '@/modules/upload/upload.module'
import { UsersModule } from '@/modules/user/user.module'
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
    TokensModule,
    UsersModule,
    ProfilesModule,
    UploadsModule,
    ListingsModule
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
