"use server" // 👈 CRITICAL: Must be at the very top!

import { prisma } from "@/lib/db"
import { EditBinFormValue } from "@/components/FormLogic/(Admin)/admin-schema"
import { updateCredentialPassword } from "@/lib/createCredentialUser"
import { revalidatePath } from "next/cache"

export async function updateBin(formData: Partial<EditBinFormValue>, binUserID: string) {
    try {
        const { password, confirmPassword, ...safeUpdateData } = formData

        // Credential passwords live on the Account row, not User - see
        // lib/createCredentialUser.ts.
        if (password && password !== "") {
            await updateCredentialPassword(binUserID, password)
        }

        const updatedUser = await prisma.user.update({
            where: { id: binUserID },
            data: safeUpdateData,
        })

        revalidatePath("/admin/bin/manager")
        revalidatePath("/admin/bin/manager/map")
        revalidatePath("/admin/bin/manager/view/[id]", "page")
        revalidatePath("/admin/bin/manager/update/[id]", "page")
        revalidatePath("/admin/bin/manager/[id]", "page")

        return updatedUser

    } catch(error) {
        console.error("Error updating bin:", error)
        throw new Error("Update failed")
    }
}