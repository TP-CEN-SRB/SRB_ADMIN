"use client"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Menu, LayoutDashboard, ExternalLink, LogOut } from "lucide-react"

export function RedirectPopover({ isAdmin, username, email, signOut }: { isAdmin: boolean, username: string, email: string, signOut: () => Promise<void> }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="gap-2">  
            <Menu className="size-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" sideOffset={10} className="w-64 p-0">

        <div className="border-b">
          <div className="flex flex-col p-2 bg-muted/30">
            <p className="text-sm">{username}</p>
            <p className="text-xs text-muted-foreground">{email}</p>
          </div>

          <form action={signOut} className="bg-muted/30">
              <Button type="submit" variant="ghost" className="text-destructive">
                <LogOut className="size-4" />
                Sign Out
              </Button>
          </form>
        </div>


        <div className="flex flex-col">

          {isAdmin && (
            <Button asChild variant="ghost" className="justify-start gap-2">
              <Link href="/admin">
                <LayoutDashboard className="size-4" />
                Admin Dashboard
              </Link>
            </Button>
          )}

          <Button asChild variant="ghost" className="justify-start gap-2">
            <Link href="/api/mobile-handoff">
              <ExternalLink className="size-4" />
              Go to Mobile App
            </Link>
          </Button>

          <div className="p-2"></div>
        </div>
      </PopoverContent>
    </Popover>
  )
}