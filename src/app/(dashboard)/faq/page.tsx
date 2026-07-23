import { redirect } from "next/navigation";
import { adminApi } from "@/lib/admin-api";
import { getSession } from "@/lib/admin-session";
import { getDict } from "@/lib/i18n/server";
import type { FaqRow } from "@/lib/types";
import { FaqsTable } from "./faq-table";
import { FaqDialog } from "./faq-dialog";

export default async function FaqPage() {
  const session = await getSession();
  const role = session?.role;
  if (!role || !["super_admin", "admin", "viewer", "support"].includes(role)) {
    redirect("/");
  }
  const canManage =
    role === "super_admin" || role === "admin" || role === "support";
  const dict = await getDict();
  const faqs = await adminApi<FaqRow[]>("/admin/faqs");
  const publishedCount = faqs.filter((faq) => faq.isPublished).length;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-semibold">
            {dict.faq.title}
          </h1>
          <p className="text-sm text-muted-foreground">
            {dict.faq.subtitle(faqs.length, publishedCount)}
          </p>
        </div>
        {canManage ? <FaqDialog /> : null}
      </div>

      <FaqsTable data={faqs} canManage={canManage} />
    </div>
  );
}
