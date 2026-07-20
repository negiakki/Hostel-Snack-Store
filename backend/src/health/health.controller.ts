import { Controller, Get } from '@nestjs/common';
import { Public } from '../auth/public.decorator';

interface HealthResponse {
  success: true;
  data: {
    status: 'ok';
    service: 'backend';
    timestamp: string;
  };
}

@Controller('health')
export class HealthController {
  @Get()
  @Public()
  getHealth(): HealthResponse {
    return {
      success: true,
      data: {
        status: 'ok',
        service: 'backend',
        timestamp: new Date().toISOString(),
      },
    };
  }
}
