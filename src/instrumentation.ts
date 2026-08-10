import * as Sentry from "@sentry/nextjs";

export async function register() {
  const dsn = process.env.SENTRY_DSN;
  if (!dsn) {
    return;
  }
  if (process.env.NEXT_RUNTIME === "nodejs") {
    Sentry.init({
      dsn,
      tracesSampleRate: 0.2,
      sendDefaultPii: false,
    });
  } else if (process.env.NEXT_RUNTIME === "edge") {
    Sentry.init({
      dsn,
      tracesSampleRate: 0.2,
      sendDefaultPii: false,
    });
  }
}

export const onRequestError = Sentry.captureRequestError;
