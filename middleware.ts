import NextAuth from "next-auth";
import authConfig from "./auth.config";
import { getToken } from "next-auth/jwt";
import { Role } from "@prisma/client";

export const { auth } = NextAuth(authConfig);

const adminRoutes = ["/admin"];
const apiAuthRoutes = "/api/auth";

export default auth(async (req) => {
  const path = req.nextUrl.pathname;

  // ✅ 1. Skip ALL cron routes — absolutely no auth for them
  if (path.startsWith("/api/cron")) {
    return;  // allow cron job to run with no middleware
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

  // 🔐 User not logged in
  if (!isLoggedIn && !token) {
    if (isAdminRoute) {
      return Response.redirect(new URL("/login", req.nextUrl));
    }
  } else {
    // 🔐 User logged in but NOT admin — block admin dashboard
    if (isAdminRoute && token?.role !== Role.ADMIN) {
      return Response.redirect(new URL("/not-found", req.nextUrl));
    }
  }
});

// ⭐ Correct matcher — bypasses /api/cron entirely
export const config = {
  matcher: [
    "/admin/:path*",         // Admin pages protected
    "/api/(?!cron).*",       // Apply middleware to API except /api/cron/**
  ],
};
