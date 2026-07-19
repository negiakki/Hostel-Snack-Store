import { OrderStatus } from '@prisma/client';

export interface OrderResponseDto {
  orderId: string;
  status: OrderStatus;
  total: number;
  createdAt: string;
}

export interface CreateOrderResponseDto {
  success: true;
  data: OrderResponseDto;
}
