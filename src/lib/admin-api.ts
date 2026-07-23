import "server-only";
import { getAccessToken } from "./admin-session";

const BASE_URL = process.env.ADMIN_API_BASE_URL ?? "http://127.0.0.1:3000";

export class AdminApiError extends Error {
  constructor(
    public readonly errorCode: string,
    public readonly status: number,
  ) {
    super(errorCode);
  }
}

async function parseError(response: Response): Promise<never> {
  let errorCode = "HTTP_ERROR";
  try {
    const body = (await response.json()) as { error_code?: string };
    if (body.error_code) {
      errorCode = body.error_code;
    }
  } catch {
    // ignore body parse failure
  }
  throw new AdminApiError(errorCode, response.status);
}

export async function adminApiPublic<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
    cache: "no-store",
  });
  if (!response.ok) {
    await parseError(response);
  }
  if (response.status === 204) {
    return undefined as T;
  }
  return (await response.json()) as T;
}

export async function adminApiForm<T>(
  path: string,
  method: string,
  formData: FormData,
): Promise<T> {
  const token = await getAccessToken();
  if (!token) {
    throw new AdminApiError("ADMIN_SESSION_EXPIRED", 401);
  }
  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
    cache: "no-store",
  });
  if (!response.ok) {
    await parseError(response);
  }
  return (await response.json()) as T;
}

export async function adminApi<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const token = await getAccessToken();
  if (!token) {
    throw new AdminApiError("ADMIN_SESSION_EXPIRED", 401);
  }
  const response = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...init?.headers,
    },
    cache: "no-store",
  });
  if (!response.ok) {
    await parseError(response);
  }
  if (response.status === 204) {
    return undefined as T;
  }
  return (await response.json()) as T;
}
