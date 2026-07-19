import { BadRequestException, PipeTransform } from '@nestjs/common';

export interface CreateProductDto {
  name: string;
  category: string;
  imageUrl: string;
  sellingPrice: number;
  costPrice: number;
  stock: number;
}

export interface UpdateProductDto {
  name?: string;
  category?: string;
  imageUrl?: string;
  sellingPrice?: number;
  costPrice?: number;
  stock?: number;
}

const PRODUCT_FIELDS = [
  'name',
  'category',
  'imageUrl',
  'sellingPrice',
  'costPrice',
  'stock',
] as const;

type ProductField = (typeof PRODUCT_FIELDS)[number];
type RequestBody = Record<string, unknown>;

abstract class ProductWritePipe<T> implements PipeTransform<unknown, T> {
  abstract transform(value: unknown): T;

  protected parseBody(value: unknown): RequestBody {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
      throw this.invalidRequest();
    }

    const body = value as RequestBody;

    if (
      Object.keys(body).some(
        (field) => !PRODUCT_FIELDS.includes(field as ProductField),
      )
    ) {
      throw this.invalidRequest();
    }

    return body;
  }

  protected parseText(value: unknown): string {
    if (typeof value !== 'string') {
      throw this.invalidRequest();
    }

    const trimmedValue = value.trim();

    if (!trimmedValue) {
      throw this.invalidRequest();
    }

    return trimmedValue;
  }

  protected parseImageUrl(value: unknown): string {
    const imageUrl = this.parseText(value);

    try {
      const parsedUrl = new URL(imageUrl);

      if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
        throw this.invalidRequest();
      }
    } catch (error: unknown) {
      if (error instanceof BadRequestException) {
        throw error;
      }

      throw this.invalidRequest();
    }

    return imageUrl;
  }

  protected parsePrice(value: unknown): number {
    if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
      throw this.invalidRequest();
    }

    return value;
  }

  protected parseStock(value: unknown): number {
    if (
      typeof value !== 'number' ||
      !Number.isSafeInteger(value) ||
      value < 0
    ) {
      throw this.invalidRequest();
    }

    return value;
  }

  protected invalidRequest(): BadRequestException {
    return new BadRequestException({
      success: false,
      message: 'Invalid request.',
    });
  }
}

export class CreateProductPipe
  extends ProductWritePipe<CreateProductDto>
  implements PipeTransform<unknown, CreateProductDto>
{
  transform(value: unknown): CreateProductDto {
    const body = this.parseBody(value);

    return {
      name: this.parseText(body.name),
      category: this.parseText(body.category),
      imageUrl: this.parseImageUrl(body.imageUrl),
      sellingPrice: this.parsePrice(body.sellingPrice),
      costPrice: this.parsePrice(body.costPrice),
      stock: this.parseStock(body.stock),
    };
  }
}

export class UpdateProductPipe
  extends ProductWritePipe<UpdateProductDto>
  implements PipeTransform<unknown, UpdateProductDto>
{
  transform(value: unknown): UpdateProductDto {
    const body = this.parseBody(value);

    if (!Object.keys(body).length) {
      throw this.invalidRequest();
    }

    return {
      ...(Object.hasOwn(body, 'name')
        ? { name: this.parseText(body.name) }
        : {}),
      ...(Object.hasOwn(body, 'category')
        ? { category: this.parseText(body.category) }
        : {}),
      ...(Object.hasOwn(body, 'imageUrl')
        ? { imageUrl: this.parseImageUrl(body.imageUrl) }
        : {}),
      ...(Object.hasOwn(body, 'sellingPrice')
        ? { sellingPrice: this.parsePrice(body.sellingPrice) }
        : {}),
      ...(Object.hasOwn(body, 'costPrice')
        ? { costPrice: this.parsePrice(body.costPrice) }
        : {}),
      ...(Object.hasOwn(body, 'stock')
        ? { stock: this.parseStock(body.stock) }
        : {}),
    };
  }
}
