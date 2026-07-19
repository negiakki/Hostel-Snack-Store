export interface ApplicationConfiguration {
  environment: string;
  port: number;
  frontendUrl: string;
  databaseUrl: string;
}

export interface Configuration {
  app: ApplicationConfiguration;
}

export const configuration = (): Configuration => ({
  app: {
    environment: process.env.NODE_ENV ?? 'development',
    port: Number(process.env.PORT ?? 3001),
    frontendUrl: process.env.FRONTEND_URL ?? 'http://localhost:3000',
    databaseUrl: process.env.DATABASE_URL ?? '',
  },
});
