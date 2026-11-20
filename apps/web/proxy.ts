import { NextRequest, NextResponse } from "next/server";

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "wojalo.com";

// Domains we used to live on. Links to them are still out there — order
// emails, WhatsApp shares, vendors' social bios — so a request for
// cobi.gomarketi.com/products/x is sent, permanently, to the same path on
// cobi.wojalo.com rather than landing on a dead page.
const LEGACY_ROOT_DOMAINS = ["gomarketi.com"];

function legacyRedirect(req: NextRequest, hostname: string): NextResponse | null {
  for (const legacy of LEGACY_ROOT_DOMAINS) {
    if (legacy === ROOT_DOMAIN) continue;
    if (hostname === legacy || hostname.endsWith(`.${legacy}`)) {
      const url = req.nextUrl.clone();
      url.protocol = "https:";
      url.host = hostname.slice(0, hostname.length - legacy.length) + ROOT_DOMAIN;
      url.port = "";
      return NextResponse.redirect(url, 308);
    }
  }
  return null;
}

// Subdomains that belong to the platform itself, not stores
const RESERVED = new Set(["www", "vendor", "app", "api", "admin", "mail", "cdn"]);

// Platform-wide pages that live at the root (app/legal/*, app/help) rather
// than under app/storefront/[slug]/ — every vendor's storefront footer links
// to these, so they must stay reachable un-rewritten even on a store's own
// subdomain, or every "Shipping"/"Privacy"/"Help" link 404s (there's no
// app/storefront/[slug]/legal/... route for the rewrite to land on).
const GLOBAL_PATH_PREFIXES = ["/legal", "/help"];
function isGlobalPath(pathname: string) {
  return GLOBAL_PATH_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export function proxy(req: NextRequest) {
  const host = req.headers.get("host") ?? "";
  // Strip port (for local dev: "cobi.localhost:3001" → "cobi.localhost")
  const hostname = host.replace(/:\d+$/, "");

  const moved = legacyRedirect(req, hostname);
  if (moved) return moved;

  const url = req.nextUrl.clone();

  // ── Wojalo subdomain: cobi.wojalo.com or cobi.localhost ─────────────
  let subdomain: string | null = null;

  if (hostname.endsWith(`.${ROOT_DOMAIN}`)) {
    subdomain = hostname.slice(0, hostname.length - ROOT_DOMAIN.length - 1);
  } else if (hostname.endsWith(".localhost")) {
    subdomain = hostname.slice(0, hostname.length - ".localhost".length);
  }

  if (subdomain && !RESERVED.has(subdomain)) {
    if (isGlobalPath(url.pathname)) {
      return NextResponse.next();
    }
    const alreadyRouted =
      url.pathname === `/storefront/${subdomain}` ||
      url.pathname.startsWith(`/storefront/${subdomain}/`);
    if (!alreadyRouted) {
      url.pathname = `/storefront/${subdomain}${url.pathname === "/" ? "" : url.pathname}`;
      return NextResponse.rewrite(url);
    }
    return NextResponse.next();
  }

  // ── Custom vendor domain: cobi.com (not a wojalo.com subdomain) ──────
  const isRootDomain = hostname === ROOT_DOMAIN || hostname === `www.${ROOT_DOMAIN}`;
  const isLocalhost = hostname === "localhost";

  if (!isRootDomain && !isLocalhost) {
    if (isGlobalPath(url.pathname)) {
      return NextResponse.next();
    }
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
