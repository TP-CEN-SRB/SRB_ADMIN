"use server" // 👈 CRITICAL: Must be at the very top!

import { prisma } from "@/lib/db"
import { EditBinFormValue } from "@/components/FormLogic/(Admin)/admin-schema"
import { hashPassword } from "better-auth/crypto"

export async function updateBin(formData: Partial<EditBinFormValue>, binUserID: string) {
    try {
        const { password, confirmPassword, ...safeUpdateData } = formData

        if (password && password !== "") {
            (safeUpdateData as any).password = await hashPassword(password)
        }

        // 3. Update the database
        const updatedUser = await prisma.user.update({
            where: { id: binUserID },
            data: safeUpdateData,
        })
        
        return updatedUser
        
    } catch(error) {
        console.error("Error updating bin:", error)
        throw new Error("Update failed")
    }
}