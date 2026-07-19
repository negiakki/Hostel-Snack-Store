import { Test, TestingModule } from '@nestjs/testing';
import type { ProductQueryDto } from './dto/product-query.dto';
import type {
  CreateProductDto,
  UpdateProductDto,
} from './dto/product-write.dto';
import type {
  ProductResponseWrapperDto,
  ProductsResponseDto,
} from './dto/product-response.dto';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';

describe('ProductsController', () => {
  let controller: ProductsController;
  let service: jest.Mocked<ProductsService>;
  let findAll: jest.MockedFunction<ProductsService['findAll']>;
  let findOne: jest.MockedFunction<ProductsService['findOne']>;
  let create: jest.MockedFunction<ProductsService['create']>;
  let update: jest.MockedFunction<ProductsService['update']>;
  let archive: jest.MockedFunction<ProductsService['archive']>;
  let restore: jest.MockedFunction<ProductsService['restore']>;

  beforeEach(async () => {
    findAll = jest.fn();
    findOne = jest.fn();
    create = jest.fn();
    update = jest.fn();
    archive = jest.fn();
    restore = jest.fn();
    service = {
      findAll,
      findOne,
      create,
      update,
      archive,
      restore,
    } as jest.Mocked<ProductsService>;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        {
          provide: ProductsService,
          useValue: service,
        },
      ],
    }).compile();

    controller = module.get(ProductsController);
  });

  it('delegates a validated product-list query to the service', async () => {
    const query: ProductQueryDto = { archived: false, search: 'lays' };
    const response: ProductsResponseDto = { success: true, data: [] };
    findAll.mockResolvedValue(response);

    await expect(controller.findAll(query)).resolves.toBe(response);
    expect(findAll).toHaveBeenCalledWith(query);
  });

  it('delegates a validated product id to the service', async () => {
    const productId = '69d2b1d0-5ef6-4cf3-9d31-03e3af2d6c80';
    const response: ProductResponseWrapperDto = {
      success: true,
      data: {
        id: productId,
        name: 'Lays Classic',
        category: 'Chips',
        imageUrl: 'https://storage.example.com/lays-classic.jpg',
        sellingPrice: 20,
        stock: 25,
      },
    };
    findOne.mockResolvedValue(response);

    await expect(controller.findOne(productId)).resolves.toBe(response);
    expect(findOne).toHaveBeenCalledWith(productId);
  });

  it('delegates product creation to the service', async () => {
    const data: CreateProductDto = {
      name: 'Lays Classic',
      category: 'Chips',
      imageUrl: 'https://storage.example.com/lays-classic.jpg',
      sellingPrice: 20,
      costPrice: 15,
      stock: 25,
    };
    const response: ProductResponseWrapperDto = {
      success: true,
      data: {
        id: '69d2b1d0-5ef6-4cf3-9d31-03e3af2d6c80',
        name: data.name,
        category: data.category,
        imageUrl: data.imageUrl,
        sellingPrice: data.sellingPrice,
        stock: data.stock,
      },
    };
    create.mockResolvedValue(response);

    await expect(controller.create(data)).resolves.toBe(response);
    expect(create).toHaveBeenCalledWith(data);
  });

  it('delegates update, archive, and restore operations to the service', async () => {
    const productId = '69d2b1d0-5ef6-4cf3-9d31-03e3af2d6c80';
    const data: UpdateProductDto = { stock: 30 };
    const response: ProductResponseWrapperDto = {
      success: true,
      data: {
        id: productId,
        name: 'Lays Classic',
        category: 'Chips',
        imageUrl: 'https://storage.example.com/lays-classic.jpg',
        sellingPrice: 20,
        stock: 30,
      },
    };
    update.mockResolvedValue(response);
    archive.mockResolvedValue(response);
    restore.mockResolvedValue(response);

    await expect(controller.update(productId, data)).resolves.toBe(response);
    await expect(controller.archive(productId)).resolves.toBe(response);
    await expect(controller.restore(productId)).resolves.toBe(response);
    expect(update).toHaveBeenCalledWith(productId, data);
    expect(archive).toHaveBeenCalledWith(productId);
    expect(restore).toHaveBeenCalledWith(productId);
  });
});
