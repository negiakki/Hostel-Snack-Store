import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { API_PREFIX } from '../src/common/constants/api.constants';
import { OrdersService } from '../src/orders/orders.service';

const productId = '69d2b1d0-5ef6-4cf3-9d31-03e3af2d6c80';

describe('Orders endpoint (e2e)', () => {
  let app: INestApplication<App>;
  let create: jest.Mock;

  beforeEach(async () => {
    create = jest.fn().mockResolvedValue({
      success: true,
      data: {
        orderId: 'f352bdf4-a211-43df-a0a5-8fe11fe0f6f8',
        status: 'Placed',
        total: 40,
        createdAt: '2026-07-19T18:30:00.000Z',
      },
    });

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(OrdersService)
      .useValue({ create })
      .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix(API_PREFIX);
    await app.init();
  });

  it('creates an order with the documented public payload', async () => {
    const input = {
      customerName: 'Akshat',
      items: [{ productId, quantity: 2 }],
    };

    await request(app.getHttpServer())
      .post('/api/v1/orders')
      .send(input)
      .expect(201)
      .expect({
        success: true,
        data: {
          orderId: 'f352bdf4-a211-43df-a0a5-8fe11fe0f6f8',
          status: 'Placed',
          total: 40,
          createdAt: '2026-07-19T18:30:00.000Z',
        },
      });

    expect(create).toHaveBeenCalledWith(input);
  });

  it('rejects a non-positive quantity before the service is called', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/orders')
      .send({ customerName: 'Akshat', items: [{ productId, quantity: 0 }] })
      .expect(400)
      .expect({ success: false, message: 'Invalid request.' });

    expect(create).not.toHaveBeenCalled();
  });

  afterEach(async () => {
    await app.close();
  });
});
