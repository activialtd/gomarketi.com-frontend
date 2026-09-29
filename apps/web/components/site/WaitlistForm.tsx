"use client";

import { useId, useState } from "react";
import { IconCheck } from "./Icons";

export function WaitlistForm() {
  const inputId = useId();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    // TODO(backend): POST the email to the waitlist endpoint
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div role="status" className="flex items-center gap-3 rounded-lg border border-border bg-background px-5 py-4">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-white">
          <IconCheck className="h-4 w-4" />
        </span>
        <p className="text-sm font-semibold text-foreground">
          You&apos;re on the list. We&apos;ll email you when we open.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 sm:flex-row">
      <label htmlFor={inputId} className="sr-only">
        Email address
      </label>
      <input
        id={inputId}
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        className="w-full rounded-md border border-border bg-background px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted/70 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary"
      />
      <button
        type="submit"
        className="shrink-0 rounded-md bg-primary px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        Join the waitlist
      </button>
    </form>
  );
}

/** Scalloped canopy edge. Sits under a section and takes that section's colour via text-*. */
export function AwningEdge({ className = "text-surface" }: { className?: string }) {
  return (
    <svg aria-hidden className={`block h-4 w-full ${className}`}>
      <defs>
        <pattern id="awning" width="32" height="16" patternUnits="userSpaceOnUse">
          <path d="M0 0 A16 16 0 0 0 32 0 Z" fill="currentColor" />
        </pattern>
      </defs>
      <rect width="100%" height="16" fill="url(#awning)" />
    </svg>
  );
}
