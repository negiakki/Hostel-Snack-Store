import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { ProductQueryDto } from './dto/product-query.dto';
import { CreateProductDto, UpdateProductDto } from './dto/product-write.dto';

const productSelect = {
  id: true,
  name: true,
  category: true,
  image_url: true,
  selling_price: true,
  stock: true,
} satisfies Prisma.ProductSelect;

export type ProductRecord = Prisma.ProductGetPayload<{
  select: typeof productSelect;
}>;

@Injectable()
export class ProductsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll(query: ProductQueryDto): Promise<ProductRecord[]> {
    const where: Prisma.ProductWhereInput = {
      is_archived: query.archived,
      ...(query.search
        ? {
            name: {
              contains: query.search,
              mode: 'insensitive',
            },
          }
        : {}),
      ...(query.category
        ? {
            category: {
              equals: query.category,
              mode: 'insensitive',
            },
          }
        : {}),
    };

    return this.prisma.product.findMany({
      where,
      orderBy: {
        name: 'asc',
      },
      select: productSelect,
    });
  }

  findActiveById(id: string): Promise<ProductRecord | null> {
    return this.prisma.product.findFirst({
      where: {
        id,
        is_archived: false,
      },
      select: productSelect,
    });
  }

  findById(id: string): Promise<ProductRecord | null> {
    return this.prisma.product.findUnique({
      where: {
        id,
      },
      select: productSelect,
    });
  }

  create(data: CreateProductDto): Promise<ProductRecord> {
    return this.prisma.product.create({
      data: {
        name: data.name,
        category: data.category,
        image_url: data.imageUrl,
        selling_price: data.sellingPrice,
        cost_price: data.costPrice,
        stock: data.stock,
      },
      select: productSelect,
    });
  }

  update(id: string, data: UpdateProductDto): Promise<ProductRecord> {
    return this.prisma.product.update({
      where: {
        id,
      },
      data: {
        ...(data.name !== undefined ? { name: data.name } : {}),
        ...(data.category !== undefined ? { category: data.category } : {}),
        ...(data.imageUrl !== undefined ? { image_url: data.imageUrl } : {}),
        ...(data.sellingPrice !== undefined
          ? { selling_price: data.sellingPrice }
          : {}),
        ...(data.costPrice !== undefined ? { cost_price: data.costPrice } : {}),
        ...(data.stock !== undefined ? { stock: data.stock } : {}),
      },
      select: productSelect,
    });
  }

  archive(id: string, archivedAt: Date): Promise<ProductRecord> {
    return this.prisma.product.update({
      where: {
        id,
      },
      data: {
        is_archived: true,
        archived_at: archivedAt,
      },
      select: productSelect,
    });
  }

  restore(id: string): Promise<ProductRecord> {
    return this.prisma.product.update({
      where: {
        id,
      },
      data: {
        is_archived: false,
        archived_at: null,
      },
      select: productSelect,
    });
  }
}
