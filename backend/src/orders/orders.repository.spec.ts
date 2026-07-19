import { Prisma } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { StoreStatusService } from '../store-status/store-status.service';
import {
  ArchivedOrderProductError,
  CreatedOrderRecord,
  InsufficientOrderStockError,
  OrdersRepository,
  StoreClosedOrderError,
} from './orders.repository';

const productId = '69d2b1d0-5ef6-4cf3-9d31-03e3af2d6c80';
const secondProductId = 'b6d39b4b-433d-4674-a2f9-773cbe663b6d';
const input = {
  customerName: 'Akshat',
  items: [{ productId, quantity: 1 }],
};

const product = (id = productId, stock = 2) => ({
  id,
  name: 'Lays Classic',
  selling_price: new Prisma.Decimal('20.00'),
  cost_price: new Prisma.Decimal('15.00'),
  stock,
  is_archived: false,
});

describe('OrdersRepository', () => {
  let repository: OrdersRepository;
  let findMany: jest.Mock;
  let updateMany: jest.Mock<
    Promise<Prisma.BatchPayload>,
    [Prisma.ProductUpdateManyArgs]
  >;
  let create: jest.Mock<Promise<CreatedOrderRecord>, [Prisma.OrderCreateArgs]>;
  let isOpen: jest.Mock;

  beforeEach(() => {
    findMany = jest.fn().mockResolvedValue([product()]);
    updateMany = jest
      .fn<Promise<Prisma.BatchPayload>, [Prisma.ProductUpdateManyArgs]>()
      .mockResolvedValue({ count: 1 });
    create = jest
      .fn<Promise<CreatedOrderRecord>, [Prisma.OrderCreateArgs]>()
      .mockResolvedValue({
        id: 'f352bdf4-a211-43df-a0a5-8fe11fe0f6f8',
        status: 'Placed',
        total_amount: new Prisma.Decimal('20.00'),
        created_at: new Date('2026-07-19T18:30:00.000Z'),
      });
    const transaction = {
      product: { findMany, updateMany },
      order: { create },
    };
    const prisma = {
      $transaction: jest.fn().mockImplementation((callback: unknown) => {
        return (callback as (client: typeof transaction) => unknown)(
          transaction,
        );
      }),
    } as unknown as PrismaService;
    isOpen = jest.fn().mockResolvedValue(true);
    const storeStatusService = { isOpen } as unknown as StoreStatusService;

    repository = new OrdersRepository(prisma, storeStatusService);
  });

  it('creates immutable item snapshots and calculates totals from database prices', async () => {
    await repository.create(input);

    expect(create.mock.calls[0]?.[0].data).toMatchObject({
      customer_name: 'Akshat',
      total_amount: new Prisma.Decimal('20.00'),
      total_cost: new Prisma.Decimal('15.00'),
      total_profit: new Prisma.Decimal('5.00'),
      order_items: {
        create: [
          {
            product_name: 'Lays Classic',
            selling_price: new Prisma.Decimal('20.00'),
            cost_price: new Prisma.Decimal('15.00'),
            quantity: 1,
            subtotal: new Prisma.Decimal('20.00'),
          },
        ],
      },
    });
  });

  it('uses a conditional decrement to protect the final unit from concurrent purchases', async () => {
    let availableStock = 1;
    findMany.mockResolvedValue([product(productId, 1)]);
    updateMany.mockImplementation((args) => {
      const requiredStock = (args.where.stock as Prisma.IntFilter).gte;

      if (typeof requiredStock !== 'number') {
        throw new Error('Expected an atomic stock guard.');
      }

      if (availableStock >= requiredStock) {
        availableStock -= requiredStock;
        return Promise.resolve({ count: 1 });
      }

      return Promise.resolve({ count: 0 });
    });

    const attempts = await Promise.allSettled([
      repository.create(input),
      repository.create(input),
    ]);

    expect(
      attempts.filter((attempt) => attempt.status === 'fulfilled'),
    ).toHaveLength(1);
    expect(
      attempts.filter((attempt) => attempt.status === 'rejected'),
    ).toHaveLength(1);
    expect(availableStock).toBe(0);
    expect(updateMany).toHaveBeenCalledWith({
      where: {
        id: productId,
        is_archived: false,
        stock: { gte: 1 },
      },
      data: { stock: { decrement: 1 } },
    });
  });

  it('rejects a closed store before inventory or order data is written', async () => {
    isOpen.mockResolvedValue(false);

    await expect(repository.create(input)).rejects.toBeInstanceOf(
      StoreClosedOrderError,
    );

    expect(updateMany).not.toHaveBeenCalled();
    expect(create).not.toHaveBeenCalled();
  });

  it('rejects archived products before checking store status or writing inventory', async () => {
    findMany.mockResolvedValue([{ ...product(), is_archived: true }]);

    await expect(repository.create(input)).rejects.toBeInstanceOf(
      ArchivedOrderProductError,
    );

    expect(isOpen).not.toHaveBeenCalled();
    expect(updateMany).not.toHaveBeenCalled();
    expect(create).not.toHaveBeenCalled();
  });

  it('rejects and rolls back when a later item cannot be atomically deducted', async () => {
    findMany.mockResolvedValue([product(productId), product(secondProductId)]);
    updateMany
      .mockResolvedValueOnce({ count: 1 })
      .mockResolvedValueOnce({ count: 0 });

    await expect(
      repository.create({
        customerName: 'Akshat',
        items: [
          { productId, quantity: 1 },
          { productId: secondProductId, quantity: 1 },
        ],
      }),
    ).rejects.toBeInstanceOf(InsufficientOrderStockError);

    expect(create).not.toHaveBeenCalled();
  });
});
