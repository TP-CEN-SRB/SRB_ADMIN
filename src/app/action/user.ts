"use server"
import { prisma } from "@/lib/db"
import {
  SignUpAdminSchema,
  SignUpBinSchema,
  UpdateAdminEmailSchema,
  UpdateStudentSchema,
  UpdateBinSchema,
} from "@/schemas/auth"
import { z } from "zod"
import { hash } from "bcrypt"
import { Faculty, Role } from "@/generated/prisma"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { revalidatePath } from "next/cache"

function capitalizeFirstLetter(name: string): string {
  const trimmedName = name?.trim()
  if (!trimmedName) {
    return ""
  }
  return trimmedName[0].toUpperCase() + trimmedName.slice(1)
}


export async function signUpBin(values: z.infer<typeof SignUpBinSchema>){
  const validatedFields = SignUpBinSchema.safeParse(values)
  if (!validatedFields.success) {
    return { error: "Invalid fields!" }
  }
  
  const { name, email, password, location, faculty, latitude, longitude } = validatedFields.data
  
  const formattedName = capitalizeFirstLetter(name)
  const formattedLocation = capitalizeFirstLetter(location)
  const cleanPassword = password.trim()

  const existingBinUser = await checkBinUserWithSimilarRecord(
    formattedName,
    email,
    formattedLocation,
    latitude,
    longitude
  )

  if (existingBinUser) {
    return { error: "Duplicate found. Bin Manager already exists!" }
  }
  const hashedPassword = await hash(cleanPassword, 10)

  try {
    await prisma.user.create({
      data: {
        name: formattedName,
        email,
        emailVerified: true, // Better Auth standard is usually boolean, check your schema
        location: formattedLocation,
        faculty,
        diploma: "N/A",
        role: Role.BIN,
        password: hashedPassword,
        lat: latitude,
        long: longitude,
      },
    })
    revalidatePath("/admin/bin/manager")
    return { success: "Bin user created successfully." }
      
  } 
  catch (error) {
    console.error("Failed to create Bin Manager:", error)
    return { error: "Database error occurred while creating the user." }
  }
}


export async function updateBinUser(id: string, values: z.infer<typeof UpdateBinSchema>){
  const validatedFields = UpdateBinSchema.safeParse(values)
  if (!validatedFields.success) {
    return { error: "Invalid fields!" }
  }
  const formData = validatedFields.data
  const name = capitalizeFirstLetter(formData.name).trim()
  const email = formData.email.toLowerCase().trim()
  const location = formData.location.trim()
  const faculty = formData.faculty
  const lat = formData.latitude
  const long = formData.longitude
  const isExistingPassword = formData.isExistingPassword
  let password
  const existingBinUser = await prisma.user.findUnique({
    where: { id },
  })
  if (!isExistingPassword) {
    password = await hash(formData.password, 10)
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
    )
    if (existingBinUser) {
      return { error: "Duplicate found. Bin Manager already exists!" }
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
    })
    revalidatePath("/admin/bin/manager")
    return { success: "Bin Manager updated!" }
  } else {
    return { error: "Bin Manager does not exist!" }
  }
}

async function checkBinUserWithSimilarRecord(
  name: string,
  email: string,
  location: string,
  lat: number,
  long: number,
  update?: boolean,
  id?: string
){
  const binUser = await prisma.user.findFirst({
    where: {
      OR: [{ name }, { email }, { location }, { AND: [{ lat }, { long }] }],
      ...(update && id && { id: { not: id } }),
    },
  })
  return binUser
}

export async function updateAdmin(values: z.infer<typeof SignUpAdminSchema>){
  const validatedFields = SignUpAdminSchema.omit({
    password: true,
    confirmPassword: true,
  }).safeParse(values)
  if (!validatedFields.success) {
    return { error: "Invalid credentials!" }
  }
  const { name, email, faculty } = validatedFields.data
  const existingUser = await prisma.user.findUnique({
    where: { email: email, role: "ADMIN" },
  })
  if (!existingUser) {
    return { error: "Something went wrong!" }
  }
  const sessionData = await auth.api.getSession({
      headers: await headers() 
    })
  
  const sessionUser = sessionData?.user
  if (
    !sessionUser ||
    sessionUser.role !== "ADMIN" ||
    sessionUser.id !== existingUser.id
  ) {
    return { error: "Unauthorized access!" }
  }
  await prisma.user.update({
    where: { id: existingUser.id },
    data: { name: capitalizeFirstLetter(name), faculty },
  })
  revalidatePath("/admin/profile")
  return { success: "Profile updated successfully" }
}

