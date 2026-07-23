import Link from "next/link"
import { Suspense } from "react"
import { Undo2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { getVoucherById } from "@/app/action/voucher"
import { UpdateVoucherForm } from "@/components/FormLogic/(Misc)/UpdateVoucherForm"
import { notFound } from "next/navigation"
import { FormSkeleton } from "@/components/FormSkeleton"

const UpdateVoucherPage = ({
  params,
}: {
  params: Promise<{ id: string }>
}) => {
  return (
    <div className="container mx-auto px-4 py-6 md:px-6 2xl:max-w-[1400px] h-full overflow-y-auto">
      <div className="mb-6 flex flex-col items-start justify-between gap-3 sm:flex-row">
        <h1 className="text-2xl font-semibold">Edit Voucher</h1>
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/voucher">
            <Undo2 className="mr-2 size-4" />
            Cancel & Return
          </Link>
        </Button>
      </div>

      <div className="max-w-2xl">
        <Suspense fallback={<FormSkeleton fields={6} />}>
          <UpdateVoucherSection params={params} />
        </Suspense>
      </div>
    </div>
  )
}

async function UpdateVoucherSection({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const voucher = await getVoucherById(id)

  if (!voucher) {
    notFound()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Voucher Details</CardTitle>
        <CardDescription>Update this voucher&apos;s information.</CardDescription>
      </CardHeader>
      <CardContent>
        <UpdateVoucherForm id={id} voucher={voucher} />
      </CardContent>
    </Card>
  )
}

export default UpdateVoucherPage
