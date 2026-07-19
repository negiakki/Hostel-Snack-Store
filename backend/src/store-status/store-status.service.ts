import { Injectable } from '@nestjs/common';
import { StoreStatusResponseDto } from './dto/store-status-response.dto';
import { UpdateStoreStatusDto } from './dto/store-status-write.dto';
import {
  StoreSettingsRecord,
  StoreStatusRepository,
} from './store-status.repository';

@Injectable()
export class StoreStatusService {
  constructor(private readonly storeStatusRepository: StoreStatusRepository) {}

  async getStatus(): Promise<StoreStatusResponseDto> {
    const settings = await this.storeStatusRepository.findOrCreate();

    return this.toResponse(settings);
  }

  async updateStatus(
    data: UpdateStoreStatusDto,
  ): Promise<StoreStatusResponseDto> {
    const settings = await this.storeStatusRepository.update(data);

    return this.toResponse(settings);
  }

  private toResponse(settings: StoreSettingsRecord): StoreStatusResponseDto {
    return {
      isOpen: settings.is_open,
      message: settings.message,
    };
  }
}
