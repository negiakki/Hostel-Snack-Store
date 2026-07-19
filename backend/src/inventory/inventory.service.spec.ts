import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Prisma } from '@prisma/client';
import {
  InventoryListResult,
  InventoryRepository,
  InventoryUpdateResult,
} from './inventory.repository';
import { InventoryService } from './inventory.service';

const productId = '69d2b1d0-5ef6-4cf3-9d31-03e3af2d6c80';

const updateResult = (
  overrides: Partial<InventoryUpdateResult> = {},
): InventoryUpdateResult => ({
  product: { id: productId, stock: 2 },
  lowStockThreshold: 2,
  updated: true,
  ...overrides,
});

describe('InventoryService', () => {
  let service: InventoryService;
  let repository: jest.Mocked<InventoryRepository>;
  let addStock: jest.MockedFunction<InventoryRepository['addStock']>;
  let findAll: jest.MockedFunction<InventoryRepository['findAll']>;
  let removeStock: jest.MockedFunction<InventoryRepository['removeStock']>;
  let setStock: jest.MockedFunction<InventoryRepository['setStock']>;

  beforeEach(async () => {
    addStock = jest.fn();
    findAll = jest.fn();
    removeStock = jest.fn();
    setStock = jest.fn();
    repository = {
      addStock,
      findAll,
      removeStock,
      setStock,
    } as jest.Mocked<InventoryRepository>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InventoryService,
        {
          provide: InventoryRepository,
          useValue: repository,
        },
      ],
    }).compile();

    service = module.get(InventoryService);
  });

  it('adds stock and returns low-stock status using the global threshold', async () => {
    addStock.mockResolvedValue(updateResult());

    await expect(service.addStock(productId, { quantity: 3 })).resolves.toEqual(
      {
        success: true,
        data: {
          productId,
          stock: 2,
          lowStockThreshold: 2,
          isLowStock: true,
          isOutOfStock: false,
        },
      },
    );
    expect(addStock).toHaveBeenCalledWith(productId, 3);
  });

  it('returns inventory products with backend-derived stock statuses', async () => {
    const result: InventoryListResult = {
      lowStockThreshold: 2,
      products: [
        {
          id: productId,
          name: 'Lays Classic',
          category: 'Chips',
          selling_price: new Prisma.Decimal('20.00'),
          stock: 2,
        },
      ],
    };
    findAll.mockResolvedValue(result);

    await expect(service.findAll()).resolves.toMatchObject({
      success: true,
      data: [
        {
          id: productId,
          isLowStock: true,
          isOutOfStock: false,
        },
      ],
    });
  });

  it('marks zero stock as both low and out of stock after a removal', async () => {
    removeStock.mockResolvedValue(
      updateResult({ product: { id: productId, stock: 0 } }),
    );

    await expect(
      service.removeStock(productId, { quantity: 2 }),
    ).resolves.toMatchObject({
      data: {
        isLowStock: true,
        isOutOfStock: true,
      },
    });
  });

  it('rejects removals that would make stock negative', async () => {
    removeStock.mockResolvedValue(updateResult({ updated: false }));

    await expect(
      service.removeStock(productId, { quantity: 3 }),
    ).rejects.toMatchObject(
      new ConflictException({
        success: false,
        message: 'Insufficient stock for this adjustment.',
      }),
    );
  });

  it('returns 404 when an inventory operation targets a missing product', async () => {
    setStock.mockResolvedValue(updateResult({ product: null, updated: false }));

    await expect(
      service.setStock(productId, { stock: 4 }),
    ).rejects.toMatchObject(
      new NotFoundException({
        success: false,
        message: 'Product not found.',
      }),
    );
  });
});
