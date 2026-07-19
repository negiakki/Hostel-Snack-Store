import { Controller, Get } from '@nestjs/common';

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
