import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OrderStatus } from '@prisma/client';
import { CreateOrderDto } from './dto/create-order.dto';
import {
  CreateOrderResponseDto,
  OrderDetailResponseDto,
  OrderListResponseDto,
} from './dto/order-response.dto';
import {
  ArchivedOrderProductError,
  InsufficientOrderStockError,
  InvalidOrderStatusTransitionError,
  OrderDetailRecord,
  OrderListRecord,
  OrderNotFoundError,
  OrderProductNotFoundError,
  OrdersRepository,
  StoreClosedOrderError,
} from './orders.repository';

@Injectable()
export class OrdersService {
  constructor(private readonly ordersRepository: OrdersRepository) {}

  async create(data: CreateOrderDto): Promise<CreateOrderResponseDto> {
    try {
      const order = await this.ordersRepository.create(data);

      return {
        success: true,
        data: {
          orderId: order.id,
          status: order.status,
          total: Number(order.total_amount),
          createdAt: order.created_at.toISOString(),
        },
      };
    } catch (error: unknown) {
      if (error instanceof StoreClosedOrderError) {
        throw new ForbiddenException({
          success: false,
          message: 'The store is currently closed.',
        });
      }

      if (error instanceof OrderProductNotFoundError) {
        throw new NotFoundException({
          success: false,
          message: 'Product not found.',
        });
      }

      if (error instanceof ArchivedOrderProductError) {
        throw new ConflictException({
          success: false,
          message: 'Archived products cannot be ordered.',
        });
      }

      if (error instanceof InsufficientOrderStockError) {
        throw new ConflictException({
          success: false,
          message: 'Insufficient stock for one or more requested products.',
        });
      }

      throw error;
    }
  }

  async list(): Promise<OrderListResponseDto> {
    const orders = await this.ordersRepository.list();

    return {
      success: true,
      data: orders.map((order) => this.toOrderListItem(order)),
    };
  }

  async getById(orderId: string): Promise<OrderDetailResponseDto> {
    try {
      return {
        success: true,
        data: this.toOrderDetail(await this.ordersRepository.getById(orderId)),
      };
    } catch (error: unknown) {
      if (error instanceof OrderNotFoundError) {
        throw new NotFoundException({ success: false, message: error.message });
      }

      throw error;
    }
  }

  async updateStatus(
    orderId: string,
    status: OrderStatus,
  ): Promise<OrderDetailResponseDto> {
    try {
      return {
        success: true,
        data: this.toOrderDetail(
          await this.ordersRepository.updateStatus(orderId, status),
        ),
      };
    } catch (error: unknown) {
      if (error instanceof OrderNotFoundError) {
        throw new NotFoundException({ success: false, message: error.message });
      }

      if (error instanceof InvalidOrderStatusTransitionError) {
        throw new ConflictException({ success: false, message: error.message });
      }

      throw error;
    }
  }

  private toOrderListItem(order: OrderListRecord) {
    return {
      orderId: order.id,
      customerName: order.customer_name,
      itemCount: order._count.order_items,
      total: Number(order.total_amount),
      status: order.status,
      createdAt: order.created_at.toISOString(),
    };
  }

  private toOrderDetail(order: OrderDetailRecord) {
    return {
      orderId: order.id,
      customerName: order.customer_name,
      status: order.status,
      total: Number(order.total_amount),
      createdAt: order.created_at.toISOString(),
      items: order.order_items.map((item) => ({
        productName: item.product_name,
        quantity: item.quantity,
        unitPrice: Number(item.selling_price),
        lineTotal: Number(item.subtotal),
      })),
    };
  }
}
