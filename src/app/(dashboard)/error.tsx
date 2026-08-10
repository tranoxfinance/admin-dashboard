"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { useDict } from "@/components/i18n-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function DashboardErrorBoundary({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  const dict = useDict();

  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardContent className="flex flex-col items-center gap-3 py-6 text-center">
          <AlertTriangle className="size-8 text-destructive" />
          <div>
            <h1 className="font-heading text-base font-semibold">
              {dict.errorBoundary.title}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {dict.errorBoundary.body}
            </p>
            {error.digest ? (
              <p className="mt-2 font-mono text-xs text-muted-foreground">
                {dict.errorBoundary.errorId(error.digest)}
              </p>
            ) : null}
          </div>
          <div className="mt-2 flex items-center gap-2">
            <Button
              variant="outline"
              nativeButton={false}
              render={<Link href="/" />}
            >
              {dict.errorBoundary.backToOverview}
            </Button>
            <Button onClick={() => unstable_retry()}>
              {dict.errorBoundary.retry}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
