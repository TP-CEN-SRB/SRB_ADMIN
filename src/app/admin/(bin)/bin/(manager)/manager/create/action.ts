"use server"

import { Faculty, Role } from "@/generated/prisma"
import { createCredentialUser } from "@/lib/createCredentialUser"

export async function createBinManager({
  name,
  email,
  password,
  faculty,
  location,
  lat,
  long,
}: {
  name: string
  email: string
  password: string
  faculty: Faculty
  location: string
  lat: number
  long: number
}) {
  try {
    const user = await createCredentialUser({
      name,
      email,
      password,
      role: Role.BIN,
      faculty,
      location,
      lat,
      long,
    })
    return { success: true, user }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create bin account",
    }
  }
}
