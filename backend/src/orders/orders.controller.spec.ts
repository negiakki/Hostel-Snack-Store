import { Test, TestingModule } from '@nestjs/testing';
import { CreateOrderDto } from './dto/create-order.dto';
import { CreateOrderResponseDto } from './dto/order-response.dto';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';

describe('OrdersController', () => {
  it('delegates an order request to the order service', async () => {
    const create = jest.fn();
    const list = jest.fn();
    const getById = jest.fn();
    const updateStatus = jest.fn();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [
        {
          provide: OrdersService,
          useValue: { create, list, getById, updateStatus },
        },
      ],
    }).compile();
    const controller = module.get(OrdersController);
    const data: CreateOrderDto = {
      customerName: 'Akshat',
      items: [
        {
          productId: '69d2b1d0-5ef6-4cf3-9d31-03e3af2d6c80',
          quantity: 2,
        },
      ],
    };
    const response: CreateOrderResponseDto = {
      success: true,
      data: {
        orderId: 'f352bdf4-a211-43df-a0a5-8fe11fe0f6f8',
        status: 'Placed',
        total: 40,
        createdAt: '2026-07-19T18:30:00.000Z',
      },
    };
    create.mockResolvedValue(response);

    await expect(controller.create(data)).resolves.toBe(response);
    expect(create).toHaveBeenCalledWith(data);
  });

  it('delegates status updates to the order service', async () => {
    const updateStatus = jest.fn();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [
        {
          provide: OrdersService,
          useValue: {
            create: jest.fn(),
            list: jest.fn(),
            getById: jest.fn(),
            updateStatus,
          },
        },
      ],
    }).compile();
    const controller = module.get(OrdersController);

    await controller.updateStatus('f352bdf4-a211-43df-a0a5-8fe11fe0f6f8', {
      status: 'Ready',
    });

    expect(updateStatus).toHaveBeenCalledWith(
      'f352bdf4-a211-43df-a0a5-8fe11fe0f6f8',
      'Ready',
    );
  });
});
