import Link from "next/link";
import { redirect } from "next/navigation";
import { PenSquare } from "lucide-react";
import { adminApi } from "@/lib/admin-api";
import { getSession } from "@/lib/admin-session";
import { getDict } from "@/lib/i18n/server";
import type { ArticleRow } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { ArticlesTable } from "./articles-table";

export default async function ArticlesPage() {
  const session = await getSession();
  const role = session?.role;
  if (!role || !["super_admin", "admin", "viewer", "social_media"].includes(role)) {
    redirect("/");
  }
  const canManage = role === "super_admin" || role === "social_media";
  const dict = await getDict();
  const articles = await adminApi<ArticleRow[]>("/admin/articles");
  const published = articles.filter(
    (article) => article.status === "published",
  ).length;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-semibold">
            {dict.articles.title}
          </h1>
          <p className="text-sm text-muted-foreground">
            {dict.articles.subtitle(articles.length, published)}
          </p>
        </div>
        {canManage ? (
          <Button size="sm" nativeButton={false} render={<Link href="/articles/new" />}>
            <PenSquare className="size-3.5" />
            {dict.articles.newArticle}
          </Button>
        ) : null}
      </div>

      <ArticlesTable data={articles} />
    </div>
  );
}
