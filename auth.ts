// import NextAuth, { type DefaultSession } from "next-auth";
// import { PrismaAdapter } from "@auth/prisma-adapter";
// import prisma from "@/lib/db";
// import authConfig from "./auth.config";

// type ExtendedUser = DefaultSession["user"] & {
//   role: "ADMIN" | "USER";
//   age: number; // check if age of user exist in middleware before purchasing passes
// };

// declare module "next-auth" {
//   interface Session {
//     user: ExtendedUser;
//   }
// }

// export const { handlers, signIn, signOut, auth } = NextAuth({
//   adapter: PrismaAdapter(prisma),
//   session: { strategy: "jwt" },
//   ...authConfig,
//   pages: {
//     signIn: "/login",
//     // signIn: "/auth/signin",
//     // signOut: "/auth/signout",
//     // error: "/auth/error",
//     // verifyRequest: "/auth/verify-request",
//     // newUser: "/auth/new-user",
//   },
//   events: {
//     // verify the email linked with providers, since google already authenticated it
//     async linkAccount({ user }) {
//       await prisma.user.update({
//         where: { id: user.id },
//         data: {
//           emailVerified: new Date(),
//         },
//       });
//     },
//   },
//   callbacks: {
//     // token in session parameters is identical to the one in jwt
//     async session({ session, token }) {
//       // check if id exists in token and if user is logged in
//       if (session.user) {
//         if (token.sub) {
//           session.user.id = token.sub;
//         }
//         if (token.age) {
//           session.user.age = token.age as number;
//         }
//         if (token.role) {
//           session.user.role = token.role as Role;
//         }
//       }
//       console.log(session);
//       return session;
//     },
//     async jwt({ token }) {
//       // token.sub contains the uuid of the logged in user
//       if (!token.sub) return token;
//       const existingUser = await prisma.user.findUnique({
//         where: { id: token.sub },
//       });
//       if (!existingUser) return token;
//       token.role = existingUser.role;
//       token.dateOfBirth = existingUser.dateOfBirth;
//       if (existingUser.dateOfBirth) {
//         const today = new Date();
//         let age = today.getFullYear() - existingUser.dateOfBirth.getFullYear();
//         const monthDifference =
//           today.getMonth() - existingUser.dateOfBirth.getMonth();
//         if (
//           monthDifference < 0 ||
//           (monthDifference == 0 &&
//             today.getDate() < existingUser.dateOfBirth.getDate())
//         ) {
//           age--;
//         }
//         token.age = age;
//       }

//       return token;
//     },
//   },
// });
