import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { UpdateStoreStatusDto } from './dto/store-status-write.dto';

const STORE_SETTINGS_ID = 1;

const storeSettingsSelect = {
  is_open: true,
  message: true,
} satisfies Prisma.StoreSettingsSelect;

export type StoreSettingsRecord = Prisma.StoreSettingsGetPayload<{
  select: typeof storeSettingsSelect;
}>;

@Injectable()
export class StoreStatusRepository {
  constructor(private readonly prisma: PrismaService) {}

  findOrCreate(
    transaction?: Prisma.TransactionClient,
  ): Promise<StoreSettingsRecord> {
    const client = transaction ?? this.prisma;

    return client.storeSettings.upsert({
      where: { id: STORE_SETTINGS_ID },
      create: { id: STORE_SETTINGS_ID },
      update: {},
      select: storeSettingsSelect,
    });
  }

  update(data: UpdateStoreStatusDto): Promise<StoreSettingsRecord> {
    return this.prisma.storeSettings.upsert({
      where: { id: STORE_SETTINGS_ID },
      create: {
        id: STORE_SETTINGS_ID,
        is_open: data.isOpen,
        message: data.message ?? '',
      },
      update: {
        is_open: data.isOpen,
        ...(data.message !== undefined ? { message: data.message } : {}),
      },
      select: storeSettingsSelect,
    });
  }
}
