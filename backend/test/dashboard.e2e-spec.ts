import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { AuthGuard } from '../src/auth/auth.guard';
import { API_PREFIX } from '../src/common/constants/api.constants';
import { DashboardService } from '../src/dashboard/dashboard.service';

describe('Dashboard endpoint (e2e)', () => {
  let app: INestApplication<App>;
  let getDashboard: jest.Mock;

  beforeEach(async () => {
    getDashboard = jest.fn().mockResolvedValue({
      success: true,
      data: {
        summary: {
          ordersToday: 2,
          revenueToday: 40,
          profitToday: 16,
          storeStatus: 'Open',
        },
        activeOrders: { placed: 1, ready: 1 },
        inventoryAlerts: { lowStock: [], outOfStock: [] },
        recentActiveOrders: [],
      },
    });

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(DashboardService)
      .useValue({ getDashboard })
      .overrideProvider(AuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix(API_PREFIX);
    await app.init();
  });

  it('returns the aggregated operational data in one admin response', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/dashboard')
      .expect(200)
      .expect({
        success: true,
        data: {
          summary: {
            ordersToday: 2,
            revenueToday: 40,
            profitToday: 16,
            storeStatus: 'Open',
          },
          activeOrders: { placed: 1, ready: 1 },
          inventoryAlerts: { lowStock: [], outOfStock: [] },
          recentActiveOrders: [],
        },
      });

    expect(getDashboard).toHaveBeenCalledTimes(1);
  });

  afterEach(async () => {
    await app.close();
  });
});
