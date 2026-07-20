import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BusinessDatePipe } from './business-day';
import { CleanupService } from './cleanup.service';
import { Configuration } from '../config/configuration';
import {
  DailyAnalyticsResponseDto,
  DailyAnalyticsService,
} from './daily-analytics.service';

interface DailyCleanupResponseDto extends DailyAnalyticsResponseDto {
  data: DailyAnalyticsResponseDto['data'] & {
    deletedOrderCount: number;
    alreadyFinalized: boolean;
  };
}

@Controller('analytics/daily')
export class AnalyticsController {
  constructor(
    private readonly dailyAnalyticsService: DailyAnalyticsService,
    private readonly cleanupService: CleanupService,
    private readonly configService: ConfigService<Configuration, true>,
  ) {}

  @Get(':date')
  getByBusinessDate(
    @Param('date', BusinessDatePipe) businessDate: Date,
  ): Promise<DailyAnalyticsResponseDto> {
    return this.dailyAnalyticsService.getByBusinessDate(businessDate);
  }

  @Post(':date/finalize')
  async finalize(
    @Param('date', BusinessDatePipe) businessDate: Date,
  ): Promise<DailyCleanupResponseDto> {
    if (
      this.configService.getOrThrow<Configuration['app']>('app').environment ===
      'production'
    ) {
      throw new NotFoundException({ success: false, message: 'Not found.' });
    }

    const result = await this.cleanupService.finalizeBusinessDay(businessDate);

    return {
      success: true,
      data: {
        ...this.dailyAnalyticsService.toResponse(result.analytics),
        deletedOrderCount: result.deletedOrderCount,
        alreadyFinalized: result.alreadyFinalized,
      },
    };
  }
}
