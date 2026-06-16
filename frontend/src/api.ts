import type { Order, OrderRequestPayload, OrderStatus } from "./types";

const API_BASE = "/api/v1";
const TOKEN_KEY = "taxi_admin_token";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  if (!headers.has("Content-Type") && options.body && typeof options.body === "string") {
    headers.set("Content-Type", "application/json");
  }

  const token = getToken();
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (response.status === 401) {
    clearToken();
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Ошибка запроса" }));
    const detail = error.detail;
    const message =
      typeof detail === "string"
        ? detail
        : Array.isArray(detail)
          ? detail.map((item: { msg?: string }) => item.msg).join(", ")
          : "Ошибка запроса";
    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export async function submitOrderRequest(
  payload: OrderRequestPayload,
): Promise<Order> {
  return request<Order>("/orders", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// --- Admin ---

export async function adminLogin(
  email: string,
  password: string,
): Promise<void> {
  const body = new URLSearchParams();
  body.set("username", email);
  body.set("password", password);

  const data = await request<{ access_token: string }>("/admin/login", {
    method: "POST",
    body,
  });
  setToken(data.access_token);
}

export interface AdminUser {
  id: number;
  email: string;
  full_name: string | null;
  role: string;
}

export async function adminMe(): Promise<AdminUser> {
  return request<AdminUser>("/admin/me");
}

export async function adminGetOrders(status?: OrderStatus): Promise<Order[]> {
  const query = status ? `?status=${status}` : "";
  return request<Order[]>(`/admin/orders${query}`);
}

export async function adminUpdateOrderStatus(
  orderId: number,
  status: OrderStatus,
): Promise<Order> {
  return request<Order>(`/admin/orders/${orderId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}
