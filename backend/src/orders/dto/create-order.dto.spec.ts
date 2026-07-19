import { BadRequestException } from '@nestjs/common';
import { CreateOrderPipe } from './create-order.dto';

const productId = '69d2b1d0-5ef6-4cf3-9d31-03e3af2d6c80';

describe('CreateOrderPipe', () => {
  const pipe = new CreateOrderPipe();

  it('parses only the supported client fields', () => {
    expect(
      pipe.transform({
        customerName: '  Akshat  ',
        items: [{ productId, quantity: 2 }],
      }),
    ).toEqual({
      customerName: 'Akshat',
      items: [{ productId, quantity: 2 }],
    });
  });

  it.each([
    { customerName: 'Akshat', items: [{ productId, quantity: 0 }] },
    { customerName: 'Akshat', items: [{ productId, quantity: 1.5 }] },
    { customerName: '', items: [{ productId, quantity: 1 }] },
    { customerName: 'Akshat', items: [{ productId, quantity: 1 }], total: 20 },
    {
      customerName: 'Akshat',
      items: [
        { productId, quantity: 1 },
        { productId, quantity: 1 },
      ],
    },
  ])('rejects an invalid request body', (value) => {
    expect(() => pipe.transform(value)).toThrow(
      new BadRequestException({
        success: false,
        message: 'Invalid request.',
      }),
    );
  });
});
