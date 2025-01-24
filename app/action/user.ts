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
  UpdateStudentSchema,
  UpdateBinSchema,
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
  const confirmPassword = formData.confirmPassword;
  if (password !== confirmPassword) {
    return { error: "Passwords don't match!" };
  }
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
  const password = formData.password.trim();
  const location = capitalizeFirstLetter(formData.location);
  const faculty = formData.faculty;
  const lat = formData.latitude;
  const long = formData.longitude;
  const existingBinUser = await checkBinUserWithSimilarRecord(
    name,
    email,
    location,
    lat,
    long
  );
  if (existingBinUser) {
    return { error: "Duplicate found. Bin Manager already exists!" };
  }
  const hashedPassword = await hash(password, 10);
  await prisma.user.create({
    data: {
      name,
      email,
      emailVerified: new Date(), // automatically verify bin user
      location: location,
      faculty: faculty,
      role: Role.BIN,
      password: hashedPassword,
      lat: lat,
      long: long,
      //to update faculty (cfm have merge conflict)
    },
  });
  revalidatePath("/admin/bin/manager");
  return { success: "Bin user created successfully" };
};

const updateBinUser = async (
  id: string,
  values: z.infer<typeof UpdateBinSchema>
) => {
  const validatedFields = UpdateBinSchema.safeParse(values);
  if (!validatedFields.success) {
    return { error: "Invalid fields!" };
  }
  const formData = validatedFields.data;
  const name = capitalizeFirstLetter(formData.name).trim();
  const email = formData.email.toLowerCase().trim();
  const location = formData.location.trim();
  const faculty = formData.faculty;
  const lat = formData.latitude;
  const long = formData.longitude;
  const isExistingPassword = formData.isExistingPassword;
  let password;
  const existingBinUser = await prisma.user.findUnique({
    where: { id },
  });
  if (!isExistingPassword) {
    password = await hash(formData.password, 10);
  }

  if (existingBinUser) {
    const existingBinUser = await checkBinUserWithSimilarRecord(
      name,
      email,
      location,
      lat,
      long,
      true,
      id
    );
    if (existingBinUser) {
      return { error: "Duplicate found. Bin Manager already exists!" };
    }
    await prisma.user.update({
      where: { id },
      data: {
        name,
        email,
        location,
        faculty,
        lat,
        long,
        ...(!isExistingPassword && { password: password }),
      },
    });
    revalidatePath("/admin/bin/manager");
    return { success: "Bin Manager updated!" };
  } else {
    return { error: "Bin Manager does not exist!" };
  }
};

const checkBinUserWithSimilarRecord = async (
  name: string,
  email: string,
  location: string,
  lat: number,
  long: number,
  update?: boolean,
  id?: string
) => {
  const binUser = await prisma.user.findFirst({
    where: {
      OR: [{ name }, { email }, { location }, { AND: [{ lat }, { long }] }],
      ...(update && id && { id: { not: id } }),
    },
  });
  return binUser;
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
    confirmPassword: true,
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
  return { success: "Profile updated successfully" };
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
      faculty: true,
      lat: true,
      long: true,
      _count: {
        select: { bins: true },
      },
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
    revalidatePath("/admin/bin/manager");
    return { success: `User with ID ${id} deleted successfully` };
  } else {
    return { error: `User with ID ${id} does not exist` };
  }
};

const getAllStudentUsers = async (
  page: number | null,
  query: string | null,
  sortOrder: string | undefined,
  sortItem: string | undefined,
  emailType: string | null,
  faculty: string | null
) => {
  const sessionUser = await getSessionUser();
  if (!sessionUser || sessionUser.role !== "ADMIN") {
    return { error: "Unauthorized access!" };
  }
  const sortableItems = ["disposal", "point", "redemption"];
  const allowedEmailTypes = ["verified", "non-verified"];
  const pageCondition = page != null && page < 0;
  const sortOrderCondition =
    sortOrder !== undefined && sortOrder !== "asc" && sortOrder !== "desc";
  const sortItemCondition =
    sortItem !== undefined && !Object.values(sortableItems).includes(sortItem);
  const emailTypeCondition =
    emailType &&
    !emailType.split(",").every((type) => allowedEmailTypes.includes(type));
  const facultyCondition =
    faculty &&
    !faculty
      .split(",")
      .every((f) => Object.values(Faculty).includes(f as Faculty));

  // check if all conditions are met
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
      take: page ? 10 : undefined,
      skip: page ? (page - 1) * 10 : 0,
      orderBy:
        sortItem === sortableItems[0]
          ? { disposals: { _count: sortOrder } }
          : sortItem === sortableItems[1]
          ? { point: { balance: sortOrder } }
          : sortItem === sortableItems[2]
          ? { redemptions: { _count: sortOrder } }
          : { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        emailVerified: true,
        faculty: true,
        point: { select: { balance: true, updatedAt: true } },
        _count: { select: { disposals: true, redemptions: true } },
        createdAt: true,
        updatedAt: true,
      },
    }),
  ]);
  return { studentCount, students };
};

