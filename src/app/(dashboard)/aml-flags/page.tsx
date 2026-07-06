import { adminApi } from "@/lib/admin-api";
import type { AmlFlag } from "@/lib/types";
import { AmlFlagsTable } from "./aml-flags-table";

export default async function AmlFlagsPage() {
  const flags = await adminApi<AmlFlag[]>("/admin/aml-flags");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold">AML Flags</h1>
        <p className="text-sm text-muted-foreground">
          {flags.length} flag{flags.length === 1 ? "" : "s"}
        </p>
      </div>
      <AmlFlagsTable data={flags} />
    </div>
  );
}
