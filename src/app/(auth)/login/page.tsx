import Image from "next/image";
import { LoginForm } from "@/components/FormLogic/(Auth)/Login-Form"

export default function LoginPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 bg-pale-mint p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <div className="relative h-12 w-48">
            <Image
              priority
              className="object-cover"
              src="/temasekPolyBanner.png"
              alt="Recycling bins"
              fill
            />
          </div>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <LoginForm />
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