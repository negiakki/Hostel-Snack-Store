import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request, Response } from 'express';
import { Configuration } from '../config/configuration';
import {
  AUTH_COOKIE_NAME,
  AUTH_SESSION_DURATION_MILLISECONDS,
} from './auth.constants';
import { AuthService } from './auth.service';
import { LoginPipe } from './dto/login.dto';
import type { LoginDto } from './dto/login.dto';
import { Public } from './public.decorator';
import type { AuthenticatedAdmin } from './auth.types';

interface AuthenticatedRequest extends Request {
  admin: AuthenticatedAdmin;
}

interface AdminResponse {
  success: true;
  data: AuthenticatedAdmin;
}

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService<Configuration, true>,
  ) {}

  @Public()
  @Post('login')
  async login(
    @Body(new LoginPipe()) data: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AdminResponse> {
    const { admin, token } = await this.authService.login(data);
    response.cookie(AUTH_COOKIE_NAME, token, this.cookieOptions());

    return { success: true, data: admin };
  }

  @Public()
  @Post('logout')
  @HttpCode(200)
  logout(@Res({ passthrough: true }) response: Response): { success: true } {
    response.clearCookie(AUTH_COOKIE_NAME, this.cookieOptions());
    return { success: true };
  }

  @Get('session')
  session(@Req() request: AuthenticatedRequest): AdminResponse {
    return { success: true, data: request.admin };
  }

  private cookieOptions() {
    const isProduction =
      this.configService.getOrThrow<Configuration['app']>('app').environment ===
      'production';

    return {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? ('none' as const) : ('lax' as const),
      path: '/',
      maxAge: AUTH_SESSION_DURATION_MILLISECONDS,
    };
  }
}
