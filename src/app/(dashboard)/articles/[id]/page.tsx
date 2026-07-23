import { notFound, redirect } from "next/navigation";
import { adminApi, AdminApiError } from "@/lib/admin-api";
import { getSession } from "@/lib/admin-session";
import type { ArticleRow } from "@/lib/types";
import { ArticleForm } from "../article-form";

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  const role = session?.role;
  if (!role || !["super_admin", "admin", "viewer", "social_media"].includes(role)) {
    redirect("/");
  }
  const { id } = await params;
  let article: ArticleRow;
  try {
    article = await adminApi<ArticleRow>(`/admin/articles/${id}`);
  } catch (error) {
    if (error instanceof AdminApiError && error.status === 404) {
      notFound();
    }
    throw error;
  }
  const canManage = role === "super_admin" || role === "social_media";
  return <ArticleForm article={article} canManage={canManage} />;
}
