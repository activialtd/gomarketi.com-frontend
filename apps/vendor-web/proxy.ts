import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ROUTES } from "@/lib/config/routes";

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;

  if (
    path.startsWith(ROUTES.AUTH.LOGIN) ||
    path.startsWith(ROUTES.AUTH.SIGNUP)
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get("gomarket_auth")?.value;

  if (!token) {
    return NextResponse.redirect(new URL(ROUTES.AUTH.LOGIN, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
