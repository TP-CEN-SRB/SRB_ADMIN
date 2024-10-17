"use server";

import prisma from "@/lib/db";
import { LoginSchema, SignUpSchema } from "@/schemas";
import { capitalizeFirstLetter } from "@/utils/capitalizeFirstLetter";
import { hash } from "bcryptjs";
import { redirect } from "next/navigation";
import { z } from "zod";

const signUp = async (values: z.infer<typeof SignUpSchema>) => {
  const validatedFields = SignUpSchema.safeParse(values);
  if (!validatedFields.success) {
    return { error: "Invalid fields" };
  }
  const formData = validatedFields.data;
  const name = capitalizeFirstLetter(formData.name);
  const email = formData.email.toLowerCase();
  const password = formData.password;
  const faculty = formData.faculty;
  const existingUser = await prisma.user.findUnique({
    where: { email: email },
  });
  if (existingUser) {
    return { error: "User already exists" };
  }
  const hashedPassword = await hash(password, 10);
  await prisma.user.create({
    data: {
      name: name,
      faculty: faculty,
      email: email,
      password: hashedPassword,
    },
  });
  redirect("/login");
};

const login = async (values: z.infer<typeof LoginSchema>) => {
  const validatedFields = LoginSchema.safeParse(values);
  if (!validatedFields.success) {
    return { error: "Invalid fields" };
  }
  const formData = validatedFields.data;
  const email = formData.email.toLowerCase();
  const password = formData.password;
  try {
    await signIn("credentials", {
      redirectTo: "/",
      email,
      password,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid credentials" };
        default: {
          return { error: "Something went wrong" };
        }
      }
    }
    throw error;
  }
};

export { signUp, login };
