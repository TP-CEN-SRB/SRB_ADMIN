"use server"
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { EditMemberFormValue, EditMemberSchema } from "./schema";

export async function getMemberId(id: string) {
  const member = await prisma.user.findUnique({
    where: {
      id: id
    },
    include: {
      accounts: true,
      point: true,
      _count: {
        select: {
          disposals: true,
          redemptions: true,
          user_quest: {
            where: { isCompleted: true } 
          }
        }
      }
    }
  });
  return member;
}


export async function updateMember(id: string, payload: EditMemberFormValue) {

    const parsedData = EditMemberSchema.safeParse(payload)

    if (!parsedData.success){
        return { error: "Invalid data format." }
    }

    if (!id) {
        return { error: "ID not found" }
    }

    const { name, email, emailVerified, faculty, role, password,} = parsedData.data
    const header = await headers();

    try {
        
    const existingUser = await prisma.user.findUnique({
                            where: {
                                email: email
                            }
                        });

    if (existingUser && existingUser.id !== id) {
        return { error: "This email is already in use by another member." };
    }

    await prisma.user.update({
            where: { 
                id: id 
            },
            data: { 
                name: name, 
                email: email,
                emailVerified: emailVerified, 
                faculty: faculty, 
                role: role 
            } 
        });
} catch(error) {
    console.error("updateMember failed:", error);
    return { error: "Something went wrong when updating, please try again later." }
}
    return { success: true }
}   

export async function sendPasswordResetEmail(email: string) {
    const header = await headers();
    
    try {
        await auth.api.requestPasswordReset({
            body: {
                email: email,
                redirectTo: "/reset-password", 
            },
            headers: header
        });
        return { success: true };
    } catch (error) {
        console.error("Failed to send reset email:", error);
        return { error: "Failed to send reset email. Please try again." };
    }
}