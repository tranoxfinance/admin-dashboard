"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";
import { AlertTriangle } from "lucide-react";
import { useDict } from "@/components/i18n-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function GlobalErrorBoundary({
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
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
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
          <Button onClick={() => unstable_retry()} className="mt-2">
            {dict.errorBoundary.retry}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
