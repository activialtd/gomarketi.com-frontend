import { reportClientError } from "./api-client";

// Self-built crash capture, no Sentry — reports into the same admin-api
// error_events queue the backend writes to. ErrorBoundary.tsx covers render
// errors; this covers everything else (event handlers, timers, native
// callbacks) via React Native's built-in global handler.
export function installGlobalErrorHandler() {
  const globalAny = global as any;
  const defaultHandler = globalAny.ErrorUtils?.getGlobalHandler?.();

  globalAny.ErrorUtils?.setGlobalHandler?.(
    (error: Error, isFatal?: boolean) => {
      reportClientError({
        service: "consumer-app",
        message: error?.message ?? String(error),
        stack: error?.stack,
        context: { isFatal: !!isFatal, kind: "global-handler" },
      });

      if (defaultHandler) {
        defaultHandler(error, isFatal);
      }
    },
  );
}
