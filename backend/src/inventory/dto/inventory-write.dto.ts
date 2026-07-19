import { BadRequestException, PipeTransform } from '@nestjs/common';

export interface AdjustStockDto {
  quantity: number;
}

export interface SetStockDto {
  stock: number;
}

type RequestBody = Record<string, unknown>;

abstract class InventoryWritePipe<T> implements PipeTransform<unknown, T> {
  abstract transform(value: unknown): T;

  protected parseBody(value: unknown, field: string): RequestBody {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
      throw this.invalidRequest();
    }

    const body = value as RequestBody;

    if (Object.keys(body).length !== 1 || !Object.hasOwn(body, field)) {
      throw this.invalidRequest();
    }

    return body;
  }

  protected parseNonNegativeInteger(value: unknown): number {
    if (
      typeof value !== 'number' ||
      !Number.isSafeInteger(value) ||
      value < 0
    ) {
      throw this.invalidRequest();
    }

    return value;
  }

  protected parsePositiveInteger(value: unknown): number {
    const quantity = this.parseNonNegativeInteger(value);

    if (quantity === 0) {
      throw this.invalidRequest();
    }

    return quantity;
  }

  protected invalidRequest(): BadRequestException {
    return new BadRequestException({
      success: false,
      message: 'Invalid request.',
    });
  }
}

export class AdjustStockPipe
  extends InventoryWritePipe<AdjustStockDto>
  implements PipeTransform<unknown, AdjustStockDto>
{
  transform(value: unknown): AdjustStockDto {
    const body = this.parseBody(value, 'quantity');

    return { quantity: this.parsePositiveInteger(body.quantity) };
  }
}

export class SetStockPipe
  extends InventoryWritePipe<SetStockDto>
  implements PipeTransform<unknown, SetStockDto>
{
  transform(value: unknown): SetStockDto {
    const body = this.parseBody(value, 'stock');

    return { stock: this.parseNonNegativeInteger(body.stock) };
  }
}
