import { Module } from '@nestjs/common';
import { AnalyticsController } from './analytics.controller';
import { CleanupService } from './cleanup.service';
import { DailyAnalyticsRepository } from './daily-analytics.repository';
import { DailyAnalyticsService } from './daily-analytics.service';

@Module({
  controllers: [AnalyticsController],
  providers: [CleanupService, DailyAnalyticsRepository, DailyAnalyticsService],
  exports: [CleanupService, DailyAnalyticsService],
})
export class AnalyticsModule {}
