"use server";
import { signIn, signOut } from "@/auth";
import prisma from "@/lib/db";
import {
  LoginSchema,
  SignUpSchema,
  ResetSchema,
  NewPasswordSchema,
  SignUpBinSchema,
} from "@/schemas";
import { capitalizeFirstLetter } from "@/utils/capitalizeFirstLetter";
import { compare, hash } from "bcryptjs";
import { AuthError } from "next-auth";
import { z } from "zod";
import {
  generateVerificationToken,
  generatePasswordResetToken,
} from "@/lib/tokens";
import { sendVerificationEmail, sendPasswordResetEmail } from "@/lib/mail";
import { getPasswordResetTokenByToken } from "@/utils/passwordResetToken";
import { Role } from "@prisma/client";
import { generateRandomNumber } from "@/utils/generateRandomNumber";

const signUp = async (values: z.infer<typeof SignUpSchema>) => {
  const validatedFields = SignUpSchema.safeParse(values);
  if (!validatedFields.success) {
    return { error: "Invalid fields!" };
  }
  const formData = validatedFields.data;
  const name = capitalizeFirstLetter(formData.name);
  const email = formData.email;
  const password = formData.password;
  const faculty = formData.faculty;
  const existingUser = await prisma.user.findUnique({
    where: { email: email },
  });
  if (existingUser) {
    return { error: "User already exists!" };
  }
  const salt = generateRandomNumber(8, 16);
  const hashedPassword = await hash(password, salt);
  await prisma.user.create({
    data: {
      name: name,
      faculty: faculty,
      email: email,
      role: Role.ADMIN,
      password: hashedPassword,
    },
  });
  const verificationToken = await generateVerificationToken(email);
  await sendVerificationEmail(verificationToken.email, verificationToken.token);
  return { success: "Confirmation email sent!" };
};

const signUpBin = async (values: z.infer<typeof SignUpBinSchema>) => {
  const validatedFields = SignUpBinSchema.safeParse(values);
  if (!validatedFields.success) {
    return { error: "Invalid fields!" };
  }
  const formData = validatedFields.data;
  const name = capitalizeFirstLetter(formData.name);
  const email = formData.email;
  const password = formData.password;
  const secondaryPassword = formData.secondaryPassword;
  const location = formData.location;
  const existingUser = await prisma.user.findUnique({
    where: { email: email },
  });
  if (existingUser) {
    return { error: "User already exists!" };
  }
  const salt = generateRandomNumber(8, 16);
  const hashedPassword = await hash(password, salt);
  const hashedSecondaryPassword = await hash(secondaryPassword, salt);
  await prisma.user.create({
    data: {
      name: name,
      email: email,
      emailVerified: new Date(), // automatically verify bin user
      role: Role.BIN,
      password: hashedPassword,
      secondaryPassword: hashedSecondaryPassword,
      bins: {
        createMany: {
          data: [
            {
              location: `${location}`,
              material: "PLASTIC",
            },
            { location: `${location}`, material: "METAL" },
          ],
        },
      },
    },
  });
  return { success: "Bin successfully created!" };
};

const login = async (values: z.infer<typeof LoginSchema>) => {
  const validatedFields = LoginSchema.safeParse(values);
  if (!validatedFields.success) {
    return { error: "Invalid fields!" };
  }
  const formData = validatedFields.data;
  const email = formData.email;
  const password = formData.password;
  const existingUser = await prisma.user.findFirst({
    where: {
      email: email,
      role: {
        in: [Role.ADMIN, Role.BIN],
      },
    },
  });
  if (!existingUser) {
    return { error: "Email does not exist!" };
  }
  const isMatched = await compare(password, existingUser.password);
  if (!isMatched) {
    return { error: "Invalid credentials!" };
  }
  if (!existingUser.emailVerified) {
    const verificationToken = await generateVerificationToken(
      existingUser.email
    );
    await sendVerificationEmail(
      verificationToken.email,
      verificationToken.token
    );
    return { success: "Confirmation email sent!" };
  }
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
          return { error: "Invalid credentials!" };
        default: {
          return { error: "Something went wrong!" };
        }
      }
    }
    throw error;
  }
};

const logout = async () => {
  await signOut({
    redirectTo: "/",
  });
};

const logoutBin = async (userId: string, secondaryPassword: string) => {
  const binUser = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });
  if (!binUser) return { error: "User not found!" };
  const isMatched = await compare(
    secondaryPassword,
    binUser.secondaryPassword!
  );
  if (!isMatched) {
    return { error: "Invalid password!" };
  }
  await signOut({
    redirectTo: "/",
  });
};

const resetPassword = async (values: z.infer<typeof ResetSchema>) => {
  const validatedFields = ResetSchema.safeParse(values);
  if (!validatedFields.success) {
    return { error: "Invalid email" };
  }
  const formData = validatedFields.data;
  const email = formData.email;
  const existingUser = await prisma.user.findFirst({
    where: { email: email, role: "ADMIN" },
  });
  if (!existingUser) {
    return { error: "Email does not exist!" };
  }

  const passwordResetToken = await generatePasswordResetToken(email);
  await sendPasswordResetEmail(
    passwordResetToken.email,
    passwordResetToken.token
  );
  return { success: "Reset email sent!" };
};

const newPassword = async (
  values: z.infer<typeof NewPasswordSchema>,
  token: string
) => {
  if (!token) return { error: "Something went wrong! Please try again" };
  const validatedFields = NewPasswordSchema.safeParse(values);
  if (!validatedFields.success) {
    return { error: "Invalid token or password!" };
  }
  const formData = validatedFields.data;
  const password = formData.password;
  const existingToken = await getPasswordResetTokenByToken(token);
  if (!existingToken)
    return { error: "This link is invalid! Please reset your password again" };

  const hasExpired = new Date(existingToken.expires) < new Date();
  if (hasExpired)
    return { error: "This link has expired! Please reset your password again" };

  const existingUser = await prisma.user.findFirst({
    where: { email: existingToken.email, role: "ADMIN" },
  });
  if (!existingUser) {
    return { error: "Email does not exist!" };
  }
  const hashedPassword = await hash(password, 10);
  await prisma.user.update({
    where: { id: existingUser.id },
    data: { password: hashedPassword },
  });
  await prisma.passswordResetToken.delete({
    where: { id: existingToken.id },
  });
  return { success: "Password updated successfully!" };
};

const getBinUser = async (id: string) => {
  const binUser = await prisma.user.findFirst({
    where: { id: id, role: Role.BIN },
  });
  return binUser;
};

export {
  signUp,
  signUpBin,
  login,
  logout,
  logoutBin,
  resetPassword,
  newPassword,
  getBinUser,
};
