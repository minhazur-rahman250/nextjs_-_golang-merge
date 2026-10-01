import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { NotificationService } from './notification.service.js';

@Module({
  imports: [
    HttpModule.register({
      timeout: 5000, // ৫ সেকেন্ডের বেশি অপেক্ষা করবে না
    }),
    ConfigModule,
  ],
  providers: [NotificationService],
  exports: [NotificationService],
})
export class NotificationModule {}