import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { API_PREFIX } from './common/constants/api.constants';
import { ApiExceptionFilter } from './common/filters/api-exception.filter';
import { Configuration } from './config/configuration';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService<Configuration, true>);
  const appConfig = configService.getOrThrow<Configuration['app']>('app');
  const logger = new Logger('Bootstrap');
  const { frontendUrls, port } = appConfig;

  app.setGlobalPrefix(API_PREFIX);
  app.useGlobalFilters(new ApiExceptionFilter());
  app.enableShutdownHooks();
  app.enableCors({
    origin: frontendUrls,
    credentials: true,
  });

  await app.listen(port);
  logger.log(`API listening on http://localhost:${port}/${API_PREFIX}`);
}

void bootstrap();
