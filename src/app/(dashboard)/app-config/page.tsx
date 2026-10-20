import { redirect } from "next/navigation";
import { adminApi } from "@/lib/admin-api";
import { getSession } from "@/lib/admin-session";
import { getDict } from "@/lib/i18n/server";
import type { AppConfigRow, ServiceStatusRow } from "@/lib/types";
import { AppConfigForm } from "./app-config-form";
import { ServiceStatusPanel } from "./service-status-panel";
import { PageHeader } from "@/components/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  const orderedConfigs = [...configs].sort((a, b) =>
    a.platform === b.platform ? 0 : a.platform === "android" ? -1 : 1,
  );

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={dict.appConfig.title}
        description={dict.appConfig.subtitle}
      />

      <Tabs defaultValue={orderedConfigs[0]?.platform ?? "service-status"}>
        <TabsList>
          {orderedConfigs.map((config) => (
            <TabsTrigger key={config.platform} value={config.platform}>
              {config.platform === "ios"
                ? dict.appConfig.platformIos
                : dict.appConfig.platformAndroid}
            </TabsTrigger>
          ))}
          <TabsTrigger value="service-status">
            {dict.appConfig.serviceStatusTitle}
          </TabsTrigger>
        </TabsList>

        {orderedConfigs.map((config) => (
          <TabsContent key={config.platform} value={config.platform}>
            <AppConfigForm config={config} />
          </TabsContent>
        ))}

        <TabsContent value="service-status">
          <ServiceStatusPanel data={serviceStatuses} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
