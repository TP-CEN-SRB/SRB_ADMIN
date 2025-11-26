import NextAuth from "next-auth";
import authConfig from "./auth.config";
import { getToken } from "next-auth/jwt";
import { Role } from "@prisma/client";

export const { auth } = NextAuth(authConfig);

// Admin-only protected routes
const adminRoutes = ["/admin"];
const apiAuthRoutes = "/api/auth";

export default auth(async (req) => {
  const path = req.nextUrl.pathname;

  // Skip middleware for cron jobs (CRITICAL FIX)
  if (path.startsWith("/api/cron")) {
    return; // allow request to proceed normally
  }

  const isLoggedIn = !!req.auth;

  const isApiAuthRoute = path.startsWith(apiAuthRoutes);

  const token = await getToken({
    req,
    secret: process.env.AUTH_SECRET,
    secureCookie: process.env.NODE_ENV === "production",
  });

  const isAdminRoute = adminRoutes.some((route) => path.startsWith(route));

  // Block access to /api/auth/* directly
  if (isApiAuthRoute) {
    return Response.redirect(new URL("/not-found", req.nextUrl));
  }

  // Not logged in OR no token
  if (!isLoggedIn && !token) {
    if (isAdminRoute) {
      return Response.redirect(new URL("/login", req.nextUrl));
    }
  } else {
    // Logged in but NOT admin trying to access admin routes
    if (isAdminRoute && token?.role !== Role.ADMIN) {
      return Response.redirect(new URL("/not-found", req.nextUrl));
    }
  }
});

// Middleware matcher
export const config = {
  matcher: [
    "/admin/:path*",
    "/api/:path*",
    "!/api/cron/:path*",  // ✅ EXCLUDE all cron routes
  ],
};
