export interface ProductResponseDto {
  id: string;
  name: string;
  category: string;
  imageUrl: string;
  sellingPrice: number;
  stock: number;
  isLowStock: boolean;
  isOutOfStock: boolean;
}

export interface ProductsResponseDto {
  success: true;
  data: ProductResponseDto[];
}

export interface ProductResponseWrapperDto {
  success: true;
  data: ProductResponseDto;
}
