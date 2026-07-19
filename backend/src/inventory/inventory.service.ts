import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  InventoryProductDto,
  InventoryProductsResponseDto,
  InventoryResponseDto,
} from './dto/inventory-response.dto';
import { AdjustStockDto, SetStockDto } from './dto/inventory-write.dto';
import {
  InventoryListProductRecord,
  InventoryRepository,
  InventoryUpdateResult,
} from './inventory.repository';

interface StockedProduct {
  id: string;
  stock: number;
}

export interface ProductStockStatus {
  isLowStock: boolean;
  isOutOfStock: boolean;
}

@Injectable()
export class InventoryService {
  constructor(private readonly inventoryRepository: InventoryRepository) {}

  async findAll(): Promise<InventoryProductsResponseDto> {
    const result = await this.inventoryRepository.findAll();

    return {
      success: true,
      data: result.products.map((product) =>
        this.toProductResponse(product, result.lowStockThreshold),
      ),
    };
  }

  async getProductStatuses(
    products: readonly StockedProduct[],
  ): Promise<Map<string, ProductStockStatus>> {
    const lowStockThreshold =
      await this.inventoryRepository.getLowStockThreshold();

    return new Map(
      products.map((product) => [
        product.id,
        this.toStockStatus(product.stock, lowStockThreshold),
      ]),
    );
  }

  async addStock(
    id: string,
    data: AdjustStockDto,
  ): Promise<InventoryResponseDto> {
    const result = await this.inventoryRepository.addStock(id, data.quantity);

    return this.toResponse(this.assertUpdated(result));
  }

  async removeStock(
    id: string,
    data: AdjustStockDto,
  ): Promise<InventoryResponseDto> {
    const result = await this.inventoryRepository.removeStock(
      id,
      data.quantity,
    );

    if (!result.product) {
      throw this.productNotFound();
    }

    if (!result.updated) {
      throw new ConflictException({
        success: false,
        message: 'Insufficient stock for this adjustment.',
      });
    }

    return this.toResponse(result);
  }

  async setStock(id: string, data: SetStockDto): Promise<InventoryResponseDto> {
    const result = await this.inventoryRepository.setStock(id, data.stock);

    return this.toResponse(this.assertUpdated(result));
  }

  private assertUpdated(result: InventoryUpdateResult): InventoryUpdateResult {
    if (!result.product || !result.updated) {
      throw this.productNotFound();
    }

    return result;
  }

  private toResponse(result: InventoryUpdateResult): InventoryResponseDto {
    const product = result.product;

    if (!product) {
      throw this.productNotFound();
    }

    const { lowStockThreshold } = result;

    return {
      success: true,
      data: {
        productId: product.id,
        stock: product.stock,
        lowStockThreshold,
        ...this.toStockStatus(product.stock, lowStockThreshold),
      },
    };
  }

  private toProductResponse(
    product: InventoryListProductRecord,
    lowStockThreshold: number,
  ): InventoryProductDto {
    return {
      id: product.id,
      name: product.name,
      category: product.category,
      sellingPrice: Number(product.selling_price),
      productId: product.id,
      stock: product.stock,
      lowStockThreshold,
      ...this.toStockStatus(product.stock, lowStockThreshold),
    };
  }

  private toStockStatus(
    stock: number,
    lowStockThreshold: number,
  ): ProductStockStatus {
    return {
      isLowStock: stock <= lowStockThreshold,
      isOutOfStock: stock === 0,
    };
  }

  private productNotFound(): NotFoundException {
    return new NotFoundException({
      success: false,
      message: 'Product not found.',
    });
  }
}
