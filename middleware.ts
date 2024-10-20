import NextAuth from "next-auth";
import authConfig from "./auth.config";

export const { auth } = NextAuth(authConfig);

const protectedRoutes = ["/admin-dashboard"]; // protected routes for non-logged in users and users with incomplete profile
const publicRoutes = [
  "/",
  "/login",
  "/sign-up",
  "/new-verification",
  "/new-password",
  "/reset-password",
  "/dispose-steps",
];
const apiAuthRoutes = "/api/auth";

export default auth(async (req) => {
  const path = req.nextUrl.pathname;
  const isLoggedIn = !!req.auth; // retrieve the session
  const isApiAuthRoute = path.startsWith(apiAuthRoutes);
  const isPublicRoute = publicRoutes.includes(path);
  const isProtectedRoute = protectedRoutes.includes(path);

  if (isApiAuthRoute) {
    return;
  }
  // if (isLoggedIn && isProtectedRoute) {
  //   if (!req.auth?.user.role) {
  //     console.log("User", req.auth?);
  //     return Response.redirect(new URL("/user-profile", req.nextUrl));
  //   }
  // }
  if (isLoggedIn && (path.includes("/login") || path.includes("/signup"))) {
    // users should not be able to access auth routes when logged in
    return Response.redirect(new URL("/", req.nextUrl));
  }
  if (!isLoggedIn && !isPublicRoute) {
    // redirect users to login page when accessing protected routes if not logged in
    return Response.redirect(new URL("/login", req.nextUrl));
  }
  return;
});

// middleware is invoked all on paths
export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
