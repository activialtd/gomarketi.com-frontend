"use client";

import { useState } from "react";

export default function ComingSoon() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (email) setSubmitted(true);
  }

  return (
    <main className="min-h-screen bg-white flex flex-col">
      {/* Nav */}
      <nav className="px-6 py-5 flex items-center justify-between max-w-6xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#1a7a42] flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-white" stroke="currentColor" strokeWidth={2.2}>
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" strokeLinecap="round" strokeLinejoin="round" />
              <polyline points="9,22 9,12 15,12 15,22" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span className="text-[#1c1c1c] font-bold text-lg tracking-tight">GoMarketi</span>
        </div>
        <a
          href="https://vendor.gomarketi.com"
          className="text-sm font-medium text-[#1a7a42] border border-[#1a7a42] rounded-full px-4 py-1.5 hover:bg-[#1a7a42] hover:text-white transition-colors"
        >
          Vendor Login
        </a>
      </nav>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 py-20 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-[#f0faf3] text-[#1a7a42] text-xs font-semibold px-3 py-1.5 rounded-full mb-8 border border-[#22c55e]/30">
          <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-pulse" />
          Something big is coming
        </div>

        {/* Headline */}
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold text-[#1c1c1c] leading-[1.1] tracking-tight max-w-3xl">
          Africa&apos;s{" "}
          <span className="text-[#1a7a42]">Commerce</span>{" "}
          Platform
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-gray-500 max-w-xl leading-relaxed">
          We&apos;re building the infrastructure that empowers African vendors
          to sell, grow, and thrive — online and offline.
        </p>

        {/* Waitlist form */}
        <div className="mt-10 w-full max-w-md">
          {submitted ? (
            <div className="flex items-center justify-center gap-3 bg-[#f0faf3] border border-[#22c55e]/40 rounded-2xl px-6 py-4">
              <div className="w-8 h-8 rounded-full bg-[#1a7a42] flex items-center justify-center flex-shrink-0">
                <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-white" stroke="currentColor" strokeWidth={2.5}>
                  <polyline points="20,6 9,17 4,12" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <p className="text-[#1a7a42] font-semibold text-sm">
                You&apos;re on the list! We&apos;ll reach out soon.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#1a7a42]/30 focus:border-[#1a7a42] transition"
              />
              <button
                type="submit"
                className="px-5 py-3 bg-[#1a7a42] text-white text-sm font-semibold rounded-xl hover:bg-[#239452] transition-colors whitespace-nowrap"
              >
                Join Waitlist
              </button>
            </form>
          )}
          <p className="mt-3 text-xs text-gray-400">
            No spam. We&apos;ll only email you when we launch.
          </p>
        </div>

        {/* Stats */}
        <div className="mt-20 grid grid-cols-3 gap-8 sm:gap-16 text-center">
          {[
            { value: "54+", label: "African markets" },
            { value: "10k+", label: "Vendors waitlisted" },
            { value: "2025", label: "Launch year" },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-3xl font-extrabold text-[#1a7a42]">{s.value}</p>
              <p className="text-sm text-gray-400 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 max-w-6xl mx-auto w-full">
        <p className="text-xs text-gray-400">
          © {new Date().getFullYear()} GoMarketi. All rights reserved.
        </p>
        <div className="flex gap-5 text-xs text-gray-400">
          <a href="mailto:hello@gomarketi.com" className="hover:text-[#1a7a42] transition-colors">
            hello@gomarketi.com
          </a>
          <a href="https://vendor.gomarketi.com" className="hover:text-[#1a7a42] transition-colors">
            Vendors
          </a>
        </div>
      </footer>
    </main>
  );
}
