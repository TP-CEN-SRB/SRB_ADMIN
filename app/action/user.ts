"use server";
import { signIn, signOut } from "@/auth";
import prisma from "@/lib/db";
import {
  LoginSchema,
  SignUpAdminSchema,
  ResetSchema,
  NewPasswordSchema,
  SignUpBinSchema,
  UpdateAdminEmailSchema,
} from "@/schemas/auth";
import { capitalizeFirstLetter } from "@/utils/capitalizeFirstLetter";
import { compare, hash } from "bcryptjs";
import { AuthError } from "next-auth";
import { z } from "zod";
import {
  generateVerificationToken,
  generatePasswordResetToken,
} from "@/lib/tokens";
import { sendVerificationEmail, sendPasswordResetEmail } from "@/lib/mail";
import {
  ableToGenerateNewPasswordResetToken,
  getPasswordResetTokenByEmail,
  getPasswordResetTokenByToken,
} from "@/utils/passwordResetToken";
import { Faculty, Role } from "@prisma/client";
import {
  ableToGenerateNewVerificationToken,
  getVerificationTokenByEmail,
} from "@/utils/verificationToken";
import { getSessionUser } from "@/utils/getAuth";
import { revalidatePath } from "next/cache";

const signUp = async (values: z.infer<typeof SignUpAdminSchema>) => {
  const validatedFields = SignUpAdminSchema.safeParse(values);
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
  const hashedPassword = await hash(password, 10);
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
  const hashedPassword = await hash(password, 10);
  const hashedSecondaryPassword = await hash(secondaryPassword, 10);
  await prisma.user.create({
    data: {
      name: name,
      email: email,
      emailVerified: new Date(), // automatically verify bin user
      role: Role.BIN,
      password: hashedPassword,
      secondaryPassword: hashedSecondaryPassword,
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
    return { error: "Invalid credentials" };
  }
  const isMatched = await compare(password, existingUser.password);
  if (!isMatched) {
    return { error: "Invalid credentials!" };
  }
  if (!existingUser.emailVerified) {
    const existingToken = await getVerificationTokenByEmail(existingUser.email);
    if (!existingToken) {
      const verificationToken = await generateVerificationToken(
        existingUser.email
      );
      await sendVerificationEmail(
        verificationToken.email,
        verificationToken.token
      );
      return { success: "Confirmation email sent!" };
    }
    const ableToResendEmail = await ableToGenerateNewVerificationToken(
      existingToken.token
    );
    if (!ableToResendEmail) {
      return {
        error:
          "We have already sent you an email! If you wish to resend please try again later",
      };
    }
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
    return { error: "Invalid email!" };
  }
  const formData = validatedFields.data;
  const email = formData.email;
  const existingUser = await prisma.user.findFirst({
    where: {
      email: email,
      role: {
        in: ["ADMIN", "STUDENT"],
      },
    },
  });
  if (!existingUser) {
    return { error: "Invalid credentials!" };
  }
  const existingToken = await getPasswordResetTokenByEmail(existingUser.email);
  if (!existingToken) {
    const passwordResetToken = await generatePasswordResetToken(
      existingUser.email
    );
    await sendPasswordResetEmail(
      passwordResetToken.email,
      passwordResetToken.token
    );
    return { success: "Confirmation email sent!" };
  }
  const ableToResendEmail = await ableToGenerateNewPasswordResetToken(
    existingToken.token
  );
  if (!ableToResendEmail) {
    return {
      error:
        "We have already sent you an email! If you wish to resend please try again later",
    };
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
  if (!token) return { error: "Something went wrong!" };
  const validatedFields = NewPasswordSchema.safeParse(values);
  if (!validatedFields.success) {
    return { error: "Invalid credentials!" };
  }
  const formData = validatedFields.data;
  const password = formData.password;
  const existingToken = await getPasswordResetTokenByToken(token);
  if (!existingToken)
    return {
      error: "Oops! This link may have already been used",
    };

  const hasExpired = new Date(existingToken.expires) < new Date();
  if (hasExpired) return { error: "Oops! This link has expired" };

  const existingUser = await prisma.user.findFirst({
    where: { email: existingToken.email, role: "ADMIN" },
  });
  if (!existingUser) {
    return { error: "Something went wrong!" };
  }
  const hashedPassword = await hash(password, 10);
  await prisma.user.update({
    where: { id: existingUser.id },
    data: { password: hashedPassword },
  });
  await prisma.passswordResetToken.delete({
    where: { id: existingToken.id },
  });
  return { success: "Your password has been updated!" };
};

const getLoggedInUserById = async (id: string) => {
  const sessionUser = await getSessionUser();
  if (sessionUser?.id !== id || !sessionUser) {
    return;
  }
  const binUser = await prisma.user.findFirst({
    where: { id: id, role: sessionUser.role },
  });
  return binUser;
};

const updateAdmin = async (values: z.infer<typeof SignUpAdminSchema>) => {
  const validatedFields = SignUpAdminSchema.omit({
    password: true,
  }).safeParse(values);
  if (!validatedFields.success) {
    return { error: "Invalid credentials!" };
  }
  const { name, email, faculty } = validatedFields.data;
  const existingUser = await prisma.user.findUnique({
    where: { email: email, role: "ADMIN" },
  });
  if (!existingUser) {
    return { error: "Something went wrong!" };
  }
  const sessionUser = await getSessionUser();
  if (
    !sessionUser ||
    sessionUser.role !== "ADMIN" ||
    sessionUser.id !== existingUser.id
  ) {
    return { error: "Unauthorized access!" };
  }
  await prisma.user.update({
    where: { id: existingUser.id },
    data: { name: capitalizeFirstLetter(name), faculty },
  });
  revalidatePath("/admin/profile");
  return { success: "Profile updated successfully!" };
};

const updateAdminEmail = async (
  values: z.infer<typeof UpdateAdminEmailSchema>
) => {
  const sessionUser = await getSessionUser();
  if (!sessionUser || sessionUser.role !== "ADMIN") {
    return { error: "Unauthorized access!" };
  }
  const validatedFields = UpdateAdminEmailSchema.safeParse(values);
  if (!validatedFields.success) {
    return { error: "Invalid credentials!" };
  }
  const { email, password } = validatedFields.data;
  const currentUser = await prisma.user.findUnique({
    where: { id: sessionUser.id, role: "ADMIN" },
  });
  if (!currentUser) {
    return { error: "Something went wrong!" };
  }
  const isMatched = await compare(password, currentUser.password);
  if (!isMatched) {
    return { error: "Invalid credentials!" };
  }
  const existingUser = await prisma.user.findUnique({
    where: { email: email },
  });
  if (existingUser) {
    return { error: "Email is already in use!" };
  }
  const existingToken = await getVerificationTokenByEmail(email);
  if (!existingToken) {
    const verificationToken = await generateVerificationToken(
      email,
      currentUser.email
    );
    await sendVerificationEmail(
      verificationToken.email,
      verificationToken.token
    );
    return { success: "Confirmation email sent!" };
  }
  const ableToResendEmail = await ableToGenerateNewVerificationToken(
    existingToken.token
  );
  if (!ableToResendEmail) {
    return {
      error:
        "We have already sent you an email! If you wish to resend please try again later",
    };
  }
  const verificationToken = await generateVerificationToken(email);
  await sendVerificationEmail(verificationToken.email, verificationToken.token);
  return { success: "Confirmation email sent!" };
};

const getAllBinUsers = async () => {
  const result = await prisma.user.findMany({
    where: {
      role: "BIN",
    },
    select: {
      id: true,
      name: true,
      email: true,
    },
  });
  return result;
};

const deleteBinUser = async (id: string) => {
  const user = await prisma.user.findUnique({
    where: {
      id,
    },
  });
  if (user) {
    await prisma.user.delete({
      where: {
        id: id,
      },
    });
    return { success: `User with ID ${id} deleted successfully` };
  } else {
    return { error: `User with ID ${id} does not exist` };
  }
};

const getAllStudentUsers = async (
  page: number,
  query: string | null,
  sortOrder: string,
  sortItem: string,
  emailType: string | null,
  faculty: string | null
) => {
  const sortableEntities = ["point", "disposal"];
  const allowedEmailTypes = ["verified", "non-verified"];
  const pageCondition = page < 0;
  const sortOrderCondition =
    sortOrder !== undefined && sortOrder !== "asc" && sortOrder != "desc";
  const sortItemCondition =
    sortItem !== undefined &&
    !Object.values(sortableEntities).includes(sortItem);
  const emailTypeCondition =
    emailType &&
    !emailType.split(",").every((type) => allowedEmailTypes.includes(type));
  const facultyCondition =
    faculty &&
    !faculty
      .split(",")
      .every((f) => Object.values(Faculty).includes(f as Faculty));

  // check if faculty condiiton is valid
  if (
    pageCondition ||
    sortItemCondition ||
    sortOrderCondition ||
    emailTypeCondition ||
    facultyCondition
  ) {
    return { studentCount: 0, students: [] };
  }
  const [studentCount, students] = await Promise.all([
    prisma.user.count({
      where: {
        role: "STUDENT",
        OR: query
          ? [
              { email: { contains: query, mode: "insensitive" } },
              { name: { contains: query, mode: "insensitive" } },
            ]
          : undefined,
        emailVerified:
          emailType?.split(",").includes(allowedEmailTypes[0]) &&
          emailType?.split(",").includes(allowedEmailTypes[1])
            ? undefined
            : emailType?.split(",").includes(allowedEmailTypes[0])
            ? { not: null }
            : emailType?.split(",").includes(allowedEmailTypes[1])
            ? null
            : undefined,
        faculty: faculty ? { in: faculty.split(",") as Faculty[] } : undefined,
      },
    }),
    prisma.user.findMany({
      where: {
        role: "STUDENT",
        OR: query
          ? [
              { email: { contains: query, mode: "insensitive" } },
              { name: { contains: query, mode: "insensitive" } },
            ]
          : undefined,
        emailVerified:
          emailType?.split(",").includes(allowedEmailTypes[0]) &&
          emailType?.split(",").includes(allowedEmailTypes[1])
            ? undefined
            : emailType?.split(",").includes(allowedEmailTypes[0])
            ? { not: null }
            : emailType?.split(",").includes(allowedEmailTypes[1])
            ? null
            : undefined,
        faculty: faculty ? { in: faculty.split(",") as Faculty[] } : undefined,
      },
      take: 10,
      skip: (page - 1) * 10,
      orderBy:
        sortItem === "disposal"
          ? { disposals: { _count: sortOrder } }
          : sortItem === "point"
          ? { point: { balance: sortOrder } }
          : { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        emailVerified: true,
        point: { select: { balance: true } },
        _count: { select: { disposals: true } },
      },
    }),
  ]);
  return { studentCount, students };
};

const deleteUser = async (userId: string) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return { error: "User not found" };
  }
  const deletedUser = await prisma.user.delete({ where: { id: userId } });
  if (!deleteUser) {
    return { error: "Failed to delete user" };
  }
  revalidatePath("/admin/user");
  return { success: `User ${deletedUser.id} successfully deleted` };
};

export {
  signUp,
  signUpBin,
  login,
  logout,
  logoutBin,
  resetPassword,
  newPassword,
  getLoggedInUserById,
  updateAdmin,
  updateAdminEmail,
  getAllBinUsers,
  deleteBinUser,
  getAllStudentUsers,
  deleteUser,
};
