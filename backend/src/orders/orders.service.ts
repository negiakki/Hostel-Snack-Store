import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { CreateOrderResponseDto } from './dto/order-response.dto';
import {
  ArchivedOrderProductError,
  InsufficientOrderStockError,
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
}
