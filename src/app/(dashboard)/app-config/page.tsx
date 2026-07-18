import { redirect } from "next/navigation";
import { adminApi } from "@/lib/admin-api";
import { getSession } from "@/lib/admin-session";
import { getDict } from "@/lib/i18n/server";
import type { AppConfigRow } from "@/lib/types";
import { AppConfigForm } from "./app-config-form";

export default async function AppConfigPage() {
  const session = await getSession();
  if (session?.role !== "super_admin") {
    redirect("/");
  }
  const dict = await getDict();
  const configs = await adminApi<AppConfigRow[]>("/admin/app-config");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold">
          {dict.appConfig.title}
        </h1>
        <p className="text-sm text-muted-foreground">
          {dict.appConfig.subtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {configs.map((config) => (
          <AppConfigForm key={config.platform} config={config} />
        ))}
      </div>
    </div>
  );
}
