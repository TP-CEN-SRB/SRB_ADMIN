import Link from "next/link"
import { Undo2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { CreateStoreForm } from "@/components/FormLogic/(Misc)/CreateStoreForm"

export default function CreateStorePage() {
  return (
    <div className="container mx-auto px-4 py-6 md:px-6 2xl:max-w-[1400px] h-full overflow-y-auto">
      <div className="mb-6 flex flex-col items-start justify-between gap-3 sm:flex-row">
        <h1 className="text-2xl font-semibold">Add Store</h1>
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/store">
            <Undo2 className="mr-2 size-4" />
            Cancel & Return
          </Link>
        </Button>
      </div>

      <div className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Store Details</CardTitle>
            <CardDescription>Create a new store account.</CardDescription>
          </CardHeader>
          <CardContent>
            <CreateStoreForm />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
