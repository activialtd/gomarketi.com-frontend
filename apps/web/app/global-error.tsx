'use client';

import { useEffect } from 'react';
import { reportClientError } from '@gomarket/api-client';

// Next.js's top-level error boundary — catches render errors that escape
// every other boundary, including the root layout itself. Must render its
// own <html>/<body> since the real root layout is presumed broken here.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    reportClientError({
      service: 'web',
      message: error.message,
      stack: error.stack,
      request_path: typeof window !== 'undefined' ? window.location.pathname : undefined,
      context: { digest: error.digest, kind: 'global-error-boundary' },
    });
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          display: 'flex',
          minHeight: '100vh',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui, sans-serif',
          padding: 24,
          textAlign: 'center',
        }}
      >
        <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Something went wrong</h1>
        <p style={{ color: '#64748b', marginBottom: 20, maxWidth: 420 }}>
          We've logged this and will look into it. You can try reloading the page.
        </p>
        <button
          onClick={reset}
          style={{
            padding: '8px 16px',
            borderRadius: 8,
            background: '#011B33',
            color: '#fff',
            fontWeight: 600,
            fontSize: 14,
          }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
