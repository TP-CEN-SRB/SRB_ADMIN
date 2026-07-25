"use server"

import { prisma } from "@/lib/db"
import { hashPassword } from "better-auth/crypto"
import { randomUUID } from "crypto"
import { Role, Faculty } from "@/generated/prisma"

// Creates a User + credential Account row directly via Prisma, bypassing
// better-auth's admin-only auth.api.createUser endpoint. Used for
// admin-initiated accounts (stores, bin managers) that need a specific role
// set at creation time. hashPassword is the exact function better-auth's own
// signUpEmail uses internally, so accounts created this way log in through
// the normal signInEmail flow with no special-casing needed.
export async function createCredentialUser({
  name,
  email,
  password,
  role,
  faculty,
  diploma,
  location,
  lat,
  long,
}: {
  name: string
  email: string
  password: string
  role: Role
  faculty: Faculty
  diploma?: string
  location?: string
  lat?: number
  long?: number
}) {
  const normalizedEmail = email.toLowerCase()

  const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } })
  if (existing) {
    throw new Error("A user with that email already exists")
  }

  const passwordHash = await hashPassword(password)

  const user = await prisma.user.create({
    data: {
      name,
      email: normalizedEmail,
      role,
      faculty,
      diploma: diploma ?? "N/A",
      location,
      lat,
      long,
      emailVerified: true,
    },
  })

  await prisma.account.create({
    data: {
      id: randomUUID(),
      userId: user.id,
      providerId: "credential",
      accountId: user.id,
      password: passwordHash,
    },
  })

  // Mirrors the Point row auth.api.signUpEmail's caller creates for student
  // self-signup (see /api/signup/student) - without it, admin-created
  // accounts (stores, bin managers) have no points row at all rather than
  // one with a real 0 balance.
  await prisma.point.create({ data: { userId: user.id } })

  return user
}

// Updates a user's credential password directly via the Account row -
// better-auth stores the credential password there, not on User. Shared by
// store/bin-manager "edit" forms that let an admin optionally reset a
// managed account's password.
export async function updateCredentialPassword(userId: string, password: string) {
  const account = await prisma.account.findFirst({
    where: { userId, providerId: "credential" },
  })
  if (!account) {
    throw new Error("No credential account found for this user")
  }

  const passwordHash = await hashPassword(password)
  await prisma.account.update({
    where: { id: account.id },
    data: { password: passwordHash },
  })
}
