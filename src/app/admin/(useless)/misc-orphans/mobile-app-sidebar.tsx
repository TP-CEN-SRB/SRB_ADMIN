"use client"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { GiHamburgerMenu } from "react-icons/gi"
import { BsFillBarChartFill } from "react-icons/bs"
import { CgProfile } from "react-icons/cg"
import { PiSignOutBold } from "react-icons/pi"
import Image from "next/image"
import Link from "next/link"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { useState } from "react"
import SignOutDialog from "@/components/Dialog/SignOutDialog"
import { collaspeItems, dropdownItems } from "./app-sidebar"
import { FaChevronDown } from "react-icons/fa"

export function MobileAppSidebar() {
  const [isSignOutDialogOpen, setSignOutDialogOpen] = useState(false)
  const [openIndexes, setOpenIndexes] = useState<number[]>([])

  const handleToggle = (index: number) => {
    setOpenIndexes((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    )
  }
  return (
    <>
      <SignOutDialog
        isOpen={isSignOutDialogOpen}
        handleDialogOpen={() => setSignOutDialogOpen(!isSignOutDialogOpen)}
      />
      <Sheet>
        <div className="w-full p-4 shadow-lg flex justify-between md:hidden border-b-2 border-gray-200 bg-[#E6ECF0]">
          <SheetTrigger className="text-slate-800 border border-gray-300 rounded-lg p-1 bg-[#E6ECF0] hover:bg-[#D0D6E0]!">
            <GiHamburgerMenu size={40} />
          </SheetTrigger>
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger>
              <CgProfile className="text-slate-800" size={40} />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="border-gray-300"
              align="end"
              sideOffset={10}
            >
              <DropdownMenuLabel>Admin Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {dropdownItems.map((item, index) => (
                <Link key={index} href={item.url}>
                  <DropdownMenuItem className="cursor-pointer">
                    <item.icon />
                    <span>{item.title}</span>
                  </DropdownMenuItem>
                </Link>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="flex items-center gap-x-2 cursor-pointer text-slate-800"
                onClick={() => setSignOutDialogOpen(true)}
              >
                <PiSignOutBold />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <SheetContent
          className="max-w-[300px] text-slate-800 bg-[#E6ECF0]"
          side="left"
        >
          <SheetHeader>
            <Image
              priority
              src="/temasekPolyBanner.png"
              alt="Temasek Poly"
              width="200"
              height="200"
            />
          </SheetHeader>
          <div className="mt-5 flex flex-col gap-1">
            <div className="p-2 hover:bg-[#D0D6E0] rounded-md">
              <Link className="flex items-center gap-2" href="/admin">
                <BsFillBarChartFill />
                <span>Dashboard</span>
              </Link>
            </div>
            {collaspeItems.map((item, index) => (
              <Collapsible
                key={index}
                className="group/collapsible"
                onOpenChange={() => handleToggle(index)}
                open={openIndexes.includes(index)}
              >
                <CollapsibleTrigger asChild>
                  <div className="flex p-2 items-center gap-2 ml-auto hover:bg-[#D0D6E0] cursor-pointer rounded-md">
                    <item.icon />
                    <span>{item.title}</span>
                    <FaChevronDown
                      className={`ml-auto duration-100 ease ${
                        openIndexes.includes(index) ? "rotate-180" : "rotate-0"
                      }  `}
                    />
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  {item.child.map((child, subIndex) => (
                    <div
                      key={subIndex}
                      className="p-2 hover:bg-[#D0D6E0] rounded-md mx-4"
                    >
                      <Link
                        className="flex items-center gap-2"
                        href={child.url}
                      >
                        <child.icon />
                        <span>{child.title}</span>
                      </Link>
                    </div>
                  ))}
                </CollapsibleContent>
              </Collapsible>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
