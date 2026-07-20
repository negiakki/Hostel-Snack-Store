import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import {
  DailyAnalyticsRecord,
  DailyAnalyticsRepository,
  DailyOrderRecord,
} from './daily-analytics.repository';
import { businessDateToString } from './business-day';

export interface DailyMetrics {
  totalOrders: number;
  revenue: Prisma.Decimal;
  cost: Prisma.Decimal;
  profit: Prisma.Decimal;
  averageOrderValue: Prisma.Decimal;
  bestSellingProduct: string | null;
  totalItemsSold: number;
}

export interface DailyAnalyticsResponseDto {
  success: true;
  data: {
    date: string;
    totalOrders: number;
    revenue: number;
    cost: number;
    profit: number;
    averageOrderValue: number;
    bestSellingProduct: string | null;
    totalItemsSold: number;
    createdAt: string;
  };
}

@Injectable()
export class DailyAnalyticsService {
  constructor(
    private readonly repository: DailyAnalyticsRepository,
    private readonly prisma: PrismaService,
  ) {}

  async getByBusinessDate(
    businessDate: Date,
  ): Promise<DailyAnalyticsResponseDto> {
    const analytics = await this.repository.findByBusinessDate(
      this.prisma,
      businessDate,
    );

    if (!analytics) {
      throw new NotFoundException({
        success: false,
        message: 'Daily analytics not found.',
      });
    }

    return { success: true, data: this.toResponse(analytics) };
  }

  calculateMetrics(orders: DailyOrderRecord[]): DailyMetrics {
    const totalOrders = orders.length;
    const revenue = orders.reduce(
      (total, order) => total.add(order.total_amount),
      new Prisma.Decimal(0),
    );
    const cost = orders.reduce(
      (total, order) => total.add(order.total_cost),
      new Prisma.Decimal(0),
    );
    const profit = orders.reduce(
      (total, order) => total.add(order.total_profit),
      new Prisma.Decimal(0),
    );
    const quantitiesByProduct = new Map<string, number>();
    let totalItemsSold = 0;

    for (const order of orders) {
      for (const item of order.order_items) {
        totalItemsSold += item.quantity;
        quantitiesByProduct.set(
          item.product_name,
          (quantitiesByProduct.get(item.product_name) ?? 0) + item.quantity,
        );
      }
    }

    const bestSellingProduct =
      [...quantitiesByProduct.entries()].sort(
        ([leftName, leftQuantity], [rightName, rightQuantity]) => {
          if (rightQuantity !== leftQuantity) {
            return rightQuantity - leftQuantity;
          }

          return leftName.localeCompare(rightName);
        },
      )[0]?.[0] ?? null;

    return {
      totalOrders,
      revenue,
      cost,
      profit,
      averageOrderValue:
        totalOrders === 0 ? new Prisma.Decimal(0) : revenue.div(totalOrders),
      bestSellingProduct,
      totalItemsSold,
    };
  }

  toResponse(
    analytics: DailyAnalyticsRecord,
  ): DailyAnalyticsResponseDto['data'] {
    return {
      date: businessDateToString(analytics.business_date),
      totalOrders: analytics.total_orders,
      revenue: Number(analytics.revenue),
      cost: Number(analytics.cost),
      profit: Number(analytics.profit),
      averageOrderValue: Number(analytics.average_order_value),
      bestSellingProduct: analytics.best_selling_product,
      totalItemsSold: analytics.total_items_sold,
      createdAt: analytics.created_at.toISOString(),
    };
  }
}
