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
  let result: { status: string; enrollmentToken?: string; mfaToken?: string };
  try {
    result = await adminApiPublic("/admin/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  } catch (error) {
    return { error: describeError(error) };
  }
  if (result.status === "enrollment_required" && result.enrollmentToken) {
    await setShortLivedCookie(ENROLLMENT_COOKIE, result.enrollmentToken);
    redirect("/setup");
  }
  if (result.status === "mfa_required" && result.mfaToken) {
    await setShortLivedCookie(MFA_COOKIE, result.mfaToken);
    redirect("/login/verify");
  }
  return { error: "Unexpected response from server" };
}

export async function enrollTotpAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const code = String(formData.get("code") ?? "");
  const enrollmentToken = await getShortLivedCookie(ENROLLMENT_COOKIE);
  if (!enrollmentToken) {
    return { error: "Your enrollment session expired. Please start again." };
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
    return { error: "Your login session expired. Please sign in again." };
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
    switch (error.errorCode) {
      case "ADMIN_INVALID_CREDENTIALS":
        return "Incorrect email or password.";
      case "ADMIN_ACCOUNT_LOCKED":
        return "Account locked after too many failed attempts. Try again later.";
      case "ADMIN_ACCOUNT_INACTIVE":
        return "This admin account has been deactivated.";
      case "ADMIN_MFA_INVALID":
        return "Incorrect code. Please try again.";
      case "ADMIN_MFA_EXPIRED":
        return "This code has expired. Please sign in again.";
      case "ADMIN_MFA_MAX_ATTEMPTS":
        return "Too many incorrect attempts. Please sign in again.";
      case "ADMIN_TOTP_ALREADY_ENABLED":
        return "Two-factor authentication is already enabled for this account.";
      case "ADMIN_RESET_TOKEN_INVALID":
        return "This reset link is invalid or has expired.";
      default:
        return "Something went wrong. Please try again.";
    }
  }
  return "Could not reach the server. Please try again.";
}
