// This file configures the initialization of Sentry on the client.
// The config you add here will be used whenever a user loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  // Use environment variables with fallback for DSN
  dsn: process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN || "https://90c2ee31837142dea4ff89b612345843@o4504106631626752.ingest.us.sentry.io/4504106640539652",
  
  // Set different sample rates based on environment
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.2 : 1.0,
  
  // Enable capturing of PII data
  sendDefaultPii: true,
  
  // Replay sampling rates
  replaysSessionSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 0.5,
  replaysOnErrorSampleRate: 1.0,
  
  // Set the environment
  environment: process.env.NEXT_PUBLIC_VERCEL_ENV || process.env.NODE_ENV || 'development',
  
  // Enable automatic instrumentation
  integrations: [
    // Browser tracing for performance monitoring
    Sentry.browserTracingIntegration({
      tracePropagationTargets: ['localhost', /^\//],
      idleTimeout: 2000, // Increase idle timeout for better transaction capturing
    }),
    
    // Session replay for debugging
    Sentry.replayIntegration({
      maskAllText: false,
      blockAllMedia: false,
    }),
  ],
  
  // Further customize error context
  beforeSend(event) {
    // Don't send events in development if configured 
    if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_SENTRY_DISABLE_DEV === 'true') {
      return null;
    }
    
    // Add custom breadcrumb for debugging
    Sentry.addBreadcrumb({
      category: 'app',
      message: 'Event processed by beforeSend',
      level: 'info',
    });
    
    return event;
  },
});

// Only log in development
if (process.env.NODE_ENV !== 'production') {
  console.log("Sentry instrumentation initialized for client");
}

// Required hook for Sentry to instrument navigations in Next.js
// This is the only officially supported router transition hook in the current SDK
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart; 