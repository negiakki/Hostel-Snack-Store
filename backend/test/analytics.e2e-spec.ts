import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { API_PREFIX } from '../src/common/constants/api.constants';
import { CleanupService } from '../src/analytics/cleanup.service';
import { DailyAnalyticsService } from '../src/analytics/daily-analytics.service';
import { AuthGuard } from '../src/auth/auth.guard';
import { businessDayBounds } from '../src/analytics/business-day';

describe('Daily analytics endpoint (e2e)', () => {
  let app: INestApplication<App>;
  let getByBusinessDate: jest.Mock;
  let finalizeBusinessDay: jest.Mock;
  let toResponse: jest.Mock;

  beforeEach(async () => {
    getByBusinessDate = jest.fn().mockResolvedValue({
      success: true,
      data: { date: '2026-07-19', totalOrders: 2 },
    });
    finalizeBusinessDay = jest.fn().mockResolvedValue({
      analytics: { id: 'daily-analytics-record' },
      deletedOrderCount: 2,
      alreadyFinalized: false,
    });
    toResponse = jest.fn().mockReturnValue({
      date: '2026-07-19',
      totalOrders: 2,
      revenue: 100,
      cost: 62,
      profit: 38,
      averageOrderValue: 50,
      bestSellingProduct: 'Coke',
      totalItemsSold: 6,
      createdAt: '2026-07-20T00:00:00.000Z',
    });

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(DailyAnalyticsService)
      .useValue({ getByBusinessDate, toResponse })
      .overrideProvider(CleanupService)
      .useValue({ finalizeBusinessDay })
      .overrideProvider(AuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix(API_PREFIX);
    await app.init();
  });

  it('returns a permanent daily record after finalizing and removing order detail', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/analytics/daily/2026-07-19/finalize')
      .expect(201)
      .expect({
        success: true,
        data: {
          date: '2026-07-19',
          totalOrders: 2,
          revenue: 100,
          cost: 62,
          profit: 38,
          averageOrderValue: 50,
          bestSellingProduct: 'Coke',
          totalItemsSold: 6,
          createdAt: '2026-07-20T00:00:00.000Z',
          deletedOrderCount: 2,
          alreadyFinalized: false,
        },
      });

    expect(finalizeBusinessDay).toHaveBeenCalledWith(
      new Date('2026-07-19T00:00:00.000Z'),
    );
  });

  it('passes the requested IST business day into finalization without changing the API contract', async () => {
    finalizeBusinessDay.mockImplementationOnce((businessDate: Date) => {
      expect(businessDayBounds(businessDate)).toEqual({
        start: new Date('2026-07-19T18:30:00.000Z'),
        end: new Date('2026-07-20T18:30:00.000Z'),
      });

      return Promise.resolve({
        analytics: { id: 'daily-analytics-record' },
        deletedOrderCount: 0,
        alreadyFinalized: true,
      });
    });

    await request(app.getHttpServer())
      .post('/api/v1/analytics/daily/2026-07-20/finalize')
      .expect(201);

    expect(finalizeBusinessDay).toHaveBeenCalledWith(
      new Date('2026-07-20T00:00:00.000Z'),
    );
  });

  it('validates the target business date before cleanup starts', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/analytics/daily/2026-02-30/finalize')
      .expect(400)
      .expect({
        success: false,
        message: 'Business date must be a valid calendar date.',
      });

    expect(finalizeBusinessDay).not.toHaveBeenCalled();
  });

  afterEach(async () => {
    await app.close();
  });
});
