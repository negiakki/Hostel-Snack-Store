import { Injectable, NotFoundException } from '@nestjs/common';
import { ProductQueryDto } from './dto/product-query.dto';
import { CreateProductDto, UpdateProductDto } from './dto/product-write.dto';
import {
  ProductResponseDto,
  ProductResponseWrapperDto,
  ProductsResponseDto,
} from './dto/product-response.dto';
import { ProductRecord, ProductsRepository } from './products.repository';

@Injectable()
export class ProductsService {
  constructor(private readonly productsRepository: ProductsRepository) {}

  async findAll(query: ProductQueryDto): Promise<ProductsResponseDto> {
    const products = await this.productsRepository.findAll(query);

    return {
      success: true,
      data: products.map((product) => this.toResponse(product)),
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
      data: this.toResponse(product),
    };
  }

  async create(data: CreateProductDto): Promise<ProductResponseWrapperDto> {
    const product = await this.productsRepository.create(data);

    return {
      success: true,
      data: this.toResponse(product),
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
      data: this.toResponse(product),
    };
  }

  async archive(id: string): Promise<ProductResponseWrapperDto> {
    await this.assertProductExists(id);
    const product = await this.productsRepository.archive(id, new Date());

    return {
      success: true,
      data: this.toResponse(product),
    };
  }

  async restore(id: string): Promise<ProductResponseWrapperDto> {
    await this.assertProductExists(id);
    const product = await this.productsRepository.restore(id);

    return {
      success: true,
      data: this.toResponse(product),
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

  private toResponse(product: ProductRecord): ProductResponseDto {
    return {
      id: product.id,
      name: product.name,
      category: product.category,
      imageUrl: product.image_url,
      sellingPrice: Number(product.selling_price),
      stock: product.stock,
    };
  }
}
