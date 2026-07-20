export interface StoreStatusDto {
  isOpen: boolean;
  message: string;
}

export interface StoreStatusResponseDto {
  success: true;
  data: StoreStatusDto;
}
