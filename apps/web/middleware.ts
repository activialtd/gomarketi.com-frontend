import { NextRequest, NextResponse } from "next/server";

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "gomarketi.com";

// Subdomains that belong to the platform itself, not stores
const RESERVED = new Set(["www", "vendor", "app", "api", "admin", "mail", "cdn"]);

export function middleware(req: NextRequest) {
  const host = req.headers.get("host") ?? "";
  // Strip port (for local dev: "cobi.localhost:3001" → "cobi.localhost")
  const hostname = host.replace(/:\d+$/, "");

  const url = req.nextUrl.clone();

  // ── GoMarket subdomain: cobi.gomarketi.com or cobi.localhost ─────────────
  let subdomain: string | null = null;

  if (hostname.endsWith(`.${ROOT_DOMAIN}`)) {
    subdomain = hostname.slice(0, hostname.length - ROOT_DOMAIN.length - 1);
  } else if (hostname.endsWith(".localhost")) {
    subdomain = hostname.slice(0, hostname.length - ".localhost".length);
  }

  if (subdomain && !RESERVED.has(subdomain)) {
    url.pathname = `/storefront/${subdomain}${url.pathname === "/" ? "" : url.pathname}`;
    return NextResponse.rewrite(url);
  }

  // ── Custom vendor domain: cobi.com (not a gomarketi.com subdomain) ───────
  const isRootDomain = hostname === ROOT_DOMAIN || hostname === `www.${ROOT_DOMAIN}`;
  const isLocalhost = hostname === "localhost";

  if (!isRootDomain && !isLocalhost) {
    // Pass the custom domain to the page via a header so it can look up the store
    url.pathname = `/storefront/_domain${url.pathname === "/" ? "" : url.pathname}`;
    const res = NextResponse.rewrite(url);
    res.headers.set("x-custom-domain", hostname);
    return res;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
