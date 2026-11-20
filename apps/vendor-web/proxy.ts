import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ROUTES } from "@/lib/config/routes";

// The dashboard moved from vendor.gomarketi.com to vendor.wojalo.com. Old
// bookmarks and email links get a permanent redirect to the same page.
const LEGACY_HOST_SUFFIX = "gomarketi.com";
const ROOT_DOMAIN = process.env.NEXT_PUBLIC_STORE_DOMAIN ?? "wojalo.com";

export async function proxy(request: NextRequest) {
  const host = (request.headers.get("host") ?? "").replace(/:\d+$/, "");
  if (ROOT_DOMAIN !== LEGACY_HOST_SUFFIX && (host === LEGACY_HOST_SUFFIX || host.endsWith(`.${LEGACY_HOST_SUFFIX}`))) {
    const url = request.nextUrl.clone();
    url.protocol = "https:";
    url.host = host.slice(0, host.length - LEGACY_HOST_SUFFIX.length) + ROOT_DOMAIN;
    url.port = "";
    return NextResponse.redirect(url, 308);
  }

  const path = request.nextUrl.pathname;

  if (
    path.startsWith(ROUTES.AUTH.LOGIN) ||
    path.startsWith(ROUTES.AUTH.SIGNUP)
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get("gomarket_auth")?.value;
  // const token = true;

  if (!token) {
    return NextResponse.redirect(new URL(ROUTES.AUTH.LOGIN, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
