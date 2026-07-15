"use server"
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { EditMemberFormValue, EditMemberSchema } from "./schema";
import { EditBinFormValue } from "@/components/FormLogic/(Admin)/admin-schema";

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

    const { name, email, faculty, role, password,} = parsedData.data
    const header = await headers();

    try {
    await prisma.user.update({
            where: { 
                id: id 
            },
            data: { 
                name: name, 
                email: email, 
                faculty: faculty, 
                role: role 
            } 
        });

    if (password) {
        await auth.api.setUserPassword({
            body: { 
                userId: id, 
                newPassword: password 
            },
            headers: header,
        });
    }
} catch(error) {
    // 🔥 ADD THIS CONSOLE.LOG TO SEE THE REAL ERROR IN YOUR TERMINAL
    console.error("FAILED TO UPDATE MEMBER:", error); 
    
    // Optional: You can return the error message directly for debugging
    // return { error: error instanceof Error ? error.message : "Unknown error occurred" }
    
    return { error: "Something went wrong when updating, please try again later." }
}
    return { success: true }
}