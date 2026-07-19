import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Test, TestingModule } from '@nestjs/testing';
import {
  ArchivedOrderProductError,
  InsufficientOrderStockError,
  OrderProductNotFoundError,
  OrdersRepository,
  StoreClosedOrderError,
} from './orders.repository';
import { OrdersService } from './orders.service';

const input = {
  customerName: 'Akshat',
  items: [{ productId: '69d2b1d0-5ef6-4cf3-9d31-03e3af2d6c80', quantity: 2 }],
};

describe('OrdersService', () => {
  let service: OrdersService;
  let create: jest.MockedFunction<OrdersRepository['create']>;

  beforeEach(async () => {
    create = jest.fn();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: OrdersRepository, useValue: { create } },
      ],
    }).compile();

    service = module.get(OrdersService);
  });

  it('returns only server-generated order values after a successful order', async () => {
    create.mockResolvedValue({
      id: 'f352bdf4-a211-43df-a0a5-8fe11fe0f6f8',
      status: 'Placed',
      total_amount: new Prisma.Decimal('40.00'),
      created_at: new Date('2026-07-19T18:30:00.000Z'),
    });

    await expect(service.create(input)).resolves.toEqual({
      success: true,
      data: {
        orderId: 'f352bdf4-a211-43df-a0a5-8fe11fe0f6f8',
        status: 'Placed',
        total: 40,
        createdAt: '2026-07-19T18:30:00.000Z',
      },
    });
  });

  it.each([
    [
      new StoreClosedOrderError(),
      ForbiddenException,
      'The store is currently closed.',
    ],
    [
      new OrderProductNotFoundError(input.items[0].productId),
      NotFoundException,
      'Product not found.',
    ],
    [
      new ArchivedOrderProductError(input.items[0].productId),
      ConflictException,
      'Archived products cannot be ordered.',
    ],
    [
      new InsufficientOrderStockError(input.items[0].productId),
      ConflictException,
      'Insufficient stock for one or more requested products.',
    ],
  ])(
    'maps order failures to standardized HTTP errors',
    async (error, Exception, message) => {
      create.mockRejectedValue(error);

      await expect(service.create(input)).rejects.toMatchObject(
        new Exception({ success: false, message }),
      );
    },
  );
});
