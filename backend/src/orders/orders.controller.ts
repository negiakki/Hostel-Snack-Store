import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { CreateOrderPipe } from './dto/create-order.dto';
import type { CreateOrderDto } from './dto/create-order.dto';
import type {
  CreateOrderResponseDto,
  OrderDetailResponseDto,
  OrderListResponseDto,
} from './dto/order-response.dto';
import {
  OrderIdPipe,
  UpdateOrderStatusPipe,
  type UpdateOrderStatusDto,
} from './dto/update-order-status.dto';
import { OrdersService } from './orders.service';
import { Public } from '../auth/public.decorator';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @Public()
  create(
    @Body(new CreateOrderPipe()) data: CreateOrderDto,
  ): Promise<CreateOrderResponseDto> {
    return this.ordersService.create(data);
  }

  @Get()
  list(): Promise<OrderListResponseDto> {
    return this.ordersService.list();
  }

  @Get(':id')
  getById(
    @Param('id', new OrderIdPipe()) orderId: string,
  ): Promise<OrderDetailResponseDto> {
    return this.ordersService.getById(orderId);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id', new OrderIdPipe()) orderId: string,
    @Body(new UpdateOrderStatusPipe()) data: UpdateOrderStatusDto,
  ): Promise<OrderDetailResponseDto> {
    return this.ordersService.updateStatus(orderId, data.status);
  }
}
