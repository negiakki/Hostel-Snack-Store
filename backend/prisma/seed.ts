import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

function requiredEnvironmentValue(name: string): string {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`${name} must be set before seeding the administrator.`);
  }

  return value;
}

async function main(): Promise<void> {
  const existingAdministrator = await prisma.adminUser.findFirst({
    select: { id: true },
  });

  if (existingAdministrator) {
    return;
  }

  const name = requiredEnvironmentValue('ADMIN_NAME');
  const email = requiredEnvironmentValue('ADMIN_EMAIL').toLowerCase();
  const password = requiredEnvironmentValue('ADMIN_PASSWORD');
  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.adminUser.create({
    data: {
      name,
      email,
      password_hash: passwordHash,
    },
  });
}

void main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
