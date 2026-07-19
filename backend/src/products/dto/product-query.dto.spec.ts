import { BadRequestException } from '@nestjs/common';
import { ProductQueryPipe } from './product-query.dto';

describe('ProductQueryPipe', () => {
  const pipe = new ProductQueryPipe();

  it('defaults archived to false and trims valid filters', () => {
    expect(
      pipe.transform({
        search: '  lays  ',
        category: '  Chips  ',
      }),
    ).toEqual({
      search: 'lays',
      category: 'Chips',
      archived: false,
    });
  });

  it('accepts archived=true as an explicit archived-product filter', () => {
    expect(pipe.transform({ archived: 'true' })).toEqual({
      archived: true,
      search: undefined,
      category: undefined,
    });
  });

  it.each([{ archived: 'yes' }, { search: ['lays'] }, { category: '   ' }])(
    'rejects invalid query values: %o',
    (query) => {
      expect(() => pipe.transform(query)).toThrow(BadRequestException);
    },
  );
});
