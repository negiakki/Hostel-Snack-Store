import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';
import { Configuration } from '../config/configuration';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleDestroy {
  constructor(configService: ConfigService<Configuration, true>) {
    const appConfig = configService.getOrThrow<Configuration['app']>('app');

    super({
      datasources: {
        db: {
          url: appConfig.databaseUrl,
        },
      },
    });
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
