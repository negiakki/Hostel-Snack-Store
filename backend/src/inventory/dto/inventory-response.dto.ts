export interface InventoryResponseDataDto {
  productId: string;
  stock: number;
  lowStockThreshold: number;
  isLowStock: boolean;
  isOutOfStock: boolean;
}

export interface InventoryResponseDto {
  success: true;
  data: InventoryResponseDataDto;
}

export interface InventoryProductDto extends InventoryResponseDataDto {
  id: string;
  name: string;
  category: string;
  sellingPrice: number;
}

export interface InventoryProductsResponseDto {
  success: true;
  data: InventoryProductDto[];
}
