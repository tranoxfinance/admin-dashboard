import { adminApi } from "@/lib/admin-api";
import type { AdminUserRow, Paginated } from "@/lib/types";
import { UsersTable } from "./users-table";

export default async function UsersPage() {
  const data = await adminApi<Paginated<AdminUserRow>>(
    "/admin/users?page=1&limit=50",
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold">Users</h1>
        <p className="text-sm text-muted-foreground">
          {data.total} total accounts
        </p>
      </div>
      <UsersTable data={data.items} />
    </div>
  );
}
