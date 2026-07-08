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
  return "Could not reach the server. Please try again.";
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
