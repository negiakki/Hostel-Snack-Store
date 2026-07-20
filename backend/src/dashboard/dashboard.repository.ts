import { Injectable } from '@nestjs/common';
import { OrderStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { businessDayBounds } from '../analytics/business-day';

const todayOrderSelect = {
  id: true,
  status: true,
  total_amount: true,
  total_cost: true,
  total_profit: true,
  order_items: {
    select: { product_name: true, quantity: true },
  },
} satisfies Prisma.OrderSelect;

const recentActiveOrderSelect = {
  id: true,
  customer_name: true,
  status: true,
  created_at: true,
} satisfies Prisma.OrderSelect;

const inventoryProductSelect = {
  id: true,
  name: true,
  stock: true,
} satisfies Prisma.ProductSelect;

export type TodayOrderRecord = Prisma.OrderGetPayload<{
  select: typeof todayOrderSelect;
}>;

export type RecentActiveOrderRecord = Prisma.OrderGetPayload<{
  select: typeof recentActiveOrderSelect;
}>;

export type DashboardInventoryProductRecord = Prisma.ProductGetPayload<{
  select: typeof inventoryProductSelect;
}>;

@Injectable()
export class DashboardRepository {
  constructor(private readonly prisma: PrismaService) {}

  findTodayOrders(businessDate: Date): Promise<TodayOrderRecord[]> {
    const { start, end } = businessDayBounds(businessDate);

    return this.prisma.order.findMany({
      where: { created_at: { gte: start, lt: end } },
      select: todayOrderSelect,
    });
  }

  findRecentActiveOrders(): Promise<RecentActiveOrderRecord[]> {
    return this.prisma.order.findMany({
      where: { status: { in: [OrderStatus.Placed, OrderStatus.Ready] } },
      orderBy: { created_at: 'desc' },
      take: 5,
      select: recentActiveOrderSelect,
    });
  }

  findActiveInventoryProducts(): Promise<DashboardInventoryProductRecord[]> {
    return this.prisma.product.findMany({
      where: { is_archived: false },
      orderBy: { name: 'asc' },
      select: inventoryProductSelect,
    });
  }
}
