import { BadRequestException, PipeTransform } from '@nestjs/common';

const STORE_STATUS_FIELDS = ['isOpen', 'message'] as const;
const MAX_MESSAGE_LENGTH = 160;

type StoreStatusField = (typeof STORE_STATUS_FIELDS)[number];
type RequestBody = Record<string, unknown>;

export interface UpdateStoreStatusDto {
  isOpen: boolean;
  message?: string;
}

export class UpdateStoreStatusPipe implements PipeTransform<
  unknown,
  UpdateStoreStatusDto
> {
  transform(value: unknown): UpdateStoreStatusDto {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
      throw this.invalidRequest();
    }

    const body = value as RequestBody;

    if (
      Object.keys(body).some(
        (field) => !STORE_STATUS_FIELDS.includes(field as StoreStatusField),
      )
    ) {
      throw this.invalidRequest();
    }

    if (typeof body.isOpen !== 'boolean') {
      throw this.invalidRequest();
    }

    return {
      isOpen: body.isOpen,
      ...(Object.hasOwn(body, 'message')
        ? { message: this.parseMessage(body.message) }
        : {}),
    };
  }

  private parseMessage(value: unknown): string {
    if (typeof value !== 'string') {
      throw this.invalidRequest();
    }

    const message = value.trim();

    if (Array.from(message).length > MAX_MESSAGE_LENGTH) {
      throw this.invalidRequest();
    }

    return message;
  }

  private invalidRequest(): BadRequestException {
    return new BadRequestException({
      success: false,
      message: 'Invalid request.',
    });
  }
}
