import { BadRequestException } from '@nestjs/common';
import { UuidValidationPipe } from './uuid-validation.pipe';

describe('UuidValidationPipe', () => {
  const pipe = new UuidValidationPipe();

  it('returns a valid UUID', () => {
    expect(pipe.transform('69d2b1d0-5ef6-4cf3-9d31-03e3af2d6c80')).toBe(
      '69d2b1d0-5ef6-4cf3-9d31-03e3af2d6c80',
    );
  });

  it('returns a 400 error for an invalid UUID', () => {
    expect(() => pipe.transform('not-a-uuid')).toThrow(BadRequestException);
  });
});
