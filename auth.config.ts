import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { LoginSchema } from "./schemas/auth";
import prisma from "@/lib/db";
import { compare } from "bcryptjs";

// Notice this is only an object, not a full Auth.js instance
export default {
  providers: [
    Credentials({
      name: "DefaultCredentials",
      authorize: async (credentials) => {
        const validatedFields = LoginSchema.safeParse(credentials);
        if (validatedFields.success) {
          const { email, password } = validatedFields.data;
          const user = await prisma.user.findUnique({
            where: { email: email },
          });
          // check if user already exists either using credentials or google
          if (!user || !user.password) {
            return null;
          }
          const isMatched = await compare(password, user.password);
          if (isMatched) {
            return user;
          }
        }
        return null;
      },
    }),
  ],
  jwt: { maxAge: 60 * 60 * 24 * 7 }, // 7 days
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 7 }, // 7 days
} satisfies NextAuthConfig;
