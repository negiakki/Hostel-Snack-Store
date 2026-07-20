import { OrderStatus, Prisma } from '@prisma/client';
import { DailyAnalyticsRepository } from './daily-analytics.repository';
import { DailyAnalyticsService } from './daily-analytics.service';
import { PrismaService } from '../database/prisma.service';

describe('DailyAnalyticsService', () => {
  const repository = {} as DailyAnalyticsRepository;
  const prisma = {} as PrismaService;
  const service = new DailyAnalyticsService(repository, prisma);

  it('calculates aggregate metrics solely from immutable completed-order snapshots', () => {
    const metrics = service.calculateMetrics([
      {
        id: 'order-1',
        status: OrderStatus.Completed,
        total_amount: new Prisma.Decimal('60.00'),
        total_cost: new Prisma.Decimal('38.00'),
        total_profit: new Prisma.Decimal('22.00'),
        order_items: [
          { product_name: 'Lays Classic', quantity: 2 },
          { product_name: 'Coke', quantity: 1 },
        ],
      },
      {
        id: 'order-2',
        status: OrderStatus.Completed,
        total_amount: new Prisma.Decimal('40.00'),
        total_cost: new Prisma.Decimal('24.00'),
        total_profit: new Prisma.Decimal('16.00'),
        order_items: [{ product_name: 'Coke', quantity: 3 }],
      },
    ]);

    expect(metrics).toMatchObject({
      totalOrders: 2,
      revenue: new Prisma.Decimal('100.00'),
      cost: new Prisma.Decimal('62.00'),
      profit: new Prisma.Decimal('38.00'),
      averageOrderValue: new Prisma.Decimal('50.00'),
      bestSellingProduct: 'Coke',
      totalItemsSold: 6,
    });
  });

  it('records zero-value days without inventing a best-selling product', () => {
    expect(service.calculateMetrics([])).toMatchObject({
      totalOrders: 0,
      revenue: new Prisma.Decimal(0),
      cost: new Prisma.Decimal(0),
      profit: new Prisma.Decimal(0),
      averageOrderValue: new Prisma.Decimal(0),
      bestSellingProduct: null,
      totalItemsSold: 0,
    });
  });
});
