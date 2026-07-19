const DEFAULT_PORT = 3001;

export function validateEnvironment(config: Record<string, unknown>) {
  const databaseUrl = config.DATABASE_URL;

  if (typeof databaseUrl !== 'string' || databaseUrl.trim() === '') {
    throw new Error(
      'DATABASE_URL must be set. Copy .env.example to .env first.',
    );
  }

  let databaseProtocol: string;

  try {
    databaseProtocol = new URL(databaseUrl).protocol;
  } catch {
    throw new Error('DATABASE_URL must be a valid PostgreSQL connection URL.');
  }

  if (!['postgres:', 'postgresql:'].includes(databaseProtocol)) {
    throw new Error(
      'DATABASE_URL must use a direct PostgreSQL connection URL (postgresql:// or postgres://). Prisma Accelerate URLs are not supported.',
    );
  }

  const configuredPort = config.PORT ?? DEFAULT_PORT;
  const port = Number(configuredPort);

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('PORT must be an integer between 1 and 65535.');
  }

  return {
    ...config,
    PORT: port,
  };
}
