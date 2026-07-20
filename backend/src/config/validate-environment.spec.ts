import { validateEnvironment } from './validate-environment';

describe('validateEnvironment', () => {
  it('accepts a direct PostgreSQL connection URL', () => {
    expect(
      validateEnvironment({
        DATABASE_URL: 'postgresql://postgres:password@localhost:5432/store',
        JWT_SECRET: 'a-secure-test-secret-that-is-longer-than-32-characters',
        FRONTEND_URL: 'http://localhost:3000',
      }),
    ).toEqual({
      DATABASE_URL: 'postgresql://postgres:password@localhost:5432/store',
      JWT_SECRET: 'a-secure-test-secret-that-is-longer-than-32-characters',
      FRONTEND_URL: 'http://localhost:3000',
      PORT: 3001,
    });
  });

  it('rejects a Prisma Accelerate connection URL', () => {
    expect(() =>
      validateEnvironment({
        DATABASE_URL: 'prisma://accelerate.prisma-data.net/?api_key=test',
        JWT_SECRET: 'a-secure-test-secret-that-is-longer-than-32-characters',
        FRONTEND_URL: 'http://localhost:3000',
      }),
    ).toThrow(
      'DATABASE_URL must use a direct PostgreSQL connection URL (postgresql:// or postgres://). Prisma Accelerate URLs are not supported.',
    );
  });

  it('rejects a short JWT secret', () => {
    expect(() =>
      validateEnvironment({
        DATABASE_URL: 'postgresql://postgres:password@localhost:5432/store',
        JWT_SECRET: 'short-secret',
        FRONTEND_URL: 'http://localhost:3000',
      }),
    ).toThrow(
      'JWT_SECRET must be set to a cryptographically secure random string',
    );
  });

  it('requires HTTPS frontend origins in production', () => {
    expect(() =>
      validateEnvironment({
        NODE_ENV: 'production',
        DATABASE_URL: 'postgresql://postgres:password@localhost:5432/store',
        JWT_SECRET: 'a-secure-test-secret-that-is-longer-than-32-characters',
        FRONTEND_URL: 'http://localhost:3000',
      }),
    ).toThrow('Production origins must use HTTPS.');
  });

  it('rejects frontend URLs that include a path', () => {
    expect(() =>
      validateEnvironment({
        DATABASE_URL: 'postgresql://postgres:password@localhost:5432/store',
        JWT_SECRET: 'a-secure-test-secret-that-is-longer-than-32-characters',
        FRONTEND_URL: 'https://store.example.com/admin',
      }),
    ).toThrow('valid origins without paths');
  });
});
