import { BadRequestException, PipeTransform } from '@nestjs/common';

export interface ProductQueryDto {
  search?: string;
  category?: string;
  archived: boolean;
}

type QueryValue = string | string[] | undefined;

interface ProductQueryParameters {
  search?: QueryValue;
  category?: QueryValue;
  archived?: QueryValue;
}

export class ProductQueryPipe implements PipeTransform<
  unknown,
  ProductQueryDto
> {
  transform(value: unknown): ProductQueryDto {
    if (!this.isQueryParameters(value)) {
      throw this.invalidRequest();
    }

    return {
      search: this.parseOptionalText(value.search),
      category: this.parseOptionalText(value.category),
      archived: this.parseArchived(value.archived),
    };
  }

  private isQueryParameters(value: unknown): value is ProductQueryParameters {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  }

  private parseOptionalText(value: QueryValue): string | undefined {
    if (value === undefined) {
      return undefined;
    }

    if (typeof value !== 'string') {
      throw this.invalidRequest();
    }

    const trimmedValue = value.trim();

    if (!trimmedValue) {
      throw this.invalidRequest();
    }

    return trimmedValue;
  }

  private parseArchived(value: QueryValue): boolean {
    if (value === undefined || value === 'false') {
      return false;
    }

    if (value === 'true') {
      return true;
    }

    throw this.invalidRequest();
  }

  private invalidRequest(): BadRequestException {
    return new BadRequestException({
      success: false,
      message: 'Invalid request.',
    });
  }
}
