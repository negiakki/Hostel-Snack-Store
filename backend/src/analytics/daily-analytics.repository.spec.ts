import { Prisma } from '@prisma/client';
import { DailyAnalyticsRepository } from './daily-analytics.repository';

describe('DailyAnalyticsRepository', () => {
  it('groups orders in the requested Asia/Kolkata business day', async () => {
    const findMany = jest.fn().mockResolvedValue([]);
    const client = {
      order: { findMany },
    } as unknown as Prisma.TransactionClient;
    const repository = new DailyAnalyticsRepository();

    await repository.findOrdersForBusinessDate(
      client,
      new Date('2026-07-20T00:00:00.000Z'),
    );

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          created_at: {
            gte: new Date('2026-07-19T18:30:00.000Z'),
            lt: new Date('2026-07-20T18:30:00.000Z'),
          },
        },
      }),
    );
  });
});
