const DEFAULT_API_BASE_URL = "http://localhost:3001/api/v1";
const configuredApiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!configuredApiBaseUrl && process.env.NODE_ENV === "production") {
  throw new Error(
    "NEXT_PUBLIC_API_BASE_URL must be set for a production frontend build.",
  );
}

export const apiConfig = {
  baseUrl: (configuredApiBaseUrl ?? DEFAULT_API_BASE_URL).replace(/\/$/, ""),
};