export async function updateAdminEmail(
  values: z.infer<typeof UpdateAdminEmailSchema>
){
  const sessionData = await auth.api.getSession({
      headers: await headers() 
    })
  
  const sessionUser = sessionData?.user
  if (!sessionUser || sessionUser.role !== "ADMIN") {
    return { error: "Unauthorized access!" }
  }
  const validatedFields = UpdateAdminEmailSchema.safeParse(values)
  if (!validatedFields.success) {
    return { error: "Invalid credentials!" }
  }
  const { email, password } = validatedFields.data
  const currentUser = await prisma.user.findUnique({
    where: { id: sessionUser.id, role: "ADMIN" },
  })
  if (!currentUser) {
    return { error: "Something went wrong!" }
  }
  const isMatched = await compare(password, currentUser.password)
  if (!isMatched) {
    return { error: "Invalid credentials!" }
  }
  const existingUser = await prisma.user.findUnique({
    where: { email: email },
  })
  if (existingUser) {
    return { error: "Email is already in use!" }
  }
  const existingToken = await getVerificationTokenByEmail(email)
  if (!existingToken) {
    const verificationToken = await generateVerificationToken(
      email,
      currentUser.email
    )
    await sendVerificationEmail(
      verificationToken.email,
      verificationToken.token
    )
    return { success: "Confirmation email sent!" }
  }
  const ableToResendEmail = await ableToGenerateNewVerificationToken(
    email
  )
  if (!ableToResendEmail) {
    return {
      error:
        "We have already sent you an email! If you wish to resend please try again later",
    }
  }
  const verificationToken = await generateVerificationToken(email)
  await sendVerificationEmail(verificationToken.email, verificationToken.token)
  return { success: "Confirmation email sent!" }
}

export async function getAllBinUsers(){
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
  })
  return result
}

export async function deleteBinUser(id: string){
  // Find the bin manager by ID
  const user = await prisma.user.findUnique({
    where: { id },
  })

  if (!user) {
    return { error: `User with ID ${id} does not exist` }
  }

  try {
    // 🗑️ Step 1: Delete all bins assigned to this manager
    await prisma.bin.deleteMany({
      where: {
        userId: id,
      },
    })

    // 👤 Step 2: Delete the bin manager (user)
    await prisma.user.delete({
      where: {
        id: id,
      },
    })

    // 🔁 Step 3: Revalidate admin dashboard to update table
    revalidatePath("/admin/bin/manager")

    return { success: `Bin Manager with ID ${id} and all assigned bins were permanently deleted.` }
  } catch (error) {
    console.error("Error deleting bin user and bins:", error)
    return { error: "Unexpected error occurred while deleting user and bins." }
  }
}


export async function getAllStudentUsers(
  page: number | null,
  query: string | null,
  sortOrder: string | undefined,
  sortItem: string | undefined,
  emailType: string | null,
  faculty: string | null
){
  const sessionData = await auth.api.getSession({
    headers: await headers() 
  })

  const sessionUser = sessionData?.user
  if (!sessionUser || sessionUser.role !== "ADMIN") {
    return { error: "Unauthorized access!" }
  }
  const sortableItems = ["disposal", "point", "redemption"]
  const allowedEmailTypes = ["verified", "non-verified"]
  const pageCondition = page != null && page < 0
  const sortOrderCondition =
    sortOrder !== undefined && sortOrder !== "asc" && sortOrder !== "desc"
  const sortItemCondition =
    sortItem !== undefined && !Object.values(sortableItems).includes(sortItem)
  const emailTypeCondition =
    emailType &&
    !emailType.split(",").every((type) => allowedEmailTypes.includes(type))
  const facultyCondition =
    faculty &&
    !faculty
      .split(",")
      .every((f) => Object.values(Faculty).includes(f as Faculty))

  // check if all conditions are met
  if (
    pageCondition ||
    sortItemCondition ||
    sortOrderCondition ||
    emailTypeCondition ||
    facultyCondition
  ) {
    return { studentCount: 0, students: [] }
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
        profileImageUrl: true,
        point: { select: { balance: true, updatedAt: true } },
        _count: { select: { disposals: true, redemptions: true } },
        createdAt: true,
        updatedAt: true,
      },
    }),
  ])
  return { studentCount, students }
}

