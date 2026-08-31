'use client';

import { useEffect } from 'react';
import { reportClientError } from '@gomarket/api-client';

// Self-built crash capture — no Sentry/new dependency, reports into the same
// admin-api error_events queue the backend writes to (see
// shared/pkg/middleware.Recovery on the Go side). Covers what a React error
// boundary can't: uncaught errors outside the render tree, and promise
// rejections nobody awaited.
export function ErrorReporter() {
  useEffect(() => {
    function onError(event: ErrorEvent) {
      reportClientError({
        service: 'vendor-web',
        message: event.message || 'window.onerror',
        stack: event.error?.stack,
        request_path: window.location.pathname,
      });
    }

    function onRejection(event: PromiseRejectionEvent) {
      const reason = event.reason;
      reportClientError({
        service: 'vendor-web',
        message: reason instanceof Error ? reason.message : String(reason),
        stack: reason instanceof Error ? reason.stack : undefined,
        request_path: window.location.pathname,
        context: { kind: 'unhandledrejection' },
      });
    }

    window.addEventListener('error', onError);
    window.addEventListener('unhandledrejection', onRejection);
    return () => {
      window.removeEventListener('error', onError);
      window.removeEventListener('unhandledrejection', onRejection);
    };
  }, []);

  return null;
}
