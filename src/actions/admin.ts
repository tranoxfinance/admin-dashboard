"use server";

import { revalidatePath } from "next/cache";
import { adminApi, AdminApiError } from "@/lib/admin-api";
import type { SupportMessage } from "@/lib/types";

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
