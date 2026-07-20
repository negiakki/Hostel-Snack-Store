import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { PrismaService } from '../database/prisma.service';

describe('AuthService', () => {
  const password = 'a strong password';
  const passwordHash = bcrypt.hashSync(password, 4);
  let findUnique: jest.Mock;
  let signAsync: jest.Mock;
  let service: AuthService;

  beforeEach(() => {
    findUnique = jest.fn();
    signAsync = jest.fn().mockResolvedValue('signed-token');
    service = new AuthService(
      { adminUser: { findUnique } } as unknown as PrismaService,
      { signAsync } as unknown as JwtService,
    );
  });

  it('verifies bcrypt credentials and signs a JWT without returning the hash', async () => {
    findUnique.mockResolvedValue({
      id: '8c474ed5-272f-45fe-959e-faf7cc4d2ae8',
      name: 'Store Admin',
      email: 'admin@example.com',
      password_hash: passwordHash,
    });

    await expect(
      service.login({ email: 'admin@example.com', password }),
    ).resolves.toEqual({
      admin: {
        id: '8c474ed5-272f-45fe-959e-faf7cc4d2ae8',
        name: 'Store Admin',
        email: 'admin@example.com',
      },
      token: 'signed-token',
    });

    expect(signAsync).toHaveBeenCalledWith(
      {
        sub: '8c474ed5-272f-45fe-959e-faf7cc4d2ae8',
        email: 'admin@example.com',
      },
      expect.objectContaining({ expiresIn: 28800 }),
    );
  });

  it('rejects unknown accounts and invalid passwords with the same response', async () => {
    findUnique.mockResolvedValue(null);

    await expect(
      service.login({ email: 'missing@example.com', password }),
    ).rejects.toMatchObject({
      response: { message: 'Invalid email or password.' },
    });

    findUnique.mockResolvedValue({
      id: '8c474ed5-272f-45fe-959e-faf7cc4d2ae8',
      name: 'Store Admin',
      email: 'admin@example.com',
      password_hash: passwordHash,
    });

    await expect(
      service.login({ email: 'admin@example.com', password: 'incorrect' }),
    ).rejects.toMatchObject({
      response: { message: 'Invalid email or password.' },
    });
  });

  it('rejects a token whose administrator no longer exists', async () => {
    findUnique.mockResolvedValue(null);

    await expect(
      service.validateSession({
        sub: '8c474ed5-272f-45fe-959e-faf7cc4d2ae8',
        email: 'admin@example.com',
      }),
    ).rejects.toMatchObject({
      response: { message: 'Authentication is required.' },
    });
  });
});
