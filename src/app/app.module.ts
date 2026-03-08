import { Module } from '@nestjs/common'

import { ConfigModule } from '@nestjs/config'
import { APP_GUARD } from '@nestjs/core'
import { seconds, ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler'

import { AllExceptionsFilter } from '@/common/filters'
import { ResponseInterceptor } from '@/common/interceptors'

import { AmenitiesModule } from '@/modules/amenity/amenity.module'
import { AuthModule } from '@/modules/auth/auth.module'
import { BookingsModule } from '@/modules/booking/booking.module'
import { ListingsModule } from '@/modules/listing/listing.module'
import { ProfilesModule } from '@/modules/profile/profile.module'
import { ReviewsModule } from '@/modules/review/review.module'
import { TokensModule } from '@/modules/token/token.module'
import { UnitCalendarDaysModule } from '@/modules/unit-calendar-day/unit-calendar-day.module'
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
    AmenitiesModule,
    AuthModule,
    BookingsModule,
    TokensModule,
    UsersModule,
    ProfilesModule,
    ReviewsModule,
    UnitCalendarDaysModule,
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
