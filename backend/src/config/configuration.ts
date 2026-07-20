export interface ApplicationConfiguration {
  environment: string;
  port: number;
  frontendUrls: string[];
  databaseUrl: string;
  jwtSecret: string;
}

export interface Configuration {
  app: ApplicationConfiguration;
}

export const configuration = (): Configuration => ({
  app: {
    environment: process.env.NODE_ENV ?? 'development',
    port: Number(process.env.PORT ?? 3001),
    frontendUrls: (process.env.FRONTEND_URL ?? 'http://localhost:3000')
      .split(',')
      .map((url) => url.trim())
      .filter(Boolean),
    databaseUrl: process.env.DATABASE_URL ?? '',
    jwtSecret: process.env.JWT_SECRET ?? '',
  },
});
