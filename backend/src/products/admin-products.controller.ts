import { Controller, Get, Query } from '@nestjs/common';
import { ProductQueryPipe } from './dto/product-query.dto';
import type { ProductQueryDto } from './dto/product-query.dto';
import type { ProductsResponseDto } from './dto/product-response.dto';
import { ProductsService } from './products.service';

@Controller('admin/products')
export class AdminProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  findAll(
    @Query(new ProductQueryPipe()) query: ProductQueryDto,
  ): Promise<ProductsResponseDto> {
    return this.productsService.findAll(query);
  }
}
