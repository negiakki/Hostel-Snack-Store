import { BadRequestException, PipeTransform } from '@nestjs/common';

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export class UuidValidationPipe implements PipeTransform<unknown, string> {
  transform(value: unknown): string {
    if (typeof value === 'string' && UUID_PATTERN.test(value)) {
      return value;
    }

    throw new BadRequestException({
      success: false,
      message: 'Invalid request.',
    });
  }
}
