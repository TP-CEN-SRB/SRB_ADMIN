import { Table, TableHead, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table"
import { prisma } from "@/lib/db"

async function getAllMembers(){
  const allMember = await prisma.user.findMany({
    where: {
      role: {
        in: ["ADMIN", "STUDENT", "STAFF"]
      }
    },
    orderBy: {
      createdAt: "asc"
    },
    include: {
      point: true 
    }
  })
  return allMember
}

export default async function ViewStudent(){
  const members = await getAllMembers()
  return(
    <div className="flex flex-col h-screen">
      <header className="z-40 bg-muted p-2">
        Members Table
      </header>
      <Table>
        <colgroup>
          <col style={{ width: '5%' }} />
          <col style={{ width: '10%' }} />
          <col style={{ width: '20%' }} />
          <col style={{ width: '15%' }} />
          <col style={{ width: '15%' }} />
          <col style={{ width: '15%' }} />
          <col style={{ width: '10%' }} />
          <col style={{ width: '10%' }} />
        </colgroup>
        <TableHeader>
          <TableRow>
            <TableHead className="text-center">s/n</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Email Verified</TableHead>
            <TableHead>Joined Date</TableHead>
            <TableHead>Faculty</TableHead>
            <TableHead>Points</TableHead>
            <TableHead className="text-center">Role</TableHead>
          </TableRow>
        </TableHeader>
      </Table>
      <div className="overflow-auto p-6">
        <Table>
          <colgroup>
            <col style={{ width: '5%' }} />
            <col style={{ width: '10%' }} />
            <col style={{ width: '20%' }} />
            <col style={{ width: '15%' }} />
            <col style={{ width: '15%' }} />
            <col style={{ width: '15%' }} />
            <col style={{ width: '10%' }} />
            <col style={{ width: '10%' }} />
          </colgroup>
          <TableBody>
            {members.map((member) => (
              <TableRow key={member.id}>
                <TableCell><span className="text-xs">1</span></TableCell>
                <TableCell><span className="text-xs">{member.name}</span></TableCell>
                <TableCell><span className="text-xs">{member.email}</span></TableCell>
                <TableCell><span className="text-xs">{member.emailVerified == true? "True" : "False"}</span></TableCell>
                <TableCell><span className="text-xs">{new Date(member.createdAt).toLocaleDateString()}</span></TableCell>
                <TableCell><span className="text-xs">{member.faculty}</span></TableCell>
                <TableCell><span className="text-xs">{member.point?.balance || 0}</span></TableCell>
                <TableCell><span className="text-xs">{member.role}</span></TableCell>
              </TableRow>
            ))}

          </TableBody>
        </Table>
      </div>
    </div>
  )
}