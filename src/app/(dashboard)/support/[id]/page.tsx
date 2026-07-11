import { notFound } from "next/navigation";
import { adminApi, AdminApiError } from "@/lib/admin-api";
import { getAccessToken, getSession } from "@/lib/admin-session";
import type { SupportConversationDetail } from "@/lib/types";
import { SupportThread } from "./support-thread";

export default async function SupportConversationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let detail: SupportConversationDetail;
  try {
    detail = await adminApi<SupportConversationDetail>(
      `/admin/support/conversations/${id}`,
    );
  } catch (error) {
    if (error instanceof AdminApiError && error.status === 404) {
      notFound();
    }
    throw error;
  }
  const accessToken = await getAccessToken();
  const session = await getSession();

  return (
    <SupportThread
      initialDetail={detail}
      conversationId={id}
      accessToken={accessToken ?? ""}
      canManage={session?.role !== "viewer"}
    />
  );
}
