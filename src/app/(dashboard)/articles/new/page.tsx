import { redirect } from "next/navigation";
import { getSession } from "@/lib/admin-session";
import { ArticleForm } from "../article-form";

export default async function NewArticlePage() {
  const session = await getSession();
  const role = session?.role;
  if (!role || !["super_admin", "social_media"].includes(role)) {
    redirect("/articles");
  }
  return <ArticleForm canManage />;
}
