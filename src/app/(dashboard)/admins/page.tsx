import { redirect } from "next/navigation";
import { adminApi } from "@/lib/admin-api";
import { getSession } from "@/lib/admin-session";
import { getDict } from "@/lib/i18n/server";
import type { AdminAccountRow } from "@/lib/types";
import { AdminsTable } from "./admins-table";
import { CreateAdminDialog } from "./create-admin-dialog";
import { PageHeader } from "@/components/page-header";

export default async function AdminsPage() {
  const session = await getSession();
  if (session?.role !== "super_admin" && session?.role !== "hr") {
    redirect("/");
  }
  const dict = await getDict();
  const admins = await adminApi<AdminAccountRow[]>("/admin/admins");

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={dict.admins.title}
        description={dict.admins.subtitle(admins.length)}
        actions={
          <>
            <CreateAdminDialog currentRole={session.role} />
          </>
        }
      />

      <AdminsTable
        data={admins}
        currentAdminId={session.sub}
        currentRole={session.role}
      />
    </div>
  );
}
