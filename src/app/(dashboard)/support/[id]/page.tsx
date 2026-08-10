import { notFound, redirect } from "next/navigation";
import { adminApi, AdminApiError } from "@/lib/admin-api";
import { getSession } from "@/lib/admin-session";
import type { SupportConversationDetail } from "@/lib/types";
import { SupportThread } from "./support-thread";

export default async function SupportConversationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();
  if (session?.role === "hr" || session?.role === "social_media") {
    redirect("/");
  }
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
  return (
    <SupportThread
      initialDetail={detail}
      conversationId={id}
      canManage={session?.role !== "viewer"}
    />
  );
}
