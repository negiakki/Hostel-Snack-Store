import { BadRequestException } from '@nestjs/common';
import { AdjustStockPipe, SetStockPipe } from './inventory-write.dto';

describe('AdjustStockPipe', () => {
  const pipe = new AdjustStockPipe();

  it('accepts a positive whole-number quantity', () => {
    expect(pipe.transform({ quantity: 3 })).toEqual({ quantity: 3 });
  });

  it.each([
    { quantity: 0 },
    { quantity: -1 },
    { quantity: 1.5 },
    { quantity: '3' },
    { stock: 3 },
    { quantity: 3, unexpected: true },
  ])('rejects invalid stock adjustments: %o', (body) => {
    expect(() => pipe.transform(body)).toThrow(BadRequestException);
  });
});

describe('SetStockPipe', () => {
  const pipe = new SetStockPipe();

  it('accepts zero and non-negative whole-number stock values', () => {
    expect(pipe.transform({ stock: 0 })).toEqual({ stock: 0 });
    expect(pipe.transform({ stock: 3 })).toEqual({ stock: 3 });
  });

  it.each([{ stock: -1 }, { stock: 1.5 }, { quantity: 3 }])(
    'rejects an invalid set-stock request: %o',
    (body) => {
      expect(() => pipe.transform(body)).toThrow(BadRequestException);
    },
  );
});
