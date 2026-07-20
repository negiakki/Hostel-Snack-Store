import { Injectable } from '@nestjs/common';
import { OrderStatus } from '@prisma/client';
import { currentBusinessDate } from '../analytics/business-day';
import { DailyAnalyticsService } from '../analytics/daily-analytics.service';
import { InventoryService } from '../inventory/inventory.service';
import { StoreStatusService } from '../store-status/store-status.service';
import { DashboardResponseDto } from './dto/dashboard-response.dto';
import { DashboardRepository } from './dashboard.repository';

@Injectable()
export class DashboardService {
  constructor(
    private readonly dashboardRepository: DashboardRepository,
    private readonly dailyAnalyticsService: DailyAnalyticsService,
    private readonly inventoryService: InventoryService,
    private readonly storeStatusService: StoreStatusService,
  ) {}

  async getDashboard(now = new Date()): Promise<DashboardResponseDto> {
    const [todayOrders, recentActiveOrders, inventoryProducts, storeStatus] =
      await Promise.all([
        this.dashboardRepository.findTodayOrders(currentBusinessDate(now)),
        this.dashboardRepository.findRecentActiveOrders(),
        this.dashboardRepository.findActiveInventoryProducts(),
        this.storeStatusService.getStatus(),
      ]);
    const completedOrders = todayOrders.filter(
      (order) => order.status === OrderStatus.Completed,
    );
    const completedMetrics =
      this.dailyAnalyticsService.calculateMetrics(completedOrders);
    const inventoryStatuses =
      await this.inventoryService.getProductStatuses(inventoryProducts);

    return {
      success: true,
      data: {
        summary: {
          ordersToday: todayOrders.length,
          revenueToday: Number(completedMetrics.revenue),
          profitToday: Number(completedMetrics.profit),
          storeStatus: storeStatus.isOpen ? 'Open' : 'Closed',
        },
        activeOrders: {
          placed: todayOrders.filter(
            (order) => order.status === OrderStatus.Placed,
          ).length,
          ready: todayOrders.filter(
            (order) => order.status === OrderStatus.Ready,
          ).length,
        },
        inventoryAlerts: {
          lowStock: inventoryProducts
            .filter((product) => {
              const status = inventoryStatuses.get(product.id);
              return status?.isLowStock && !status.isOutOfStock;
            })
            .map((product) => ({
              productId: product.id,
              name: product.name,
              stock: product.stock,
            })),
          outOfStock: inventoryProducts
            .filter(
              (product) => inventoryStatuses.get(product.id)?.isOutOfStock,
            )
            .map((product) => ({
              productId: product.id,
              name: product.name,
              stock: product.stock,
            })),
        },
        recentActiveOrders: recentActiveOrders.flatMap((order) => {
          if (order.status === OrderStatus.Completed) {
            return [];
          }

          return [
            {
              orderId: order.id,
              customerName: order.customer_name,
              status: order.status,
              createdAt: order.created_at.toISOString(),
            },
          ];
        }),
      },
    };
  }
}
