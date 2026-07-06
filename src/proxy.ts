import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const BASE_URL = process.env.ADMIN_API_BASE_URL ?? "http://localhost:3000";
const ACCESS_COOKIE = "admin_access";
const REFRESH_COOKIE = "admin_refresh";
const REFRESH_MAX_AGE_SECONDS = 12 * 60 * 60;

const PUBLIC_PATHS = [
  "/login",
  "/login/verify",
  "/setup",
  "/forgot-password",
  "/reset-password",
];

interface AccessPayload {
  exp: number;
}

function decodeJwtPayload(token: string): AccessPayload | null {
  try {
    const [, payload] = token.split(".");
    const json = Buffer.from(payload, "base64url").toString("utf8");
    return JSON.parse(json) as AccessPayload;
  } catch {
    return null;
  }
}

function isExpired(payload: AccessPayload | null, skewSeconds = 10) {
  if (!payload) {
    return true;
  }
  return payload.exp * 1000 <= Date.now() + skewSeconds * 1000;
}

function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  path: "/",
};

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const publicPath = isPublicPath(pathname);

  const accessToken = request.cookies.get(ACCESS_COOKIE)?.value;
  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;
  const accessPayload = accessToken ? decodeJwtPayload(accessToken) : null;

  if (accessPayload && !isExpired(accessPayload)) {
    if (publicPath) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  if (refreshToken) {
    try {
      const refreshResponse = await fetch(`${BASE_URL}/admin/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });
      if (refreshResponse.ok) {
        const data = (await refreshResponse.json()) as {
          accessToken: string;
          refreshToken: string;
        };
        const response = publicPath
          ? NextResponse.redirect(new URL("/", request.url))
          : NextResponse.next();
        const newPayload = decodeJwtPayload(data.accessToken);
        const accessMaxAge = newPayload
          ? Math.max(newPayload.exp - Math.floor(Date.now() / 1000), 60)
          : 900;
        response.cookies.set(ACCESS_COOKIE, data.accessToken, {
          ...cookieOptions,
          maxAge: accessMaxAge,
        });
        response.cookies.set(REFRESH_COOKIE, data.refreshToken, {
          ...cookieOptions,
          maxAge: REFRESH_MAX_AGE_SECONDS,
        });
        return response;
      }
    } catch {
      // Backend unreachable or refresh rejected; fall through to login redirect.
    }
  }

  if (publicPath) {
    return NextResponse.next();
  }
  const response = NextResponse.redirect(new URL("/login", request.url));
  response.cookies.delete(ACCESS_COOKIE);
  response.cookies.delete(REFRESH_COOKIE);
  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon.png|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
