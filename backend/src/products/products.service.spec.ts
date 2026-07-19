import { NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Test, TestingModule } from '@nestjs/testing';
import { ProductQueryDto } from './dto/product-query.dto';
import { CreateProductDto, UpdateProductDto } from './dto/product-write.dto';
import { InventoryService } from '../inventory/inventory.service';
import { ProductRecord, ProductsRepository } from './products.repository';
import { ProductsService } from './products.service';

const product: ProductRecord = {
  id: '69d2b1d0-5ef6-4cf3-9d31-03e3af2d6c80',
  name: 'Lays Classic',
  category: 'Chips',
  image_url: 'https://storage.example.com/lays-classic.jpg',
  selling_price: new Prisma.Decimal('20.00'),
  stock: 25,
};

describe('ProductsService', () => {
  let service: ProductsService;
  let repository: jest.Mocked<ProductsRepository>;
  let findAll: jest.MockedFunction<ProductsRepository['findAll']>;
  let findActiveById: jest.MockedFunction<ProductsRepository['findActiveById']>;
  let findById: jest.MockedFunction<ProductsRepository['findById']>;
  let create: jest.MockedFunction<ProductsRepository['create']>;
  let update: jest.MockedFunction<ProductsRepository['update']>;
  let archive: jest.MockedFunction<ProductsRepository['archive']>;
  let restore: jest.MockedFunction<ProductsRepository['restore']>;
  let getProductStatuses: jest.MockedFunction<
    InventoryService['getProductStatuses']
  >;

  beforeEach(async () => {
    findAll = jest.fn();
    findActiveById = jest.fn();
    findById = jest.fn();
    create = jest.fn();
    update = jest.fn();
    archive = jest.fn();
    restore = jest.fn();
    getProductStatuses = jest.fn().mockResolvedValue(
      new Map([
        [
          product.id,
          {
            isLowStock: false,
            isOutOfStock: false,
          },
        ],
      ]),
    );
    repository = {
      findAll,
      findActiveById,
      findById,
      create,
      update,
      archive,
      restore,
    } as jest.Mocked<ProductsRepository>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: ProductsRepository,
          useValue: repository,
        },
        {
          provide: InventoryService,
          useValue: { getProductStatuses },
        },
      ],
    }).compile();

    service = module.get(ProductsService);
  });

  it('returns mapped products without internal cost price or database field names', async () => {
    const query: ProductQueryDto = {
      search: 'lays',
      category: 'Chips',
      archived: false,
    };
    findAll.mockResolvedValue([product]);

    await expect(service.findAll(query)).resolves.toEqual({
      success: true,
      data: [
        {
          id: product.id,
          name: 'Lays Classic',
          category: 'Chips',
          imageUrl: 'https://storage.example.com/lays-classic.jpg',
          sellingPrice: 20,
          stock: 25,
          isLowStock: false,
          isOutOfStock: false,
        },
      ],
    });
    expect(findAll).toHaveBeenCalledWith(query);
    expect(getProductStatuses).toHaveBeenCalledWith([product]);
  });

  it('returns an active product by id', async () => {
    findActiveById.mockResolvedValue(product);

    await expect(service.findOne(product.id)).resolves.toEqual({
      success: true,
      data: {
        id: product.id,
        name: 'Lays Classic',
        category: 'Chips',
        imageUrl: 'https://storage.example.com/lays-classic.jpg',
        sellingPrice: 20,
        stock: 25,
        isLowStock: false,
        isOutOfStock: false,
      },
    });
    expect(findActiveById).toHaveBeenCalledWith(product.id);
    expect(getProductStatuses).toHaveBeenCalledWith([product]);
  });

  it('preserves the inventory-derived low and out-of-stock statuses', async () => {
    findAll.mockResolvedValue([product]);
    getProductStatuses.mockResolvedValue(
      new Map([
        [
          product.id,
          {
            isLowStock: true,
            isOutOfStock: true,
          },
        ],
      ]),
    );

    await expect(service.findAll({ archived: false })).resolves.toMatchObject({
      data: [
        {
          id: product.id,
          isLowStock: true,
          isOutOfStock: true,
        },
      ],
    });
  });

  it('returns 404 when no active product matches the id', async () => {
    findActiveById.mockResolvedValue(null);

    await expect(service.findOne(product.id)).rejects.toMatchObject(
      new NotFoundException({
        success: false,
        message: 'Product not found.',
      }),
    );
  });

  it('creates a product and returns its public response', async () => {
    const data: CreateProductDto = {
      name: 'Lays Classic',
      category: 'Chips',
      imageUrl: 'https://storage.example.com/lays-classic.jpg',
      sellingPrice: 20,
      costPrice: 15,
      stock: 25,
    };
    create.mockResolvedValue(product);

    await expect(service.create(data)).resolves.toMatchObject({
      success: true,
      data: {
        id: product.id,
        sellingPrice: 20,
        isLowStock: false,
        isOutOfStock: false,
      },
    });
    expect(create).toHaveBeenCalledWith(data);
  });

  it('updates an existing product', async () => {
    const data: UpdateProductDto = { sellingPrice: 25 };
    findById.mockResolvedValue(product);
    update.mockResolvedValue(product);

    await expect(service.update(product.id, data)).resolves.toMatchObject({
      success: true,
      data: {
        stock: 25,
        sellingPrice: 20,
        isLowStock: false,
        isOutOfStock: false,
      },
    });
    expect(update).toHaveBeenCalledWith(product.id, data);
  });

  it('returns 404 when an updated product does not exist', async () => {
    findById.mockResolvedValue(null);

    await expect(
      service.update(product.id, { category: 'Snacks' }),
    ).rejects.toMatchObject(
      new NotFoundException({
        success: false,
        message: 'Product not found.',
      }),
    );
    expect(update).not.toHaveBeenCalled();
  });

  it('archives an existing product without deleting it', async () => {
    findById.mockResolvedValue(product);
    archive.mockResolvedValue(product);

    await expect(service.archive(product.id)).resolves.toMatchObject({
      success: true,
      data: { id: product.id },
    });
    expect(archive).toHaveBeenCalledWith(product.id, expect.any(Date));
  });

  it('restores an existing product', async () => {
    findById.mockResolvedValue(product);
    restore.mockResolvedValue(product);

    await expect(service.restore(product.id)).resolves.toMatchObject({
      success: true,
      data: { id: product.id },
    });
    expect(restore).toHaveBeenCalledWith(product.id);
  });
});
