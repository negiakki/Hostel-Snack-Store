import { Injectable, NotFoundException } from '@nestjs/common';
import { ProductQueryDto } from './dto/product-query.dto';
import { CreateProductDto, UpdateProductDto } from './dto/product-write.dto';
import {
  ProductResponseDto,
  ProductResponseWrapperDto,
  ProductsResponseDto,
} from './dto/product-response.dto';
import {
  InventoryService,
  ProductStockStatus,
} from '../inventory/inventory.service';
import { ProductRecord, ProductsRepository } from './products.repository';

@Injectable()
export class ProductsService {
  constructor(
    private readonly productsRepository: ProductsRepository,
    private readonly inventoryService: InventoryService,
  ) {}

  async findAll(query: ProductQueryDto): Promise<ProductsResponseDto> {
    const products = await this.productsRepository.findAll(query);
    const statuses = await this.inventoryService.getProductStatuses(products);

    return {
      success: true,
      data: products.map((product) =>
        this.toResponse(product, this.getStatus(product.id, statuses)),
      ),
    };
  }

  async findOne(id: string): Promise<ProductResponseWrapperDto> {
    const product = await this.productsRepository.findActiveById(id);

    if (!product) {
      throw new NotFoundException({
        success: false,
        message: 'Product not found.',
      });
    }

    return {
      success: true,
      data: await this.toResponseWithStatus(product),
    };
  }

  async create(data: CreateProductDto): Promise<ProductResponseWrapperDto> {
    const product = await this.productsRepository.create(data);

    return {
      success: true,
      data: await this.toResponseWithStatus(product),
    };
  }

  async update(
    id: string,
    data: UpdateProductDto,
  ): Promise<ProductResponseWrapperDto> {
    await this.assertProductExists(id);
    const product = await this.productsRepository.update(id, data);

    return {
      success: true,
      data: await this.toResponseWithStatus(product),
    };
  }

  async archive(id: string): Promise<ProductResponseWrapperDto> {
    await this.assertProductExists(id);
    const product = await this.productsRepository.archive(id, new Date());

    return {
      success: true,
      data: await this.toResponseWithStatus(product),
    };
  }

  async restore(id: string): Promise<ProductResponseWrapperDto> {
    await this.assertProductExists(id);
    const product = await this.productsRepository.restore(id);

    return {
      success: true,
      data: await this.toResponseWithStatus(product),
    };
  }

  private async assertProductExists(id: string): Promise<void> {
    const product = await this.productsRepository.findById(id);

    if (!product) {
      throw new NotFoundException({
        success: false,
        message: 'Product not found.',
      });
    }
  }

  private async toResponseWithStatus(
    product: ProductRecord,
  ): Promise<ProductResponseDto> {
    const statuses = await this.inventoryService.getProductStatuses([product]);

    return this.toResponse(product, this.getStatus(product.id, statuses));
  }

  private getStatus(
    productId: string,
    statuses: Map<string, ProductStockStatus>,
  ): ProductStockStatus {
    const status = statuses.get(productId);

    if (!status) {
      throw new Error('Inventory status is unavailable for this product.');
    }

    return status;
  }

  private toResponse(
    product: ProductRecord,
    status: ProductStockStatus,
  ): ProductResponseDto {
    return {
      id: product.id,
      name: product.name,
      category: product.category,
      imageUrl: product.image_url,
      sellingPrice: Number(product.selling_price),
      stock: product.stock,
      ...status,
    };
  }
}
