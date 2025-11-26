import NextAuth from "next-auth";
import authConfig from "./auth.config";
import { getToken } from "next-auth/jwt";
import { Role } from "@prisma/client";

export const { auth } = NextAuth(authConfig);

const adminRoutes = ["/admin"];
const apiAuthRoutes = "/api/auth";

export default auth(async (req) => {
  const path = req.nextUrl.pathname;

  // ⭐ Allow ALL cron routes to bypass
  if (path.startsWith("/api/cron")) return;

  const isLoggedIn = !!req.auth;
  const isApiAuthRoute = path.startsWith(apiAuthRoutes);

  const token = await getToken({
    req,
    secret: process.env.AUTH_SECRET,
    secureCookie: process.env.NODE_ENV === "production",
  });

  const isAdminRoute = adminRoutes.some((route) => path.startsWith(route));

  // 🚫 Do NOT allow direct /api/auth access
  if (isApiAuthRoute) {
    return Response.redirect(new URL("/not-found", req.nextUrl));
  }

  // 🔐 Not logged in → block admin pages only
  if (!isLoggedIn && !token) {
    if (isAdminRoute) {
      return Response.redirect(new URL("/login", req.nextUrl));
    }
    return; // allow normal pages
  }

  // 🔐 Logged in but NOT admin → block admin pages
  if (isAdminRoute && token?.role !== Role.ADMIN) {
    return Response.redirect(new URL("/not-found", req.nextUrl));
  }
});

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/:path*",  // no regex, fully valid for Vercel
  ],
};
