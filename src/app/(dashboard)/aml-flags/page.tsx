import { adminApi } from "@/lib/admin-api";
import { formatDate } from "@/lib/format";
import type { AmlFlag } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FlagReviewActions } from "./flag-review-actions";

const STATUS_VARIANT: Record<
  AmlFlag["status"],
  "secondary" | "destructive" | "outline"
> = {
  open: "destructive",
  reviewed: "secondary",
  dismissed: "outline",
};

export default async function AmlFlagsPage() {
  const flags = await adminApi<AmlFlag[]>("/admin/aml-flags");

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="font-heading text-2xl font-semibold">AML Flags</h1>
        <p className="text-sm text-muted-foreground">
          {flags.length} flag{flags.length === 1 ? "" : "s"}
        </p>
      </div>
      <div className="rounded-xl ring-1 ring-foreground/10">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Reason</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Flagged</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {flags.map((flag) => (
              <TableRow key={flag.id}>
                <TableCell className="max-w-md">{flag.reason}</TableCell>
                <TableCell>
                  <Badge variant={STATUS_VARIANT[flag.status]}>
                    {flag.status}
                  </Badge>
                </TableCell>
                <TableCell>{formatDate(flag.createdAt)}</TableCell>
                <TableCell className="text-right">
                  {flag.status === "open" ? (
                    <FlagReviewActions flagId={flag.id} />
                  ) : null}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
