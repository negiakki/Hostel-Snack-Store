import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';

const STORE_SETTINGS_ID = 1;

const inventoryProductSelect = {
  id: true,
  stock: true,
} satisfies Prisma.ProductSelect;

const inventoryListProductSelect = {
  id: true,
  name: true,
  category: true,
  selling_price: true,
  stock: true,
} satisfies Prisma.ProductSelect;

export type InventoryProductRecord = Prisma.ProductGetPayload<{
  select: typeof inventoryProductSelect;
}>;

export interface InventoryUpdateResult {
  product: InventoryProductRecord | null;
  lowStockThreshold: number;
  updated: boolean;
}

export type InventoryListProductRecord = Prisma.ProductGetPayload<{
  select: typeof inventoryListProductSelect;
}>;

export interface InventoryListResult {
  products: InventoryListProductRecord[];
  lowStockThreshold: number;
}

@Injectable()
export class InventoryRepository {
  constructor(private readonly prisma: PrismaService) {}

  getLowStockThreshold(): Promise<number> {
    return this.prisma.$transaction((transaction) =>
      this.findLowStockThreshold(transaction),
    );
  }

  async findAll(): Promise<InventoryListResult> {
    return this.prisma.$transaction(async (transaction) => {
      const products = await transaction.product.findMany({
        where: { is_archived: false },
        orderBy: { name: 'asc' },
        select: inventoryListProductSelect,
      });
      return {
        products,
        lowStockThreshold: await this.findLowStockThreshold(transaction),
      };
    });
  }

  addStock(id: string, quantity: number): Promise<InventoryUpdateResult> {
    return this.updateStock(id, {
      stock: {
        increment: quantity,
      },
    });
  }

  removeStock(id: string, quantity: number): Promise<InventoryUpdateResult> {
    return this.updateStock(
      id,
      {
        stock: {
          decrement: quantity,
        },
      },
      {
        stock: {
          gte: quantity,
        },
      },
    );
  }

  setStock(id: string, stock: number): Promise<InventoryUpdateResult> {
    return this.updateStock(id, { stock });
  }

  private async updateStock(
    id: string,
    data: Prisma.ProductUpdateManyMutationInput,
    additionalWhere: Prisma.ProductWhereInput = {},
  ): Promise<InventoryUpdateResult> {
    return this.prisma.$transaction(async (transaction) => {
      const updateResult = await transaction.product.updateMany({
        where: {
          id,
          ...additionalWhere,
        },
        data,
      });
      const product = await transaction.product.findUnique({
        where: { id },
        select: inventoryProductSelect,
      });

      return {
        product,
        lowStockThreshold: await this.findLowStockThreshold(transaction),
        updated: updateResult.count === 1,
      };
    });
  }

  private async findLowStockThreshold(
    transaction: Prisma.TransactionClient,
  ): Promise<number> {
    const settings = await transaction.storeSettings.upsert({
      where: { id: STORE_SETTINGS_ID },
      create: { id: STORE_SETTINGS_ID },
      update: {},
      select: { low_stock_threshold: true },
    });

    return settings.low_stock_threshold;
  }
}
