import { apiConfig } from "@/config/api";

export interface BackendHealth {
  status: "online" | "unavailable";
  checkedAt: string;
}

interface HealthResponse {
  success: true;
  data: {
    status: "ok";
    service: "backend";
    timestamp: string;
  };
}

function isHealthResponse(value: unknown): value is HealthResponse {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const response = value as Record<string, unknown>;
  const data = response.data;

  return (
    response.success === true &&
    typeof data === "object" &&
    data !== null &&
    (data as Record<string, unknown>).status === "ok" &&
    (data as Record<string, unknown>).service === "backend" &&
    typeof (data as Record<string, unknown>).timestamp === "string"
  );
}

export async function getBackendHealth(): Promise<BackendHealth> {
  try {
    const response = await fetch(`${apiConfig.baseUrl}/health`, {
      cache: "no-store",
    });
    const payload: unknown = await response.json();

    if (!response.ok || !isHealthResponse(payload)) {
      return {
        status: "unavailable",
        checkedAt: new Date().toISOString(),
      };
    }

    return {
      status: "online",
      checkedAt: payload.data.timestamp,
    };
  } catch {
    return {
      status: "unavailable",
      checkedAt: new Date().toISOString(),
    };
  }
}
