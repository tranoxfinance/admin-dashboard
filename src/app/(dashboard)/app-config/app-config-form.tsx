"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { updateAppConfigAction } from "@/actions/admin";
import { describeApiError } from "@/lib/i18n";
import { formatDate } from "@/lib/format";
import type { AppConfigRow } from "@/lib/types";
import { useDict } from "@/components/i18n-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const VERSION_PATTERN = /^\d+\.\d+\.\d+$/;

export function AppConfigForm({ config }: { config: AppConfigRow }) {
  const [minimumVersion, setMinimumVersion] = useState(config.minimumVersion);
  const [latestVersion, setLatestVersion] = useState(config.latestVersion);
  const [maintenanceMode, setMaintenanceMode] = useState(
    config.maintenanceMode,
  );
  const [maintenanceMessage, setMaintenanceMessage] = useState(
    config.maintenanceMessage ?? "",
  );
  const [updateMessage, setUpdateMessage] = useState(
    config.updateMessage ?? "",
  );
  const [isPending, startTransition] = useTransition();
  const dict = useDict();
  const t = dict.appConfig;

  const minimumVersionValid = VERSION_PATTERN.test(minimumVersion);
  const latestVersionValid = VERSION_PATTERN.test(latestVersion);
  const canSave = minimumVersionValid && latestVersionValid;

  function handleSave() {
    if (!canSave) {
      return;
    }
    startTransition(async () => {
      const result = await updateAppConfigAction(config.platform, {
        minimumVersion,
        latestVersion,
        maintenanceMode,
        maintenanceMessage: maintenanceMessage.trim() || undefined,
        updateMessage: updateMessage.trim() || undefined,
      });
      if (result.ok) {
        toast.success(t.saved);
      } else {
        toast.error(describeApiError(dict, result.error));
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {config.platform === "ios" ? t.platformIos : t.platformAndroid}
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          {t.updatedAt}: {formatDate(config.updatedAt, dict.common.dateLocale)}
        </p>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor={`min-version-${config.platform}`}>
              {t.minimumVersion}
            </Label>
            <Input
              id={`min-version-${config.platform}`}
              value={minimumVersion}
              placeholder="1.0.0"
              onChange={(event) => setMinimumVersion(event.target.value)}
              aria-invalid={!minimumVersionValid}
            />
            <p className="text-xs text-muted-foreground">
              {minimumVersionValid ? t.minimumVersionHint : t.versionInvalid}
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor={`latest-version-${config.platform}`}>
              {t.latestVersion}
            </Label>
            <Input
              id={`latest-version-${config.platform}`}
              value={latestVersion}
              placeholder="1.0.0"
              onChange={(event) => setLatestVersion(event.target.value)}
              aria-invalid={!latestVersionValid}
            />
            <p className="text-xs text-muted-foreground">
              {latestVersionValid ? t.latestVersionHint : t.versionInvalid}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Label>{t.maintenanceMode}</Label>
          <p className="text-xs text-muted-foreground">{t.maintenanceModeHint}</p>
          <div>
            <Button
              type="button"
              size="sm"
              variant={maintenanceMode ? "destructive" : "outline"}
              onClick={() => setMaintenanceMode((prev) => !prev)}
            >
              {maintenanceMode ? t.maintenanceEnabled : t.maintenanceDisabled}
            </Button>
          </div>
        </div>

        {maintenanceMode ? (
          <div className="flex flex-col gap-2">
            <Label htmlFor={`maintenance-message-${config.platform}`}>
              {t.maintenanceMessage}
            </Label>
            <Textarea
              id={`maintenance-message-${config.platform}`}
              value={maintenanceMessage}
              maxLength={500}
              placeholder={t.maintenanceMessagePlaceholder}
              onChange={(event) => setMaintenanceMessage(event.target.value)}
            />
          </div>
        ) : null}

        <div className="flex flex-col gap-2">
          <Label htmlFor={`update-message-${config.platform}`}>
            {t.updateMessage}
          </Label>
          <Textarea
            id={`update-message-${config.platform}`}
            value={updateMessage}
            maxLength={500}
            placeholder={t.updateMessagePlaceholder}
            onChange={(event) => setUpdateMessage(event.target.value)}
          />
        </div>

        <div>
          <Button disabled={isPending || !canSave} onClick={handleSave}>
            {isPending ? t.saving : t.save}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
