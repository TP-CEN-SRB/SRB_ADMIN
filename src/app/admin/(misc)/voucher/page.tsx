import { Suspense } from "react"
import Image from "next/image"
import { Table, TableHead, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TableSkeleton } from "@/components/TableSkeleton"
import { VoucherHeader } from "./header"
import { VoucherActions } from "./voucherActions"
import { CreateVoucherForm } from "@/components/FormLogic/(Misc)/CreateVoucherForm"
import { getVouchers } from "@/app/action/voucher"

const col_widths = ["10%", "20%", "10%", "10%", "10%", "10%", "10%", "10%", "10%"]

interface VoucherAdminPageProps {
  searchParams: Promise<{
    page?: string
    limit?: string
    sort?: string
    search?: string
  }>
}

export default async function VoucherAdminPage({ searchParams }: VoucherAdminPageProps) {
  const params = await searchParams

  return (
    <div className="flex h-full overflow-hidden">
      <div className="w-full max-w-sm border-r overflow-y-auto p-4">
        <Card>
          <CardHeader>
            <CardTitle>Add Voucher</CardTitle>
            <CardDescription>Create a new voucher members can redeem with points.</CardDescription>
          </CardHeader>
          <CardContent>
            <CreateVoucherForm />
          </CardContent>
        </Card>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <Suspense key={JSON.stringify(params)} fallback={<TableSkeleton columns={9} />}>
          <VoucherTable searchParams={params} />
        </Suspense>
      </div>
    </div>
  )
}

async function VoucherTable({ searchParams: params }: { searchParams: Awaited<VoucherAdminPageProps["searchParams"]> }) {
  const currentPage = Number(params.page) || 1
  const currentLimit = Number(params.limit) || 10
  const currentSort = params.sort || "dateDesc"
  const currentSearch = params.search || ""

  const { vouchers, voucherCount, totalPages } = await getVouchers(
    currentPage,
    currentLimit,
    currentSort,
    currentSearch
  )

  return (
    <>
      <VoucherHeader
        currentPage={currentPage}
        currentLimit={currentLimit}
        totalPages={totalPages}
        totalCount={voucherCount}
      />

      <Table className="table-fixed">
        <colgroup>
          {col_widths.map((width, index) => (
            <col key={index} style={{ width }} />
          ))}
        </colgroup>
        <TableHeader>
          <TableRow>
            <TableHead>Image</TableHead>
            <TableHead>Name</TableHead>
            <TableHead className="text-center">Points</TableHead>
            <TableHead className="text-center">Status</TableHead>
            <TableHead className="text-center">Stores</TableHead>
            <TableHead className="text-center">Start</TableHead>
            <TableHead className="text-center">End</TableHead>
            <TableHead className="text-center">Redeemed</TableHead>
            <TableHead className="text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
      </Table>

      <div className="flex-1 overflow-auto">
        <Table className="table-fixed">
          <colgroup>
            {col_widths.map((width, index) => (
              <col key={index} style={{ width }} />
            ))}
          </colgroup>
          <TableBody>
            {vouchers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="h-24 text-center text-muted-foreground">
                  No vouchers found.
                </TableCell>
              </TableRow>
            ) : (
              vouchers.map((voucher) => (
                <TableRow key={voucher.id}>
                  <TableCell>
                    <Image
                      src={voucher.image}
                      alt={voucher.name}
                      width={40}
                      height={40}
                      className="rounded object-cover size-10"
                    />
                  </TableCell>
                  <TableCell><span className="text-xs">{voucher.name}</span></TableCell>
                  <TableCell className="text-center"><span className="text-xs">{voucher.pointsRequired}</span></TableCell>
                  <TableCell className="text-center">
                    <Badge variant={voucher.isAvailable ? "default" : "secondary"}>
                      {voucher.isAvailable ? "Available" : "Hidden"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="text-xs">
                      {voucher._count.allowedStores === 0 ? "All" : `${voucher._count.allowedStores} store${voucher._count.allowedStores > 1 ? "s" : ""}`}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="text-xs">{voucher.startDate ? new Date(voucher.startDate).toLocaleDateString("en-SG") : "—"}</span>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="text-xs">{voucher.endDate ? new Date(voucher.endDate).toLocaleDateString("en-SG") : "—"}</span>
                  </TableCell>
                  <TableCell className="text-center"><span className="text-xs">{voucher._count.redemptions}</span></TableCell>
                  <TableCell className="text-center"><VoucherActions voucherId={voucher.id} isAvailable={voucher.isAvailable} /></TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </>
  )
}
