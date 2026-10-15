import { NextRequest, NextResponse } from "next/server";

const protectedRoutes = [
  "/dashboard",
  "/projects",
  "/forms",
  "/members",
  "/notifications",
  "/settings",
  "/select-project",
  "/my",
  "/submissions",
  "/tenants",
];

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const pathname = request.nextUrl.pathname;

  const isProtectedRoute = protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/projects/:path*",
    "/forms/:path*",
    "/members/:path*",
    "/notifications/:path*",
    "/settings/:path*",
    "/select-project/:path*",
    "/my/:path*",
    "/submissions/:path*",
    "/tenants/:path*",
  ],
};
