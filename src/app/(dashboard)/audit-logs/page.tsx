import { adminApi } from "@/lib/admin-api";
import { formatDate } from "@/lib/format";
import type { AuditLog, Paginated } from "@/lib/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function AuditLogsPage() {
  const data = await adminApi<Paginated<AuditLog>>(
    "/admin/audit-logs?page=1&limit=100",
  );

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="font-heading text-2xl font-semibold">Audit Logs</h1>
        <p className="text-sm text-muted-foreground">
          {data.total} recorded events
        </p>
      </div>
      <div className="rounded-xl ring-1 ring-foreground/10">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Action</TableHead>
              <TableHead>Entity</TableHead>
              <TableHead>IP Address</TableHead>
              <TableHead>When</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.items.map((log) => (
              <TableRow key={log.id}>
                <TableCell className="font-medium">{log.action}</TableCell>
                <TableCell className="text-muted-foreground">
                  {log.entityType ?? "—"}
                  {log.entityId ? ` · ${log.entityId.slice(0, 8)}` : ""}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {log.ipAddress ?? "—"}
                </TableCell>
                <TableCell>{formatDate(log.createdAt)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
