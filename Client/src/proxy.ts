import { NextRequest, NextResponse } from "next/server";

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if user is authenticated
  const isAuthenticated = request.cookies.get("accessToken")?.value || false;

  // If trying to access auth pages while authenticated, redirect to dashboard
  if (pathname.startsWith("/auth") && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard/overview", request.url));
  }

  // If trying to access dashboard while not authenticated, redirect to login
  if (pathname.startsWith("/dashboard") && !isAuthenticated) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  // If accessing root path, redirect based on auth status
  if (pathname === "/") {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL("/dashboard/overview", request.url));
    } else {
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
