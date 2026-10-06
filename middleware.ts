import { NextRequest, NextResponse } from "next/server";

const TOKEN_COOKIE = "pf_token";
const PUBLIC = ["/login", "/verify-otp", "/change-password"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isPublic = PUBLIC.some(
    (p) => pathname === p || pathname.startsWith(p + "/"),
  );

  // Read pf_token — the cookie that lives on the Vercel domain.
  const token = req.cookies.get(TOKEN_COOKIE)?.value;

  // Protected route, no token → bounce to login.
  if (!isPublic && !token) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    if (pathname !== "/") url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // Already signed in, hitting login → send to dashboard.
  if (isPublic && token && pathname !== "/change-password") {
    const url = req.nextUrl.clone();
    url.pathname = "/dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|webp|ico)).*)",
  ],
};