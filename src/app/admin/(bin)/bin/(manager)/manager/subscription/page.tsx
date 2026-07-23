import { Table, TableHead, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table"
import { SubscriptionHeader } from "./subscriptionHeader"
import { SubscriptionSeeMore } from "./SubscriptionSeeMore"
import { getAllSubscriptions } from "@/app/action/subscription"

const col_widths = ["30%", "25%", "20%", "15%", "10%"]

export default async function AllSubscriptionsPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string
    limit?: string
    sort?: string
    search?: string
  }>
}) {
  const params = await searchParams
  const currentPage = Number(params.page) || 1
  const currentLimit = Number(params.limit) || 10
  const sortOrder = params.sort === "dateAsc" ? "asc" : "desc"
  const search = params.search || ""

  const { subscriptions, subscriptionCount, totalPages } = await getAllSubscriptions(
    currentPage,
    currentLimit,
    search,
    sortOrder
  )

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <SubscriptionHeader
        currentPage={currentPage}
        currentLimit={currentLimit}
        totalPages={totalPages}
        totalCount={subscriptionCount}
      />

      <Table className="table-fixed">
        <colgroup>
          {col_widths.map((width, index) => (
            <col key={index} style={{ width }} />
          ))}
        </colgroup>
        <TableHeader>
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead>Bin Manager</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Subscribed Since</TableHead>
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
            {subscriptions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={col_widths.length} className="h-24 text-center text-muted-foreground">
                  No subscriptions found.
                </TableCell>
              </TableRow>
            ) : (
              subscriptions.map((subscription) => (
                <TableRow key={subscription.id}>
                  <TableCell><span className="text-xs">{subscription.email}</span></TableCell>
                  <TableCell><span className="text-xs">{subscription.user.name}</span></TableCell>
                  <TableCell><span className="text-xs">{subscription.user.location ?? "—"}</span></TableCell>
                  <TableCell><span className="text-xs">{new Date(subscription.createdAt).toLocaleDateString()}</span></TableCell>
                  <TableCell className="text-center">
                    <SubscriptionSeeMore
                      subscriptionId={subscription.id}
                      email={subscription.email}
                      binManagerId={subscription.userId}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
