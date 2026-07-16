  import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
  import { Button } from "@/components/ui/button";
  import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
  import { Badge } from "@/components/ui/badge";
  import { notFound } from "next/navigation";
  import { 
    Undo2, 
    Star, 
    TreePine, 
    Leaf, 
    Trophy, 
    Recycle, 
  } from "lucide-react";

  import { getMemberId } from "./updateMember";

  import Link from "next/link";
  import EditMemberForm from "./editMemberForm";

  export default async function EditMemberPage({ params } : { params : Promise<{id: string}>}) {
    const { id } = await params;
    const member = await getMemberId(id);

    if (!member) {
      notFound();
    }

    const initials = member.name 
      ? member.name.substring(0, 2).toUpperCase() 
      : "US";


    return (
      <div className="container mx-auto px-4 py-6 md:px-6 2xl:max-w-[1400px] h-full overflow-y-auto">
        <div className="mb-6 flex flex-col items-start justify-between gap-3 sm:flex-row">
          <h1 className="text-2xl font-semibold">Edit Member Profile</h1>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/admin/member`}>
                <Undo2 className="mr-2 size-4" />
                Cancel & Return
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-4">
          
          {/* Main Content - Edit Form */}
          <div className="space-y-6 md:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle>Member Details</CardTitle>
                <CardDescription>Update the user's personal information and role.</CardDescription>
              </CardHeader>
              <CardContent>
                <EditMemberForm
                  id={member.id}
                  defaultValues={{
                    name: member.name ?? "",
                    email: member.email ?? "",
                    faculty: member.faculty,
                    role: member.role,
                    emailVerified: member.emailVerified,
                  }}
                />
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-1 space-y-6">
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
                    <span className="text-muted-foreground">Points Balance</span>
                    <span className="font-medium text-yellow-600 flex items-center gap-1">
                      {member.point?.balance || 0} <Star className="size-3 fill-yellow-600" />
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Activity Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Recycle className="size-4 text-blue-500" /> Disposals
                  </div>
                  <span className="font-medium">{member._count?.disposals || 0}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Trophy className="size-4 text-orange-500" /> Quests
                  </div>
                  <span className="font-medium">{member._count?.user_quest || 0}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <TreePine className="size-4 text-green-500" /> Trees Saved
                  </div>
                  <span className="font-medium">{member.treesaved}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Leaf className="size-4 text-teal-500" /> CO₂ Offset
                  </div>
                  <span className="font-medium">{(member.carbonprint ?? 0).toFixed(1)}kg</span>
                </div>
              </CardContent>
            </Card>
          </div>
          
        </div>
      </div>
    );
  }