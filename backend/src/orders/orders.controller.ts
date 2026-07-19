import { Body, Controller, Post } from '@nestjs/common';
import { CreateOrderPipe } from './dto/create-order.dto';
import type { CreateOrderDto } from './dto/create-order.dto';
import type { CreateOrderResponseDto } from './dto/order-response.dto';
import { OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  create(
    @Body(new CreateOrderPipe()) data: CreateOrderDto,
  ): Promise<CreateOrderResponseDto> {
    return this.ordersService.create(data);
  }
}
