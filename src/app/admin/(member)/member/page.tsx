import { Table, TableHead, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table"
import { prisma } from "@/lib/db"
import { PageinationHeader } from "./header"

async function getAllMembers(page: number = 1, limit: number = 10){
  const allMember = await prisma.user.findMany({

    skip: (page - 1) * limit,
    take: limit,

    where: {
      role: {
        in: ["ADMIN", "STUDENT", "STAFF"]
      }
    },

    orderBy: {
      createdAt: "desc",
    },

    include: {
      point: true 
    }
  })

  const allMemberCount = await prisma.user.count({
    where: {
      role: {
        in: ["ADMIN", "STUDENT", "STAFF"]
      }
    }
  })

  const totalPages = Math.ceil(allMemberCount / limit)

  return {allMember, allMemberCount, totalPages} 
}

export default async function ViewStudent({searchParams} : {searchParams: Promise<{page?: string, limit?: string}>}){

  const currentPage = Number((await searchParams).page) || 1
  const currentLimit = Number((await searchParams).limit) || 10
  const {allMember, allMemberCount, totalPages} = await getAllMembers(currentPage, currentLimit)

  return(
    <div className="flex flex-col h-full overflow-hidden">

      <PageinationHeader currentPage={currentPage} currentLimit={currentLimit} totalPages={totalPages} allMemberCount={allMemberCount}/>

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