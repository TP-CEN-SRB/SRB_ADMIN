import { Suspense } from "react"
import Image from "next/image"
import { ScanClaimForm } from "./ScanClaimForm"

export default function ScanPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 bg-pale-mint p-6 md:p-10">
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <Suspense>
              <ScanClaimForm />
            </Suspense>
          </div>
        </div>
      </div>
      <div className="relative hidden bg-muted lg:block">
        <Image
          priority
          className="object-cover"
          src="/recycling.png"
          alt="Recycling bins"
          fill
        />
      </div>
    </div>
  )
}
