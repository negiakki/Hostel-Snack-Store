const DEFAULT_API_BASE_URL = "http://localhost:3001/api/v1";

export const apiConfig = {
  baseUrl: (process.env.API_BASE_URL ?? DEFAULT_API_BASE_URL).replace(
    /\/$/,
    "",
  ),
};
