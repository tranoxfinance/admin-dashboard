"use server";

import { redirect } from "next/navigation";
import { adminApi, adminApiPublic, AdminApiError } from "@/lib/admin-api";
import {
  clearSessionCookies,
  clearShortLivedCookie,
  ENROLLMENT_COOKIE,
  getAccessToken,
  getRefreshToken,
  getShortLivedCookie,
  MFA_COOKIE,
  PASSWORD_CHANGE_COOKIE,
  REFRESH_MAX_AGE_SECONDS,
  setSessionCookies,
  setShortLivedCookie,
} from "@/lib/admin-session";

export interface ActionState {
  error?: string;
  success?: boolean;
}

interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export async function forgotPasswordAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const email = String(formData.get("email") ?? "");
  try {
    await adminApiPublic("/admin/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  } catch (error) {
    return { error: describeError(error) };
  }
  return { success: true };
}

export async function resetPasswordAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const token = String(formData.get("token") ?? "");
  const password = String(formData.get("password") ?? "");
  try {
    await adminApiPublic("/admin/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, password }),
    });
  } catch (error) {
    return { error: describeError(error) };
  }
  return { success: true };
}

export async function loginAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  let result: {
    status: string;
    enrollmentToken?: string;
    mfaToken?: string;
    changeToken?: string;
  };
  try {
    result = await adminApiPublic("/admin/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  } catch (error) {
    return { error: describeError(error) };
  }
  if (result.status === "password_change_required" && result.changeToken) {
    await setShortLivedCookie(PASSWORD_CHANGE_COOKIE, result.changeToken);
    redirect("/change-password");
  }
  if (result.status === "enrollment_required" && result.enrollmentToken) {
    await setShortLivedCookie(ENROLLMENT_COOKIE, result.enrollmentToken);
    redirect("/setup");
  }
  if (result.status === "mfa_required" && result.mfaToken) {
    await setShortLivedCookie(MFA_COOKIE, result.mfaToken);
    redirect("/login/verify");
  }
  return { error: "UNEXPECTED_RESPONSE" };
}

export async function changeTempPasswordAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const password = String(formData.get("password") ?? "");
  const changeToken = await getShortLivedCookie(PASSWORD_CHANGE_COOKIE);
  if (!changeToken) {
    return { error: "LOGIN_SESSION_EXPIRED" };
  }
  let result: {
    status: string;
    enrollmentToken?: string;
    mfaToken?: string;
  };
  try {
    result = await adminApiPublic("/admin/auth/change-password", {
      method: "POST",
      headers: { Authorization: `Bearer ${changeToken}` },
      body: JSON.stringify({ password }),
    });
  } catch (error) {
    return { error: describeError(error) };
  }
  await clearShortLivedCookie(PASSWORD_CHANGE_COOKIE);
  if (result.status === "enrollment_required" && result.enrollmentToken) {
    await setShortLivedCookie(ENROLLMENT_COOKIE, result.enrollmentToken);
    redirect("/setup");
  }
  if (result.status === "mfa_required" && result.mfaToken) {
    await setShortLivedCookie(MFA_COOKIE, result.mfaToken);
    redirect("/login/verify");
  }
  return { error: "UNEXPECTED_RESPONSE" };
}

export async function enrollTotpAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const code = String(formData.get("code") ?? "");
  const enrollmentToken = await getShortLivedCookie(ENROLLMENT_COOKIE);
  if (!enrollmentToken) {
    return { error: "ENROLLMENT_EXPIRED" };
  }
  let tokens: TokenPair;
  try {
    tokens = await adminApiPublic("/admin/auth/totp/enroll", {
      method: "POST",
      headers: { Authorization: `Bearer ${enrollmentToken}` },
      body: JSON.stringify({ code }),
    });
  } catch (error) {
    return { error: describeError(error) };
  }
  await clearShortLivedCookie(ENROLLMENT_COOKIE);
  await setSessionCookies(
    tokens.accessToken,
    tokens.refreshToken,
    REFRESH_MAX_AGE_SECONDS,
  );
  redirect("/");
}

export async function verifyMfaAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const code = String(formData.get("code") ?? "");
  const mfaToken = await getShortLivedCookie(MFA_COOKIE);
  if (!mfaToken) {
    return { error: "LOGIN_SESSION_EXPIRED" };
  }
  let tokens: TokenPair;
  try {
    tokens = await adminApiPublic("/admin/auth/login/verify", {
      method: "POST",
      body: JSON.stringify({ mfaToken, code }),
    });
  } catch (error) {
    return { error: describeError(error) };
  }
  await clearShortLivedCookie(MFA_COOKIE);
  await setSessionCookies(
    tokens.accessToken,
    tokens.refreshToken,
    REFRESH_MAX_AGE_SECONDS,
  );
  redirect("/");
}

export async function logoutAction(): Promise<void> {
  const refreshToken = await getRefreshToken();
  const accessToken = await getAccessToken();
  if (refreshToken && accessToken) {
    try {
      await adminApi("/admin/auth/logout", {
        method: "POST",
        body: JSON.stringify({ refreshToken }),
      });
    } catch {
      // best-effort revoke; still clear local cookies below
    }
  }
  await clearSessionCookies();
  redirect("/login");
}

function describeError(error: unknown): string {
  if (error instanceof AdminApiError) {
    return error.errorCode;
  }
  return "NETWORK_ERROR";
}
