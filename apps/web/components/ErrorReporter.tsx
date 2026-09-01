'use client';

import { useEffect } from 'react';
import { reportClientError } from '@gomarket/api-client';

// Self-built crash capture — no Sentry/new dependency, reports into the same
// admin-api error_events queue the backend writes to. This is the customer-
// facing storefront (checkout, product pages, every vendor subdomain) — it
// had zero error visibility before this, unlike vendor-web/consumer-app
// which already report via the same pattern.
export function ErrorReporter() {
  useEffect(() => {
    function onError(event: ErrorEvent) {
      reportClientError({
        service: 'web',
        message: event.message || 'window.onerror',
        stack: event.error?.stack,
        request_path: window.location.pathname,
      });
    }

    function onRejection(event: PromiseRejectionEvent) {
      const reason = event.reason;
      reportClientError({
        service: 'web',
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
