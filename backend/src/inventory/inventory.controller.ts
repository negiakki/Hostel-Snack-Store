import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import type {
  InventoryProductsResponseDto,
  InventoryResponseDto,
} from './dto/inventory-response.dto';
import type { AdjustStockDto, SetStockDto } from './dto/inventory-write.dto';
import { AdjustStockPipe, SetStockPipe } from './dto/inventory-write.dto';
import { InventoryService } from './inventory.service';
import { UuidValidationPipe } from '../products/pipes/uuid-validation.pipe';

@Controller('inventory/products')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get()
  findAll(): Promise<InventoryProductsResponseDto> {
    return this.inventoryService.findAll();
  }

  @Post(':id/add-stock')
  addStock(
    @Param('id', new UuidValidationPipe()) id: string,
    @Body(new AdjustStockPipe()) data: AdjustStockDto,
  ): Promise<InventoryResponseDto> {
    return this.inventoryService.addStock(id, data);
  }

  @Post(':id/remove-stock')
  removeStock(
    @Param('id', new UuidValidationPipe()) id: string,
    @Body(new AdjustStockPipe()) data: AdjustStockDto,
  ): Promise<InventoryResponseDto> {
    return this.inventoryService.removeStock(id, data);
  }

  @Put(':id/stock')
  setStock(
    @Param('id', new UuidValidationPipe()) id: string,
    @Body(new SetStockPipe()) data: SetStockDto,
  ): Promise<InventoryResponseDto> {
    return this.inventoryService.setStock(id, data);
  }
}
