import Link from "next/link";
import { Button } from "@/components/ui/button"
import { getSignOut } from "@/lib/auth-server";
import { getSession } from "@/lib/auth-server";
import { RedirectPopover } from "@/components/(nav)/redirect-popup"
export async function ButtonSessions(){
    const session = await getSession()
    
    if (!session){
        return(
            <div className="flex items-center gap-2">
                <Button asChild variant="outline">
                    <Link href="/signup">Sign Up</Link>
                </Button>
                <Button asChild >
                    <Link href="/login">Login</Link>
                </Button>
            </div>  
        )
    }
    return(
        <div className="text-sm flex items-center gap-2">
            <RedirectPopover isAdmin={session.user.role === "Admin"} isBin={session.user.role === "Bin"} username={session.user.name} email={session.user.email} signOut={getSignOut}/>
        </div>

    )

}