const deleteStudent = async (userId: string) => {
  const sessionUser = await getSessionUser();
  if (!sessionUser || sessionUser.role !== "ADMIN") {
    return { error: "Unauthorized access!" };
  }
  const student = await prisma.user.findUnique({
    where: { id: userId, role: "STUDENT" },
  });
  if (!student) {
    return { error: "User not found" };
  }
  const deletedStudent = await prisma.user.delete({ where: { id: userId } });
  if (!deletedStudent) {
    return { error: "Failed to delete user" };
  }
  revalidatePath("/admin/student");
  return { success: `Student ${deletedStudent.id} deleted successfully` };
};

const updateStudent = async (
  values: z.infer<typeof UpdateStudentSchema>,
  userId: string
) => {
  const sessionUser = await getSessionUser();
  if (!sessionUser || sessionUser.role !== "ADMIN") {
    return { error: "Unauthorized access!" };
  }
  const validatedFields = UpdateStudentSchema.safeParse(values);
  if (!validatedFields.success) {
    return { error: "Invalid credentials!" };
  }
  const { name, email, faculty, points } = validatedFields.data;
  const existingUser = await prisma.user.findUnique({
    where: { id: userId, role: "STUDENT" },
  });
  if (!existingUser) {
    return { error: "Something went wrong!" };
  }
  const updatedUser = await prisma.user.update({
    where: { id: existingUser.id },
    data: {
      name: capitalizeFirstLetter(name),
      email,
      faculty,
      point: { update: { balance: points } },
    },
  });
  revalidatePath("/admin/student");
  return { success: `Student ${updatedUser.id} updated successfully ` };
};

const getTopHundredUsers = async (dateFrom?: Date, dateTo?: Date) => {
  const curr = new Date();
      const monday = curr.getDate() - ((curr.getDay() + 6) % 7);
      
      const startDate = new Date(curr.setDate(monday));
      startDate.setHours(0, 0, 0, 0);
      
      const endDate = new Date(curr);
      endDate.setDate(monday + 6); // Add 6 days to get to Sunday
      endDate.setHours(23, 59, 59, 999);
  // Get top users by points
  const data = await prisma.disposal.groupBy({
    by: ["userId"],
    where: {
      user: {
        role: "STUDENT" as Role,
      },
      isRedeemed: true,
      createdAt: {
        gte: dateFrom ?? startDate,
        lte: dateTo ?? endDate,
      },
    },
    _sum: {
      pointsAwarded: true,
    },
    orderBy: {
      _sum: { pointsAwarded: "desc" },
    },
    take: 100,
  });

  const userIds = data
    .map((user) => user.userId)
    .filter((id): id is string => id !== null);

  if (userIds.length === 0) {
    return [];
  }

  const [userDisposals, userRedemptions, allTestData] = await Promise.all([
    prisma.disposal.groupBy({
      by: ["userId"],
      _count: {
        id: true,
      },
      where: {
        userId: {
          in: userIds,
        },
      },
    }),
    prisma.redemption.groupBy({
      by: ["userId"],
      _count: {
        id: true,
      },
      where: {
        userId: {
          in: userIds,
        },
      },
    }),
    prisma.disposal.findMany({
      where: {
        userId: {
          in: userIds,
        },
      },
      include: {
        user: {
          select: {
            id: true,
          },
        },
        bin: {
          include: {
            binMaterial: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    }),
  ]);

  const orderedDisposals = await Promise.all(
    userIds.map(async (userId) => {
      const disposal = userDisposals.find((d) => d.userId === userId) || {
        _count: { id: 0 },
      };

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          name: true,
          email: true,
        },
      });

      const userTestData = allTestData.filter((t) => t.user?.id === userId);
      const materialCounts = userTestData.reduce((acc, item) => {
        const materialName = item.bin?.binMaterial?.name;
        if (materialName) {
          acc[materialName] = (acc[materialName] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>);

      const mostFrequentMaterial = Object.entries(materialCounts).reduce(
        (max, [material, count]) => 
          count > (max[1] || 0) ? [material, count] : max,
        ['', 0]
      )[0];

      return {
        username: user?.name,
        userId,
        balance: data.find((d) => d.userId === userId)?._sum.pointsAwarded || 0,
        disposalCount: disposal._count.id,
        redemptionCount: userRedemptions.find((r) => r.userId === userId)?._count?.id || 0,
        mostFrequentMaterial: mostFrequentMaterial || undefined,
      };
    })
  );

  return orderedDisposals.sort((a, b) => b.balance - a.balance);
};

const listOfBinManagersUsed = async () => {
  const binManagers = await prisma.user.findMany({
    where: { role: "BIN" },
    select: {
      id: true,
      name: true,
      email: true,
      faculty: true,
      _count: { select: { bins: true } },
    },
  });
  return binManagers.map((binUser) => ({
    id: binUser?.id as string,
    name: binUser?.name as string,
    email: binUser?.email as string,
    faculty: binUser?.faculty as Faculty,
    _count: { bins: binUser._count.bins as number },
  }));
};

export {
  signUp,
  signUpBin,
  updateBinUser,
  login,
  logout,
  resetPassword,
  newPassword,
  getLoggedInUserById,
  updateAdmin,
  updateAdminEmail,
  getAllBinUsers,
  deleteBinUser,
  getAllStudentUsers,
  deleteStudent,
  updateStudent,
  getTopHundredUsers,
  listOfBinManagersUsed,
};
