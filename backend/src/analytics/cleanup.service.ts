import { ConflictException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { DailyAnalyticsService } from './daily-analytics.service';
import {
  DailyAnalyticsRecord,
  DailyAnalyticsRepository,
} from './daily-analytics.repository';

export class IncompleteBusinessDayOrdersError extends Error {
  constructor() {
    super('All orders for the business day must be completed before cleanup.');
  }
}

export interface DailyCleanupResult {
  analytics: DailyAnalyticsRecord;
  deletedOrderCount: number;
  alreadyFinalized: boolean;
}

@Injectable()
export class CleanupService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly repository: DailyAnalyticsRepository,
    private readonly dailyAnalyticsService: DailyAnalyticsService,
  ) {}

  async finalizeBusinessDay(businessDate: Date): Promise<DailyCleanupResult> {
    try {
      return await this.prisma.$transaction(
        async (transaction) => {
          const existing = await this.repository.findByBusinessDate(
            transaction,
            businessDate,
          );

          if (existing) {
            return {
              analytics: existing,
              deletedOrderCount: 0,
              alreadyFinalized: true,
            };
          }

          const orders = await this.repository.findOrdersForBusinessDate(
            transaction,
            businessDate,
          );

          if (orders.some((order) => !this.repository.isCompleted(order))) {
            throw new IncompleteBusinessDayOrdersError();
          }

          const analytics = await this.repository.create(
            transaction,
            businessDate,
            this.dailyAnalyticsService.calculateMetrics(orders),
          );
          const deletedOrderCount = await this.repository.deleteOrders(
            transaction,
            orders.map((order) => order.id),
          );

          return { analytics, deletedOrderCount, alreadyFinalized: false };
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
      );
    } catch (error: unknown) {
      if (error instanceof IncompleteBusinessDayOrdersError) {
        throw new ConflictException({ success: false, message: error.message });
      }

      throw error;
    }
  }
}
