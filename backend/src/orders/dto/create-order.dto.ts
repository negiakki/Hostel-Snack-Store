import { BadRequestException, PipeTransform } from '@nestjs/common';

export interface CreateOrderItemDto {
  productId: string;
  quantity: number;
}

export interface CreateOrderDto {
  customerName: string;
  items: CreateOrderItemDto[];
}

type RequestBody = Record<string, unknown>;

export class CreateOrderPipe implements PipeTransform<unknown, CreateOrderDto> {
  transform(value: unknown): CreateOrderDto {
    const body = this.parseBody(value);
    const customerName = this.parseText(body.customerName);
    const items = this.parseItems(body.items);

    if (new Set(items.map((item) => item.productId)).size !== items.length) {
      throw this.invalidRequest();
    }

    return { customerName, items };
  }

  private parseBody(value: unknown): RequestBody {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
      throw this.invalidRequest();
    }

    const body = value as RequestBody;
    const fields = Object.keys(body);

    if (
      fields.length !== 2 ||
      !Object.hasOwn(body, 'customerName') ||
      !Object.hasOwn(body, 'items')
    ) {
      throw this.invalidRequest();
    }

    return body;
  }

  private parseItems(value: unknown): CreateOrderItemDto[] {
    if (!Array.isArray(value) || value.length === 0) {
      throw this.invalidRequest();
    }

    return value.map((item) => this.parseItem(item));
  }

  private parseItem(value: unknown): CreateOrderItemDto {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
      throw this.invalidRequest();
    }

    const item = value as RequestBody;
    const fields = Object.keys(item);

    if (
      fields.length !== 2 ||
      !Object.hasOwn(item, 'productId') ||
      !Object.hasOwn(item, 'quantity')
    ) {
      throw this.invalidRequest();
    }

    const productId = this.parseUuid(item.productId);
    const quantity = this.parseQuantity(item.quantity);

    return { productId, quantity };
  }

  private parseText(value: unknown): string {
    if (typeof value !== 'string') {
      throw this.invalidRequest();
    }

    const text = value.trim();

    if (!text) {
      throw this.invalidRequest();
    }

    return text;
  }

  private parseUuid(value: unknown): string {
    const productId = this.parseText(value);
    const uuidPattern =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    if (!uuidPattern.test(productId)) {
      throw this.invalidRequest();
    }

    return productId;
  }

  private parseQuantity(value: unknown): number {
    if (
      typeof value !== 'number' ||
      !Number.isSafeInteger(value) ||
      value <= 0
    ) {
      throw this.invalidRequest();
    }

    return value;
  }

  private invalidRequest(): BadRequestException {
    return new BadRequestException({
      success: false,
      message: 'Invalid request.',
    });
  }
}
