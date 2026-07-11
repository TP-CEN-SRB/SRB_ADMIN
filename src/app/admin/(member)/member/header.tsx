"use client"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { ChevronLeft, ChevronRight, ChevronsLeft,  ChevronsRight} from "lucide-react"
import { Button } from "@/components/ui/button"

import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { useTransition } from "react"

const limits = [
  { label: "10 rows", value: "10" },
  { label: "20 rows", value: "20" },
  { label: "50 rows", value: "50" },
  { label: "100 rows", value: "100" },
]

interface PaginationHeaderProps {
    currentPage: number,
    currentLimit: number,
    totalPages: number,
    allMemberCount: number,
}

export function PageinationHeader({currentPage, currentLimit, totalPages, allMemberCount} : PaginationHeaderProps){

    const [isPending, startTransition] = useTransition()
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()  

    function rebuildURL(newLimit: string){
        const params = new URLSearchParams(searchParams.toString())
        params.set("limit", newLimit)
        params.set("page", "1")
        router.push(`${pathname}?${params.toString()}`)
    }

    function onButtonClick(direction: string){
        const params = new URLSearchParams(searchParams.toString())
        let newPage = currentPage
        switch(direction){
            case "start":
                newPage = 1
                break
            case "prev":
                newPage = currentPage - 1
                break
            case "next":
                newPage = currentPage + 1
                break
            case "end":
                newPage = totalPages
                break
        }
        const clampPage = Math.max(1, Math.min(newPage, totalPages))
        params.set("page", clampPage.toString())
        startTransition(function(){
            router.push(`${pathname}?${params.toString()}`)
        })
       
    }

    return(
        <header className="z-40 flex items-center justify-between bg-muted p-2">

            <span>Members Table</span>

            <div className="flex items-center gap-2">

                <Select value={currentLimit.toString()} onValueChange={rebuildURL}>
                    
                <SelectTrigger className="text-sm w-24 text-center">
                    <SelectValue placeholder="Select limit" />
                </SelectTrigger>

                <SelectContent>
                    <SelectGroup>
                    <SelectLabel>No. of Rows</SelectLabel>
                    {limits.map((limit) => (
                        <SelectItem key={limit.value} value={limit.value}>
                        {limit.label}
                        </SelectItem>
                    ))}
                    </SelectGroup>
                </SelectContent>
                </Select>

                <Button variant="outline" onClick={function(){onButtonClick("start")}} disabled={(currentPage < 2) || isPending}>
                    <ChevronsLeft className="h-4 w-4"/>
                </Button>

                <Button variant="outline" onClick={function(){onButtonClick("prev")}} disabled={(currentPage < 2) || isPending}>
                    <ChevronLeft className="h-4 w-4"/>
                </Button>

                <div className="text-sm w-18 text-center">{Math.min(currentPage * currentLimit, allMemberCount)} / {allMemberCount}</div>

                <Button variant="outline" onClick={function(){onButtonClick("next")}} disabled={(currentPage > (totalPages - 1)) || isPending}>
                    <ChevronRight className="h-4 w-4"/>
                </Button>

                <Button variant="outline" onClick={function(){onButtonClick("end")}} disabled={(currentPage > (totalPages - 1)) || isPending}>
                    <ChevronsRight className="h-4 w-4"/>
                </Button>

            </div>
        </header>
    )
}