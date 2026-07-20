'use client'

import Link from "next/link";
import { Button } from "@/components/ui/button"
import { useSignOut, authClient } from "@/lib/auth-client";
import { RedirectPopover } from "@/components/(nav)/redirect-popup"

export function ButtonSessions(){
    const { data: session } = authClient.useSession()
    const handleSignOut = useSignOut()

    if (!session){
        return(
            <div className="flex items-center gap-2">
                <Button asChild variant="outline">
                    <Link href="/signup">Sign Up</Link>
                </Button>
                <Button asChild>
                    <Link href="/login">Login</Link>
                </Button>
            </div>
        )
    }
    return(
        <div className="text-sm flex items-center gap-2">
            <RedirectPopover
              isAdmin={session.user.role === "admin"}
              username={session.user.name}
              email={session.user.email}
              signOut={handleSignOut}
            />
        </div>
    )
}