import { NextRequest, NextResponse } from "next/server";

const protectedRoutes = ["/admin/dashboard", "/admin/products", "/admin/categories", "/admin/gallery", "/admin/blog", "/admin/orders", "/admin/settings", "/admin/seo"];
const publicRoutes = ["/admin/login"];

export default async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const isProtectedRoute = protectedRoutes.some((route) => path.startsWith(route));
  const isPublicRoute = publicRoutes.some((route) => path.startsWith(route));
  const hasSessionCookie = req.cookies.has("authjs.session-token") || req.cookies.has("__Secure-authjs.session-token");

  if (isProtectedRoute && !hasSessionCookie) {
    const loginUrl = new URL("/admin/login", req.url);
    loginUrl.searchParams.set("callbackUrl", path);
    return NextResponse.redirect(loginUrl);
  }

  if (isPublicRoute && hasSessionCookie && path === "/admin/login") {
    return NextResponse.redirect(new URL("/admin/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
