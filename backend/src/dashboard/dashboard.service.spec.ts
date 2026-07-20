import { OrderStatus, Prisma } from '@prisma/client';
import { DailyAnalyticsService } from '../analytics/daily-analytics.service';
import { InventoryService } from '../inventory/inventory.service';
import { StoreStatusService } from '../store-status/store-status.service';
import { DashboardRepository } from './dashboard.repository';
import { DashboardService } from './dashboard.service';

describe('DashboardService', () => {
  let service: DashboardService;
  let findTodayOrders: jest.Mock;
  let findRecentActiveOrders: jest.Mock;
  let findActiveInventoryProducts: jest.Mock;
  let calculateMetrics: jest.Mock;
  let getProductStatuses: jest.Mock;
  let getStatus: jest.Mock;

  beforeEach(() => {
    findTodayOrders = jest.fn().mockResolvedValue([
      {
        id: 'placed-order',
        status: OrderStatus.Placed,
        total_amount: new Prisma.Decimal('50.00'),
        total_cost: new Prisma.Decimal('30.00'),
        total_profit: new Prisma.Decimal('20.00'),
        order_items: [],
      },
      {
        id: 'ready-order',
        status: OrderStatus.Ready,
        total_amount: new Prisma.Decimal('20.00'),
        total_cost: new Prisma.Decimal('12.00'),
        total_profit: new Prisma.Decimal('8.00'),
        order_items: [],
      },
      {
        id: 'completed-order',
        status: OrderStatus.Completed,
        total_amount: new Prisma.Decimal('40.00'),
        total_cost: new Prisma.Decimal('24.00'),
        total_profit: new Prisma.Decimal('16.00'),
        order_items: [{ product_name: 'Lays Classic', quantity: 2 }],
      },
    ]);
    findRecentActiveOrders = jest.fn().mockResolvedValue([
      {
        id: 'ready-order',
        customer_name: 'Ravi',
        status: OrderStatus.Ready,
        created_at: new Date('2026-07-20T16:00:00.000Z'),
      },
      {
        id: 'placed-order',
        customer_name: 'Neha',
        status: OrderStatus.Placed,
        created_at: new Date('2026-07-20T15:55:00.000Z'),
      },
    ]);
    findActiveInventoryProducts = jest.fn().mockResolvedValue([
      { id: 'low-stock', name: 'Coke', stock: 2 },
      { id: 'out-of-stock', name: 'Lays Classic', stock: 0 },
      { id: 'healthy-stock', name: 'Juice', stock: 8 },
    ]);
    calculateMetrics = jest.fn().mockReturnValue({
      revenue: new Prisma.Decimal('40.00'),
      profit: new Prisma.Decimal('16.00'),
    });
    getProductStatuses = jest.fn().mockResolvedValue(
      new Map([
        ['low-stock', { isLowStock: true, isOutOfStock: false }],
        ['out-of-stock', { isLowStock: true, isOutOfStock: true }],
        ['healthy-stock', { isLowStock: false, isOutOfStock: false }],
      ]),
    );
    getStatus = jest.fn().mockResolvedValue({ isOpen: true, message: '' });

    service = new DashboardService(
      {
        findTodayOrders,
        findRecentActiveOrders,
        findActiveInventoryProducts,
      } as unknown as DashboardRepository,
      { calculateMetrics } as unknown as DailyAnalyticsService,
      { getProductStatuses } as unknown as InventoryService,
      { getStatus } as unknown as StoreStatusService,
    );
  });

  it('returns one operational view using completed snapshots for revenue and profit', async () => {
    await expect(
      service.getDashboard(new Date('2026-07-20T18:00:00.000Z')),
    ).resolves.toEqual({
      success: true,
      data: {
        summary: {
          ordersToday: 3,
          revenueToday: 40,
          profitToday: 16,
          storeStatus: 'Open',
        },
        activeOrders: { placed: 1, ready: 1 },
        inventoryAlerts: {
          lowStock: [{ productId: 'low-stock', name: 'Coke', stock: 2 }],
          outOfStock: [
            { productId: 'out-of-stock', name: 'Lays Classic', stock: 0 },
          ],
        },
        recentActiveOrders: [
          {
            orderId: 'ready-order',
            customerName: 'Ravi',
            status: OrderStatus.Ready,
            createdAt: '2026-07-20T16:00:00.000Z',
          },
          {
            orderId: 'placed-order',
            customerName: 'Neha',
            status: OrderStatus.Placed,
            createdAt: '2026-07-20T15:55:00.000Z',
          },
        ],
      },
    });

    expect(calculateMetrics).toHaveBeenCalledWith([
      expect.objectContaining({ id: 'completed-order' }),
    ]);
    expect(findTodayOrders).toHaveBeenCalledWith(
      new Date('2026-07-20T00:00:00.000Z'),
    );
  });
});
