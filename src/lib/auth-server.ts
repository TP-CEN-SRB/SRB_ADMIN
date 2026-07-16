"use server"
import { headers } from "next/headers"
import { auth } from "./auth"
import { prisma } from "./db"
import { signupSchema, SignupFormValue } from "@/lib/zod-schema"
import { redirect } from "next/navigation"

export async function getSession(){
    return await auth.api.getSession({
    headers: await headers()
  });
}

export async function getSignOut(){
    await auth.api.signOut({
        headers: await headers(),
    });
    redirect("/login")
}

export async function getSignUp(payload: SignupFormValue){
    const parsedData = signupSchema.safeParse(payload)

    if (!parsedData.success){
        return { error: "Invalid data format." }
    }

    const { name, email, password, confirmPassword, faculty, role, location, lat, long} = parsedData.data
    
    try{
        await auth.api.signUpEmail({
            body: {
                name, 
                email, 
                password, 
                faculty, 
                role, 
                location, 
                lat, 
                long
            },
            headers: await headers()
        })
        await prisma.user.update({
            where: { email: email.toLowerCase() },
            data: { emailVerified: true }
        })
    }
    catch(error){
        return { error: "Something went wrong when signing up, please try again later." }
    }
    return { success: true }
}

export async function deleteBinUser(userId: string){
    try {
        const session = await auth.api.getSession({ 
            headers: await headers()
        })

        if ( !session?.user || session.user.role !== "admin") {
            return { error: "Unauthorized access" }
        }

        await prisma.bin.deleteMany({
            where: { userId: userId },
        })

        await prisma.user.delete({
            where: { id: userId },
        })
        return { success: `Bin ${userId} deleted successfully` }
  } catch (error) {
        console.error("Deletion error:", error)
        return { error: "Failed to delete user" }
  }
}

export async function deleteStudent(userId: string){
    try {
        const session = await auth.api.getSession({ 
            headers: await headers()
        })

        if ( !session?.user || session.user.role !== "admin") {
            return { error: "Unauthorized access" }
        }

        await prisma.user.delete({
            where: { id: userId, role: "STUDENT" },
        })

        return { success: `Student ${userId} deleted successfully` }
  } catch (error) {
        console.error("Deletion error:", error)
        return { error: "Failed to delete user" }
  }
}