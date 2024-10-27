import NextAuth from "next-auth";
import authConfig from "./auth.config";
import { getToken } from "next-auth/jwt";
import { Role } from "@prisma/client";

export const { auth } = NextAuth(authConfig);

const adminRoutes = ["/admin-dashboard", "/bin-users"]; // protected routes for non-logged in users and users with incomplete profile
const binRoutes = [
  "/dispose-steps",
  "/disposal-confirmation",
  "/disposal-qr",
  "/detect-material",
];
const apiAuthRoutes = "/api/auth";

export default auth(async (req) => {
  const path = req.nextUrl.pathname;
  const isLoggedIn = !!req.auth;
  const isApiAuthRoute = path.startsWith(apiAuthRoutes);
  const token = await getToken({
    req,
    secret: process.env.AUTH_SECRET,
    secureCookie: true,
  });
  const isAdminRoute = adminRoutes.includes(path);
  const isBinRoute = binRoutes.includes(path);

  if (isApiAuthRoute) {
    return;
  }
  if (!isLoggedIn && !token) {
    // Redirect non-logged-in users to the login page for protected routes
    if (isAdminRoute || isBinRoute) {
      return Response.redirect(new URL("/login", req.nextUrl));
    }
  } else {
    if (isAdminRoute && token?.role !== Role.ADMIN) {
      return Response.redirect(new URL("/not-found", req.nextUrl));
    }
    if (isBinRoute && token?.role !== Role.BIN) {
      return Response.redirect(new URL("/not-found", req.nextUrl));
    }
    if (path.includes("/login") || path.includes("/signup")) {
      return Response.redirect(new URL("/", req.nextUrl));
    }
  }
});

// middleware is invoked all on paths
export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest|mp3)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
