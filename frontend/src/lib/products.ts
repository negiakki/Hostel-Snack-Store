import { apiConfig } from "@/config/api";
import { adminFetch } from "@/lib/admin-api";

export interface Product {
  id: string;
  name: string;
  category: string;
  imageUrl: string;
  sellingPrice: number;
  stock: number;
  isLowStock: boolean;
  isOutOfStock: boolean;
}

export interface CreateProductInput {
  name: string;
  category: string;
  imageUrl: string;
  sellingPrice: number;
  costPrice: number;
  stock: number;
}

export interface UpdateProductInput {
  name?: string;
  category?: string;
  imageUrl?: string;
  sellingPrice?: number;
  costPrice?: number;
}

interface ProductsResponse {
  success: true;
  data: Product[];
}

interface ProductResponse {
  success: true;
  data: Product;
}

interface ApiErrorResponse {
  success: false;
  message: string;
}

export interface ProductFilters {
  search?: string;
  category?: string;
  archived?: boolean;
}

function isApiError(value: unknown): value is ApiErrorResponse {
  return (
    typeof value === "object" &&
    value !== null &&
    (value as Record<string, unknown>).success === false &&
    typeof (value as Record<string, unknown>).message === "string"
  );
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  authenticated = false,
): Promise<T> {
  const requestOptions = {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  };
  const response = authenticated
    ? await adminFetch(apiConfig.baseUrl + path, requestOptions)
    : await fetch(apiConfig.baseUrl + path, requestOptions);
  const payload: unknown = await response.json();

  if (!response.ok) {
    throw new Error(
      isApiError(payload) ? payload.message : "Unable to complete the request.",
    );
  }

  return payload as T;
}

export async function getProducts(
  filters: ProductFilters,
  signal?: AbortSignal,
): Promise<Product[]> {
  const query = new URLSearchParams();

  if (filters.search) {
    query.set("search", filters.search);
  }

  if (filters.category) {
    query.set("category", filters.category);
  }

  query.set("archived", String(filters.archived ?? false));
  const queryString = query.toString();
  const path = "/products" + (queryString ? "?" + queryString : "");
  const response = await request<ProductsResponse>(path, { signal });

  return response.data;
}

export async function getAdminProducts(
  filters: ProductFilters,
  signal?: AbortSignal,
): Promise<Product[]> {
  const query = new URLSearchParams();

  if (filters.search) {
    query.set("search", filters.search);
  }

  if (filters.category) {
    query.set("category", filters.category);
  }

  query.set("archived", String(filters.archived ?? false));
  const queryString = query.toString();
  const path = "/admin/products" + (queryString ? "?" + queryString : "");
  const response = await request<ProductsResponse>(path, { signal }, true);

  return response.data;
}

export async function createProduct(
  input: CreateProductInput,
): Promise<Product> {
  const response = await request<ProductResponse>("/products", {
    method: "POST",
    body: JSON.stringify(input),
  }, true);

  return response.data;
}

export async function updateProduct(
  id: string,
  input: UpdateProductInput,
): Promise<Product> {
  const response = await request<ProductResponse>("/products/" + id, {
    method: "PATCH",
    body: JSON.stringify(input),
  }, true);

  return response.data;
}

export async function archiveProduct(id: string): Promise<Product> {
  const response = await request<ProductResponse>("/products/" + id, {
    method: "DELETE",
  }, true);

  return response.data;
}

export async function restoreProduct(id: string): Promise<Product> {
  const response = await request<ProductResponse>(
    "/products/" + id + "/restore",
    {
      method: "PATCH",
    },
    true,
  );

  return response.data;
}
