import { Table, TableHead, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table"
import { prisma } from "@/lib/db"
import { PageinationHeader } from "./header"

type Role = "ADMIN" | "STUDENT" | "STAFF"
type Sort = "asc" | "desc" | undefined

async function getAllMembers(
  page: number, 
  limit: number, 
  roles: Role[], 
  sort: Sort[])
  {
  const allMember = await prisma.user.findMany({

    skip: (page - 1) * limit,
    take: limit,

    where: {
      role: {
        in: roles
      }
    },

    orderBy: {
      createdAt: sort[0],
      name: sort[1]
    },

    include: {
      point: true 
    }
  })

  const allMemberCount = await prisma.user.count({
    where: {
      role: {
        in: roles
      }
    }
  })

  const totalPages = Math.ceil(allMemberCount / limit)

  return {allMember, allMemberCount, totalPages} 
}

export default async function ViewStudent({searchParams} : {searchParams: Promise<{page?: string, limit?: string, roles?: string, sort?: string}>}){

  const params = await searchParams
  const currentPage = Number(params.page) || 1
  const currentLimit = Number(params.limit) || 10
  
  const currentRoles = params.roles ? (params.roles.split(",") as Role[]) : ["ADMIN", "STUDENT", "STAFF"] as Role[]
  
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


  const {allMember, allMemberCount, totalPages} = await getAllMembers(currentPage, currentLimit, currentRoles, currentSort)

  return(
    <div className="flex flex-col h-full overflow-hidden">

      <PageinationHeader 
      currentPage={currentPage} 
      currentLimit={currentLimit} 
      totalPages={totalPages} 
      allMemberCount={allMemberCount}
      />

      <Table>
        <colgroup>
            <col style={{ width: '5%' }} />
            <col style={{ width: '15%' }} />
            <col style={{ width: '20%' }} />
            <col style={{ width: '10%' }} />
            <col style={{ width: '10%' }} />
            <col style={{ width: '10%' }} />
            <col style={{ width: '10%' }} />
            <col style={{ width: '10%' }} />
            <col style={{ width: '10%' }} />
        </colgroup>
        <TableHeader>
          <TableRow>
            <TableHead className="text-center">s/n</TableHead>
            <TableHead>Member</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Email Verified</TableHead>
            <TableHead>Joined Date</TableHead>
            <TableHead>Faculty</TableHead>
            <TableHead>Diploma</TableHead>
            <TableHead className="text-center">Points</TableHead>
            <TableHead className="text-center">Role</TableHead>
          </TableRow>
        </TableHeader>
      </Table>

      <div className="flex-1 overflow-auto">
        <Table>
          <colgroup>
            <col style={{ width: '5%' }} />
            <col style={{ width: '15%' }} />
            <col style={{ width: '20%' }} />
            <col style={{ width: '10%' }} />
            <col style={{ width: '10%' }} />
            <col style={{ width: '10%' }} />
            <col style={{ width: '10%' }} />
            <col style={{ width: '10%' }} />
            <col style={{ width: '10%' }} />
          </colgroup>
          <TableBody>
            {allMember.map((member, i) => (
              <TableRow key={member.id}>
                <TableCell className="text-center"><span className="text-xs">{(i + 1) + ((currentPage - 1) * currentLimit)}</span></TableCell>
                <TableCell><span className="text-xs">{member.name}</span></TableCell>
                <TableCell><span className="text-xs">{member.email}</span></TableCell>
                <TableCell><span className="text-xs">{member.emailVerified == true? "True" : "False"}</span></TableCell>
                <TableCell><span className="text-xs">{new Date(member.createdAt).toLocaleDateString()}</span></TableCell>
                <TableCell><span className="text-xs">{member.faculty}</span></TableCell>
                <TableCell><span className="text-xs">{member.diploma || "N/A"}</span></TableCell>
                <TableCell className="text-center"><span className="text-xs">{member.point?.balance || 0}</span></TableCell>
                <TableCell className="text-center"><span className="text-xs">{member.role}</span></TableCell>
              </TableRow>
            ))}

          </TableBody>
        </Table>
      </div>
    </div>
  )
}