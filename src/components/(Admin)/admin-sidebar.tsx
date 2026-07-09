"use client"
import { usePathname } from "next/navigation"
import { SidebarTrigger } from '@/components/ui/sidebar'

export default function AdminSidebar(){
    const pathname = usePathname()
    const isAdmin = pathname.startsWith("/admin")
    if (!isAdmin){
        return null
    }
    return(
        <SidebarTrigger className="!size-8 [&>svg]:!size-4"/>
    )
}