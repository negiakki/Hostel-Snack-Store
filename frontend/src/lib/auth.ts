import { apiConfig } from "@/config/api";
import { adminFetch } from "@/lib/admin-api";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
}

interface AdminResponse {
  success: true;
  data: AdminUser;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isAdminUser(value: unknown): value is AdminUser {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.name === "string" &&
    typeof value.email === "string"
  );
}

function isAdminResponse(value: unknown): value is AdminResponse {
  return isRecord(value) && value.success === true && isAdminUser(value.data);
}

function errorMessage(payload: unknown, fallback: string): string {
  return isRecord(payload) &&
    payload.success === false &&
    typeof payload.message === "string"
    ? payload.message
    : fallback;
}

async function parseResponse(response: Response): Promise<unknown> {
  return response.json().catch(() => null);
}

export async function getAdminSession(): Promise<AdminUser> {
  const response = await adminFetch(`${apiConfig.baseUrl}/auth/session`, {
    cache: "no-store",
  });
  const payload = await parseResponse(response);

  if (!response.ok) {
    throw new Error(errorMessage(payload, "Your session has expired."));
  }

  if (!isAdminResponse(payload)) {
    throw new Error("The authentication service returned an invalid response.");
  }

  return payload.data;
}

export async function loginAdmin(
  email: string,
  password: string,
): Promise<AdminUser> {
  const response = await adminFetch(`${apiConfig.baseUrl}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const payload = await parseResponse(response);

  if (!response.ok) {
    throw new Error(errorMessage(payload, "Unable to sign in."));
  }

  if (!isAdminResponse(payload)) {
    throw new Error("The authentication service returned an invalid response.");
  }

  return payload.data;
}

export async function logoutAdmin(): Promise<void> {
  const response = await adminFetch(`${apiConfig.baseUrl}/auth/logout`, {
    method: "POST",
  });

  if (!response.ok) {
    throw new Error("Unable to sign out. Please try again.");
  }
}
