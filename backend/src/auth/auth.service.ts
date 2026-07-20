import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../database/prisma.service';
import { AUTH_SESSION_DURATION_SECONDS } from './auth.constants';
import type { LoginDto } from './dto/login.dto';
import type { AuthenticatedAdmin, JwtPayload } from './auth.types';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async login(
    data: LoginDto,
  ): Promise<{ admin: AuthenticatedAdmin; token: string }> {
    const admin = await this.prisma.adminUser.findUnique({
      where: { email: data.email },
    });

    if (!admin || !(await bcrypt.compare(data.password, admin.password_hash))) {
      throw this.invalidCredentials();
    }

    const authenticatedAdmin: AuthenticatedAdmin = {
      id: admin.id,
      name: admin.name,
      email: admin.email,
    };
    const token = await this.jwtService.signAsync(
      {
        sub: admin.id,
        email: admin.email,
      } satisfies JwtPayload,
      { expiresIn: AUTH_SESSION_DURATION_SECONDS },
    );

    return { admin: authenticatedAdmin, token };
  }

  async validateSession(payload: JwtPayload): Promise<AuthenticatedAdmin> {
    const admin = await this.prisma.adminUser.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    if (!admin || admin.email !== payload.email) {
      throw this.unauthorized();
    }

    return admin;
  }

  private invalidCredentials(): UnauthorizedException {
    return new UnauthorizedException({
      success: false,
      message: 'Invalid email or password.',
    });
  }

  private unauthorized(): UnauthorizedException {
    return new UnauthorizedException({
      success: false,
      message: 'Authentication is required.',
    });
  }
}
