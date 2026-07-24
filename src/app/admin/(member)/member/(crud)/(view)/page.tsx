import { Suspense } from "react"
import { Table, TableHead, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table"
import { TableSkeleton } from "@/components/TableSkeleton"
import { PageinationHeader } from "./header"
import { Role, Faculty, Sort, getAllMembers } from "./allMembers"
import { SeeMore } from "./seeMore"

const col_widths = ["5%", "10%", "15%", "10%", "10%", "10%", "10%", "10%", "10%", "10%"]

interface ViewStudentProps {
  searchParams: Promise<{
    page?: string
    limit?: string
    roles?: string
    faculty?: string
    sort?: string
    search?: string
  }>
}

export default async function ViewStudent({ searchParams }: ViewStudentProps) {
  const params = await searchParams

  return (
    <Suspense key={JSON.stringify(params)} fallback={<TableSkeleton columns={10} />}>
      <MembersTable searchParams={params} />
    </Suspense>
  )
}

async function MembersTable({ searchParams: params }: { searchParams: Awaited<ViewStudentProps["searchParams"]> }) {
  const currentPage = Number(params.page) || 1
  const currentLimit = Number(params.limit) || 10

  const currentRoles = params.roles ? (params.roles.split(",") as Role[]) : ["admin", "STUDENT", "STAFF"] as Role[]
  const currentFaculty = params.faculty ? (params.faculty.split(",") as Faculty[]) : ["ENG", "BUS", "DES", "ASC", "IIT", "HSS", "EXT", "OTHERS"] as Faculty[]

  let currentSort = ["desc", undefined] as Sort[]
  const sortString = params.sort || "dateDesc"
  switch(sortString){
    case "dateAsc":
      currentSort = ["asc", undefined] as Sort[]
      break
    case "dateDesc":
      currentSort = ["desc", undefined] as Sort[]
      break
    case "nameAsc":
      currentSort = [undefined, "asc"] as Sort[]
      break
    case "nameDesc":
      currentSort = [undefined, "desc"] as Sort[]
      break
  }

  const currentSearch = params.search || ""

  const {allMember, allMemberCount, totalPages} = await getAllMembers(currentPage, currentLimit, currentRoles, currentFaculty, currentSort, currentSearch)

  return(
    <div className="flex flex-col h-full overflow-hidden">

      <PageinationHeader
      currentPage={currentPage}
      currentLimit={currentLimit}
      totalPages={totalPages}
      allMemberCount={allMemberCount}
      />

      <Table className="table-fixed">
        <colgroup>
        {col_widths.map((width, index) => (
          <col key={index} style={{width}}/>
        ))}
        </colgroup>
        <TableHeader>
          <TableRow>
            <TableHead className="text-center">s/n</TableHead>
            <TableHead>Member</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Email Verified</TableHead>
            <TableHead>Joined Date</TableHead>
            <TableHead className="text-center">Faculty</TableHead>
            <TableHead className="text-center">Diploma</TableHead>
            <TableHead className="text-center">Points</TableHead>
            <TableHead className="text-center">Role</TableHead>
            <TableHead className="text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
      </Table>

      <div className="flex-1 overflow-auto">
        <Table className="table-fixed">
        <colgroup>
        {col_widths.map((width, index) => (
          <col key={index} style={{width}}/>
        ))}
        </colgroup>
        <TableBody>
          {allMember.map((member, i) => (
            <TableRow key={member.id}>
              <TableCell className="text-center"><span className="text-xs">{(i + 1) + ((currentPage - 1) * currentLimit)}</span></TableCell>
              <TableCell><span className="text-xs">{member.name}</span></TableCell>
              <TableCell><span className="text-xs">{member.email}</span></TableCell>
              <TableCell><span className="text-xs">{member.emailVerified == true? "True" : "False"}</span></TableCell>
              <TableCell><span className="text-xs">{new Date(member.createdAt).toLocaleDateString()}</span></TableCell>
              <TableCell className="text-center"><span className="text-xs">{member.faculty}</span></TableCell>
              <TableCell className="text-center"><span className="text-xs">{member.diploma || "N/A"}</span></TableCell>
              <TableCell className="text-center"><span className="text-xs">{member.point?.balance || 0}</span></TableCell>
              <TableCell className="text-center"><span className="text-xs">{member.role === "admin"? "ADMIN" : member.role}</span></TableCell>

              <TableCell className="text-center"><SeeMore memberId={member.id} memberName={member.name} memberEmail={member.email}/></TableCell>

            </TableRow>
          ))}

        </TableBody>
        </Table>
      </div>
    </div>
  )
}
