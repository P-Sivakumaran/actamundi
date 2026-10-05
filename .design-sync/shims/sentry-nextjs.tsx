// design-sync build shim for '@sentry/nextjs' — see next-image.tsx header
// for why this exists. @sentry/nextjs's Pages Router instrumentation
// (client/routing/pagesRouterRoutingInstrumentation.js) and build-detection
// helper (common/utils/isBuild.js) unconditionally import 'next/router' and
// 'next/constants' to hook route-change tracking and detect `next build` —
// both assume a running Next.js app and aren't esbuild-bundlable standalone.
// Only the 3 Sentry calls actamundi's components actually use are covered
// (grep `Sentry\.` under components/ before adding more — keep this file
// matching real usage, not a full SDK reimplementation). The real app
// imports the real @sentry/nextjs unchanged; this only affects the
// design-sync preview sandbox.
export function captureException(_error: unknown, _context?: unknown) {}
export function showReportDialog(_options?: unknown) {}
export function lastEventId(): string | undefined {
  return undefined
}
