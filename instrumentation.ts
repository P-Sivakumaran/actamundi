import * as Sentry from "@sentry/nextjs";

export function register() {
  // Initialize Sentry for server-side and edge runtimes.
  // This runs once per session on the server.
  Sentry.init({
    dsn: process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN || "https://90c2ee31837142dea4ff89b612345843@o4504106631626752.ingest.us.sentry.io/4504106640539652",
    tracesSampleRate: 1.0,
    sendDefaultPii: true,
    // Add any other server-specific or edge-specific Sentry config here
  });

  console.log("Sentry instrumentation initialized for server/edge.");
} 