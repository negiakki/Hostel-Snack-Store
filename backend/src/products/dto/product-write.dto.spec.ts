import { BadRequestException } from '@nestjs/common';
import { CreateProductPipe, UpdateProductPipe } from './product-write.dto';

const validProduct = {
  name: 'Lays Classic',
  category: 'Chips',
  imageUrl: 'https://storage.example.com/lays-classic.jpg',
  sellingPrice: 20,
  costPrice: 15,
  stock: 25,
};

describe('CreateProductPipe', () => {
  const pipe = new CreateProductPipe();

  it('validates and normalizes a complete product payload', () => {
    expect(
      pipe.transform({
        ...validProduct,
        name: '  Lays Classic  ',
      }),
    ).toEqual(validProduct);
  });

  it('allows omitted initial stock so the database default is used', () => {
    const productWithoutStock = {
      name: validProduct.name,
      category: validProduct.category,
      imageUrl: validProduct.imageUrl,
      sellingPrice: validProduct.sellingPrice,
      costPrice: validProduct.costPrice,
    };

    expect(pipe.transform(productWithoutStock)).toEqual(productWithoutStock);
  });

  it.each([
    { ...validProduct, stock: -1 },
    { ...validProduct, costPrice: '15' },
    { ...validProduct, imageUrl: 'not-a-url' },
    { ...validProduct, unexpected: true },
    { name: validProduct.name },
  ])('rejects invalid product input: %o', (body) => {
    expect(() => pipe.transform(body)).toThrow(BadRequestException);
  });
});

describe('UpdateProductPipe', () => {
  const pipe = new UpdateProductPipe();

  it('validates only supplied fields', () => {
    expect(pipe.transform({ sellingPrice: 25 })).toEqual({
      sellingPrice: 25,
    });
  });

  it.each([{}, { stock: 1.5 }, { name: '   ' }])(
    'rejects an invalid partial update: %o',
    (body) => {
      expect(() => pipe.transform(body)).toThrow(BadRequestException);
    },
  );
});
