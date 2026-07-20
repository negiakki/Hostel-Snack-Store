import { Injectable } from '@nestjs/common';
import { OrderStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { businessDayBounds } from './business-day';
import type { DailyMetrics } from './daily-analytics.service';

const dailyAnalyticsSelect = {
  business_date: true,
  total_orders: true,
  revenue: true,
  cost: true,
  profit: true,
  average_order_value: true,
  best_selling_product: true,
  total_items_sold: true,
  created_at: true,
} satisfies Prisma.DailyAnalyticsSelect;

const dailyOrderSelect = {
  id: true,
  status: true,
  total_amount: true,
  total_cost: true,
  total_profit: true,
  order_items: {
    select: { product_name: true, quantity: true },
  },
} satisfies Prisma.OrderSelect;

export type DailyAnalyticsRecord = Prisma.DailyAnalyticsGetPayload<{
  select: typeof dailyAnalyticsSelect;
}>;

export type DailyOrderRecord = Prisma.OrderGetPayload<{
  select: typeof dailyOrderSelect;
}>;

type DatabaseClient = PrismaService | Prisma.TransactionClient;

@Injectable()
export class DailyAnalyticsRepository {
  findByBusinessDate(
    client: DatabaseClient,
    businessDate: Date,
  ): Promise<DailyAnalyticsRecord | null> {
    return client.dailyAnalytics.findUnique({
      where: { business_date: businessDate },
      select: dailyAnalyticsSelect,
    });
  }

  findOrdersForBusinessDate(
    client: DatabaseClient,
    businessDate: Date,
  ): Promise<DailyOrderRecord[]> {
    const { start, end } = businessDayBounds(businessDate);

    return client.order.findMany({
      where: { created_at: { gte: start, lt: end } },
      select: dailyOrderSelect,
    });
  }

  create(
    client: DatabaseClient,
    businessDate: Date,
    metrics: DailyMetrics,
  ): Promise<DailyAnalyticsRecord> {
    return client.dailyAnalytics.create({
      data: {
        business_date: businessDate,
        total_orders: metrics.totalOrders,
        revenue: metrics.revenue,
        cost: metrics.cost,
        profit: metrics.profit,
        average_order_value: metrics.averageOrderValue,
        best_selling_product: metrics.bestSellingProduct,
        total_items_sold: metrics.totalItemsSold,
      },
      select: dailyAnalyticsSelect,
    });
  }

  async deleteOrders(
    client: DatabaseClient,
    orderIds: string[],
  ): Promise<number> {
    if (orderIds.length === 0) {
      return 0;
    }

    await client.orderItem.deleteMany({
      where: { order_id: { in: orderIds } },
    });
    const result = await client.order.deleteMany({
      where: { id: { in: orderIds } },
    });
    return result.count;
  }

  isCompleted(order: DailyOrderRecord): boolean {
    return order.status === OrderStatus.Completed;
  }
}
