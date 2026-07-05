import { adminApi } from "@/lib/admin-api";
import { formatCurrency, formatDate } from "@/lib/format";
import type { Paginated, Transaction } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ReverseTransactionButton } from "./reverse-transaction-button";

const STATUS_VARIANT: Record<
  Transaction["status"],
  "secondary" | "destructive" | "outline"
> = {
  completed: "secondary",
  failed: "destructive",
  reversed: "destructive",
  pending: "outline",
  processing: "outline",
};

export default async function TransactionsPage() {
  const data = await adminApi<Paginated<Transaction>>(
    "/admin/transactions?page=1&limit=50",
  );

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="font-heading text-2xl font-semibold">Transactions</h1>
        <p className="text-sm text-muted-foreground">
          {data.total} total transfers
        </p>
      </div>
      <div className="rounded-xl ring-1 ring-foreground/10">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Sent</TableHead>
              <TableHead>Received</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Initiated</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.items.map((tx) => (
              <TableRow key={tx.id}>
                <TableCell className="font-medium">
                  {formatCurrency(tx.sendAmount, tx.sendCurrency)}
                </TableCell>
                <TableCell>
                  {formatCurrency(tx.receiveAmount, tx.receiveCurrency)}
                </TableCell>
                <TableCell>
                  <Badge variant={STATUS_VARIANT[tx.status]}>
                    {tx.status}
                  </Badge>
                </TableCell>
                <TableCell>{formatDate(tx.initiatedAt)}</TableCell>
                <TableCell className="text-right">
                  {tx.status === "completed" ? (
                    <ReverseTransactionButton transactionId={tx.id} />
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
