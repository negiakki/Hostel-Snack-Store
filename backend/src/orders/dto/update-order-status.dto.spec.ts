import { BadRequestException } from '@nestjs/common';
import { OrderIdPipe, UpdateOrderStatusPipe } from './update-order-status.dto';

describe('UpdateOrderStatusPipe', () => {
  const pipe = new UpdateOrderStatusPipe();

  it.each(['Placed', 'Ready', 'Completed'])(
    'accepts the documented %s status',
    (status) => {
      expect(pipe.transform({ status })).toEqual({ status });
    },
  );

  it.each([
    {},
    { status: 'Preparing' },
    { status: 'Completed', extra: true },
    { status: 1 },
  ])('rejects an invalid status body', (value) => {
    expect(() => pipe.transform(value)).toThrow(
      new BadRequestException({ success: false, message: 'Invalid request.' }),
    );
  });
});

describe('OrderIdPipe', () => {
  const pipe = new OrderIdPipe();

  it('accepts an order UUID', () => {
    expect(pipe.transform('f352bdf4-a211-43df-a0a5-8fe11fe0f6f8')).toBe(
      'f352bdf4-a211-43df-a0a5-8fe11fe0f6f8',
    );
  });

  it('rejects an invalid order UUID with the API error shape', () => {
    expect(() => pipe.transform('not-an-order-id')).toThrow(
      new BadRequestException({ success: false, message: 'Invalid request.' }),
    );
  });
});
