import { Body, Controller, Get, Put } from '@nestjs/common';
import type { StoreStatusResponseDto } from './dto/store-status-response.dto';
import type { UpdateStoreStatusDto } from './dto/store-status-write.dto';
import { UpdateStoreStatusPipe } from './dto/store-status-write.dto';
import { StoreStatusService } from './store-status.service';
import { Public } from '../auth/public.decorator';

@Controller('store-status')
export class StoreStatusController {
  constructor(private readonly storeStatusService: StoreStatusService) {}

  @Get()
  @Public()
  getStatus(): Promise<StoreStatusResponseDto> {
    return this.storeStatusService.getStatus();
  }

  @Put()
  updateStatus(
    @Body(new UpdateStoreStatusPipe()) data: UpdateStoreStatusDto,
  ): Promise<StoreStatusResponseDto> {
    return this.storeStatusService.updateStatus(data);
  }
}
