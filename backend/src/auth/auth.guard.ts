import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { AUTH_COOKIE_NAME } from './auth.constants';
import { AuthService } from './auth.service';
import { IS_PUBLIC_KEY } from './public.decorator';
import type { AuthenticatedAdmin, JwtPayload } from './auth.types';

interface AuthenticatedRequest extends Request {
  admin?: AuthenticatedAdmin;
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
    private readonly authService: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = this.getCookie(request.headers.cookie, AUTH_COOKIE_NAME);

    if (!token) {
      throw this.unauthorized();
    }

    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token);
      request.admin = await this.authService.validateSession(payload);
      return true;
    } catch {
      throw this.unauthorized();
    }
  }

  private getCookie(
    header: string | undefined,
    name: string,
  ): string | undefined {
    if (!header) {
      return undefined;
    }

    for (const part of header.split(';')) {
      const [cookieName, ...cookieValue] = part.trim().split('=');

      if (cookieName === name) {
        try {
          return decodeURIComponent(cookieValue.join('='));
        } catch {
          return undefined;
        }
      }
    }

    return undefined;
  }

  private unauthorized(): UnauthorizedException {
    return new UnauthorizedException({
      success: false,
      message: 'Authentication is required.',
    });
  }
}
