import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ProductQueryPipe } from './dto/product-query.dto';
import type { ProductQueryDto } from './dto/product-query.dto';
import { CreateProductPipe, UpdateProductPipe } from './dto/product-write.dto';
import type {
  CreateProductDto,
  UpdateProductDto,
} from './dto/product-write.dto';
import {
  ProductResponseWrapperDto,
  ProductsResponseDto,
} from './dto/product-response.dto';
import { UuidValidationPipe } from './pipes/uuid-validation.pipe';
import { ProductsService } from './products.service';
import { Public } from '../auth/public.decorator';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @Public()
  findAll(
    @Query(new ProductQueryPipe()) query: ProductQueryDto,
  ): Promise<ProductsResponseDto> {
    return this.productsService.findAll({ ...query, archived: false });
  }

  @Get(':id')
  @Public()
  findOne(
    @Param('id', new UuidValidationPipe()) id: string,
  ): Promise<ProductResponseWrapperDto> {
    return this.productsService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body(new CreateProductPipe()) data: CreateProductDto,
  ): Promise<ProductResponseWrapperDto> {
    return this.productsService.create(data);
  }

  @Patch(':id')
  update(
    @Param('id', new UuidValidationPipe()) id: string,
    @Body(new UpdateProductPipe()) data: UpdateProductDto,
  ): Promise<ProductResponseWrapperDto> {
    return this.productsService.update(id, data);
  }

  @Delete(':id')
  archive(
    @Param('id', new UuidValidationPipe()) id: string,
  ): Promise<ProductResponseWrapperDto> {
    return this.productsService.archive(id);
  }

  @Patch(':id/restore')
  restore(
    @Param('id', new UuidValidationPipe()) id: string,
  ): Promise<ProductResponseWrapperDto> {
    return this.productsService.restore(id);
  }
}
