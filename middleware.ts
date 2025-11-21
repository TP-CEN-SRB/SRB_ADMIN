import NextAuth from "next-auth";
import authConfig from "./auth.config";
import { getToken } from "next-auth/jwt";
import { Role } from "@prisma/client";

export const { auth } = NextAuth(authConfig);

const adminRoutes = ["/admin"];
const apiAuthRoutes = "/api/auth";

export default auth(async (req) => {
  const path = req.nextUrl.pathname;
  const isLoggedIn = !!req.auth;
  const isApiAuthRoute = path.startsWith(apiAuthRoutes);
  const token = await getToken({
    req,
    secret: process.env.AUTH_SECRET,
    secureCookie: process.env.NODE_ENV === "production",
  });

  const isAdminRoute = adminRoutes.some((route) => path.startsWith(route));

  if (isApiAuthRoute) {
    return Response.redirect(new URL("/not-found", req.nextUrl));
  }

  if (!isLoggedIn && !token) {
    // 🚫 Redirect unauthenticated users only if they're accessing /admin
    if (isAdminRoute) {
      return Response.redirect(new URL("/login", req.nextUrl));
    }
  } else {
    // 🚫 Restrict access to admin routes by role
    if (isAdminRoute && token?.role !== Role.ADMIN) {
      return Response.redirect(new URL("/not-found", req.nextUrl));
    }
  }
});

export const config = {
  matcher: ["/admin/:path*", "/api/:path*"],
};
