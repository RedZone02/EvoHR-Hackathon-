import { Module } from '@nestjs/common';
import { OffersService } from './offers.service';
import { OffersController } from './offers.controller';
import { AiMapNotificationModule } from '../ai-map-notification/ai-map-notification.module';

@Module({
  imports: [AiMapNotificationModule],
  controllers: [OffersController],
  providers: [OffersService],
  exports: [OffersService],
})
export class OffersModule {}
