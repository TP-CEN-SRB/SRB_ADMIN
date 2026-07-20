"use client"
import Link from "next/link"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty"

export function EmptyInputGroup() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyTitle>404 - Not Found</EmptyTitle>
        <EmptyDescription>
          The page you&apos;re looking for doesn&apos;t exist.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <EmptyDescription>
          Return to  <Link href="/">Home</Link>
        </EmptyDescription>
      </EmptyContent>
    </Empty>
  )
}