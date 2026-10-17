import { redirect } from "next/navigation";
import { adminApi } from "@/lib/admin-api";
import { getSession } from "@/lib/admin-session";
import { getDict } from "@/lib/i18n/server";
import type { AppConfigRow, ServiceStatusRow } from "@/lib/types";
import { AppConfigForm } from "./app-config-form";
import { ServiceStatusPanel } from "./service-status-panel";
import { PageHeader } from "@/components/page-header";

export default async function AppConfigPage() {
  const session = await getSession();
  if (session?.role !== "super_admin") {
    redirect("/");
  }
  const dict = await getDict();
  const [configs, serviceStatuses] = await Promise.all([
    adminApi<AppConfigRow[]>("/admin/app-config"),
    adminApi<ServiceStatusRow[]>("/admin/service-status"),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={dict.appConfig.title}
        description={dict.appConfig.subtitle}
      />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {configs.map((config) => (
          <AppConfigForm key={config.platform} config={config} />
        ))}
      </div>

      <ServiceStatusPanel data={serviceStatuses} />
    </div>
  );
}
