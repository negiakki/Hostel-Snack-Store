import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { API_PREFIX } from '../src/common/constants/api.constants';
import { AuthService } from '../src/auth/auth.service';

describe('Authentication endpoints (e2e)', () => {
  let app: INestApplication<App>;
  let login: jest.Mock;
  let validateSession: jest.Mock;

  beforeEach(async () => {
    login = jest.fn().mockResolvedValue({
      admin: {
        id: '8c474ed5-272f-45fe-959e-faf7cc4d2ae8',
        name: 'Store Admin',
        email: 'admin@example.com',
      },
      token: 'signed-token',
    });
    validateSession = jest.fn().mockResolvedValue({
      id: '8c474ed5-272f-45fe-959e-faf7cc4d2ae8',
      name: 'Store Admin',
      email: 'admin@example.com',
    });
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(AuthService)
      .useValue({ login, validateSession })
      .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix(API_PREFIX);
    await app.init();
  });

  it('sets an HTTP-only cookie after a successful login', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'admin@example.com', password: 'a strong password' })
      .expect(201)
      .expect(
        'set-cookie',
        /hostel_snack_admin_session=signed-token;.*HttpOnly; SameSite=Lax/,
      )
      .expect(({ body }: { body: unknown }) => {
        expect(body).toEqual({
          success: true,
          data: {
            id: '8c474ed5-272f-45fe-959e-faf7cc4d2ae8',
            name: 'Store Admin',
            email: 'admin@example.com',
          },
        });
      });
  });

  it('rejects a protected API request without an authentication cookie', () =>
    request(app.getHttpServer())
      .get('/api/v1/inventory/products')
      .expect(401)
      .expect({ success: false, message: 'Authentication is required.' }));

  it('clears the cookie during logout', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/auth/logout')
      .expect(200)
      .expect('set-cookie', /hostel_snack_admin_session=;.*Path=\//);
  });

  afterEach(async () => {
    await app.close();
  });
});
