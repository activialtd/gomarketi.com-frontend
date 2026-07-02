import { NextRequest, NextResponse } from "next/server";

// Root domain — subdomains of this become storefronts.
// Set NEXT_PUBLIC_ROOT_DOMAIN in Vercel environment variables.
const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "gomarketi.com";

// Subdomains that belong to other apps — never rewrite these to a storefront.
const RESERVED = new Set(["www", "vendor", "api", "staging", "admin", "app"]);

export function middleware(request: NextRequest) {
  const host = (request.headers.get("host") ?? "").toLowerCase();
  const { pathname } = request.nextUrl;

  // Strip port for comparison (relevant in local dev)
  const hostWithoutPort = host.split(":")[0];

  // Determine the subdomain (everything before the first dot in the root domain)
  // e.g. "cobi.gomarketi.com" → "cobi"
  //      "gomarketi.com"      → "" (root domain, no slug)
  const isSubdomain = hostWithoutPort.endsWith(`.${ROOT_DOMAIN}`);
  if (!isSubdomain) {
    // Root domain or unrelated host — let Next.js handle normally
    return NextResponse.next();
  }

  const slug = hostWithoutPort.slice(0, -(ROOT_DOMAIN.length + 1)); // strip ".gomarketi.com"

  // Skip reserved subdomains
  if (!slug || RESERVED.has(slug)) {
    return NextResponse.next();
  }

  // Already on a /storefront path (shouldn't normally happen from a subdomain
  // request, but guard anyway to avoid double-rewriting)
  if (pathname.startsWith("/storefront")) {
    return NextResponse.next();
  }

  // Rewrite to the path-based storefront route:
  //   cobi.gomarketi.com/           → /storefront/cobi
  //   cobi.gomarketi.com/shop       → /storefront/cobi/shop
  //   cobi.gomarketi.com/products/x → /storefront/cobi/products/x
  const rewritePath = `/storefront/${slug}${pathname === "/" ? "" : pathname}`;
  const rewriteUrl = new URL(rewritePath, request.url);
  // Preserve query string
  rewriteUrl.search = request.nextUrl.search;

  return NextResponse.rewrite(rewriteUrl);
}

export const config = {
  matcher: [
    // Run on all requests except Next.js static assets and image optimization
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};
