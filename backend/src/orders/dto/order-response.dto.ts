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

export interface OrderListItemDto {
  orderId: string;
  customerName: string;
  itemCount: number;
  total: number;
  status: OrderStatus;
  createdAt: string;
}

export interface OrderListResponseDto {
  success: true;
  data: OrderListItemDto[];
}

export interface OrderItemDetailDto {
  productName: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface OrderDetailDto {
  orderId: string;
  customerName: string;
  status: OrderStatus;
  total: number;
  createdAt: string;
  items: OrderItemDetailDto[];
}

export interface OrderDetailResponseDto {
  success: true;
  data: OrderDetailDto;
}
