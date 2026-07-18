"use server";

import { revalidatePath } from "next/cache";
import { adminApi, AdminApiError } from "@/lib/admin-api";
import type {
  AdminAccountRow,
  AdminNotificationChannel,
  AdminNotificationRow,
  AppConfigRow,
  AppPlatform,
  ServiceName,
  ServiceStatusLevel,
  ServiceStatusRow,
  SupportMessage,
} from "@/lib/types";

export interface MutationResult {
  ok: boolean;
  error?: string;
}

function describeError(error: unknown): string {
  if (error instanceof AdminApiError) {
    return error.errorCode;
  }
  return "NETWORK_ERROR";
}

export async function setUserActiveAction(
  userId: string,
  isActive: boolean,
): Promise<MutationResult> {
  try {
    await adminApi(`/admin/users/${userId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ isActive }),
    });
  } catch (error) {
    return { ok: false, error: describeError(error) };
  }
  revalidatePath("/users");
  return { ok: true };
}

export async function reverseTransactionAction(
  transactionId: string,
): Promise<MutationResult> {
  try {
    await adminApi(`/admin/transactions/${transactionId}/reverse`, {
      method: "POST",
    });
  } catch (error) {
    return { ok: false, error: describeError(error) };
  }
  revalidatePath("/transactions");
  return { ok: true };
}

export async function reviewFlagAction(
  flagId: string,
  status: "reviewed" | "dismissed",
): Promise<MutationResult> {
  try {
    await adminApi(`/admin/aml-flags/${flagId}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  } catch (error) {
    return { ok: false, error: describeError(error) };
  }
  revalidatePath("/aml-flags");
  return { ok: true };
}

export async function createRestrictionAction(
  userId: string,
  payload: {
    level: "restricted" | "suspended";
    reason: "fraud_suspicion" | "compliance_review" | "other";
    note?: string;
  },
): Promise<MutationResult> {
  try {
    await adminApi(`/admin/users/${userId}/restrictions`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  } catch (error) {
    return { ok: false, error: describeError(error) };
  }
  revalidatePath("/users");
  revalidatePath("/restrictions");
  revalidatePath("/aml-flags");
  return { ok: true };
}

export async function liftRestrictionAction(
  restrictionId: string,
): Promise<MutationResult> {
  try {
    await adminApi(`/admin/restrictions/${restrictionId}/lift`, {
      method: "PATCH",
    });
  } catch (error) {
    return { ok: false, error: describeError(error) };
  }
  revalidatePath("/users");
  revalidatePath("/restrictions");
  revalidatePath("/aml-flags");
  return { ok: true };
}

export async function escalateRestrictionAction(
  restrictionId: string,
): Promise<MutationResult> {
  try {
    await adminApi(`/admin/restrictions/${restrictionId}/escalate`, {
      method: "PATCH",
    });
  } catch (error) {
    return { ok: false, error: describeError(error) };
  }
  revalidatePath("/users");
  revalidatePath("/restrictions");
  revalidatePath("/aml-flags");
  return { ok: true };
}

export async function reviewAppealAction(
  appealId: string,
  decision: "approved" | "rejected",
): Promise<MutationResult> {
  try {
    await adminApi(`/admin/appeals/${appealId}`, {
      method: "PATCH",
      body: JSON.stringify({ decision }),
    });
  } catch (error) {
    return { ok: false, error: describeError(error) };
  }
  revalidatePath("/users");
  revalidatePath("/restrictions");
  revalidatePath("/aml-flags");
  return { ok: true };
}

export async function createAdminAction(payload: {
  email: string;
  password: string;
  role: AdminAccountRow["role"];
}): Promise<MutationResult> {
  try {
    await adminApi("/admin/admins", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  } catch (error) {
    return { ok: false, error: describeError(error) };
  }
  revalidatePath("/admins");
  return { ok: true };
}

export async function updateAdminAction(
  adminId: string,
  changes: { role?: AdminAccountRow["role"]; isActive?: boolean },
): Promise<MutationResult> {
  try {
    await adminApi(`/admin/admins/${adminId}`, {
      method: "PATCH",
      body: JSON.stringify(changes),
    });
  } catch (error) {
    return { ok: false, error: describeError(error) };
  }
  revalidatePath("/admins");
  return { ok: true };
}

export interface TranslateResult extends MutationResult {
  translations?: string[];
}

export async function translateTextsAction(
  texts: string[],
  targetLang: "en" | "fr",
): Promise<TranslateResult> {
  try {
    const result = await adminApi<{ translations: string[] }>(
      "/admin/support/translate",
      { method: "POST", body: JSON.stringify({ texts, targetLang }) },
    );
    return { ok: true, translations: result.translations };
  } catch (error) {
    return { ok: false, error: describeError(error) };
  }
}

export interface SendSupportReplyResult extends MutationResult {
  message?: SupportMessage;
}

export async function sendSupportReplyAction(
  conversationId: string,
  message: string,
): Promise<SendSupportReplyResult> {
  try {
    const created = await adminApi<SupportMessage>(
      `/admin/support/conversations/${conversationId}/messages`,
      { method: "POST", body: JSON.stringify({ message }) },
    );
    revalidatePath("/support");
    revalidatePath(`/support/${conversationId}`);
    return { ok: true, message: created };
  } catch (error) {
    return { ok: false, error: describeError(error) };
  }
}

export async function assignSupportConversationAction(
  conversationId: string,
): Promise<MutationResult> {
  try {
    await adminApi(`/admin/support/conversations/${conversationId}/assign`, {
      method: "POST",
    });
  } catch (error) {
    return { ok: false, error: describeError(error) };
  }
  revalidatePath("/support");
  revalidatePath(`/support/${conversationId}`);
  return { ok: true };
}

export async function resolveSupportConversationAction(
  conversationId: string,
): Promise<MutationResult> {
  try {
    await adminApi(`/admin/support/conversations/${conversationId}/resolve`, {
      method: "POST",
    });
  } catch (error) {
    return { ok: false, error: describeError(error) };
  }
  revalidatePath("/support");
  revalidatePath(`/support/${conversationId}`);
  return { ok: true };
}

export interface SendNotificationResult extends MutationResult {
  notification?: AdminNotificationRow;
}

export async function sendUserNotificationAction(
  userId: string,
  payload: { title: string; body: string; channels: AdminNotificationChannel[] },
): Promise<SendNotificationResult> {
  try {
    const notification = await adminApi<AdminNotificationRow>(
      `/admin/notifications/user/${userId}`,
      { method: "POST", body: JSON.stringify(payload) },
    );
    return { ok: true, notification };
  } catch (error) {
    return { ok: false, error: describeError(error) };
  }
}

export async function broadcastNotificationAction(payload: {
  title: string;
  body: string;
  channels: AdminNotificationChannel[];
}): Promise<SendNotificationResult> {
  try {
    const notification = await adminApi<AdminNotificationRow>(
      "/admin/notifications/broadcast",
      { method: "POST", body: JSON.stringify(payload) },
    );
    revalidatePath("/notifications");
    return { ok: true, notification };
  } catch (error) {
    return { ok: false, error: describeError(error) };
  }
}

export interface UpdateAppConfigResult extends MutationResult {
  config?: AppConfigRow;
}

export async function updateAppConfigAction(
  platform: AppPlatform,
  changes: {
    minimumVersion?: string;
    latestVersion?: string;
    maintenanceMode?: boolean;
    maintenanceMessage?: string;
    updateMessage?: string;
  },
): Promise<UpdateAppConfigResult> {
  try {
    const config = await adminApi<AppConfigRow>(
      `/admin/app-config/${platform}`,
      { method: "PUT", body: JSON.stringify(changes) },
    );
    revalidatePath("/app-config");
    return { ok: true, config };
  } catch (error) {
    return { ok: false, error: describeError(error) };
  }
}

export interface UpdateServiceStatusResult extends MutationResult {
  status?: ServiceStatusRow;
}

export async function updateServiceStatusAction(
  service: ServiceName,
  changes: { status: ServiceStatusLevel; message?: string },
): Promise<UpdateServiceStatusResult> {
  try {
    const status = await adminApi<ServiceStatusRow>(
      `/admin/service-status/${service}`,
      { method: "PUT", body: JSON.stringify(changes) },
    );
    revalidatePath("/app-config");
    return { ok: true, status };
  } catch (error) {
    return { ok: false, error: describeError(error) };
  }
}

export async function closeSupportConversationAction(
  conversationId: string,
): Promise<MutationResult> {
  try {
    await adminApi(`/admin/support/conversations/${conversationId}/close`, {
      method: "POST",
    });
  } catch (error) {
    return { ok: false, error: describeError(error) };
  }
  revalidatePath("/support");
  revalidatePath(`/support/${conversationId}`);
  return { ok: true };
}
