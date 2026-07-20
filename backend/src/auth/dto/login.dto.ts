import { BadRequestException, PipeTransform } from '@nestjs/common';

export interface LoginDto {
  email: string;
  password: string;
}

export class LoginPipe implements PipeTransform<unknown, LoginDto> {
  transform(value: unknown): LoginDto {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
      throw this.invalidRequest();
    }

    const { email, password } = value as Record<string, unknown>;

    if (
      typeof email !== 'string' ||
      typeof password !== 'string' ||
      email.trim() === '' ||
      password === '' ||
      !this.isEmail(email.trim())
    ) {
      throw this.invalidRequest();
    }

    return {
      email: email.trim().toLowerCase(),
      password,
    };
  }

  private isEmail(value: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  private invalidRequest(): BadRequestException {
    return new BadRequestException({
      success: false,
      message: 'Enter a valid email address and password.',
    });
  }
}
