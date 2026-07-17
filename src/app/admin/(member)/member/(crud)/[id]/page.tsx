import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableHead, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import {
  Undo2,
  Star,
  Users,
  TreePine,
  TrendingUp,
  Leaf,
  Trophy,
  Calendar,
  Recycle,
  Gift,
  AlertTriangle,
  Edit
} from "lucide-react";

import { prisma } from "@/lib/db"
import { notFound } from "next/navigation"
import Link from "next/link";
import { getFeedbacksForUser, getFaultReportsForUser } from "@/app/action/feedback";

const statusStyles: Record<string, string> = {
  OPEN: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400",
  IN_PROGRESS: "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400",
  RESOLVED: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400",
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={`size-3.5 ${i < rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`} />
      ))}
    </div>
  )
}

async function getMemberId(id: string){

  const member = await prisma.user.findUnique({
    where: {
      id: id
    },
    include: {
      point: true,
      _count: {
        select: {
          disposals: true,
          redemptions: true,
          FaultReport: true,
          user_event: true,
          user_quest: {
            where: { isCompleted: true }
          }
        }
      }
    }
  })
  return member
}

export default async function MemberPage({ params } : { params : Promise<{id: string}>}){
  const { id } = await params
  const [member, feedbacks, faultReports] = await Promise.all([
    getMemberId(id),
    getFeedbacksForUser(id),
    getFaultReportsForUser(id),
  ])

  if (!member){
    notFound()
  }

  const initials = member.name 
  ? member.name.substring(0, 2).toUpperCase() 
  : "US";

  return (
    <div className="container mx-auto px-4 py-6 md:px-6 2xl:max-w-[1400px] h-full overflow-y-auto">
      <div className="mb-6 flex flex-col items-start justify-between gap-3 sm:flex-row">
        <h1 className="text-2xl font-semibold">Profile</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/admin/member/edit/${member.id}`}>
              <Edit className="mr-2 size-4" />
              Edit Member
            </Link>
          </Button>

          <Button variant="outline" size="sm" asChild>
            <Link href={`/admin/member`}>
              <Undo2 className="mr-2 size-4" />
              Return
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        {/* Sidebar */}
        <div className="md:col-span-1">
          <Card className="p-0">
            <CardContent className="p-6">
              <div className="flex flex-col items-center">
                <Avatar className="size-20">
                  <AvatarImage
                    src={member.profileImageUrl || ""} 
                    alt={member.name || "Member"}
                  />
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <h2 className="mt-4 text-lg font-semibold">{member.name || "Unknown Member"}</h2>
                <p className="text-muted-foreground text-sm">
                  {member.email}
                </p>
                <Badge className="mt-2" variant="secondary">
                  {member.role}
                </Badge>
              </div>

              <div className="mt-6 space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Member since</span>
                  <span>{new Date(member.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Last updated</span>
                  <span>{new Date(member.updatedAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Faculty</span>
                  <span>{member.faculty || "N/A"}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="space-y-6 md:col-span-3">
          
          {/* ALL 9 STATS IN ONE UNIFIED GRID */}
          <div className="grid gap-4 sm:grid-cols-3">
            
            {/* --- ROW 1: SUSTAINABILITY IMPACT --- */}
            <Card className="p-0">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="bg-green-500/10 rounded-lg p-2">
                    <TreePine className="text-green-600 size-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-semibold">{member.treesaved}</p>
                    <p className="text-muted-foreground text-sm">Trees Saved</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="p-0">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="bg-emerald-500/10 rounded-lg p-2">
                    <TrendingUp className="text-emerald-600 size-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-semibold">{(member.treeprogress * 100).toFixed(0)}%</p>
                    <p className="text-muted-foreground text-sm">Tree Progress</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="p-0">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="bg-teal-500/10 rounded-lg p-2">
                    <Leaf className="text-teal-600 size-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-semibold">{member.carbonprint.toFixed(1)} kg</p>
                    <p className="text-muted-foreground text-sm">Carbon Offset</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* --- ROW 2: GAMIFICATION & POINTS --- */}
            <Card className="p-0">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="bg-yellow-500/10 rounded-lg p-2">
                    <Star className="text-yellow-600 size-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-semibold">{member.point?.balance || 0}</p>
                    <p className="text-muted-foreground text-sm">Points Balance</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="p-0">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="bg-orange-500/10 rounded-lg p-2">
                    <Trophy className="text-orange-600 size-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-semibold">{member._count?.user_quest || 0}</p>
                    <p className="text-muted-foreground text-sm">Completed Quests</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="p-0">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="bg-purple-500/10 rounded-lg p-2">
                    <Calendar className="text-purple-600 size-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-semibold">{member._count?.user_event || 0}</p>
                    <p className="text-muted-foreground text-sm">Events Attended</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* --- ROW 3: APP ACTIVITY --- */}
            <Card className="p-0">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="bg-blue-500/10 rounded-lg p-2">
                    <Recycle className="text-blue-600 size-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-semibold">{member._count?.disposals || 0}</p>
                    <p className="text-muted-foreground text-sm">Total Disposals</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="p-0">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="bg-pink-500/10 rounded-lg p-2">
                    <Gift className="text-pink-600 size-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-semibold">{member._count?.redemptions || 0}</p>
                    <p className="text-muted-foreground text-sm">Rewards Claimed</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="p-0">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="bg-red-500/10 rounded-lg p-2">
                    <AlertTriangle className="text-red-600 size-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-semibold">{member._count?.FaultReport || 0}</p>
                    <p className="text-muted-foreground text-sm">Faults Reported</p>
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>

          {/* Feedback & Fault Reports */}
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Feedback</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table className="table-fixed">
                  <colgroup>
                    <col style={{ width: "20%" }} />
                    <col style={{ width: "55%" }} />
                    <col style={{ width: "25%" }} />
                  </colgroup>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-center">Rating</TableHead>
                      <TableHead>Message</TableHead>
                      <TableHead className="text-center">Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {feedbacks.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} className="h-20 text-center text-muted-foreground">
                          No feedback submitted.
                        </TableCell>
                      </TableRow>
                    ) : (
                      feedbacks.map((feedback) => (
                        <TableRow key={feedback.id}>
                          <TableCell className="text-center"><div className="flex justify-center"><StarRating rating={feedback.rating} /></div></TableCell>
                          <TableCell><span className="text-xs truncate block max-w-full">{feedback.message || "—"}</span></TableCell>
                          <TableCell className="text-center"><span className="text-xs">{new Date(feedback.createdAt).toLocaleDateString("en-SG")}</span></TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Fault Reports</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table className="table-fixed">
                  <colgroup>
                    <col style={{ width: "30%" }} />
                    <col style={{ width: "25%" }} />
                    <col style={{ width: "20%" }} />
                    <col style={{ width: "25%" }} />
                  </colgroup>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Location</TableHead>
                      <TableHead className="text-center">Category</TableHead>
                      <TableHead className="text-center">Date</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {faultReports.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="h-20 text-center text-muted-foreground">
                          No fault reports submitted.
                        </TableCell>
                      </TableRow>
                    ) : (
                      faultReports.map((report) => (
                        <TableRow key={report.id}>
                          <TableCell><span className="text-xs truncate block max-w-full">{report.location}</span></TableCell>
                          <TableCell className="text-center"><Badge variant="secondary" className="text-xs">{report.category}</Badge></TableCell>
                          <TableCell className="text-center"><span className="text-xs">{new Date(report.createdAt).toLocaleDateString("en-SG")}</span></TableCell>
                          <TableCell className="text-center">
                            <Badge className={statusStyles[report.status]}>{report.status.replace("_", " ")}</Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}