export interface DashboardResponseDto {
  success: true;
  data: {
    summary: {
      ordersToday: number;
      revenueToday: number;
      profitToday: number;
      storeStatus: 'Open' | 'Closed';
    };
    activeOrders: {
      placed: number;
      ready: number;
    };
    inventoryAlerts: {
      lowStock: Array<{
        productId: string;
        name: string;
        stock: number;
      }>;
      outOfStock: Array<{
        productId: string;
        name: string;
        stock: number;
      }>;
    };
    recentActiveOrders: Array<{
      orderId: string;
      customerName: string;
      status: 'Placed' | 'Ready';
      createdAt: string;
    }>;
  };
}
