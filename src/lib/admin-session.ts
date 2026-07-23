import "server-only";
import { cookies } from "next/headers";

export const ACCESS_COOKIE = "admin_access";
export const REFRESH_COOKIE = "admin_refresh";
export const ENROLLMENT_COOKIE = "admin_enrollment";
export const MFA_COOKIE = "admin_mfa";
export const PASSWORD_CHANGE_COOKIE = "admin_password_change";
export const REFRESH_MAX_AGE_SECONDS = 12 * 60 * 60;

export type AdminRole =
  | "super_admin"
  | "admin"
  | "support"
  | "hr"
  | "social_media"
  | "viewer";

export interface AdminAccessPayload {
  sub: string;
  email: string;
  role?: AdminRole;
  scope: string;
  exp: number;
}

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  path: "/",
};

export function decodeJwtPayload<T>(token: string): T | null {
  try {
    const [, payload] = token.split(".");
    const json = Buffer.from(payload, "base64url").toString("utf8");
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
}

export function isExpired(payload: { exp: number } | null, skewSeconds = 10) {
  if (!payload) {
    return true;
  }
  return payload.exp * 1000 <= Date.now() + skewSeconds * 1000;
}

export async function getAccessToken(): Promise<string | null> {
  const store = await cookies();
  return store.get(ACCESS_COOKIE)?.value ?? null;
}

export async function getRefreshToken(): Promise<string | null> {
  const store = await cookies();
  return store.get(REFRESH_COOKIE)?.value ?? null;
}

export async function getSession(): Promise<AdminAccessPayload | null> {
  const token = await getAccessToken();
  if (!token) {
    return null;
  }
  const payload = decodeJwtPayload<AdminAccessPayload>(token);
  if (!payload || isExpired(payload)) {
    return null;
  }
  return payload;
}

export async function setSessionCookies(
  accessToken: string,
  refreshToken: string,
  refreshMaxAgeSeconds: number,
) {
  const store = await cookies();
  const accessPayload = decodeJwtPayload<AdminAccessPayload>(accessToken);
  const accessMaxAge = accessPayload
    ? Math.max(accessPayload.exp - Math.floor(Date.now() / 1000), 60)
    : 15 * 60;
  store.set(ACCESS_COOKIE, accessToken, {
    ...cookieOptions,
    maxAge: accessMaxAge,
  });
  store.set(REFRESH_COOKIE, refreshToken, {
    ...cookieOptions,
    maxAge: refreshMaxAgeSeconds,
  });
}

export async function clearSessionCookies() {
  const store = await cookies();
  store.delete(ACCESS_COOKIE);
  store.delete(REFRESH_COOKIE);
}

export async function setShortLivedCookie(name: string, value: string) {
  const store = await cookies();
  store.set(name, value, { ...cookieOptions, maxAge: 15 * 60 });
}

export async function getShortLivedCookie(
  name: string,
): Promise<string | null> {
  const store = await cookies();
  return store.get(name)?.value ?? null;
}

export async function clearShortLivedCookie(name: string) {
  const store = await cookies();
  store.delete(name);
}
