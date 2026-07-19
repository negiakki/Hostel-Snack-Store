import { PrismaService } from '../database/prisma.service';
import { ProductsRepository } from './products.repository';

describe('ProductsRepository', () => {
  let repository: ProductsRepository;
  let findMany: jest.Mock;
  let findFirst: jest.Mock;

  beforeEach(() => {
    findMany = jest.fn().mockResolvedValue([]);
    findFirst = jest.fn().mockResolvedValue(null);
    const prisma = {
      product: {
        findMany,
        findFirst,
      },
    } as unknown as PrismaService;

    repository = new ProductsRepository(prisma);
  });

  it('builds a case-insensitive active-product search and category filter', async () => {
    await repository.findAll({
      search: 'lays',
      category: 'Chips',
      archived: false,
    });

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          is_archived: false,
          name: {
            contains: 'lays',
            mode: 'insensitive',
          },
          category: {
            equals: 'Chips',
            mode: 'insensitive',
          },
        },
        orderBy: {
          name: 'asc',
        },
      }),
    );
  });

  it('filters explicitly for archived products', async () => {
    await repository.findAll({ archived: true });

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          is_archived: true,
        },
      }),
    );
  });

  it('only retrieves active products by id for the public read endpoint', async () => {
    await repository.findActiveById('69d2b1d0-5ef6-4cf3-9d31-03e3af2d6c80');

    expect(findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          id: '69d2b1d0-5ef6-4cf3-9d31-03e3af2d6c80',
          is_archived: false,
        },
      }),
    );
  });
});
