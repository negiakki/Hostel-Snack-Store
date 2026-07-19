import { PrismaService } from '../database/prisma.service';
import { InventoryRepository } from './inventory.repository';

const productId = '69d2b1d0-5ef6-4cf3-9d31-03e3af2d6c80';

describe('InventoryRepository', () => {
  let repository: InventoryRepository;
  let updateMany: jest.Mock;
  let findMany: jest.Mock;
  let findUnique: jest.Mock;
  let upsert: jest.Mock;

  beforeEach(() => {
    updateMany = jest.fn().mockResolvedValue({ count: 1 });
    findMany = jest.fn().mockResolvedValue([]);
    findUnique = jest.fn().mockResolvedValue({ id: productId, stock: 4 });
    upsert = jest.fn().mockResolvedValue({ low_stock_threshold: 2 });
    const transaction = {
      product: { updateMany, findMany, findUnique },
      storeSettings: { upsert },
    };
    const prisma = {
      $transaction: jest.fn().mockImplementation((callback: unknown) => {
        return (callback as (client: typeof transaction) => unknown)(
          transaction,
        );
      }),
    } as unknown as PrismaService;

    repository = new InventoryRepository(prisma);
  });

  it('uses an atomic stock guard when removing inventory', async () => {
    await repository.removeStock(productId, 3);

    expect(updateMany).toHaveBeenCalledWith({
      where: {
        id: productId,
        stock: { gte: 3 },
      },
      data: {
        stock: { decrement: 3 },
      },
    });
  });

  it('lists active products in name order', async () => {
    await repository.findAll();

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { is_archived: false },
        orderBy: { name: 'asc' },
      }),
    );
  });

  it('increments inventory without reading and rewriting stock in application code', async () => {
    await repository.addStock(productId, 3);

    expect(updateMany).toHaveBeenCalledWith({
      where: { id: productId },
      data: {
        stock: { increment: 3 },
      },
    });
  });

  it('sets inventory to an exact validated value', async () => {
    await repository.setStock(productId, 6);

    expect(updateMany).toHaveBeenCalledWith({
      where: { id: productId },
      data: { stock: 6 },
    });
  });
});
