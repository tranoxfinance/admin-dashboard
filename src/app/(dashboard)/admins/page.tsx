import { redirect } from "next/navigation";
import { adminApi } from "@/lib/admin-api";
import { getSession } from "@/lib/admin-session";
import { getDict } from "@/lib/i18n/server";
import type { AdminAccountRow } from "@/lib/types";
import { AdminsTable } from "./admins-table";
import { CreateAdminDialog } from "./create-admin-dialog";

export default async function AdminsPage() {
  const session = await getSession();
  if (session?.role !== "super_admin") {
    redirect("/");
  }
  const dict = await getDict();
  const admins = await adminApi<AdminAccountRow[]>("/admin/admins");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-semibold">
            {dict.admins.title}
          </h1>
          <p className="text-sm text-muted-foreground">
            {dict.admins.subtitle(admins.length)}
          </p>
        </div>
        <CreateAdminDialog />
      </div>

      <AdminsTable data={admins} currentAdminId={session.sub} />
    </div>
  );
}
