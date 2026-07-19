import { validateEnvironment } from './validate-environment';

describe('validateEnvironment', () => {
  it('accepts a direct PostgreSQL connection URL', () => {
    expect(
      validateEnvironment({
        DATABASE_URL: 'postgresql://postgres:password@localhost:5432/store',
      }),
    ).toEqual({
      DATABASE_URL: 'postgresql://postgres:password@localhost:5432/store',
      PORT: 3001,
    });
  });

  it('rejects a Prisma Accelerate connection URL', () => {
    expect(() =>
      validateEnvironment({
        DATABASE_URL: 'prisma://accelerate.prisma-data.net/?api_key=test',
      }),
    ).toThrow(
      'DATABASE_URL must use a direct PostgreSQL connection URL (postgresql:// or postgres://). Prisma Accelerate URLs are not supported.',
    );
  });
});
