import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { PrismaModule } from './database/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { StoresModule } from './modules/stores/stores.module';
import { OffersModule } from './modules/offers/offers.module';
import { ReservationsModule } from './modules/reservations/reservations.module';
import { AdminModule } from './modules/admin/admin.module';
import { AiMapNotificationModule } from './modules/ai-map-notification/ai-map-notification.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: 60000, // 1 minut
        limit: 60,   // max 60 cereri/minut per IP
      },
    ]),
    PrismaModule,
    AuthModule,
    StoresModule,
    OffersModule,
    ReservationsModule,
    AdminModule,
    AiMapNotificationModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
