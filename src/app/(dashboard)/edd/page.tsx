import { redirect } from "next/navigation";
import { adminApi } from "@/lib/admin-api";
import { getSession } from "@/lib/admin-session";
import { getDict } from "@/lib/i18n/server";
import type { EddSubmissionRow, Paginated } from "@/lib/types";
import { EddTable } from "./edd-table";

const STATUSES = ["pending", "approved", "rejected"];

export default async function EddPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const session = await getSession();
  const role = session?.role;
  if (!role || !["super_admin", "admin", "support", "viewer"].includes(role)) {
    redirect("/");
  }
  const canDecide = role === "super_admin" || role === "admin";
  const params = await searchParams;
  const status = params.status && STATUSES.includes(params.status)
    ? params.status
    : undefined;
  const dict = await getDict();
  const query = new URLSearchParams({ page: "1", limit: "100" });
  if (status) query.set("status", status);

  const [submissions, pending] = await Promise.all([
    adminApi<Paginated<EddSubmissionRow>>(`/admin/kyc/edd?${query.toString()}`),
    adminApi<Paginated<EddSubmissionRow>>(
      "/admin/kyc/edd?page=1&limit=1&status=pending",
    ),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold">{dict.edd.title}</h1>
        <p className="text-sm text-muted-foreground">
          {dict.edd.subtitle(pending.total)}
        </p>
      </div>

      <EddTable
        data={submissions.items}
        activeStatus={status}
        canDecide={canDecide}
      />
    </div>
  );
}
