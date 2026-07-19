import { Test, TestingModule } from '@nestjs/testing';
import type { InventoryResponseDto } from './dto/inventory-response.dto';
import type { AdjustStockDto, SetStockDto } from './dto/inventory-write.dto';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';

describe('InventoryController', () => {
  let controller: InventoryController;
  let service: jest.Mocked<InventoryService>;
  let addStock: jest.MockedFunction<InventoryService['addStock']>;
  let removeStock: jest.MockedFunction<InventoryService['removeStock']>;
  let setStock: jest.MockedFunction<InventoryService['setStock']>;

  beforeEach(async () => {
    addStock = jest.fn();
    removeStock = jest.fn();
    setStock = jest.fn();
    service = {
      addStock,
      removeStock,
      setStock,
    } as jest.Mocked<InventoryService>;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [InventoryController],
      providers: [{ provide: InventoryService, useValue: service }],
    }).compile();

    controller = module.get(InventoryController);
  });

  it('delegates add, remove, and set inventory operations', async () => {
    const productId = '69d2b1d0-5ef6-4cf3-9d31-03e3af2d6c80';
    const response: InventoryResponseDto = {
      success: true,
      data: {
        productId,
        stock: 3,
        lowStockThreshold: 2,
        isLowStock: false,
        isOutOfStock: false,
      },
    };
    const adjustment: AdjustStockDto = { quantity: 2 };
    const setStockData: SetStockDto = { stock: 3 };
    addStock.mockResolvedValue(response);
    removeStock.mockResolvedValue(response);
    setStock.mockResolvedValue(response);

    await expect(controller.addStock(productId, adjustment)).resolves.toBe(
      response,
    );
    await expect(controller.removeStock(productId, adjustment)).resolves.toBe(
      response,
    );
    await expect(controller.setStock(productId, setStockData)).resolves.toBe(
      response,
    );

    expect(addStock).toHaveBeenCalledWith(productId, adjustment);
    expect(removeStock).toHaveBeenCalledWith(productId, adjustment);
    expect(setStock).toHaveBeenCalledWith(productId, setStockData);
  });
});
