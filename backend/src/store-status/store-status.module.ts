import { Module } from '@nestjs/common';
import { StoreStatusController } from './store-status.controller';
import { StoreStatusRepository } from './store-status.repository';
import { StoreStatusService } from './store-status.service';

@Module({
  controllers: [StoreStatusController],
  providers: [StoreStatusRepository, StoreStatusService],
  exports: [StoreStatusService],
})
export class StoreStatusModule {}
