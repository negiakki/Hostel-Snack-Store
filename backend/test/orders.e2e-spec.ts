import { ConflictException, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { API_PREFIX } from '../src/common/constants/api.constants';
import { OrdersService } from '../src/orders/orders.service';
import { AuthGuard } from '../src/auth/auth.guard';

const productId = '69d2b1d0-5ef6-4cf3-9d31-03e3af2d6c80';

describe('Orders endpoint (e2e)', () => {
  let app: INestApplication<App>;
  let create: jest.Mock;
  let list: jest.Mock;
  let getById: jest.Mock;
  let updateStatus: jest.Mock;

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
    list = jest.fn().mockResolvedValue({
      success: true,
      data: [
        {
          orderId: 'f352bdf4-a211-43df-a0a5-8fe11fe0f6f8',
          customerName: 'Akshat',
          itemCount: 2,
          status: 'Placed',
          total: 40,
          createdAt: '2026-07-19T18:30:00.000Z',
        },
      ],
    });
    getById = jest.fn().mockResolvedValue({
      success: true,
      data: {
        orderId: 'f352bdf4-a211-43df-a0a5-8fe11fe0f6f8',
        customerName: 'Akshat',
        status: 'Placed',
        total: 40,
        createdAt: '2026-07-19T18:30:00.000Z',
        items: [
          {
            productName: 'Lays Classic',
            quantity: 2,
            unitPrice: 20,
            lineTotal: 40,
          },
        ],
      },
    });
    updateStatus = jest.fn().mockResolvedValue({
      success: true,
      data: {
        orderId: 'f352bdf4-a211-43df-a0a5-8fe11fe0f6f8',
        customerName: 'Akshat',
        status: 'Ready',
        total: 40,
        createdAt: '2026-07-19T18:30:00.000Z',
        items: [],
      },
    });

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(OrdersService)
      .useValue({ create, list, getById, updateStatus })
      .overrideProvider(AuthGuard)
      .useValue({ canActivate: () => true })
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

  it('lists the newest orders for the admin workflow', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/orders')
      .expect(200)
      .expect({
        success: true,
        data: [
          {
            orderId: 'f352bdf4-a211-43df-a0a5-8fe11fe0f6f8',
            customerName: 'Akshat',
            itemCount: 2,
            status: 'Placed',
            total: 40,
            createdAt: '2026-07-19T18:30:00.000Z',
          },
        ],
      });

    expect(list).toHaveBeenCalledTimes(1);
  });

  it('returns immutable order details for admin verification', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/orders/f352bdf4-a211-43df-a0a5-8fe11fe0f6f8')
      .expect(200);

    expect(getById).toHaveBeenCalledWith(
      'f352bdf4-a211-43df-a0a5-8fe11fe0f6f8',
    );
  });

  it('updates only documented statuses and exposes invalid-transition errors', async () => {
    await request(app.getHttpServer())
      .patch('/api/v1/orders/f352bdf4-a211-43df-a0a5-8fe11fe0f6f8/status')
      .send({ status: 'Ready' })
      .expect(200);

    expect(updateStatus).toHaveBeenCalledWith(
      'f352bdf4-a211-43df-a0a5-8fe11fe0f6f8',
      'Ready',
    );

    updateStatus.mockRejectedValueOnce(
      new ConflictException({
        success: false,
        message: 'Order status transition is invalid.',
      }),
    );

    await request(app.getHttpServer())
      .patch('/api/v1/orders/f352bdf4-a211-43df-a0a5-8fe11fe0f6f8/status')
      .send({ status: 'Completed' })
      .expect(409)
      .expect({
        success: false,
        message: 'Order status transition is invalid.',
      });
  });

  afterEach(async () => {
    await app.close();
  });
});
