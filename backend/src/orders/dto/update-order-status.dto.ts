import { BadRequestException, PipeTransform } from '@nestjs/common';
import { OrderStatus } from '@prisma/client';

export interface UpdateOrderStatusDto {
  status: OrderStatus;
}

export class OrderIdPipe implements PipeTransform<unknown, string> {
  transform(value: unknown): string {
    if (
      typeof value !== 'string' ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        value,
      )
    ) {
      throw invalidRequest();
    }

    return value;
  }
}

export class UpdateOrderStatusPipe implements PipeTransform<
  unknown,
  UpdateOrderStatusDto
> {
  transform(value: unknown): UpdateOrderStatusDto {
    if (
      typeof value !== 'object' ||
      value === null ||
      Array.isArray(value) ||
      !Object.hasOwn(value, 'status') ||
      Object.keys(value).length !== 1
    ) {
      throw invalidRequest();
    }

    const status = (value as Record<string, unknown>).status;

    if (
      status !== OrderStatus.Placed &&
      status !== OrderStatus.Ready &&
      status !== OrderStatus.Completed
    ) {
      throw invalidRequest();
    }

    return { status };
  }
}

function invalidRequest(): BadRequestException {
  return new BadRequestException({
    success: false,
    message: 'Invalid request.',
  });
}