export async function deleteStudent(userId: string) {
  const sessionData = await auth.api.getSession({
    headers: await headers() 
  })

  const sessionUser = sessionData?.user
  if (!sessionUser || sessionUser.role !== "ADMIN") {
    return { error: "Unauthorized access!" }
  }
  const student = await prisma.user.findUnique({
    where: { id: userId, role: "STUDENT" },
  })
  if (!student) {
    return { error: "User not found" }
  }
  const deletedStudent = await prisma.user.delete({ where: { id: userId } })
  if (!deletedStudent) {
    return { error: "Failed to delete user" }
  }
  revalidatePath("/admin/student")
  return { success: `Student ${deletedStudent.id} deleted successfully` }
}

export async function updateStudent(
  values: z.infer<typeof UpdateStudentSchema>,
  userId: string
){
  const sessionData = await auth.api.getSession({
      headers: await headers() 
    })
  
  const sessionUser = sessionData?.user
  if (!sessionUser || sessionUser.role !== "ADMIN") {
    return { error: "Unauthorized access!" }
  }
  const validatedFields = UpdateStudentSchema.safeParse(values)
  if (!validatedFields.success) {
    return { error: "Invalid credentials!" }
  }
  const { name, email, faculty, points } = validatedFields.data
  const existingUser = await prisma.user.findUnique({
    where: { id: userId, role: "STUDENT" },
  })
  if (!existingUser) {
    return { error: "Something went wrong!" }
  }
  const updatedUser = await prisma.user.update({
    where: { id: existingUser.id },
    data: {
      name: capitalizeFirstLetter(name),
      email,
      faculty,
      point: { update: { balance: points } },
    },
  })
  revalidatePath("/admin/student")
  return { success: `Student ${updatedUser.id} updated successfully ` }
}

export const getTopTenUsers = async (dateFrom?: Date, dateTo?: Date) => {
  // 1️⃣ Aggregate top users by points
  const aggregated = await prisma.disposal.groupBy({
    by: ["userId"],
    where: {
      user: {
        role: Role.STUDENT,
      },
      isRedeemed: true,
      createdAt: {
        gte: dateFrom,
        lte: dateTo,
      },
    },
    _sum: {
      pointsAwarded: true,
    },
    orderBy: {
      _sum: { pointsAwarded: "desc" },
    },
    take: 10,
  })

const userIds = aggregated
  .map((user) => user.userId)
  .filter((id) => id !== null)

  if (userIds.length === 0) {
    return []
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
  ])

  const orderedDisposals = await Promise.all(
    userIds.map(async (userId) => {
      const disposal = userDisposals.find((d) => d.userId === userId) || {
        _count: { id: 0 },
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          name: true,
          email: true,
          profileImageUrl: true, // ✅ ADD THIS
        },
      })


      const userTestData = allTestData.filter((t) => t.user?.id === userId)
      const materialCounts = userTestData.reduce((acc: { [x: string]: any }, item: { bin: { binMaterial: { name: any } } }) => {
        const materialName = item.bin?.binMaterial?.name
        if (materialName) {
          acc[materialName] = (acc[materialName] || 0) + 1
        }
        return acc
      }, {} as Record<string, number>)

        const mostFrequentMaterial = Object.entries(materialCounts).reduce(
          (max, [material, count]) => {
    // Treat null/undefined/missing as 0
          const safeCount = count ?? 0 
          
          return safeCount > (max[1] || 0)  ? [material, safeCount] : max
        },
          ["", 0]
        )[0]

      return {
        username: user?.name,
        userId,
        profileImageUrl: user?.profileImageUrl ?? null, // ✅ ADD THIS
        balance:
          aggregated.find((d: { userId: any }) => d.userId === userId)?._sum.pointsAwarded || 0,
        disposalCount: disposal._count.id,
        redemptionCount:
          userRedemptions.find((r: { userId: any }) => r.userId === userId)?._count?.id || 0,
        mostFrequentMaterial: mostFrequentMaterial || undefined,
      }
    })
  )

  return orderedDisposals.sort((a: { balance: number }, b: { balance: number }) => b.balance - a.balance)
}

export async function listOfBinManagersUsed() {
  const binManagers = await prisma.user.findMany({
    where: { role: "BIN" },
    select: {
      id: true,
      name: true,
      email: true,
      faculty: true,
      _count: { select: { bins: true } },
    },
  })
  return binManagers.map((binUser
  ) => ({
    id: binUser?.id as string,
    name: binUser?.name as string,
    email: binUser?.email as string,
    faculty: binUser?.faculty as Faculty,
    _count: { bins: binUser._count.bins as number },
  }))
}