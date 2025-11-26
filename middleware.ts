import NextAuth from "next-auth";
import authConfig from "./auth.config";
import { getToken } from "next-auth/jwt";
import { Role } from "@prisma/client";

export const { auth } = NextAuth(authConfig);

const adminRoutes = ["/admin"];
const apiAuthRoutes = "/api/auth";

export default auth(async (req) => {
  const path = req.nextUrl.pathname;

  // ✅ 1. Allow all cron routes to bypass middleware
  if (path.startsWith("/api/cron")) {
    return;  // Skip all auth for cron jobs
  }

  const isLoggedIn = !!req.auth;
  const isApiAuthRoute = path.startsWith(apiAuthRoutes);

  const token = await getToken({
    req,
    secret: process.env.AUTH_SECRET,
    secureCookie: process.env.NODE_ENV === "production",
  });

  const isAdminRoute = adminRoutes.some((route) => path.startsWith(route));

  // ❌ Block direct /api/auth access
  if (isApiAuthRoute) {
    return Response.redirect(new URL("/not-found", req.nextUrl));
  }

  // 🔐 If not logged in or no token
  if (!isLoggedIn && !token) {
    if (isAdminRoute) {
      return Response.redirect(new URL("/login", req.nextUrl));
    }
  } else {
    // 🔐 Logged in but NOT admin accessing admin routes
    if (isAdminRoute && token?.role !== Role.ADMIN) {
      return Response.redirect(new URL("/not-found", req.nextUrl));
    }
  }
});

// ⭐ DO NOT USE negative matchers here
export const config = {
  matcher: [
    "/admin/:path*",
    "/api/:path*",  // Middleware applies normally
  ],
};
