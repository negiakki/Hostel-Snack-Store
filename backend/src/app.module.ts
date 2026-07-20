import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { configuration } from './config/configuration';
import { validateEnvironment } from './config/validate-environment';
import { PrismaModule } from './database/prisma.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { HealthModule } from './health/health.module';
import { InventoryModule } from './inventory/inventory.module';
import { OrdersModule } from './orders/orders.module';
import { ProductsModule } from './products/products.module';
import { StoreStatusModule } from './store-status/store-status.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [configuration],
      validate: validateEnvironment,
    }),
    PrismaModule,
    AnalyticsModule,
    DashboardModule,
    AuthModule,
    HealthModule,
    InventoryModule,
    OrdersModule,
    ProductsModule,
    StoreStatusModule,
  ],
})
export class AppModule {}
