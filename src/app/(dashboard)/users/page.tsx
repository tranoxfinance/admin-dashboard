import { adminApi } from "@/lib/admin-api";
import { formatDate } from "@/lib/format";
import type { AdminUserRow, Paginated } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UserStatusToggle } from "./user-status-toggle";

export default async function UsersPage() {
  const data = await adminApi<Paginated<AdminUserRow>>(
    "/admin/users?page=1&limit=50",
  );

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="font-heading text-2xl font-semibold">Users</h1>
        <p className="text-sm text-muted-foreground">
          {data.total} total accounts
        </p>
      </div>
      <div className="rounded-xl ring-1 ring-foreground/10">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Phone</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Country</TableHead>
              <TableHead>KYC Tier</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.items.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.phone}</TableCell>
                <TableCell>{user.email ?? "—"}</TableCell>
                <TableCell>{user.country}</TableCell>
                <TableCell>{user.kycTier}</TableCell>
                <TableCell>
                  {user.isLocked ? (
                    <Badge variant="destructive">Locked</Badge>
                  ) : user.isActive ? (
                    <Badge variant="secondary">Active</Badge>
                  ) : (
                    <Badge variant="outline">Inactive</Badge>
                  )}
                </TableCell>
                <TableCell>{formatDate(user.createdAt)}</TableCell>
                <TableCell className="text-right">
                  <UserStatusToggle
                    userId={user.id}
                    isActive={user.isActive}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
