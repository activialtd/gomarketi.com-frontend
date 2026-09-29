"use client";

import { useId, useState } from "react";

const CONTACT_EMAIL = "hello@gomarketi.com";

const TOPICS = [
  { value: "buying", label: "Shopping on GoMarket" },
  { value: "selling", label: "Opening a store" },
  { value: "order", label: "An order I placed" },
  { value: "partnership", label: "Working together" },
  { value: "other", label: "Something else" },
] as const;

/**
 * Contact form.
 *
 * There is no messages endpoint yet, so submitting opens the visitor's mail
 * client with everything already filled in — nothing is silently swallowed,
 * and the message reaches a real inbox. When an endpoint exists, replace the
 * body of `handleSubmit` with the POST; the fields already match.
 */
export function ContactForm() {
  const ids = {
    name: useId(),
    email: useId(),
    topic: useId(),
    message: useId(),
  };

  const [form, setForm] = useState({
    name: "",
    email: "",
    topic: "buying",
    message: "",
  });
  const [handedOff, setHandedOff] = useState(false);

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const topicLabel =
      TOPICS.find((t) => t.value === form.topic)?.label ?? "Enquiry";
    const subject = `${topicLabel} — ${form.name}`;
    const body = [
      `Name: ${form.name}`,
      `Email: ${form.email}`,
      `Topic: ${topicLabel}`,
      "",
      form.message,
    ].join("\n");

    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(body)}`;
    setHandedOff(true);
  }

  const field =
    "w-full rounded-xl border border-border bg-background px-5 py-4 text-[15px] text-foreground outline-none transition-colors placeholder:text-muted/60 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20";
  const label = "block text-[13px] font-bold tracking-wide text-foreground";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor={ids.name} className={label}>
            Your name
          </label>
          <input
            id={ids.name}
            required
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="Adaeze Okonkwo"
            className={`mt-2 ${field}`}
          />
        </div>
        <div>
          <label htmlFor={ids.email} className={label}>
            Email address
          </label>
          <input
            id={ids.email}
            type="email"
            required
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            placeholder="you@example.com"
            className={`mt-2 ${field}`}
          />
        </div>
      </div>

      <div>
        <label htmlFor={ids.topic} className={label}>
          What is this about?
        </label>
        <select
          id={ids.topic}
          value={form.topic}
          onChange={(e) => set("topic", e.target.value)}
          className={`mt-2 ${field}`}
        >
          {TOPICS.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor={ids.message} className={label}>
          Your message
        </label>
        <textarea
          id={ids.message}
          required
          rows={6}
          value={form.message}
          onChange={(e) => set("message", e.target.value)}
          placeholder="Tell us what you need."
          className={`mt-2 resize-y ${field}`}
        />
      </div>

      <div className="flex flex-wrap items-center gap-5">
        <button
          type="submit"
          className="inline-flex items-center rounded-full bg-primary px-7 py-4 text-sm font-bold tracking-wide text-white uppercase transition-colors hover:bg-primary-soft focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          Send message
        </button>

        {handedOff && (
          <p role="status" className="text-sm text-muted">
            Your mail app should be open with the message ready. If it did not
            open, write to{" "}
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="font-semibold text-primary underline underline-offset-2"
            >
              {CONTACT_EMAIL}
            </a>
            .
          </p>
        )}
      </div>
    </form>
  );
}
