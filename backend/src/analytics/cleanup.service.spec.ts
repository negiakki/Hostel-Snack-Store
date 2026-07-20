import { OrderStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { CleanupService } from './cleanup.service';
import { DailyAnalyticsRepository } from './daily-analytics.repository';
import { DailyAnalyticsService } from './daily-analytics.service';

const businessDate = new Date('2026-07-19T00:00:00.000Z');
const analyticsRecord = {
  business_date: businessDate,
  total_orders: 1,
  revenue: new Prisma.Decimal('40.00'),
  cost: new Prisma.Decimal('24.00'),
  profit: new Prisma.Decimal('16.00'),
  average_order_value: new Prisma.Decimal('40.00'),
  best_selling_product: 'Lays Classic',
  total_items_sold: 2,
  created_at: new Date('2026-07-20T00:00:00.000Z'),
};
const completedOrder = {
  id: 'f352bdf4-a211-43df-a0a5-8fe11fe0f6f8',
  status: OrderStatus.Completed,
  total_amount: new Prisma.Decimal('40.00'),
  total_cost: new Prisma.Decimal('24.00'),
  total_profit: new Prisma.Decimal('16.00'),
  order_items: [{ product_name: 'Lays Classic', quantity: 2 }],
};

describe('CleanupService', () => {
  let service: CleanupService;
  let findByBusinessDate: jest.Mock;
  let findOrdersForBusinessDate: jest.Mock;
  let create: jest.Mock;
  let deleteOrders: jest.Mock;
  let calculateMetrics: jest.Mock;

  beforeEach(() => {
    findByBusinessDate = jest.fn().mockResolvedValue(null);
    findOrdersForBusinessDate = jest.fn().mockResolvedValue([completedOrder]);
    create = jest.fn().mockResolvedValue(analyticsRecord);
    deleteOrders = jest.fn().mockResolvedValue(1);
    calculateMetrics = jest.fn().mockReturnValue({
      totalOrders: 1,
      revenue: new Prisma.Decimal('40.00'),
      cost: new Prisma.Decimal('24.00'),
      profit: new Prisma.Decimal('16.00'),
      averageOrderValue: new Prisma.Decimal('40.00'),
      bestSellingProduct: 'Lays Classic',
      totalItemsSold: 2,
    });
    const transaction = {} as Prisma.TransactionClient;
    const prisma = {
      $transaction: jest.fn(
        (callback: (client: Prisma.TransactionClient) => unknown) =>
          callback(transaction),
      ),
    } as unknown as PrismaService;
    const repository = {
      findByBusinessDate,
      findOrdersForBusinessDate,
      create,
      deleteOrders,
      isCompleted: (order: { status: OrderStatus }) =>
        order.status === OrderStatus.Completed,
    } as unknown as DailyAnalyticsRepository;
    const dailyAnalyticsService = {
      calculateMetrics,
    } as unknown as DailyAnalyticsService;

    service = new CleanupService(prisma, repository, dailyAnalyticsService);
  });

  it('creates analytics and deletes detail only within one transaction', async () => {
    await expect(service.finalizeBusinessDay(businessDate)).resolves.toEqual({
      analytics: analyticsRecord,
      deletedOrderCount: 1,
      alreadyFinalized: false,
    });

    expect(calculateMetrics).toHaveBeenCalledWith([completedOrder]);
    expect(create.mock.invocationCallOrder[0]).toBeLessThan(
      deleteOrders.mock.invocationCallOrder[0] ?? Number.POSITIVE_INFINITY,
    );
    expect(deleteOrders).toHaveBeenCalledWith(expect.anything(), [
      completedOrder.id,
    ]);
  });

  it('keeps all order detail when analytics generation fails', async () => {
    create.mockRejectedValueOnce(new Error('Database write failed.'));

    await expect(service.finalizeBusinessDay(businessDate)).rejects.toThrow(
      'Database write failed.',
    );
    expect(deleteOrders).not.toHaveBeenCalled();
  });

  it('is idempotent after the business day has already been finalized', async () => {
    findByBusinessDate.mockResolvedValueOnce(analyticsRecord);

    await expect(service.finalizeBusinessDay(businessDate)).resolves.toEqual({
      analytics: analyticsRecord,
      deletedOrderCount: 0,
      alreadyFinalized: true,
    });
    expect(findOrdersForBusinessDate).not.toHaveBeenCalled();
    expect(create).not.toHaveBeenCalled();
    expect(deleteOrders).not.toHaveBeenCalled();
  });

  it('refuses cleanup while any order has not completed', async () => {
    findOrdersForBusinessDate.mockResolvedValueOnce([
      { ...completedOrder, status: OrderStatus.Ready },
    ]);

    await expect(
      service.finalizeBusinessDay(businessDate),
    ).rejects.toMatchObject({
      status: 409,
      response: {
        success: false,
        message:
          'All orders for the business day must be completed before cleanup.',
      },
    });
    expect(create).not.toHaveBeenCalled();
    expect(deleteOrders).not.toHaveBeenCalled();
  });
});
