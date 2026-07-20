import { INestApplication, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { API_PREFIX } from '../src/common/constants/api.constants';
import { AuthService } from '../src/auth/auth.service';
import { ProductsService } from '../src/products/products.service';
import { JwtService } from '@nestjs/jwt';

const product = {
  id: '69d2b1d0-5ef6-4cf3-9d31-03e3af2d6c80',
  name: 'Lays Classic',
  category: 'Chips',
  imageUrl: 'https://storage.example.com/lays-classic.jpg',
  sellingPrice: 20,
  stock: 25,
};

describe('Products endpoints (e2e)', () => {
  let app: INestApplication<App>;
  let findAll: jest.Mock;
  let findOne: jest.Mock;
  let create: jest.Mock;
  let update: jest.Mock;
  let archive: jest.Mock;
  let restore: jest.Mock;
  let sessionCookie: string;

  beforeEach(async () => {
    findAll = jest.fn().mockResolvedValue({ success: true, data: [product] });
    findOne = jest.fn().mockResolvedValue({ success: true, data: product });
    create = jest.fn().mockResolvedValue({ success: true, data: product });
    update = jest.fn().mockResolvedValue({ success: true, data: product });
    archive = jest.fn().mockResolvedValue({ success: true, data: product });
    restore = jest.fn().mockResolvedValue({ success: true, data: product });

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(ProductsService)
      .useValue({ findAll, findOne, create, update, archive, restore })
      .overrideProvider(AuthService)
      .useValue({
        validateSession: jest.fn().mockResolvedValue({
          id: '8c474ed5-272f-45fe-959e-faf7cc4d2ae8',
          name: 'Store Admin',
          email: 'admin@example.com',
        }),
      })
      .compile();

    const jwtService = moduleFixture.get(JwtService);
    const token = await jwtService.signAsync({
      sub: '8c474ed5-272f-45fe-959e-faf7cc4d2ae8',
      email: 'admin@example.com',
    });
    sessionCookie = `hostel_snack_admin_session=${token}`;

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix(API_PREFIX);
    await app.init();
  });

  it('lists products with validated search, category, and archived filters', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/products?search=lays&category=Chips&archived=false')
      .expect(200)
      .expect({ success: true, data: [product] });

    expect(findAll).toHaveBeenCalledWith({
      search: 'lays',
      category: 'Chips',
      archived: false,
    });
  });

  it('keeps archived products out of the public catalog', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/products?archived=true')
      .expect(200)
      .expect({ success: true, data: [product] });

    expect(findAll).toHaveBeenCalledWith({ archived: false });
  });

  it('returns one valid product and rejects an invalid UUID', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/products/69d2b1d0-5ef6-4cf3-9d31-03e3af2d6c80')
      .expect(200)
      .expect({ success: true, data: product });

    await request(app.getHttpServer())
      .get('/api/v1/products/not-a-uuid')
      .expect(400)
      .expect({ success: false, message: 'Invalid request.' });
  });

  it('creates a product and rejects incomplete input', async () => {
    const input = {
      name: 'Lays Classic',
      category: 'Chips',
      imageUrl: 'https://storage.example.com/lays-classic.jpg',
      sellingPrice: 20,
      costPrice: 15,
      stock: 25,
    };

    await request(app.getHttpServer())
      .post('/api/v1/products')
      .set('Cookie', sessionCookie)
      .send(input)
      .expect(201)
      .expect({ success: true, data: product });
    expect(create).toHaveBeenCalledWith(input);

    await request(app.getHttpServer())
      .post('/api/v1/products')
      .set('Cookie', sessionCookie)
      .send({ ...input, stock: -1 })
      .expect(400)
      .expect({ success: false, message: 'Invalid request.' });
  });

  it('updates a product with a valid partial payload', async () => {
    await request(app.getHttpServer())
      .patch('/api/v1/products/69d2b1d0-5ef6-4cf3-9d31-03e3af2d6c80')
      .set('Cookie', sessionCookie)
      .send({ sellingPrice: 30 })
      .expect(200)
      .expect({ success: true, data: product });

    expect(update).toHaveBeenCalledWith(
      '69d2b1d0-5ef6-4cf3-9d31-03e3af2d6c80',
      { sellingPrice: 30 },
    );
  });

  it('archives and restores an existing product', async () => {
    await request(app.getHttpServer())
      .delete('/api/v1/products/69d2b1d0-5ef6-4cf3-9d31-03e3af2d6c80')
      .set('Cookie', sessionCookie)
      .expect(200)
      .expect({ success: true, data: product });
    expect(archive).toHaveBeenCalledWith(
      '69d2b1d0-5ef6-4cf3-9d31-03e3af2d6c80',
    );

    await request(app.getHttpServer())
      .patch('/api/v1/products/69d2b1d0-5ef6-4cf3-9d31-03e3af2d6c80/restore')
      .set('Cookie', sessionCookie)
      .expect(200)
      .expect({ success: true, data: product });
    expect(restore).toHaveBeenCalledWith(
      '69d2b1d0-5ef6-4cf3-9d31-03e3af2d6c80',
    );
  });

  it('returns 404 for a missing product', async () => {
    findOne.mockRejectedValue(
      new NotFoundException({
        success: false,
        message: 'Product not found.',
      }),
    );

    await request(app.getHttpServer())
      .get('/api/v1/products/69d2b1d0-5ef6-4cf3-9d31-03e3af2d6c80')
      .expect(404)
      .expect({ success: false, message: 'Product not found.' });
  });

  afterEach(async () => {
    await app.close();
  });
});
